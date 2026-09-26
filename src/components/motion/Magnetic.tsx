"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "./MotionPreferences";

/**
 * A few pixels of pull toward a fine pointer while it's over the child — the
 * primary call to action leaning in. Written to the style inside
 * requestAnimationFrame (no React state per move); off for touch and reduced
 * motion. The wrapper, not the child, moves, so the child's own press scale
 * still works.
 */
export function Magnetic({ children, strength = 6 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    // Measured on entry, before any pull, so the pull doesn't feed back into itself.
    let box: DOMRect | null = null;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const enter = () => {
      box = el.getBoundingClientRect();
    };
    const move = (event: PointerEvent) => {
      if (!box) return;
      const b = box;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const dx = clamp((event.clientX - (b.left + b.width / 2)) / (b.width / 2));
        const dy = clamp((event.clientY - (b.top + b.height / 2)) / (b.height / 2));
        el.style.transform = `translate3d(${(dx * strength).toFixed(1)}px, ${(dy * strength * 0.6).toFixed(1)}px, 0)`;
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      box = null;
      el.style.transform = "";
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.style.transform = "";
    };
  }, [reduced, strength]);

  return (
    <span ref={ref} className="inline-flex transition-transform duration-(--dur-base) ease-(--ease-out)">
      {children}
    </span>
  );
}
