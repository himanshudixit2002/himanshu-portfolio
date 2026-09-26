import type { CSSProperties } from "react";
import Link from "next/link";
import type { Project } from "@/content/types";
import { vizFor } from "@/lib/metric-viz";
import { SnapGallery } from "@/components/motion/SnapGallery";
import { ArrowRight } from "@/components/ui/icons";
import { MiniVisual } from "@/components/visuals/MiniVisual";
import { MetricFigure } from "./MetricFigure";
import s from "./case.module.css";

const stagger = (i: number) => ({ "--reveal-i": i }) as CSSProperties;

/** The project's figures, each with a small, exact picture of itself. */
export function Metrics({ project }: { project: Project }) {
  return (
    <dl className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {project.metrics.map((m, i) => {
        const viz = vizFor(m);
        return (
        <div key={m.label} data-reveal style={stagger(i)} className="flex flex-col border-t border-white/12 pt-5">
          <dt className="order-2 mt-2 text-sm leading-relaxed text-muted-inverse">{m.label}</dt>
          <dd className="order-1">
            {/* Tiles side by side keep their numbers level; alone, an empty slot collapses. */}
            <span className={`items-end pb-4 sm:flex sm:min-h-14 ${viz.kind === "none" ? "hidden" : "flex min-h-14"}`}>
              <MetricFigure viz={viz} accent={project.accent} />
            </span>
            <span className="text-title block text-[clamp(2.25rem,4vw,3.25rem)]">{m.value}</span>
          </dd>
        </div>
        );
      })}
    </dl>
  );
}

/** Decisions as an Apple-style gallery: a snapping row on phones, a grid from 768px. */
export function Decisions({ project }: { project: Project }) {
  const cards = project.decisions.map((d, i) => (
    <article key={d.title} className="flex h-full flex-col rounded-[1.5rem] bg-snow p-6 ring-1 ring-black/5 md:p-7">
      <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
      <h3 className="mt-2 text-lg font-semibold tracking-[-0.015em] text-balance">{d.title}</h3>
      <p className="mt-2 leading-relaxed text-muted">{d.body}</p>
    </article>
  ));
  return <SnapGallery label="Decisions worth explaining" items={cards} stackFrom="md" columns={Math.min(2, cards.length)} tone="light" />;
}

/** How to check the work, and where it stops — ticks and cautions draw in. */
export function Proof({ project }: { project: Project }) {
  return (
    <div className="container-page grid gap-12 md:grid-cols-2">
      {project.evidence.length > 0 && (
        <div data-reveal>
          <p className="text-eyebrow text-accent-bright">How you can check it</p>
          <ul className="mt-5 grid gap-3.5">
            {project.evidence.map((e, i) => (
              <li key={e} className="flex gap-3 leading-relaxed text-muted-inverse">
                <Mark kind="check" i={i} />
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}
      {project.limitations.length > 0 && (
        <div data-reveal style={stagger(1)}>
          <p className="text-eyebrow text-amber-300">Limits, honestly</p>
          <ul className="mt-5 grid gap-3.5">
            {project.limitations.map((l, i) => (
              <li key={l} className="flex gap-3 leading-relaxed text-muted-inverse">
                <Mark kind="limit" i={i} />
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Mark({ kind, i }: { kind: "check" | "limit"; i: number }) {
  const check = kind === "check";
  return (
    <svg viewBox="0 0 20 20" className={`mt-0.5 size-5 flex-none ${check ? "text-accent-bright" : "text-amber-300"}`} aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.12" />
      {check ? (
        <path className={s.tick} style={{ "--u": i } as CSSProperties} d="M6 10.4l2.6 2.6L14 7.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
      ) : (
        <path className={s.tick} style={{ "--u": i } as CSSProperties} d="M10 5.8v5.4M10 14.2v.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" pathLength={1} />
      )}
    </svg>
  );
}

/** The next project, as a door: its colour, its mark, one step away. */
export function NextProject({ next }: { next: Project }) {
  return (
    <Link
      href={`/work/${next.slug}`}
      data-loops
      className={`${s.next} group relative isolate grid items-center overflow-hidden rounded-[2rem] bg-ink-2 ring-1 ring-white/8 md:grid-cols-[1fr_20rem]`}
    >
      <span
        aria-hidden="true"
        className={`${s.nextGlow} absolute inset-0 -z-10`}
        style={{ background: `radial-gradient(70% 90% at 85% 50%, ${next.accent}24, transparent 70%)` }}
      />
      <span className="p-7 md:p-10">
        <span className="text-eyebrow text-dim-inverse">Next project</span>
        <span className="mt-3 block text-display text-[clamp(2.25rem,5vw,4rem)]" style={{ color: next.accent }}>
          {next.title}
        </span>
        <span className="mt-3 flex items-center gap-2 text-muted-inverse">
          {next.tagline}
          <ArrowRight className="size-4 flex-none transition-transform duration-(--dur-base) group-hover:translate-x-1.5" />
        </span>
      </span>
      <span aria-hidden="true" className="hidden aspect-[16/10] [mask-image:radial-gradient(closest-side,black_55%,transparent)] md:block">
        <MiniVisual id={next.visual} accent={next.accent} />
      </span>
    </Link>
  );
}
