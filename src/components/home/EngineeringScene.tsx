import Link from "next/link";
import { kvStore, projects } from "@/content/projects";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SnapGallery } from "@/components/motion/SnapGallery";
import { ArrowRight } from "@/components/ui/icons";
import { LazyVisual } from "@/components/visuals/LazyVisual";
import { CardGrid } from "@/components/work/CardFocus";
import { ProjectCard } from "@/components/work/ProjectCard";

/** Projects with a homepage chapter of their own; the gallery shows the rest. */
const FEATURED = ["smartshelfkart", "elepeia", "cue-and-coffee", "kvstore"];

/** Scene 06: one systems project to play with, then every other project in a swipeable row. */
export function EngineeringScene() {
  const more = projects.filter((p) => !FEATURED.includes(p.slug));

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
            <h2 className="text-title text-[clamp(1.75rem,3.4vw,2.75rem)]">Everything else I&rsquo;ve built</h2>
            <Link href="/work" className="group inline-flex min-h-11 items-center gap-2 text-accent-bright">
              <span className="link-draw">All {projects.length} projects</span>
              <ArrowRight className="size-4 transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0.5" />
            </Link>
          </div>
          {/* On phones the card in view plays its signature; on wider screens, the one under the pointer. */}
          <CardGrid className="mt-8">
            <SnapGallery label="More projects" items={more.map((p) => <ProjectCard key={p.slug} project={p} className="h-full" />)} itemWidth="min(86%, 24rem)" dim="phone" />
          </CardGrid>
        </div>
      </div>
    </section>
  );
}
