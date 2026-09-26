"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import { Sparkle } from "@/components/ui/icons";
import { DISCOVERIES, discoveryName } from "@/lib/discoveries";
import { DISCOVERY_EVENT, discover, foundSnapshot, parseList } from "@/lib/explored";
import { isTyping } from "@/lib/xray";
import s from "./fx.module.css";

type Slim = { slug: string; accent: string };

const WIPE = "hd-wipe";
const WIPE_SIZE = 160;

/** Starts the accent wipe toward a project from a point on screen (the palette and Surprise me call this). */
export const wipeTo = (slug: string, x = window.innerWidth / 2, y = window.innerHeight / 2) =>
  window.dispatchEvent(new CustomEvent(WIPE, { detail: { slug, x, y } }));

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

/** A fixed, even-looking scatter in [0, 1) for spark i. */
const scatter = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Site-wide touches, from one client component in the layout with one
 * listener each, all off under reduced motion where they move anything:
 *
 * - Project links wipe the screen in that project's accent from the click
 *   while the case study loads: a small circle scaled up (compositor only),
 *   lifting away once the new page is in.
 * - Buttons marked [data-ripple] ripple from where they're pressed.
 * - [data-launch] links launch their arrow before the page scrolls.
 * - [data-bounce], [data-redraw] and [data-swap] react to a poke.
 * - Finding a discovery shows a note under the header.
 * - The Konami code bursts sparks in every project's accent.
 * - A hidden tab asks you to come back; developers get a hello in the console.
 */
export function Fx({ projects }: { projects: Slim[] }) {
  const { reduced } = useMotionPreference();
  const pathname = usePathname();
  const wipe = useRef<HTMLDivElement>(null);
  const pending = useRef<{ grow: Animation; timer: number } | null>(null);
  const [note, setNote] = useState<{ id: string; n: number; key: number } | null>(null);
  const [sparks, setSparks] = useState(0);

  // ── The wipe ────────────────────────────────────────────────────────
  const lift = useCallback(() => {
    const p = pending.current;
    const el = wipe.current;
    if (!p || !el) return;
    pending.current = null;
    window.clearTimeout(p.timer);
    const clear = () => document.documentElement.removeAttribute("data-wiping");
    p.grow.finished
      .then(() => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }).finished)
      .then(
        () => {
          el.getAnimations().forEach((a) => a.cancel());
          clear();
        },
        clear,
      );
  }, []);

  const start = useCallback(
    (slug: string, x: number, y: number) => {
      const el = wipe.current;
      const accent = projects.find((p) => p.slug === slug)?.accent;
      if (!el || !accent || reduced) return;
      el.getAnimations().forEach((a) => a.cancel());
      el.style.setProperty("--wipe", accent);
      el.style.left = `${x - WIPE_SIZE / 2}px`;
      el.style.top = `${y - WIPE_SIZE / 2}px`;
      // Far enough to cover the farthest corner.
      const reach = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const scale = ((reach + 8) * 2) / WIPE_SIZE;
      const grow = el.animate(
        [
          { opacity: 1, transform: "scale(0)" },
          { opacity: 1, transform: `scale(${scale.toFixed(2)})` },
        ],
        { duration: 420, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      );
      if (pending.current) window.clearTimeout(pending.current.timer);
      // The incoming page waits under the circle (PageTransition reads this).
      document.documentElement.setAttribute("data-wiping", "");
      // Lifts when the new page is in (below), or after a while regardless.
      pending.current = { grow, timer: window.setTimeout(lift, 2500) };
    },
    [projects, reduced, lift],
  );

  useEffect(() => {
    lift();
  }, [pathname, lift]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      const match = url.origin === window.location.origin && url.pathname.match(/^\/work\/([^/]+)\/?$/);
      if (!match || url.pathname === window.location.pathname) return;
      start(match[1], event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2);
    };
    const onWipe = (event: Event) => {
      const { slug, x, y } = (event as CustomEvent<{ slug: string; x: number; y: number }>).detail;
      start(slug, x, y);
    };
    document.addEventListener("click", onClick);
    window.addEventListener(WIPE, onWipe);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(WIPE, onWipe);
    };
  }, [start]);

  // ── Ripples and launches ────────────────────────────────────────────
  useEffect(() => {
    if (reduced) return;
    const onDown = (event: PointerEvent) => {
      const el = (event.target as Element | null)?.closest?.<HTMLElement>("[data-ripple]");
      if (!el) return;
      const box = el.getBoundingClientRect();
      el.style.setProperty("--rx", `${event.clientX - box.left}px`);
      el.style.setProperty("--ry", `${event.clientY - box.top}px`);
      el.dataset.rippling = el.dataset.rippling === "a" ? "b" : "a";
    };
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest?.<HTMLElement>("[data-launch]");
      if (el) el.dataset.launched = el.dataset.launched === "a" ? "b" : "a";
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("click", onClick);
    };
  }, [reduced]);

  // ── Things that react to a poke ─────────────────────────────────────
  // [data-bounce] bounces under a fine pointer or a tap, at most once per
  // bounce; [data-redraw] replays its drawing on a tap (hover does it in
  // CSS); [data-swap] shows the other chat in its [data-swap-root].
  useEffect(() => {
    let bouncedAt = 0;
    const bounce = (el: HTMLElement) => {
      if (performance.now() - bouncedAt < 1000) return;
      bouncedAt = performance.now();
      el.dataset.bouncing = el.dataset.bouncing === "a" ? "b" : "a";
      discover("bounce");
    };
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const el = (event.target as Element | null)?.closest?.<HTMLElement>("[data-bounce]");
      if (el) bounce(el);
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const dot = target?.closest?.<HTMLElement>("[data-bounce]");
      if (dot && event.pointerType !== "mouse") bounce(dot);
      const drawing = target?.closest?.<HTMLElement>("[data-redraw]");
      if (drawing && event.pointerType !== "mouse") drawing.dataset.redrawing = drawing.dataset.redrawing === "a" ? "b" : "a";
    };
    const onClick = (event: MouseEvent) => {
      const swap = (event.target as Element | null)?.closest?.("[data-swap]")?.closest<HTMLElement>("[data-swap-root]");
      if (swap) swap.dataset.swapped = swap.dataset.swapped === "alt" ? "main" : "alt";
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // ── Discoveries ─────────────────────────────────────────────────────
  useEffect(() => {
    let timer = 0;
    const onFound = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const n = parseList(foundSnapshot()).filter((f) => DISCOVERIES.some((d) => d.id === f)).length;
      setNote({ id, n, key: Date.now() });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setNote(null), 3600);
    };
    window.addEventListener(DISCOVERY_EVENT, onFound);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(DISCOVERY_EVENT, onFound);
    };
  }, []);

  // ── The Konami code ─────────────────────────────────────────────────
  useEffect(() => {
    let at = 0;
    let timer = 0;
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      at = key === KONAMI[at] ? at + 1 : key === KONAMI[0] ? 1 : 0;
      if (at < KONAMI.length) return;
      at = 0;
      discover("konami");
      setSparks((n) => n + 1);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setSparks(0), 1400);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // ── Away, and a hello for developers ────────────────────────────────
  useEffect(() => {
    const AWAY = "Come back soon · Himanshu Dixit";
    let before = "";
    const onVisibility = () => {
      if (document.hidden) {
        before = document.title;
        document.title = AWAY;
      } else if (document.title === AWAY && before) document.title = before;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const w = window as typeof window & { __hdHello?: boolean };
    if (w.__hdHello) return;
    w.__hdHello = true;
    console.log(
      "%cHi, fellow developer.%c\nThis site is Next.js and React, mostly server components, with its motion in CSS scroll timelines.\nPress ⌘K (or Ctrl+K) to jump anywhere, x for x-ray mode — and there are a few things to find.",
      "font: 600 14px system-ui; color: #5ca4ff",
      "font: 12px system-ui; color: inherit",
    );
  }, []);

  const accents = projects.map((p) => p.accent);
  return (
    <>
      <div ref={wipe} aria-hidden="true" className={s.wipe} />
      {note && (
        <div key={note.key} role="status" className={s.note}>
          <Sparkle className={s.noteIcon} />
          <span>
            <span className={s.noteLabel}>Discovery</span> {discoveryName(note.id)}
          </span>
          <span className={s.noteCount}>
            {note.n} of {DISCOVERIES.length}
          </span>
        </div>
      )}
      {sparks > 0 && !reduced && (
        <span key={sparks} aria-hidden="true" className={s.sparks}>
          {[...accents, ...accents].map((color, i, all) => {
            const angle = (i / all.length) * Math.PI * 2 + (scatter(i) - 0.5) * 0.5;
            const reach = 8 + scatter(i + 40) * 10;
            return (
              <span
                key={i}
                className={s.spark}
                style={
                  {
                    "--dx": `${(Math.cos(angle) * reach).toFixed(2)}rem`,
                    "--dy": `${(Math.sin(angle) * reach).toFixed(2)}rem`,
                    "--d": `${Math.round(scatter(i + 90) * 160)}ms`,
                    background: color,
                  } as CSSProperties
                }
              />
            );
          })}
        </span>
      )}
    </>
  );
}
