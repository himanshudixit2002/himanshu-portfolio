"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// False until the first page has hydrated, so the initial load keeps its own
// hero entrance and only client-side navigations fade in.
let hydrated = false;

/**
 * Fades each new page up on client-side navigation. Used from template files,
 * which remount on every navigation. Only the incoming page animates — opacity
 * and transform on the compositor, nothing captured or measured — and nested
 * templates mounting together animate once, from the outermost.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // Read while rendering, so templates that hydrate together all see false.
  const navigated = useRef(hydrated);

  useLayoutEffect(() => {
    hydrated = true;
    const el = ref.current;
    if (!el || !navigated.current) return;
    if (document.documentElement.getAttribute("data-motion") === "reduce") return;

    // Layout effects run child-first, so an inner template has already
    // started; the outer one takes over.
    el.querySelectorAll<HTMLElement>("[data-page]").forEach((inner) => inner.getAnimations().forEach((a) => a.cancel()));
    // Under a project's accent wipe (Fx), the page waits until the circle
    // has covered the screen, then rises as it lifts away.
    const wiping = document.documentElement.hasAttribute("data-wiping");
    const animation = el.animate(
      [
        { opacity: 0, transform: "translate3d(0, 14px, 0)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: wiping ? 420 : 320, delay: wiping ? 300 : 0, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
    );
    return () => animation.cancel();
  }, []);

  return (
    <div ref={ref} data-page="">
      {children}
    </div>
  );
}
