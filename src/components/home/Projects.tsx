import Link from "next/link";
import { projects, projectSlugs } from "@/content/projects";
import { ExploredPill, SurpriseMe } from "@/components/explore/Explored";
import { Hint } from "@/components/explore/Hint";
import { ArrowRight } from "@/components/ui/icons";
import { Featured } from "./Featured";
import { ProjectBento } from "./ProjectBento";

/** The flagships, shown as big stacking cards; every other project follows in the bento wall. */
const FEATURED = ["smartshelfkart", "elepeia", "cue-and-coffee"];

/** Every project: the three flagships as stacking cards, then the rest as a bento wall, each with its stack. */
export function Projects() {
  const more = projects.filter((p) => !FEATURED.includes(p.slug));

  return (
    <section id="work" aria-labelledby="work-title" data-tone="dark" className="relative section-y bg-ink">
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

        <div className="mt-16 md:mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="text-title text-[clamp(1.5rem,3vw,2.25rem)]">More projects</h3>
            <Link href="/work" className="group inline-flex min-h-11 items-center gap-2 text-accent-bright">
              <span className="link-draw">All {projects.length}, with filters</span>
              <ArrowRight className="size-4 transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0.5" />
            </Link>
          </div>
          {/* On phones the tile mid-screen plays its signature; on wider screens, the one under the pointer. */}
          <div className="relative mt-8" data-xray="Server-rendered bento · a dense CSS grid, each tile sized per project · signatures loop under the pointer or mid-screen on touch · tilt and light from one listener">
            <ProjectBento projects={more} start={FEATURED.length + 1} />
          </div>
        </div>
      </div>
    </section>
  );
}
