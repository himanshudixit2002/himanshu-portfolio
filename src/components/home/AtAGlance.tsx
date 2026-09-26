import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { achievements, certifications, cleartrip, education } from "@/content/experience";
import { profile } from "@/content/profile";
import { formatPeriod } from "@/lib/format";
import { Hint } from "@/components/explore/Hint";
import { Portrait } from "@/components/identity/Portrait";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowDown, ArrowRight } from "@/components/ui/icons";
import { HeroSpotlight } from "./HeroSpotlight";
import s from "./glance.module.css";

const k = (n: number) => ({ "--k": n }) as CSSProperties;
const rise = (i: number) => ({ "--i": i }) as CSSProperties;
const word = (i: number) => ({ "--w": i }) as CSSProperties;

/**
 * The first screen: who Himanshu is, directly. His name as the headline
 * (its full stop is a ball that bounces when poked), what he does, and the
 * way to the work, beside the portrait that says hello by itself; then the
 * facts as tiles — the Cleartrip role, VIT, the certifications and the
 * practice figure. Every fact is the site's own content.
 * Everything rises in on load with CSS; the monogram writes itself.
 */
export function AtAGlance() {
  const practice = achievements[0];
  const figure = practice.match(/\d[\d,]*\+?/)?.[0] ?? "";
  const school = education.school.match(/\(([^)]+)\)/)?.[1] ?? education.school;
  const first = profile.name.split(" ")[0];

  return (
    <section
      id="hello"
      aria-labelledby="hello-title"
      data-xray="Server-rendered first screen · rises in on load with CSS · the portrait, the pointer spotlight and the notes are the only client islands"
      data-tone="dark"
      className="relative isolate overflow-clip bg-ink pt-[calc(var(--nav-h)+clamp(1.75rem,5vw,4.5rem))] pb-(--section-y) [--xray-top:calc(var(--nav-h)+0.5rem)]"
    >
      <div
        aria-hidden="true"
        className="drift pointer-events-none absolute -inset-x-[12%] -top-48 -z-10 h-[76rem] bg-[radial-gradient(56rem_34rem_at_78%_16%,rgb(92_164_255/0.16),transparent_70%),radial-gradient(40rem_30rem_at_8%_38%,rgb(45_212_191/0.09),transparent_70%)]"
      />
      <HeroSpotlight />

      <div className="container-page">
        {/* The header turns frosted as soon as this passes under it, before any tile can. */}
        <div data-nav-sentinel aria-hidden="true" className="h-px" />
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          {/* Who, directly. */}
          <div className="flex flex-col justify-center py-2 lg:col-span-7 lg:py-6 lg:pr-6">
            <a
              href="#contact"
              className="hero-rise group inline-flex min-h-11 items-center gap-2.5 self-start rounded-full bg-white/6 pr-4 pl-3.5 text-sm font-medium text-fg-inverse ring-1 ring-white/12 transition-[background-color,scale] duration-(--dur-micro) ring-inset hover:bg-white/10 active:scale-[0.97]"
              style={rise(0)}
            >
              <span aria-hidden="true" className="live-dot" />
              {profile.availability}
              <ArrowRight className="size-3.5 text-muted-inverse transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0.5" />
            </a>
            {/* Two lines at every width, whatever the font: its arrival moves nothing. */}
            <h1
              id="hello-title"
              className="wr-in mt-6 text-display text-[clamp(3rem,1.6rem+6vw,6.5rem)]"
              style={{ "--wr-delay": "90ms" } as CSSProperties}
            >
              <span className="wr-w" style={word(0)}>
                Hi,
              </span>{" "}
              <span className="wr-w" style={word(1)}>
                I&rsquo;m
              </span>
              <br />
              <span className="wr-w" style={word(2)}>
                {first}
                {/* The full stop is a ball: it bounces when poked (Fx). */}
                <span data-bounce="" className="hero-dot">
                  .
                  <Hint id="bounce" arrow="left" at="wide" hover delay={1700} className="bottom-[0.15rem] left-[calc(100%+0.2rem)]">
                    boop it
                  </Hint>
                  <Hint id="bounce" arrow="down-left" at="narrow" hover delay={1700} className="bottom-[calc(100%-0.6rem)] left-[40%]">
                    boop it
                  </Hint>
                </span>
              </span>
            </h1>
            <p className="hero-rise mt-5 text-lg font-medium text-fg-inverse" style={rise(3)}>
              {profile.role} · {profile.location}
            </p>
            <p className="hero-rise text-lede mt-2 max-w-xl text-muted-inverse" style={rise(4)}>
              {profile.intro}
            </p>
            <div className="hero-rise mt-8 flex flex-wrap items-center gap-3" style={rise(5)}>
              <ButtonLink href="#work">
                See my work
                <span className="cue-nudge inline-flex">
                  <ArrowDown className="size-4" />
                </span>
              </ButtonLink>
              <ButtonLink href="/resume" variant="secondary">
                Résumé
              </ButtonLink>
              <span className="flex gap-x-5 px-2">
                {[profile.links.github, profile.links.linkedin].map((link) => (
                  <ButtonLink key={link.href} href={link.href} variant="text" external>
                    {link.label}
                  </ButtonLink>
                ))}
              </span>
            </div>
          </div>

          {/* The portrait says hello by itself; the monogram writes itself beside it. */}
          <div
            className={`${s.monoTile} hero-rise relative flex items-center overflow-clip rounded-[2rem] bg-ink-2 p-6 ring-1 ring-white/8 md:p-8 lg:col-span-5`}
            style={rise(2)}
          >
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-[radial-gradient(closest-side,rgb(92_164_255/0.3),transparent)]" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(45_212_191/0.16),transparent)]" />
            <div className="relative flex w-full items-center justify-center gap-5 md:gap-8">
              {/* The note's parent is what it points at: the portrait. */}
              <div className="relative">
                <Portrait intro="load" />
                <Hint id="portrait" arrow="left" className="bottom-1 left-[calc(100%-1.25rem)] md:bottom-4 md:left-[calc(100%-1.75rem)]">
                  say hi back
                </Hint>
              </div>
              <Monogram />
            </div>
          </div>

          {/* Now. */}
          <Tile label="Most recently" className="lg:col-span-5" i={6}>
            <p className="text-title text-[clamp(1.4rem,2.2vw,1.85rem)]">{cleartrip.title}</p>
            <p className="mt-2 leading-relaxed text-muted-inverse">
              {cleartrip.company} ({cleartrip.via}) · {formatPeriod(cleartrip.period)} · {cleartrip.location}
            </p>
            <Link href="#experience" className="group mt-4 inline-flex min-h-11 items-center gap-2 font-medium text-accent-bright">
              <span className="link-draw">What I did there</span>
              <ArrowRight className="size-4 transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0.5" />
            </Link>
          </Tile>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:gap-5">
            {/* Education. */}
            <Tile label="Education" i={7}>
              <p className="bg-linear-to-br from-[#8ec1ff] to-[#2dd4bf] bg-clip-text text-display text-5xl text-transparent">{school}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-inverse">
                {education.degree}. {education.specialization}.
              </p>
              <p className="mt-2 font-mono text-xs text-dim-inverse">
                {education.period.start}–{education.period.end} · {education.location}
              </p>
            </Tile>

            {/* Certifications. */}
            <Tile label="Certified" i={8}>
              <ul className="grid gap-4">
                {certifications.map((c) => (
                  <li key={c.name} className="flex gap-3">
                    <Cloud />
                    <p className="text-sm leading-snug">
                      <a href={c.href} target="_blank" rel="noopener noreferrer" className="link-draw font-semibold text-fg-inverse">
                        {c.name}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                      <span className="block text-muted-inverse">
                        {c.issuer}, {c.year}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </Tile>
          </div>

          {/* Practice: the figure, and the line it comes from. */}
          <Tile label="Practice" className="lg:col-span-12" i={9}>
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6">
              <p className="flex flex-none items-baseline gap-2">
                <span className="bg-linear-to-br from-[#9be15d] to-[#2cbb5d] bg-clip-text text-display text-[clamp(2.75rem,5vw,3.75rem)] text-transparent tabular-nums">
                  {figure}
                </span>
                <span className="text-lg font-semibold text-fg-inverse">problems</span>
              </p>
              <p className="text-sm leading-relaxed text-muted-inverse md:text-base">{practice}</p>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ label, className = "", i, children }: { label: string; className?: string; i: number; children: ReactNode }) {
  return (
    <div className={`hero-rise rounded-[1.75rem] bg-white/[0.035] p-6 ring-1 ring-white/8 lg:p-7 ${className}`} style={rise(i)}>
      <p className="mb-4 text-eyebrow text-dim-inverse">{label}</p>
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
    <svg viewBox="0 0 200 120" data-redraw="" className="relative w-24 flex-none sm:w-32 md:w-40" aria-hidden="true" focusable="false">
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
    <svg viewBox="0 0 24 24" className="mt-0.5 size-5 flex-none text-accent-bright" aria-hidden="true" focusable="false">
      <path d="M7 18h10.5a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7.4 9.1 4.5 4.5 0 0 0 7 18Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
