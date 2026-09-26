import type { Metadata } from "next";
import { projects, projectSlugs } from "@/content/projects";
import type { ProjectCategory } from "@/content/types";
import { ExploredPill, SurpriseMe } from "@/components/explore/Explored";
import { categoryId, ProjectCard } from "@/components/work/ProjectCard";
import { WorkFilter } from "@/components/work/WorkFilter";

export const metadata: Metadata = {
  title: "Work",
  description: "Products, systems and AI projects by Himanshu Dixit — each with an interactive look at how it works.",
  alternates: { canonical: "/work" },
};

const CATEGORIES: ProjectCategory[] = ["Product", "Systems", "AI & Data", "Tools"];

/** Flagships interleaved with the rest, so reading order matches the two-up grid. */
function displayOrder() {
  const flagships = projects.filter((p) => p.tier === "flagship");
  const rest = projects.filter((p) => p.tier !== "flagship");
  const out = [];
  for (let i = 0; i < Math.max(flagships.length, rest.length); i++) {
    if (flagships[i]) out.push(flagships[i]);
    if (rest[i]) out.push(rest[i]);
  }
  return out;
}

export default function WorkPage() {
  const filters = CATEGORIES.map((c) => ({
    id: categoryId(c),
    label: c,
    count: projects.filter((p) => p.categories.includes(c)).length,
  }));

  return (
    <section className="container-page pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))] pb-(--section-y)">
      <p className="text-eyebrow text-accent-bright">Work</p>
      <h1 className="mt-4 max-w-4xl text-display text-[clamp(2.5rem,7vw,5.5rem)] text-balance">Things I&rsquo;ve built, and how they work.</h1>
      <p className="text-lede mt-6 max-w-2xl text-muted-inverse">
        Client products, systems experiments and AI tools. Each one opens with an interactive view of the idea that makes it tick.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <SurpriseMe slugs={projectSlugs} />
        <ExploredPill slugs={projectSlugs} />
      </div>

      <div className="mt-12">
        <WorkFilter filters={filters} total={projects.length}>
          {displayOrder().map((p) => (
            <ProjectCard key={p.slug} project={p} large={p.tier === "flagship"} headingLevel={2} />
          ))}
        </WorkFilter>
      </div>
    </section>
  );
}
