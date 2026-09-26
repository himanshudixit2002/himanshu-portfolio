"use client";

import Link from "next/link";
import { useEffect, useMemo, type CSSProperties } from "react";
import { Close } from "@/components/ui/icons";
import s from "./explore.module.css";

/** A fixed, even-looking scatter in [0, 1) for dot i. */
const scatter = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * The thank-you for opening every case study: a note at the foot of the
 * screen, with a dot in each project's accent bursting from it. Transforms
 * and opacity only; under reduced motion the note simply appears (see
 * explore.module.css). Closes with its button, Escape, or by itself.
 */
export default function Celebration({ accents, total, onClose }: { accents: string[]; total: number; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const timer = window.setTimeout(onClose, 14000);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Two dots per project, spread round the circle with a little scatter.
  const dots = useMemo(() => {
    const all = [...accents, ...accents];
    return all.map((color, i) => {
      const angle = (i / all.length) * Math.PI * 2 + (scatter(i) - 0.5) * 0.4;
      const reach = 5 + scatter(i + 50) * 5;
      return {
        color,
        style: {
          "--dx": `${(Math.cos(angle) * reach).toFixed(2)}rem`,
          "--dy": `${(Math.sin(angle) * reach * 0.8 - 2).toFixed(2)}rem`,
          "--d": `${Math.round(scatter(i + 100) * 120)}ms`,
          background: color,
        } as CSSProperties,
      };
    });
  }, [accents]);

  return (
    <div role="status" className={s.party}>
      <span aria-hidden="true" className={s.burst}>
        {dots.map((d, i) => (
          <span key={i} className={s.spark} style={d.style} />
        ))}
      </span>
      <p className="pr-8 font-semibold tracking-[-0.01em]">All {total} projects explored.</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-inverse">
        Thanks for looking around properly. If something caught your eye, I&rsquo;d love to hear about it.
      </p>
      <Link
        href="/#contact"
        onClick={onClose}
        className="mt-4 inline-flex min-h-10 items-center rounded-full bg-fg-inverse px-4 text-sm font-medium text-ink transition-[scale] duration-(--dur-micro) active:scale-[0.97]"
      >
        Say hello
      </Link>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2 right-2 grid size-10 place-items-center rounded-full text-muted-inverse transition-colors hover:text-fg-inverse"
      >
        <Close className="size-4" />
      </button>
    </div>
  );
}
