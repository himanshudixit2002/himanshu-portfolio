import type { CSSProperties, ReactNode } from "react";
import type { Project } from "@/content/types";
import { ButtonLink } from "@/components/ui/ButtonLink";

type Props = {
  project: Project;
  index: number;
  art: ReactNode;
  tone: "light" | "dark";
  /** Put the artwork on the left on wide screens. */
  reverse?: boolean;
};

const stagger = (i: number) => ({ "--reveal-i": i }) as CSSProperties;

/** A homepage chapter for a flagship project: asymmetric split, three highlights, links. */
export function ProjectChapter({ project, index, art, tone, reverse = false }: Props) {
  const light = tone === "light";
  const live = project.links.find((l) => l.kind === "live");

  return (
    <article
      aria-labelledby={`${project.slug}-title`}
      data-xray="Server-rendered chapter · entrances run on CSS scroll timelines, off the main thread"
      className={`relative section-y overflow-clip ${light ? "surface-light bg-paper text-fg" : "bg-ink text-fg-inverse"}`}
    >
      <div className="container-page">
        <div className={`grid items-center gap-12 lg:gap-16 ${reverse ? "lg:grid-cols-[1.25fr_1fr]" : "lg:grid-cols-[1fr_1.25fr]"}`}>
          <header className={reverse ? "lg:order-2" : ""}>
            <p data-reveal className={`text-eyebrow flex items-center gap-3 ${light ? "text-muted" : "text-dim-inverse"}`}>
              <span>Selected work · {String(index).padStart(2, "0")}</span>
              <span aria-hidden="true" className={`h-px w-8 ${light ? "bg-black/20" : "bg-white/20"}`} />
              <span style={{ color: light ? undefined : project.accent }} className={light ? "text-fg" : ""}>
                {project.title}
              </span>
            </p>
            <h3 id={`${project.slug}-title`} data-reveal style={stagger(1)} className="mt-5 text-display text-[clamp(2.25rem,5vw,4.25rem)] text-balance">
              {project.tagline}
            </h3>
            <p data-reveal style={stagger(2)} className={`text-lede mt-5 ${light ? "text-muted" : "text-muted-inverse"}`}>
              {project.summary}
            </p>
            <div data-reveal style={stagger(3)} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/work/${project.slug}`} tone={tone}>
                See how it works
              </ButtonLink>
              {live && (
                <ButtonLink href={live.href} tone={tone} variant="secondary" external>
                  {live.label}
                </ButtonLink>
              )}
            </div>
          </header>
          <figure data-reveal className={reverse ? "lg:order-1" : ""}>
            {/* The device settles flat as it arrives. */}
            <div className="sd-tilt-flat">{art}</div>
            <figcaption className={`mt-4 text-xs ${light ? "text-muted" : "text-dim-inverse"}`}>Interface illustration with sample data</figcaption>
          </figure>
        </div>

        <ul className={`mt-16 grid gap-8 border-t pt-8 md:grid-cols-3 ${light ? "border-black/10" : "border-white/10"}`}>
          {project.highlights.map((h, i) => (
            <li key={h.title} data-reveal style={stagger(i)}>
              <h4 className="font-semibold tracking-[-0.015em]">{h.title}</h4>
              <p className={`mt-2 text-sm leading-relaxed ${light ? "text-muted" : "text-muted-inverse"}`}>{h.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
