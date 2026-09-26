"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useIdle } from "@/lib/idle";

/**
 * A static frame's drawing, drawn in an idle period of its own: a row of
 * frames appears one by one instead of in a single long frame. Its box is
 * sized by the parent, so nothing moves when it arrives.
 */
export function IdleDraw({ children }: { children: ReactNode }) {
  return useIdle() ? <div className="drawn-in h-full">{children}</div> : null;
}

/**
 * A step card's drawing: as IdleDraw, but only once the card is within a
 * card's width of the row's visible part — cards further along are drawn as
 * the row is swiped towards them, not all on load.
 */
export function CardDraw({ children }: { children: ReactNode }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!box || near) return;
    const row = box.closest(".snap-track");
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), { root: row, rootMargin: "0px 100% 0px 100%" });
    io.observe(box);
    return () => io.disconnect();
  }, [box, near]);
  return (
    <div ref={setBox} className="h-full">
      {near && <IdleDraw>{children}</IdleDraw>}
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
