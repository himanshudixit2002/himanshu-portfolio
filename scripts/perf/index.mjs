#!/usr/bin/env node
/**
 * Performance and visual checks against a running build (`npm run build && npm start`).
 *
 *   npm run perf -- scroll  [--routes /,/work] [--widths 390,1440] [--throttle 4]
 *   npm run perf -- load    [--routes /,/lab] [--runs 7] [--compare http://localhost:3200]
 *   npm run perf -- heights [--widths 390,700,900,1152,1440]
 *   npm run perf -- shots   [--routes /work/kvstore] [--widths 390,1440] [--scenes] [--reduced] [--nojs] [--out perf-shots]
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

async function newPage({ width, height = 900, throttle = 1, reduced = false, js = true } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? "reduce" : "no-preference", javaScriptEnabled: js });
  const page = await context.newPage();
  if (throttle > 1) await (await context.newCDPSession(page)).send("Emulation.setCPUThrottlingRate", { rate: throttle });
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
        const max = document.documentElement.scrollHeight - innerHeight;
        await new Promise((done) => {
          const step = () => {
            const now = performance.now();
            gaps.push(now - last);
            last = now;
            const y = scrollY + 40;
            window.scrollTo({ top: y, behavior: "instant" });
            if (y >= max) done();
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

const commands = { scroll, load, heights, shots };
if (!commands[command]) {
  console.error(`Unknown command "${command}". Use one of: ${Object.keys(commands).join(", ")}.`);
  process.exitCode = 1;
} else {
  await commands[command]();
}
await browser.close();
