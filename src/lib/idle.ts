import { startTransition, useEffect, useState } from "react";

/*
 * Idle-time work, one piece per idle period, in the order it was asked for.
 * Mounting an interactive is a burst of rendering and layout; done while the
 * page is idle — usually while the reader is still further up — it doesn't
 * land in the middle of a scroll.
 *
 * "low" work (static drawings nobody needs yet) goes after everything else,
 * and only once scrolling has settled: a fresh SVG's first layout is slow
 * enough to drop frames on a mid-range phone. "high" work (what a reader
 * reaches first) gets an idle callback of its own with a deadline: a slow
 * phone that keeps scrolling has no idle periods, and a blank card is worse
 * than one busy frame. Client-only.
 */
const queues: Record<"normal" | "low", (() => void)[]> = { normal: [], low: [] };
let draining = false;
let lastScroll = -Infinity;
const SETTLED = 300;
const later = (fn: () => void, deadline?: number) =>
  typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn, deadline ? { timeout: deadline } : undefined) : window.setTimeout(fn, 200);

function next() {
  if (queues.normal.length) queues.normal.shift()!();
  else if (performance.now() - lastScroll >= SETTLED) queues.low.shift()?.();
  if (queues.normal.length || queues.low.length) later(next);
  else draining = false;
}

/**
 * Queue a task for an idle period. "high" runs in the next idle period, or
 * within 400ms whatever happens; "low" waits for normal work and for
 * scrolling to settle.
 */
export function whenIdle(task: () => void, priority: "high" | "normal" | "low" = "normal") {
  if (priority === "high") {
    later(task, 400);
    return;
  }
  if (priority === "low" && lastScroll === -Infinity) {
    // Scroll events on the page and in any scroller (capture sees both).
    lastScroll = 0;
    window.addEventListener("scroll", () => (lastScroll = performance.now()), { passive: true, capture: true });
  }
  queues[priority].push(task);
  if (draining) return;
  draining = true;
  later(next);
}

/**
 * False until an idle period of its own has come round, then true, set as an
 * interruptible transition. "low" (the default) also waits for normal work
 * and for scrolling to settle; "high" is for what a reader reaches first.
 */
export function useIdle(priority: "high" | "normal" | "low" = "low") {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    whenIdle(() => !cancelled && startTransition(() => setReady(true)), priority);
    return () => {
      cancelled = true;
    };
  }, [priority]);
  return ready;
}
