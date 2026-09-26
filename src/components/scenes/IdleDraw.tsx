"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useIdle } from "@/lib/idle";

/**
 * A static frame's drawing, drawn in an idle period of its own: a row of
 * frames appears one by one instead of in a single long frame. Its box is
 * sized by the parent, so nothing moves when it arrives. `eager` draws it in
 * the first idle time after load, without waiting for scrolling to settle —
 * for what a reader reaches first, so it's never blank when they get there.
 */
export function IdleDraw({ children, eager = false }: { children: ReactNode; eager?: boolean }) {
  return useIdle(eager ? "high" : "low") ? <div className="drawn-in h-full">{children}</div> : null;
}

/**
 * A step card's drawing: as IdleDraw, but only once the card is within half
 * the row's width of its visible part; the rest are drawn as the row is
 * swiped towards them. The first cards pass `eager` and are drawn right after
 * load, wherever the row is, so the row is ready when it scrolls into view.
 */
export function CardDraw({ children, eager = false }: { children: ReactNode; eager?: boolean }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const [near, setNear] = useState(eager);
  useEffect(() => {
    if (!box || near) return;
    const row = box.closest(".snap-track");
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), { root: row, rootMargin: "0px 50% 0px 50%" });
    io.observe(box);
    return () => io.disconnect();
  }, [box, near]);
  return (
    <div ref={setBox} className="h-full">
      {near && <IdleDraw eager={eager}>{children}</IdleDraw>}
    </div>
  );
}

/**
 * Part of a live drawing that isn't showing yet: drawn in an idle period of
 * its own, or at once when `now` (its step has come). Splits a drawing's
 * first render into small pieces instead of one long frame on load.
 */
export function Later({ now, children }: { now: boolean; children: ReactNode }) {
  const idle = useIdle();
  // Once drawn, it stays: leaving its step fades it out rather than removing it.
  const [seen, setSeen] = useState(now);
  if (now && !seen) setSeen(true);
  return now || idle || seen ? <g className="drawn-in">{children}</g> : null;
}
