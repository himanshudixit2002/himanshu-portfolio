"use client";

import { useEffect, useRef } from "react";
import { useMotionPreference } from "./MotionPreferences";

/**
 * Tracks a fine pointer over an element as --mx / --my (0–1) and --hover
 * (0 or 1) custom properties, for highlights and glare drawn in CSS. Written
 * inside requestAnimationFrame straight to the element's style — no React
 * state per move — and inert for touch and reduced motion.
 */
export function usePointerLight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((event.clientX - box.left) / box.width).toFixed(3));
        el.style.setProperty("--my", ((event.clientY - box.top) / box.height).toFixed(3));
        el.style.setProperty("--hover", "1");
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--hover", "0");
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
      el.style.removeProperty("--hover");
    };
  }, [reduced]);

  return ref;
}
