import Link from "next/link";
import { kvStore, projects } from "@/content/projects";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRight } from "@/components/ui/icons";
import { LazyVisual } from "@/components/visuals/LazyVisual";
import { CardGrid } from "@/components/work/CardFocus";
import { ProjectCard } from "@/components/work/ProjectCard";

const MORE = ["self-healing-cache", "scopeforge", "vitals"];

/** Scene 06: one systems project to play with, then a doorway to the rest. */
export function EngineeringScene() {
  const more = MORE.map((slug) => projects.find((p) => p.slug === slug)!);

  return (
    <section id="engineering" aria-labelledby="engineering-title" className="section-y bg-ink">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p data-reveal className="text-eyebrow" style={{ color: kvStore.accent }}>
              Explore the engineering · {kvStore.title}
            </p>
            <h2 id="engineering-title" data-reveal className="mt-4 text-display text-[clamp(2.25rem,5.6vw,4.5rem)] text-balance">
              {kvStore.tagline}
            </h2>
            <p data-reveal className="text-lede mt-5 text-muted-inverse">
              {kvStore.summary} Send it a command and watch where the key lands.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/lab">Open the lab</ButtonLink>
            <ButtonLink href={`/work/${kvStore.slug}`} variant="secondary">
              Case study
            </ButtonLink>
          </div>
        </div>

        <div className="mt-10">
          <LazyVisual id="kv-explorer" />
        </div>

        <div className="mt-(--section-y)">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-title text-[clamp(1.75rem,3.4vw,2.75rem)]">More work</h2>
            <Link href="/work" className="group inline-flex min-h-11 items-center gap-2 text-accent-bright">
              <span className="link-draw">All {projects.length} projects</span>
              <ArrowRight className="size-4 transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0.5" />
            </Link>
          </div>
          <CardGrid className="mt-8 grid gap-5 md:grid-cols-3">
            {more.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </CardGrid>
        </div>
      </div>
    </section>
  );
}
