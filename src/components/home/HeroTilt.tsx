"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";

const MAX_X = 2.5; // degrees
const MAX_Y = 3.5;

/**
 * A few degrees of perspective that follow a fine pointer. Written straight to
 * the element's style inside requestAnimationFrame — no React state per move —
 * and switched off for touch, reduced motion and when the hero is off screen.
 */
export function HeroTilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let visible = true;
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(el);

    const onMove = (event: PointerEvent) => {
      if (!visible) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        el.style.transform = `perspective(2200px) rotateX(${(-y * MAX_X).toFixed(2)}deg) rotateY(${(x * MAX_Y).toFixed(2)}deg)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      data-tilt
      className={`transition-transform duration-700 ease-(--ease-out) will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
