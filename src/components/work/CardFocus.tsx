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
 *   pointer: its [data-card-light] layer is moved with a transform inside
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
    const move = (event: PointerEvent) => {
      const card = (event.target as Element).closest<HTMLElement>("[data-card]");
      const light = card?.querySelector<HTMLElement>("[data-card-light]");
      if (!card || !light) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = card.getBoundingClientRect();
        light.style.transform = `translate3d(${(event.clientX - box.left).toFixed(0)}px, ${(event.clientY - box.top).toFixed(0)}px, 0)`;
      });
    };
    root.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", move);
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
