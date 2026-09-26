import { startTransition, useEffect, useState } from "react";

/*
 * Idle-time work, one piece per idle period, in the order it was asked for.
 * Mounting an interactive is a burst of rendering and layout; done while the
 * page is idle — usually while the reader is still further up — it doesn't
 * land in the middle of a scroll.
 *
 * "low" work (static drawings nobody needs yet) goes after everything else,
 * and only once scrolling has settled: a fresh SVG's first layout is slow
 * enough to drop frames on a mid-range phone. Client-only.
 */
const queues: Record<"normal" | "low", (() => void)[]> = { normal: [], low: [] };
let draining = false;
let lastScroll = -Infinity;
const SETTLED = 300;
const later = (fn: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn) : window.setTimeout(fn, 200));

function next() {
  if (queues.normal.length) queues.normal.shift()!();
  else if (performance.now() - lastScroll >= SETTLED) queues.low.shift()?.();
  if (queues.normal.length || queues.low.length) later(next);
  else draining = false;
}

export function whenIdle(task: () => void, priority: "normal" | "low" = "normal") {
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

/** False until an idle period of its own has come round (after normal-priority work, with scrolling settled), then true, set as an interruptible transition. */
export function useIdle() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    whenIdle(() => !cancelled && startTransition(() => setReady(true)), "low");
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}
