import { projects } from "@/content/projects";
import { skillEvidence } from "@/content/skills";
import { SkillExplorer } from "./SkillExplorer";

/** The skills, each tied to the work that shows it (content/skills). */
export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      data-xray="Server-rendered list · each skill matched to the projects whose own stack names it · a client island only for choosing"
      className="relative section-y bg-ink"
    >
      <div className="container-page">
        <p data-reveal className="text-eyebrow text-accent-bright">
          Skills
        </p>
        <h2 id="skills-title" data-reveal className="mt-4 max-w-4xl text-display text-[clamp(2.25rem,5.6vw,4.5rem)] text-balance">
          The tools, and the work that shows them.
        </h2>
        <p data-reveal className="text-lede mt-5 max-w-2xl text-muted-inverse">
          Pick a skill to see which projects use it.
        </p>
        <div className="mt-12">
          <SkillExplorer groups={skillEvidence()} projects={projects.map((p) => ({ slug: p.slug, title: p.title, accent: p.accent }))} />
        </div>
      </div>
    </section>
  );
}
