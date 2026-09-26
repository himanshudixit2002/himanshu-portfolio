"use client";

import { useEffect, useRef } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import { discover } from "@/lib/explored";

type Props = { cols: number; rows: number; count: number };

/**
 * The streak board's two bits of script (StreakBoard):
 *
 * - it marks the board `data-lit` once it's well in view, which starts the
 *   fill and the flame (CSS transitions);
 * - it lets a pointer or a finger paint: the squares it passes pop and
 *   glow, and a press sends a ring of light out through the board. Drawn
 *   on a canvas laid over the squares, only while something is happening;
 *   nothing is sized or drawn until the first touch. Squares are numbered
 *   column by column, the way the board fills. Horizontal drags paint on
 *   touch screens; vertical ones still scroll the page. Off under reduced
 *   motion.
 */
export function StreakPaint({ cols, rows, count }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const board = ref.current?.closest<HTMLElement>("[data-layout]");
    if (!board) return;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        board.setAttribute("data-lit", "");
      },
      { threshold: 0.6 },
    );
    seen.observe(board);
    return () => seen.disconnect();
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    const grid = canvas?.parentElement;
    if (!canvas || !grid || reduced) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let ctx: CanvasRenderingContext2D | null = null;
    let width = 0;
    let height = 0;
    let frame = 0;
    let pressing = false;
    let pointer: { x: number; y: number } | null = null;
    let ring: { x: number; y: number; t: number } | null = null;
    const pops = new Map<number, number>();
    let painted = new Set<number>();
    const hovered = new Set<number>();

    // Sized on demand, in CSS pixels: the page may have scrolled or resized since last time.
    const measure = () => {
      const box = grid.getBoundingClientRect();
      if (!ctx || box.width !== width || box.height !== height) {
        width = box.width;
        height = box.height;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx = canvas.getContext("2d");
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      return box;
    };

    const square = (c: number, r: number, unit: number, grow: number, alpha: number) => {
      if (!ctx) return;
      const size = 8 * unit * grow;
      const x = (c * 10 + 5) * unit - size / 2;
      const y = (r * 10 + 5) * unit - size / 2;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, 2 * unit * grow);
      ctx.fill();
    };

    const draw = (now: number) => {
      frame = 0;
      const box = measure();
      if (!ctx) return;
      const unit = width / (cols * 10);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#eafff1";
      ctx.shadowColor = "#39d353";
      ctx.shadowBlur = 10;
      let alive = false;

      // Paint whatever square the pointer is over now.
      if (pointer) {
        const c = Math.floor((pointer.x - box.left) / (10 * unit));
        const r = Math.floor((pointer.y - box.top) / (10 * unit));
        const i = c * rows + r;
        if (c >= 0 && r >= 0 && c < cols && r < rows && i < count) {
          if (now - (pops.get(i) ?? -1e9) > 250) pops.set(i, now);
          (pressing ? painted : hovered).add(i);
          if (painted.size >= 10 || hovered.size >= 40) discover("streak");
        }
        pointer = null;
      }

      // A pressed square rings out through the board.
      if (ring) {
        const t = (now - ring.t) / 1200;
        if (t >= 1) ring = null;
        else {
          alive = true;
          const radius = (1 - (1 - t) ** 2) * Math.hypot(width, height);
          const band = 28 * unit;
          for (let i = 0; i < count; i++) {
            const c = Math.floor(i / rows);
            const r = i % rows;
            const near = 1 - Math.abs(Math.hypot((c * 10 + 5) * unit - ring.x, (r * 10 + 5) * unit - ring.y) - radius) / band;
            if (near > 0) square(c, r, unit, 1 + near * 0.35, near * (1 - t) * 0.8);
          }
        }
      }

      for (const [i, born] of pops) {
        const age = (now - born) / 700;
        if (age >= 1) {
          pops.delete(i);
          continue;
        }
        alive = true;
        // Swells quickly, settles slowly.
        const grow = 1 + 0.75 * Math.sin(Math.PI * Math.min(1, age * 1.8)) * (1 - age * 0.5);
        square(Math.floor(i / rows), i % rows, unit, grow, 1 - age);
      }
      ctx.globalAlpha = 1;
      if (alive) frame = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const onDown = (event: PointerEvent) => {
      const box = measure();
      pressing = true;
      painted = new Set();
      ring = { x: event.clientX - box.left, y: event.clientY - box.top, t: performance.now() };
      pointer = { x: event.clientX, y: event.clientY };
      kick();
    };
    const onMove = (event: PointerEvent) => {
      if (!pressing && !(fine && event.pointerType === "mouse")) return;
      pointer = { x: event.clientX, y: event.clientY };
      kick();
    };
    const onUp = () => {
      pressing = false;
    };

    grid.addEventListener("pointerdown", onDown);
    grid.addEventListener("pointermove", onMove);
    grid.addEventListener("pointerup", onUp);
    grid.addEventListener("pointercancel", onUp);
    grid.addEventListener("pointerleave", onUp);
    return () => {
      cancelAnimationFrame(frame);
      grid.removeEventListener("pointerdown", onDown);
      grid.removeEventListener("pointermove", onMove);
      grid.removeEventListener("pointerup", onUp);
      grid.removeEventListener("pointercancel", onUp);
      grid.removeEventListener("pointerleave", onUp);
    };
  }, [reduced, cols, rows, count]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
