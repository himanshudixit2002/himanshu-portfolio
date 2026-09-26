"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { discover } from "@/lib/explored";
import s from "./fix.module.css";

/** How far each half can travel toward the other, in drawing units; they meet at 12 each. */
const GAP = 24;

const SPARKS = [
  [80, 33, 80, 26],
  [72, 36, 68, 31],
  [88, 36, 92, 31],
  [80, 67, 80, 74],
  [72, 64, 68, 69],
  [88, 64, 92, 69],
];

/**
 * The 404's broken link, and a little game: drag the two halves together
 * (either one, with a mouse or a finger) and it mends — sparks fly and the
 * page says so. Short of that, a half springs back. The button does the
 * same from the keyboard, and undoes it. Without JavaScript it is just the
 * drawing, gently coming apart (not-found styles).
 */
export function FixTheLink({ idle }: { idle: { half: string; left: string; right: string; spark: string } }) {
  const svg = useRef<SVGSVGElement>(null);
  const left = useRef<SVGGElement>(null);
  const right = useRef<SVGGElement>(null);
  const drag = useRef<{ side: "left" | "right"; x: number; unit: number } | null>(null);
  const offset = useRef({ left: 0, right: 0 });
  const [fixed, setFixed] = useState(false);
  const [dragging, setDragging] = useState(false);

  const place = () => {
    // CSS pixels are the drawing's own units inside the SVG.
    if (left.current) left.current.style.transform = `translateX(${offset.current.left}px)`;
    if (right.current) right.current.style.transform = `translateX(${offset.current.right}px)`;
  };

  const mend = () => {
    offset.current = { left: GAP / 2, right: -GAP / 2 };
    place();
    setFixed(true);
    discover("fixer");
  };

  const reset = () => {
    offset.current = { left: 0, right: 0 };
    place();
    setFixed(false);
  };

  const grab = (side: "left" | "right", event: ReactPointerEvent) => {
    if (fixed || !svg.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    // Screen pixels per drawing unit: the drawing is 160 units wide.
    const unit = svg.current.getBoundingClientRect().width / 160;
    drag.current = { side, x: event.clientX - offset.current[side] * unit, unit };
    setDragging(true);
  };

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = (event.clientX - d.x) / d.unit;
      if (d.side === "left") offset.current.left = Math.max(0, Math.min(GAP, dx));
      else offset.current.right = Math.max(-GAP, Math.min(0, dx));
      place();
      if (offset.current.left - offset.current.right >= GAP - 2) {
        drag.current = null;
        setDragging(false);
        mend();
      }
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      setDragging(false);
      offset.current = { left: 0, right: 0 };
      place();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  });

  return (
    <div
      className="relative flex flex-wrap items-center gap-x-6 gap-y-3"
      data-xray="Client · the halves follow the pointer by transform and spring home or together · a button does it from the keyboard"
    >
      <svg
        ref={svg}
        viewBox="0 16 160 68"
        className={`${s.link} -ml-4 w-56 text-accent-bright`}
        data-fixed={fixed || undefined}
        data-dragging={dragging || undefined}
        aria-hidden="true"
        focusable="false"
      >
        <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
          <g ref={left} className={s.mover}>
            <path className={fixed ? undefined : `${idle.half} ${idle.left}`} d="M68 38 H34 a12 12 0 0 0 0 24 H68" />
            {/* A wide, invisible edge to grab. */}
            <path d="M68 38 H34 a12 12 0 0 0 0 24 H68" className={s.grab} onPointerDown={(e) => grab("left", e)} />
          </g>
          <g ref={right} className={s.mover}>
            <path className={fixed ? undefined : `${idle.half} ${idle.right}`} d="M92 38 H126 a12 12 0 0 1 0 24 H92" />
            <path d="M92 38 H126 a12 12 0 0 1 0 24 H92" className={s.grab} onPointerDown={(e) => grab("right", e)} />
          </g>
          {fixed && <path d="M68 50 H92" pathLength={1} className={s.bridge} />}
        </g>
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          {SPARKS.map(([x1, y1, x2, y2], i) => (
            <line key={i} className={fixed ? s.burst : idle.spark} style={{ "--k": i } as CSSProperties} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
      </svg>
      <div className="grid gap-1">
        {/* Always two lines, before and after, in either font: nothing below it
            moves. The invitation needs script, so without it there's one line. */}
        <p aria-live="polite" className="text-sm text-muted-inverse">
          {fixed ? "Fixed it." : "This link is broken."}
          <span className="needs-js">
            <br />
            {fixed ? "Now, where to?" : "Drag the halves together to fix it."}
          </span>
        </p>
        <button type="button" onClick={fixed ? reset : mend} className="needs-js hit justify-self-start text-sm font-medium text-accent-bright underline-offset-4 hover:underline">
          {fixed ? "Break it again" : "Fix it for me"}
        </button>
      </div>
    </div>
  );
}
