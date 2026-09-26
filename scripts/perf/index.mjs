#!/usr/bin/env node
/**
 * Performance and visual checks against a running build (`npm run build && npm start`).
 *
 *   npm run perf -- scroll  [--routes /,/work] [--widths 390,1440] [--throttle 4]
 *   npm run perf -- load    [--routes /,/lab] [--runs 7] [--compare http://localhost:3200]
 *   npm run perf -- heights [--widths 390,700,900,1152,1440]
 *   npm run perf -- shots   [--routes /work/kvstore] [--widths 390,1440] [--scenes] [--reduced] [--nojs] [--out perf-shots]
 *   npm run perf -- feel    [--routes /] [--widths 390,1440] [--throttle 4] [--net 4g] [--speed 1400]
 *
 * Common: --base http://localhost:3000. Uses Playwright's Chromium; set
 * CHROMIUM_PATH to use another build. Not part of CI — numbers depend on the
 * machine, so compare runs on the same one.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const [command = "scroll", ...rest] = process.argv.slice(2);
const flags = {};
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith("--")) continue;
  const key = rest[i].slice(2);
  const next = rest[i + 1];
  flags[key] = next && !next.startsWith("--") ? (i++, next) : true;
}
const list = (value, fallback) => (typeof value === "string" ? value.split(",") : fallback);

const BASE = flags.base ?? "http://localhost:3000";
const ROUTES = list(flags.routes, ["/", "/work", "/work/smartshelfkart", "/work/kvstore", "/lab", "/about", "/resume"]);
const median = (values) => values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

async function newPage({ width, height = 900, throttle = 1, reduced = false, js = true, touch = false, net = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? "reduce" : "no-preference",
    javaScriptEnabled: js,
    hasTouch: touch,
    isMobile: touch,
  });
  const page = await context.newPage();
  const cdp = throttle > 1 || net ? await context.newCDPSession(page) : null;
  if (throttle > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
  // A typical 4G connection: 150ms round trips, 9 Mbit/s down.
  if (net) {
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 });
  }
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(m.text()));
  await page.addInitScript(() => {
    window.__perf = { cls: 0, long: [] };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__perf.cls += e.value))).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__perf.long.push(e.duration))).observe({ type: "longtask", buffered: true });
  });
  return { page, context, errors };
}

/** Scrolls the whole page 40px per frame and records frame gaps, layout shift and long tasks. */
async function scroll() {
  const throttle = Number(flags.throttle ?? 1);
  for (const width of list(flags.widths, ["390", "1440"]).map(Number)) {
    for (const route of ROUTES) {
      const { page, context, errors } = await newPage({ width, throttle });
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const frames = await page.evaluate(async () => {
        const gaps = [];
        let last = performance.now();
        // Read every frame: the page can shrink as drawings replace their reserved space.
        const max = () => document.documentElement.scrollHeight - innerHeight;
        await new Promise((done) => {
          const step = () => {
            const now = performance.now();
            gaps.push(now - last);
            last = now;
            const y = scrollY + 40;
            window.scrollTo({ top: y, behavior: "instant" });
            if (y >= max()) done();
            else requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
        return gaps;
      });
      await page.waitForTimeout(800);
      const m = await page.evaluate(() => window.__perf);
      const sorted = frames.slice().sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      console.log(
        `${String(width).padStart(4)} ${route.padEnd(26)} p95 ${p95.toFixed(1).padStart(5)}ms  max ${sorted.at(-1).toFixed(1).padStart(6)}ms  >50ms ${String(frames.filter((f) => f > 50).length).padStart(2)}  CLS ${m.cls.toFixed(4)}  long ${m.long.map(Math.round).join("/") || "-"}${errors.length ? `  ERRORS: ${errors.join(" | ")}` : ""}`,
      );
      await context.close();
    }
  }
}

/** Median FCP and total blocking time over several loads, optionally against a second build. */
async function load() {
  const runs = Number(flags.runs ?? 7);
  const targets = [["this", BASE], ...(flags.compare ? [["compare", flags.compare]] : [])];
  for (const [label, width, throttle] of [["desktop", 1440, 1], ["phone 4x", 390, 4]]) {
    for (const route of ROUTES) {
      const out = [];
      for (const [name, base] of targets) {
        const fcp = [];
        const tbt = [];
        for (let i = 0; i < runs; i++) {
          const { page, context } = await newPage({ width, throttle });
          await page.goto(base + route, { waitUntil: "networkidle" });
          await page.waitForTimeout(1500);
          const m = await page.evaluate(() => ({
            fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0,
            tbt: window.__perf.long.reduce((sum, d) => sum + Math.max(0, d - 50), 0),
          }));
          fcp.push(m.fcp);
          tbt.push(m.tbt);
          await context.close();
        }
        out.push(`${name}: FCP ${Math.round(median(fcp))} TBT ${Math.round(median(tbt))}`);
      }
      console.log(`${label.padEnd(9)} ${route.padEnd(26)} ${out.join("   ")}`);
    }
  }
}

/** Each LazyVisual's reserved height against its rendered height. */
async function heights() {
  for (const width of list(flags.widths, ["390", "700", "900", "1152", "1440"]).map(Number)) {
    const { page, context } = await newPage({ width });
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      const reserved = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-visual]")].map((e) => [e.dataset.visual, Math.round(e.getBoundingClientRect().height)])));
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 30));
        }
      });
      await page.waitForTimeout(700);
      const rendered = await page.evaluate(() => [...document.querySelectorAll("[data-visual]")].map((e) => [e.dataset.visual, Math.round(e.getBoundingClientRect().height)]));
      for (const [id, h] of rendered) console.log(`${String(width).padStart(4)} ${route.padEnd(26)} ${id.padEnd(18)} reserved ${reserved[id]}  rendered ${h}  off by ${h - reserved[id]}`);
    }
    await context.close();
  }
}

/** Screenshots of each route; with --scenes, each pinned scene at 0, ½ and the end. */
async function shots() {
  const dir = flags.out ?? "perf-shots";
  mkdirSync(dir, { recursive: true });
  const variant = flags.nojs ? "nojs" : flags.reduced ? "reduced" : "full";
  for (const width of list(flags.widths, ["390", "1440"]).map(Number)) {
    for (const route of ROUTES) {
      const { page, context, errors } = await newPage({ width, reduced: Boolean(flags.reduced), js: !flags.nojs });
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      const slug = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
      if (flags.scenes) {
        const tracks = await page.evaluate(() =>
          [...document.querySelectorAll(".scene-track")].filter((t) => getComputedStyle(t).display !== "none").map((t) => {
            const box = t.getBoundingClientRect();
            return { top: box.top + scrollY, height: box.height };
          }),
        );
        for (const [n, t] of tracks.entries()) {
          for (const p of [0, 0.5, 1]) {
            await page.evaluate(([top, height, p]) => window.scrollTo({ top: top + p * (height - window.innerHeight), behavior: "instant" }), [t.top, t.height, p]);
            await page.waitForTimeout(700);
            await page.screenshot({ path: join(dir, `${slug}-scene${n}-${p}-${width}-${variant}.png`) });
          }
        }
      } else {
        await page.screenshot({ path: join(dir, `${slug}-${width}-${variant}.png`), fullPage: Boolean(flags.full) });
      }
      if (errors.length) console.log(`${route} @${width}: ${errors.join(" | ")}`);
      await context.close();
    }
  }
  console.log(`Screenshots in ${dir}/`);
}

/**
 * How ready a page looks while you scroll through it. Scrolls at a brisk
 * reading pace (--speed px/s, from 1.2s after the page first renders) and
 * adds up, per section, how long content sat in the part of the screen you
 * read (15–85% of its height) still faded by an entrance (opacity under
 * 0.85), undrawn (a scene card or frame without its drawing), as a
 * placeholder, or as an image still loading. Phones are emulated with touch.
 */
async function feel() {
  const throttle = Number(flags.throttle ?? 1);
  for (const width of list(flags.widths, ["390", "1440"]).map(Number)) {
    const phone = width < 768;
    for (const route of ROUTES) {
      const { page, context } = await newPage({ width, height: phone ? 844 : 900, throttle: phone ? throttle : 1, touch: phone, net: flags.net === "4g" });
      await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1200);
      const speed = Number(flags.speed ?? (phone ? 1400 : 1800));
      const found = await page.evaluate(async (speed) => {
        const vh = innerHeight;
        const time = new Map();
        const where = (el, what) => `${what} in #${el.closest("[id]")?.id ?? "?"}`;
        const reading = (el) => {
          const r = el.getBoundingClientRect();
          return r.height > 0 && r.bottom > vh * 0.15 && r.top < vh * 0.85 && r.right > 0 && r.left < innerWidth;
        };
        const check = (dt) => {
          const now = new Set();
          document.querySelectorAll("[data-reveal], .sd-rise, .sd-scale-in, .sd-mask-up, .wr-scrub").forEach((el) => {
            if (reading(el) && Number(getComputedStyle(el).opacity) < 0.85) now.add(where(el, "faded"));
          });
          document.querySelectorAll(".wr-scrub .wr-w").forEach((el) => {
            if (reading(el) && Number(getComputedStyle(el).opacity) < 0.85) now.add(where(el, "dim words"));
          });
          document.querySelectorAll(".snap-track article [aria-hidden='true'], .scene-frames li > [aria-hidden='true']").forEach((el) => {
            if (reading(el) && !el.querySelector("svg")) now.add(where(el, "undrawn"));
          });
          document.querySelectorAll("[data-visual]").forEach((el) => {
            if (reading(el) && el.firstElementChild?.childElementCount === 0) now.add(where(el, "placeholder"));
          });
          document.querySelectorAll("img").forEach((el) => {
            if (reading(el) && !el.complete) now.add(where(el, "image loading"));
          });
          for (const key of now) time.set(key, (time.get(key) ?? 0) + dt);
        };
        // The page can grow or shrink as drawings replace their reserved
        // space, so the end is read every frame; stop if scrolling stalls.
        let last = performance.now();
        let still = 0;
        while (still < 30) {
          await new Promise((r) => requestAnimationFrame(r));
          const t = performance.now();
          const dt = t - last;
          last = t;
          const max = document.documentElement.scrollHeight - vh;
          if (scrollY >= max - 2) break;
          const before = scrollY;
          scrollTo({ top: Math.min(max, scrollY + (speed * dt) / 1000), behavior: "instant" });
          still = scrollY === before ? still + 1 : 0;
          check(dt);
        }
        return [...time].sort((a, b) => b[1] - a[1]);
      }, speed);
      const total = found.reduce((sum, [, ms]) => sum + ms, 0);
      console.log(`${String(width).padStart(4)} ${route.padEnd(26)} not ready in view ${Math.round(total)}ms total`);
      for (const [key, ms] of found) if (ms >= 50) console.log(`       ${String(Math.round(ms)).padStart(5)}ms  ${key}`);
      await context.close();
    }
  }
}

const commands = { scroll, load, heights, shots, feel };
if (!commands[command]) {
  console.error(`Unknown command "${command}". Use one of: ${Object.keys(commands).join(", ")}.`);
  process.exitCode = 1;
} else {
  await commands[command]();
}
await browser.close();
