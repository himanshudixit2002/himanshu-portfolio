"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Drives every `[data-reveal]` element on the page with one observer, so
 * server components can opt into a section entrance with an attribute — in
 * browsers without scroll timelines; the rest do it in CSS (globals.css).
 *
 * Nothing is hidden until the observer's first report: it marks whatever is
 * on screen, or already scrolled past, as shown, and only then sets
 * data-reveal-ready — so nothing on screen flashes out and back. The rest
 * fade up as they come within a sixth of a screen of the bottom edge, so the
 * fade is done by the time they reach the part of the screen you read.
 * Positions come from the observer alone; nothing measures the page, so
 * off-screen sections are never laid out early just to be checked.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    // Scroll timelines drive reveals in CSS (globals.css); nothing to do.
    if (CSS.supports("animation-timeline: view()")) return;
    const root = document.documentElement;
    const pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])"));
    // A new page starts fully visible, like the first one, until the report.
    root.removeAttribute("data-reveal-ready");
    let first = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const past = first && entry.boundingClientRect.bottom < 0;
          if (!entry.isIntersecting && !past) continue;
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
        if (first) {
          first = false;
          root.setAttribute("data-reveal-ready", "");
        }
      },
      { rootMargin: "0px 0px 16% 0px" },
    );

    pending.forEach((el) => observer.observe(el));
    if (!pending.length) root.setAttribute("data-reveal-ready", "");

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
