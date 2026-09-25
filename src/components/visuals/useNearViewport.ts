"use client";

import { useEffect, useRef, useState } from "react";

/** True once the element comes within `margin` of the viewport; never flips back. */
export function useNearViewport<T extends Element>(margin = "600px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin, near]);

  return [ref, near] as const;
}

/** Runs `callback` every `ms` while `active` and the tab is visible. */
export function useInterval(callback: () => void, ms: number, active: boolean) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  });
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") saved.current();
    }, ms);
    return () => window.clearInterval(id);
  }, [ms, active]);
}

/** Live visibility, for pausing timers while a visual is scrolled away. */
export function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible] as const;
}
