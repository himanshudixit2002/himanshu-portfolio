import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getProject, nextProject, projects } from "@/content/projects";
import { CaseHero } from "@/components/case/CaseHero";
import { LocalNav } from "@/components/case/LocalNav";
import { Decisions, Metrics, NextProject, Proof } from "@/components/case/Sections";
import { SurfaceSystem } from "@/components/home/SurfaceSystem";
import { hasScene, SignatureScene } from "@/components/scenes/SignatureScene";
import { SignatureVisual } from "@/components/visuals/SignatureVisual";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${project.title} — ${project.tagline}`, description: project.summary },
  };
}

/*
 * A case study reads like a product page: the project on its device, a
 * sticky local nav, its figures drawn exactly, how it works (a scene, then
 * the interactive to try), the story on a light sheet, decisions in a
 * gallery, the proof and its limits, and the door to the next project.
 */
export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = nextProject(project.slug);
  const hasProof = project.evidence.length > 0 || project.limitations.length > 0;

  const sections = [
    ...(project.metrics.length ? [{ id: "overview", label: "Overview" }] : []),
    { id: "how", label: "How it works" },
    { id: "story", label: "Story" },
    ...(project.decisions.length ? [{ id: "decisions", label: "Decisions" }] : []),
    ...(hasProof ? [{ id: "proof", label: "Proof" }] : []),
  ];

  return (
    <>
      <CaseHero project={project} />
      <LocalNav title={project.title} accent={project.accent} sections={sections} tryId="try" />

      {project.metrics.length > 0 && (
        <section id="overview" aria-label="Overview" className="container-page pt-(--section-y)">
          <Metrics project={project} />
        </section>
      )}

      <section id="how" aria-labelledby="how-title" className="pt-(--section-y) pb-(--section-y)">
        <div className="container-page">
          <h2 id="how-title" className="text-eyebrow" style={{ color: project.accent }}>
            How it works
          </h2>
        </div>
        <SignatureScene project={project} />
        {project.slug === "smartshelfkart" && <SurfaceSystem />}
        <div id="try" className="container-page mt-8">
          {hasScene(project.slug) && <p className="mb-5 text-eyebrow text-dim-inverse">Now try it</p>}
          <SignatureVisual id={project.visual} />
        </div>
      </section>

      <section id="story" aria-labelledby="story-title" className="surface-light sd-sheet section-y bg-paper text-fg">
        <div className="container-page">
          <h2 id="story-title" className="sr-only">
            The story
          </h2>
          <div className="grid gap-12 md:grid-cols-2">
            <div data-reveal>
              <p className="text-eyebrow text-muted">The problem</p>
              <p className="mt-4 text-xl leading-relaxed tracking-[-0.01em] text-balance">{project.problem}</p>
            </div>
            <div data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
              <p className="text-eyebrow text-muted">What I did</p>
              <p className="mt-4 text-xl leading-relaxed tracking-[-0.01em] text-balance">{project.contribution}</p>
            </div>
          </div>

          <ul className="mt-16 grid gap-10 border-t border-black/10 pt-10 md:grid-cols-3">
            {project.highlights.map((h, i) => (
              <li key={h.title} data-reveal style={{ "--reveal-i": i } as CSSProperties}>
                <h3 className="text-lg font-semibold tracking-[-0.015em]">{h.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{h.body}</p>
              </li>
            ))}
          </ul>

          <div className="mt-14">
            <p className="text-eyebrow text-muted">Built with</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.stack.map((t) => (
                <li key={t} className="rounded-full bg-snow px-3 py-1.5 text-sm ring-1 ring-black/8">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {project.decisions.length > 0 && (
            <div id="decisions" className="mt-20">
              <h2 className="text-title text-[clamp(1.75rem,3.4vw,2.75rem)]">Decisions worth explaining</h2>
              <div className="mt-8">
                <Decisions project={project} />
              </div>
            </div>
          )}
        </div>
      </section>

      {hasProof && (
        <section id="proof" aria-labelledby="proof-title" className="section-y">
          <h2 id="proof-title" className="sr-only">
            Evidence and limitations
          </h2>
          <Proof project={project} />
        </section>
      )}

      <section aria-label="Next project" className="container-page pb-(--section-y)">
        <NextProject next={next} />
      </section>
    </>
  );
}
