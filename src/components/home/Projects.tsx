import Link from "next/link";
import { projects, projectSlugs } from "@/content/projects";
import { ExploredPill, SurpriseMe } from "@/components/explore/Explored";
import { Hint } from "@/components/explore/Hint";
import { SnapGallery } from "@/components/motion/SnapGallery";
import { ArrowRight } from "@/components/ui/icons";
import { CardGrid } from "@/components/work/CardFocus";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Featured } from "./Featured";

/** The flagships, shown as big stacking cards; every other project follows in the gallery. */
const FEATURED = ["smartshelfkart", "elepeia", "cue-and-coffee"];

/** Every project on one screen's worth of scrolling: the three flagships, then the rest with their stacks. */
export function Projects() {
  const more = projects.filter((p) => !FEATURED.includes(p.slug));

  return (
    <section id="work" aria-labelledby="work-title" className="relative section-y bg-ink">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p data-reveal className="text-eyebrow text-accent-bright">
              Work
            </p>
            <h2 id="work-title" data-reveal className="mt-4 text-display text-[clamp(2.25rem,5.6vw,4.5rem)] text-balance">
              Things I&rsquo;ve built.
            </h2>
            <p data-reveal className="text-lede mt-5 text-muted-inverse">
              Three to start with, then everything else. Each opens into a case study you can play with.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="relative inline-flex">
              <SurpriseMe slugs={projectSlugs} />
              <Hint id="surprise" arrow="up-left" className="top-[calc(100%-0.35rem)] left-8">
                feeling lucky?
              </Hint>
            </span>
            <ExploredPill slugs={projectSlugs} />
          </div>
        </div>

        <div className="mt-12">
          <Featured />
        </div>

        <div className="mt-(--section-y)">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="text-title text-[clamp(1.5rem,3vw,2.25rem)]">More projects</h3>
            <Link href="/work" className="group inline-flex min-h-11 items-center gap-2 text-accent-bright">
              <span className="link-draw">All {projects.length}, with filters</span>
              <ArrowRight className="size-4 transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0.5" />
            </Link>
          </div>
          {/* On phones the card in view plays its signature; on wider screens, the one under the pointer. */}
          <CardGrid className="mt-8">
            <SnapGallery label="More projects" items={more.map((p) => <ProjectCard key={p.slug} project={p} className="h-full" />)} itemWidth="min(86%, 24rem)" dim="phone" swipeHint />
          </CardGrid>
        </div>
      </div>
    </section>
  );
}
