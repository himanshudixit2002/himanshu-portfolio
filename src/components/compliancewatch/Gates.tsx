import type { CSSProperties } from "react";
import { GATES } from "@/content/compliancewatch/system";
import caseStyles from "@/components/case/case.module.css";
import s from "./deep.module.css";

/** What every change passes before it merges: one required check that needs all the others. Ticks draw in as the grid scrolls in. */
export function Gates({ accent }: { accent: string }) {
  return (
    <div data-reveal="">
      <ul className={s.gates}>
        {GATES.map((g, i) => (
          <li key={g.name} className={s.gate}>
            <svg viewBox="0 0 20 20" className="mt-0.5 size-5 flex-none" style={{ color: accent }} aria-hidden="true">
              <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.14" />
              <path className={caseStyles.tick} style={{ "--u": i } as CSSProperties} d="M6 10.4l2.6 2.6L14 7.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
            </svg>
            <span className="min-w-0">
              <span className="block font-semibold tracking-[-0.01em] text-fg-inverse">{g.name}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-muted-inverse text-pretty">{g.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className={s.required} style={{ "--accent": accent } as CSSProperties}>
        <span className="rounded-full px-3 py-1 font-mono text-sm font-semibold text-ink" style={{ background: accent }}>
          CI gate
        </span>
        <span className="text-sm text-muted-inverse">One required check on every pull request, and it needs every job above. Nightly, the evals run again against a real model, with a fuzz run and a fresh scan.</span>
      </p>
    </div>
  );
}
