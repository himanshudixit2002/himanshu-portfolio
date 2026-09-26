import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { achievements, certifications, cleartrip, education } from "@/content/experience";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import type { ProjectCategory } from "@/content/types";
import { formatPeriod } from "@/lib/format";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRight } from "@/components/ui/icons";
import s from "./glance.module.css";

const k = (n: number) => ({ "--k": n }) as CSSProperties;
const rise = (i: number) => ({ "--sd-i": i }) as CSSProperties;

const CATEGORIES: ProjectCategory[] = ["Product", "Systems", "AI & Data", "Tools"];
/** Every project, in the order it began: the matrix's columns. */
const BY_START = [...projects].sort((a, b) => a.period.start.localeCompare(b.period.start));

/**
 * Right after the hero: who Himanshu is, on one screen. Every fact is the
 * site's own content — the profile, the Cleartrip role, education,
 * certifications, the practice figure and the projects — laid out as an
 * Apple-style bento that rises as a sheet over the hero.
 */
export function AtAGlance() {
  const practice = achievements[0];
  const figure = practice.match(/\d[\d,]*\+?/)?.[0] ?? "";
  const school = education.school.match(/\(([^)]+)\)/)?.[1] ?? education.school;

  return (
    <section id="hello" aria-labelledby="hello-title" className="surface-light sd-sheet section-y bg-paper text-fg">
      <div className="container-page">
        <p data-reveal className="text-eyebrow text-muted">
          At a glance
        </p>
        <h2 id="hello-title" data-reveal className="mt-4 max-w-4xl text-display text-[clamp(2.25rem,5.6vw,4.5rem)]">
          Hello, I&rsquo;m {profile.name.split(" ")[0]}.
        </h2>
        <p data-reveal className="text-lede mt-5 max-w-3xl text-muted">
          {profile.bio[0]}
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Who: the monogram writes itself. */}
          <div
            className={`${s.monoTile} sd-rise relative flex flex-col justify-between gap-8 overflow-hidden rounded-[1.75rem] bg-ink p-7 text-fg-inverse md:col-span-2 lg:row-span-2 lg:p-9`}
            style={rise(0)}
          >
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(92_164_255/0.28),transparent)]" />
            <Monogram />
            <div className="relative">
              <p className="text-title text-[clamp(1.75rem,3vw,2.5rem)]">{profile.name}</p>
              <p className="mt-2 text-muted-inverse">
                {profile.role} · {profile.location}
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-6">
                {[profile.links.github, profile.links.linkedin].map((link) => (
                  <li key={link.href}>
                    <ButtonLink href={link.href} variant="text" external>
                      {link.label}
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Now. */}
          <Tile label="Now" className="md:col-span-2" i={1}>
            <p className="flex items-center gap-3 text-title text-[clamp(1.5rem,2.4vw,2rem)]">
              <span aria-hidden="true" className="live-dot" />
              {profile.availability}
            </p>
            <p className="mt-3 leading-relaxed text-muted">
              Most recently {cleartrip.title} at {cleartrip.company} ({cleartrip.via}), {formatPeriod(cleartrip.period)}, in {cleartrip.location}.
            </p>
            <Link href="#contact" className="group mt-5 inline-flex min-h-11 items-center gap-2 font-medium text-accent">
              <span className="link-draw">Get in touch</span>
              <ArrowRight className="size-4 transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0.5" />
            </Link>
          </Tile>

          {/* Education. */}
          <Tile label="Education" i={1}>
            <p className="text-display text-5xl">{school}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {education.degree}. {education.specialization}.
            </p>
            <p className="mt-2 font-mono text-xs text-muted">
              {education.period.start}–{education.period.end} · {education.location}
            </p>
          </Tile>

          {/* Certifications. */}
          <Tile label="Certified" i={2}>
            <ul className="grid gap-4">
              {certifications.map((c) => (
                <li key={c.name} className="flex gap-3">
                  <Cloud />
                  <p className="text-sm leading-snug">
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="link-draw font-semibold">
                      {c.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <span className="block text-muted">
                      {c.issuer}, {c.year}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </Tile>

          {/* Practice: the figure as text, and that many dots. */}
          <Tile label="Practice" className="md:col-span-2" i={0}>
            <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              <div>
                <p className="text-display text-[clamp(3rem,6vw,4.5rem)] tabular-nums">{figure}</p>
                <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-muted">{practice}</p>
              </div>
              <PracticeDots count={Number.parseInt(figure, 10) || 0} />
            </div>
          </Tile>

          {/* Range: every project, and what kind of work it is. */}
          <Tile label="Range" className="md:col-span-2" i={1}>
            <ProjectMatrix />
            <Link href="/work" className="group mt-4 inline-flex min-h-11 items-center gap-2 font-medium text-accent">
              <span className="link-draw">All {projects.length} projects</span>
              <ArrowRight className="size-4 transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0.5" />
            </Link>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ label, className = "", i, children }: { label: string; className?: string; i: number; children: ReactNode }) {
  return (
    <div className={`sd-rise rounded-[1.75rem] bg-snow p-6 ring-1 ring-black/5 lg:p-7 ${className}`} style={rise(i)}>
      <p className="mb-4 text-eyebrow text-muted">{label}</p>
      {children}
    </div>
  );
}

/** "HD", written in five strokes. Decorative: the name is set beside it. */
function Monogram() {
  const strokes = [
    "M22 16 V104",
    "M22 60 H72",
    "M72 16 V104",
    "M104 16 V104",
    "M104 16 H126 C160 16 178 36 178 60 C178 84 160 104 126 104 H104",
  ];
  return (
    <svg viewBox="0 0 200 120" className="relative w-44 md:w-64" aria-hidden="true" focusable="false">
      <defs>
        {/* In the drawing's own units: a bounding-box gradient doesn't paint a straight stroke, whose box has no width or height. */}
        <linearGradient id="mono-ink" gradientUnits="userSpaceOnUse" x1="20" y1="10" x2="180" y2="110">
          <stop offset="0" stopColor="#8ec1ff" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#mono-ink)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
        {strokes.map((d, i) => (
          <path key={d} className={s.stroke} style={k(i)} d={d} pathLength={1} />
        ))}
      </g>
    </svg>
  );
}

function Cloud() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 size-5 flex-none text-accent" aria-hidden="true" focusable="false">
      <path d="M7 18h10.5a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7.4 9.1 4.5 4.5 0 0 0 7 18Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** One dot per problem, in rows of 30; a band of light crosses them as the tile passes. */
function PracticeDots({ count }: { count: number }) {
  const cols = 30;
  const rows = Math.ceil(count / cols);
  const dots = (fill: string) => (
    <svg viewBox={`0 0 ${cols * 10} ${rows * 10}`} className="block h-full w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id={`dot-${fill.replace(/\W/g, "")}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2.1" fill={fill} />
        </pattern>
      </defs>
      <rect width={cols * 10} height={rows * 10} fill={`url(#dot-${fill.replace(/\W/g, "")})`} />
    </svg>
  );
  return (
    <div aria-hidden="true" className={`${s.dots} relative aspect-[3/2] w-full`}>
      {dots("rgb(0 0 0 / 0.13)")}
      <div className={s.band}>
        <div className={s.bandDots}>{dots("#0a66d8")}</div>
      </div>
    </div>
  );
}

/** Rows are kinds of work, columns are projects in the order they began; a filled dot is a project of that kind. */
function ProjectMatrix() {
  // Drawn at its own pixel size, so its rows line up with the labels beside it.
  const step = 16;
  const gap = 5;
  const width = BY_START.length * step;
  const height = CATEGORIES.length * (step + gap) - gap;
  return (
    <div>
      <div className={`${s.matrixBox} flex items-center gap-3`}>
        <ul className="grid w-[5.5rem] flex-none text-sm sm:w-[7rem]" style={{ gridTemplateRows: `repeat(${CATEGORIES.length}, ${step}px)`, rowGap: gap }}>
          {CATEGORIES.map((c) => (
            <li key={c} className="flex items-center justify-between gap-2 leading-none">
              <span className="truncate">{c}</span>
              <span className="font-mono text-xs text-muted tabular-nums">{projects.filter((p) => p.categories.includes(c)).length}</span>
            </li>
          ))}
        </ul>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block flex-none" aria-hidden="true" focusable="false">
          {BY_START.map((p, x) => (
            <g key={p.slug} className={s.column} style={k(x)}>
              {CATEGORIES.map((c, y) => {
                const on = p.categories.includes(c);
                return <circle key={c} cx={x * step + step / 2} cy={y * (step + gap) + step / 2} r={on ? 5.5 : 1.8} fill={on ? p.accent : "rgb(0 0 0 / 0.16)"} />;
              })}
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-3 text-xs text-muted">Each column is a project, in the order it began.</p>
      <ul className="sr-only">
        {CATEGORIES.map((c) => (
          <li key={c}>
            {c}: {projects.filter((p) => p.categories.includes(c)).map((p) => p.title).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
