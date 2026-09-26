"use client";

import { useEffect, useRef } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import s from "./spotlight.module.css";

/**
 * A soft light that follows a fine pointer across the hero, showing a faint
 * dot grid where it falls. The lens moves to the pointer and the grid inside
 * it moves the opposite way, so the dots stay put on the page while the
 * light passes over them: two transforms per frame, no repaint. Absent on
 * touch screens and under reduced motion, and paused while the hero is off
 * screen.
 */
export function HeroSpotlight() {
  const root = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const el = root.current;
    const hero = el?.parentElement;
    if (!el || !hero || !lens.current || !grid.current || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const lensEl = lens.current;
    const gridEl = grid.current;

    // The grid is the hero's size, so every dot has a fixed place on the page.
    const size = new ResizeObserver(() => {
      gridEl.style.width = `${hero.offsetWidth}px`;
      gridEl.style.height = `${hero.offsetHeight}px`;
    });
    size.observe(hero);

    let visible = true;
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) el.removeAttribute("data-on");
    });
    seen.observe(hero);

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (!visible || event.pointerType !== "mouse") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = hero.getBoundingClientRect();
        const r = lensEl.offsetWidth / 2;
        const x = event.clientX - box.left - r;
        const y = event.clientY - box.top - r;
        lensEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        gridEl.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
        el.setAttribute("data-on", "");
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.removeAttribute("data-on");
    };

    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      seen.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      el.removeAttribute("data-on");
    };
  }, [reduced]);

  return (
    <div ref={root} aria-hidden="true" className={s.spot}>
      <div ref={lens} className={s.lens}>
        <div ref={grid} className={s.grid} />
      </div>
    </div>
  );
}
