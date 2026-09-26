"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";

/**
 * Brings the project cards inside `ref` to life, with one observer or one
 * listener for all of them:
 *
 * - On touch screens, a card is active ([data-active]) while it crosses the
 *   middle fifth of the screen, so its drawing plays as it would under a
 *   pointer (mini.module.css).
 * - Under a fine pointer, a soft light in the card's accent follows the
 *   pointer and the card tilts a few degrees toward it: its
 *   [data-card-light] layer and the card itself get a transform inside
 *   requestAnimationFrame — no React state, no custom properties to restyle
 *   the card's subtree.
 *
 * Off with reduced motion; the cards are complete without it.
 */
export function useCardFocus(ref: RefObject<HTMLElement | null>) {
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;

    if (window.matchMedia("(hover: none)").matches) {
      const cards = root.querySelectorAll<HTMLElement>("[data-card]");
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) entry.target.toggleAttribute("data-active", entry.isIntersecting);
        },
        { rootMargin: "-40% 0px -40% 0px" },
      );
      cards.forEach((card) => io.observe(card));
      return () => {
        io.disconnect();
        cards.forEach((card) => card.removeAttribute("data-active"));
      };
    }

    if (!window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    let tilted: HTMLElement | null = null;
    const settle = () => {
      if (tilted) tilted.style.transform = "";
      tilted = null;
    };
    const move = (event: PointerEvent) => {
      const card = (event.target as Element).closest<HTMLElement>("[data-card]");
      const light = card?.querySelector<HTMLElement>("[data-card-light]");
      if (card !== tilted) settle();
      if (!card || !light) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = card.getBoundingClientRect();
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        light.style.transform = `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0)`;
        // A few degrees toward the pointer, as if pressed where it points.
        const rx = (0.5 - y / box.height) * 5;
        const ry = (x / box.width - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        tilted = card;
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      settle();
    };
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      settle();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
    };
  }, [ref, reduced]);
}

/** A grid of project cards with useCardFocus. */
export function CardGrid({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useCardFocus(ref);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
