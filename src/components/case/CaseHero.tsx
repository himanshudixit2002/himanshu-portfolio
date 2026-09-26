import type { CSSProperties } from "react";
import Link from "next/link";
import type { Project } from "@/content/types";
import { formatPeriod } from "@/lib/format";
import { WordReveal } from "@/components/motion/Text";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { HeroDevice } from "./HeroDevice";

const rise = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * A case study's opening: the project's own light drifting behind the title,
 * the tagline arriving word by word, the facts in turn, then the project on
 * its device, lying back until it scrolls up into place.
 */
export function CaseHero({ project }: { project: Project }) {
  const [primary, ...secondary] = project.links;
  const facts = [
    { label: "Role", value: project.role },
    { label: "When", value: formatPeriod(project.period) },
    { label: "Status", value: project.status },
    { label: "Platform", value: project.platform },
  ];

  return (
    <header className="relative isolate overflow-clip pt-[calc(var(--nav-h)+clamp(2.5rem,7vw,5rem))]">
      <div
        aria-hidden="true"
        className="ambient pointer-events-none absolute -inset-x-[15%] top-0 -z-10 h-[52rem]"
        style={{ "--ambient": `${project.accent}2e` } as CSSProperties}
      />
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="hero-rise text-sm text-dim-inverse" style={rise(0)}>
          <Link href="/work" className="transition-colors hover:text-fg-inverse">
            Work
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page" className="text-muted-inverse">
            {project.title}
          </span>
        </nav>
        <h1 className="mt-6">
          <span className="hero-rise block text-lg font-semibold" style={{ ...rise(1), color: project.accent }}>
            {project.title}
          </span>
          <span className="mt-3 block max-w-4xl text-display text-[clamp(2.5rem,6.6vw,5.5rem)] text-balance">
            <WordReveal text={project.tagline} delay={140} />
          </span>
        </h1>
        <p className="hero-rise text-lede mt-6 max-w-2xl text-muted-inverse" style={rise(4)}>
          {project.summary}
        </p>

        <dl className="mt-10 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f, i) => (
            <div key={f.label} className="hero-rise" style={rise(5 + i)}>
              <dt className="text-eyebrow text-dim-inverse">{f.label}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed">{f.value}</dd>
            </div>
          ))}
        </dl>

        {primary && (
          <div className="hero-rise mt-8 flex flex-wrap gap-3" style={rise(9)}>
            <ButtonLink href={primary.href} external>
              {primary.label}
            </ButtonLink>
            {secondary.map((l) => (
              <ButtonLink key={l.href} href={l.href} variant="secondary" external>
                {l.label}
              </ButtonLink>
            ))}
          </div>
        )}
      </div>

      {/* On phones the device starts below the fold, so its drawing is laid out
          only as it nears the screen; the estimate is its height at that width. */}
      <div className="container-page mt-16 pb-6 md:mt-24 [perspective:1600px]">
        <div className="sd-tilt-flat max-md:[contain-intrinsic-size:auto_calc((100vw-2rem)*0.78)] max-md:[content-visibility:auto]">
          <HeroDevice project={project} />
        </div>
      </div>
      {/* The local nav appears once this has scrolled under the header. */}
      <div data-local-sentinel aria-hidden="true" className="h-px" />
    </header>
  );
}
