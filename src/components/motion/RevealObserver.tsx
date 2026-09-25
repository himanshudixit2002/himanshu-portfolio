"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Drives every `[data-reveal]` element on the page with one observer, so
 * server components can opt into a section entrance with an attribute.
 * Anything already on screen when this runs is marked shown immediately; the
 * rest fade up as they enter. Nothing is hidden until this has run.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])"));
    const viewportBottom = window.innerHeight;

    const offscreen = pending.filter((el) => {
      const top = el.getBoundingClientRect().top;
      if (top < viewportBottom) {
        el.setAttribute("data-shown", "");
        return false;
      }
      return true;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    offscreen.forEach((el) => observer.observe(el));
    root.setAttribute("data-reveal-ready", "");

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
