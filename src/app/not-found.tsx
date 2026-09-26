import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import s from "./not-found.module.css";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="container-page grid min-h-[80svh] content-center pt-(--nav-h)">
      <BrokenLink />
      <p className="mt-6 text-eyebrow text-accent-bright">404</p>
      <h1 className="mt-4 text-display text-[clamp(2.5rem,7vw,5.5rem)]">Nothing lives here.</h1>
      <p className="text-lede mt-5 max-w-xl text-muted-inverse">
        The page you were looking for doesn&rsquo;t exist — or hasn&rsquo;t been built yet.
      </p>
      <div className="mt-8">
        <ButtonLink href="/">Back to the homepage</ButtonLink>
      </div>
    </section>
  );
}

/** A link, broken in two. Decorative. */
function BrokenLink() {
  return (
    <svg viewBox="0 16 160 68" className="-ml-4 w-44 text-accent-bright" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path className={`${s.half} ${s.left}`} d="M68 38 H34 a12 12 0 0 0 0 24 H68" />
        <path className={`${s.half} ${s.right}`} d="M92 38 H126 a12 12 0 0 1 0 24 H92" />
      </g>
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {[
          [80, 33, 80, 26],
          [72, 36, 68, 31],
          [88, 36, 92, 31],
          [80, 67, 80, 74],
          [72, 64, 68, 69],
          [88, 64, 92, 69],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i} className={s.spark} style={{ "--k": i } as CSSProperties} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    </svg>
  );
}
