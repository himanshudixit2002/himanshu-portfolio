import Link from "next/link";
import type { Project } from "@/content/types";
import { formatPeriod } from "@/lib/format";
import { MiniVisual } from "@/components/visuals/MiniVisual";
import { ArrowRight } from "@/components/ui/icons";

export const categoryId = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

export function ProjectCard({ project, large = false, headingLevel = 3 }: { project: Project; large?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article
      data-card
      data-cats={project.categories.map(categoryId).join(" ")}
      className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-ink-2 ring-1 ring-white/8 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:ring-white/20 ${large ? "lg:col-span-2 lg:grid lg:grid-cols-[1.2fr_1fr]" : ""}`}
    >
      <div className={`relative ${large ? "aspect-[16/10] lg:aspect-auto" : "aspect-[16/10]"} bg-ink`}>
        <MiniVisual id={project.visual} accent={project.accent} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-eyebrow" style={{ color: project.accent }}>
          {project.categories.join(" · ")}
        </p>
        <Heading className={`mt-2 font-semibold tracking-[-0.02em] ${large ? "text-3xl" : "text-xl"}`}>
          <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {project.title}
          </Link>
        </Heading>
        <p className="mt-2 text-muted-inverse">{project.tagline}</p>
        {large && <p className="mt-3 text-sm leading-relaxed text-muted-inverse">{project.summary}</p>}
        <p className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-dim-inverse">
          <span>
            {formatPeriod(project.period)} · {project.status}
          </span>
          <ArrowRight className="size-4 flex-none text-fg-inverse transition-transform duration-200 group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  );
}
