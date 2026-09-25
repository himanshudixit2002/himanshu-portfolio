import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, nextProject, projects } from "@/content/projects";
import { formatPeriod } from "@/lib/format";
import { SurfaceSystem } from "@/components/home/SurfaceSystem";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRight } from "@/components/ui/icons";
import { MiniVisual } from "@/components/visuals/MiniVisual";
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

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = nextProject(project.slug);
  const [primary, ...secondary] = project.links;

  const facts = [
    { label: "Role", value: project.role },
    { label: "When", value: formatPeriod(project.period) },
    { label: "Status", value: project.status },
    { label: "Platform", value: project.platform },
  ];

  return (
    <>
      <header className="relative isolate overflow-hidden pt-[calc(var(--nav-h)+clamp(2.5rem,7vw,5rem))]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem]"
          style={{ background: `radial-gradient(50rem 26rem at 75% 10%, ${project.accent}26, transparent 70%)` }}
        />
        <div className="container-page">
          <nav aria-label="Breadcrumb" className="text-sm text-dim-inverse">
            <Link href="/work" className="hover:text-fg-inverse">
              Work
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-muted-inverse">
              {project.title}
            </span>
          </nav>
          <h1 className="mt-6">
            <span className="block text-lg font-semibold" style={{ color: project.accent }}>
              {project.title}
            </span>
            <span className="mt-3 block max-w-4xl text-display text-[clamp(2.5rem,6.6vw,5.5rem)] text-balance">{project.tagline}</span>
          </h1>
          <p className="text-lede mt-6 max-w-2xl text-muted-inverse">{project.summary}</p>

          <dl className="mt-10 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-eyebrow text-dim-inverse">{f.label}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed">{f.value}</dd>
              </div>
            ))}
          </dl>

          {primary && (
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={primary.href} external>
                {primary.label}
              </ButtonLink>
              {secondary.map((l) => (
                <ButtonLink key={l.href} href={l.href} variant="secondary" external>
                  {l.label}
                </ButtonLink>
              ))}
            </div>
          )}
        </div>
      </header>

      {project.slug === "smartshelfkart" && <SurfaceSystem />}

      <section aria-label="How it works" className="container-page pt-14 pb-(--section-y)">
        <SignatureVisual id={project.visual} />

        {project.metrics.length > 0 && (
          <dl className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {project.metrics.map((m) => (
              <div key={m.label} data-reveal className="flex flex-col-reverse justify-end border-t border-white/12 pt-4">
                <dt className="mt-2 text-sm leading-relaxed text-muted-inverse">{m.label}</dt>
                <dd className="text-title text-[clamp(2.25rem,4vw,3.25rem)]" style={{ color: project.accent }}>
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="story" className="surface-light section-y bg-paper text-fg">
        <div className="container-page">
          <h2 id="story" className="sr-only">
            The story
          </h2>
          <div className="grid gap-12 md:grid-cols-2">
            <div data-reveal>
              <p className="text-eyebrow text-muted">The problem</p>
              <p className="mt-4 text-xl leading-relaxed tracking-[-0.01em] text-balance">{project.problem}</p>
            </div>
            <div data-reveal>
              <p className="text-eyebrow text-muted">What I did</p>
              <p className="mt-4 text-xl leading-relaxed tracking-[-0.01em] text-balance">{project.contribution}</p>
            </div>
          </div>

          <ul className="mt-16 grid gap-10 border-t border-black/10 pt-10 md:grid-cols-3">
            {project.highlights.map((h) => (
              <li key={h.title} data-reveal>
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
            <div className="mt-20">
              <h2 className="text-title text-[clamp(1.75rem,3.4vw,2.75rem)]">Decisions worth explaining</h2>
              <ol className="mt-8 grid gap-6 md:grid-cols-2">
                {project.decisions.map((d, i) => (
                  <li key={d.title} data-reveal className="rounded-[1.5rem] bg-snow p-6 ring-1 ring-black/5">
                    <span className="font-mono text-xs" style={{ color: "#0a66d8" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.015em]">{d.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{d.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {(project.evidence.length > 0 || project.limitations.length > 0) && (
        <section aria-labelledby="honest" className="section-y">
          <div className="container-page grid gap-12 md:grid-cols-2">
            <h2 id="honest" className="sr-only">
              Evidence and limitations
            </h2>
            {project.evidence.length > 0 && (
              <div data-reveal>
                <p className="text-eyebrow text-accent-bright">How you can check it</p>
                <ul className="mt-5 grid gap-3">
                  {project.evidence.map((e) => (
                    <li key={e} className="flex gap-3 leading-relaxed text-muted-inverse">
                      <span aria-hidden="true" className="mt-2.5 size-1.5 flex-none rounded-full bg-accent-bright" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div data-reveal>
              <p className="text-eyebrow text-amber-300">Limits, honestly</p>
              <ul className="mt-5 grid gap-3">
                {project.limitations.map((l) => (
                  <li key={l} className="flex gap-3 leading-relaxed text-muted-inverse">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 flex-none rounded-full bg-amber-300" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section aria-label="Next project" className="container-page pb-(--section-y)">
        <Link
          href={`/work/${next.slug}`}
          className="group grid items-center gap-6 overflow-hidden rounded-[1.75rem] bg-ink-2 ring-1 ring-white/8 transition-colors hover:ring-white/20 md:grid-cols-[1fr_16rem]"
        >
          <span className="p-7">
            <span className="text-eyebrow text-dim-inverse">Next project</span>
            <span className="mt-2 block text-title text-[clamp(1.75rem,3.4vw,2.75rem)]">{next.title}</span>
            <span className="mt-2 flex items-center gap-2 text-muted-inverse">
              {next.tagline}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </span>
          <span className="hidden aspect-[16/10] bg-ink md:block">
            <MiniVisual id={next.visual} accent={next.accent} />
          </span>
        </Link>
      </section>
    </>
  );
}
