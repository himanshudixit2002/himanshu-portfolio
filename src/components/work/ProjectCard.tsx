import type { CSSProperties } from "react";
import Link from "next/link";
import type { Project } from "@/content/types";
import { formatPeriod } from "@/lib/format";
import { SeenTick } from "@/components/explore/Explored";
import { MiniVisual } from "@/components/visuals/MiniVisual";
import { ArrowRight } from "@/components/ui/icons";
import styles from "./card.module.css";

export const categoryId = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

export function ProjectCard({ project, large = false, headingLevel = 3, className = "" }: { project: Project; large?: boolean; headingLevel?: 2 | 3; className?: string }) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article
      data-card
      data-loops
      data-cats={project.categories.map(categoryId).join(" ")}
      className={`${styles.card} group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-ink-2 ${large ? "lg:col-span-2 lg:grid lg:grid-cols-[1.2fr_1fr]" : ""} ${className}`}
      style={{ "--card-accent": project.accent } as CSSProperties}
    >
      <span aria-hidden="true" data-card-light className={styles.light} />
      <div className={`relative ${large ? "aspect-[16/10] lg:aspect-auto" : "aspect-[16/10]"} bg-ink`}>
        <MiniVisual id={project.visual} accent={project.accent} />
        <SeenTick slug={project.slug} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className={`${styles.category} text-eyebrow`} style={{ color: project.accent }}>
          {project.categories.join(" · ")}
        </p>
        <Heading className={`mt-2 font-semibold tracking-[-0.02em] ${large ? "text-3xl" : "text-xl"}`}>
          <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {project.title}
          </Link>
        </Heading>
        <p className="mt-2 text-muted-inverse">{project.tagline}</p>
        {large && <p className="mt-3 text-sm leading-relaxed text-muted-inverse">{project.summary}</p>}
        <ul aria-label="Built with" className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.slice(0, large ? 6 : 4).map((t) => (
            <li key={t} className="rounded-full bg-white/6 px-2.5 py-1 text-[0.6875rem] text-muted-inverse ring-1 ring-white/8 ring-inset">
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-dim-inverse">
          <span>
            {formatPeriod(project.period)} · {project.status}
          </span>
          <ArrowRight className="size-4 flex-none text-fg-inverse transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  );
}
