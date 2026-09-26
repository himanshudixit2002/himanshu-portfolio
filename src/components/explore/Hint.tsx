"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { dismissHint, hintsSnapshot, parseList, subscribeExplored } from "@/lib/explored";
import s from "./hint.module.css";

type Arrow = "down-left" | "down-right" | "left";

type Props = {
  /** Remembered per id: once acted on, this hint doesn't come back. */
  id: string;
  children: string;
  /** Where the arrow points, from the note. */
  arrow?: Arrow;
  tone?: "dark" | "light";
  /** Place it with absolute positioning; its parent is what it points at. */
  className?: string;
  /** Only on touch screens (a "swipe"). */
  touch?: boolean;
};

const ARROWS: Record<Arrow, { box: string; shaft: string; head: string }> = {
  "down-left": { box: "0 0 48 38", shaft: "M44 5 C 30 2, 13 10, 8 31", head: "M3 23 L8 33 L15 25" },
  "down-right": { box: "0 0 48 38", shaft: "M4 5 C 18 2, 35 10, 40 31", head: "M45 23 L40 33 L33 25" },
  left: { box: "0 0 52 26", shaft: "M50 16 C 38 4, 20 24, 5 12", head: "M12 5 L4 12 L13 17" },
};

/**
 * A hand-written "try me" note with a drawn arrow, for an interactive that
 * doesn't look like one at first glance. It draws itself in once it's fully
 * in view and leaves, for good, the first time its parent is touched, typed
 * in or (for touch hints) scrolled. Decorative: what it invites is already
 * in the text around it. Positioned absolutely, so it never moves anything.
 */
export function Hint({ id, children, arrow = "down-left", tone = "dark", className = "", touch = false }: Props) {
  const raw = useSyncExternalStore<string | null>(subscribeExplored, hintsSnapshot, () => null);
  const done = raw === null || parseList(raw).includes(id);
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || done) return;
    let timer = 0;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        timer = window.setTimeout(() => setShown(true), 450);
      },
      { threshold: 1, rootMargin: "0px 0px -12% 0px" },
    );
    seen.observe(el);

    const used = (event: Event) => {
      if (event instanceof KeyboardEvent && ["Tab", "Shift", "Escape"].includes(event.key)) return;
      setLeaving(true);
      dismissHint(id);
    };
    const events = touch ? ["scroll", "pointerdown"] : ["pointerdown", "keydown", "input"];
    events.forEach((type) => host.addEventListener(type, used, { capture: true, passive: true }));
    return () => {
      seen.disconnect();
      window.clearTimeout(timer);
      events.forEach((type) => host.removeEventListener(type, used, { capture: true }));
    };
  }, [id, done, touch]);

  if (done && !leaving) return null;
  const a = ARROWS[arrow];
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`${s.hint} ${className}`}
      data-arrow={arrow}
      data-tone={tone}
      data-touch={touch || undefined}
      data-shown={(shown && !leaving) || undefined}
    >
      <span className={s.text}>{children}</span>
      <svg viewBox={a.box} className={s.arrow} focusable="false">
        <path d={a.shaft} pathLength={1} />
        <path d={a.head} pathLength={1} className={s.head} />
      </svg>
    </span>
  );
}
