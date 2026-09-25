import type { CSSProperties } from "react";
import { smartShelfKart as project } from "@/content/projects";
import { NovaPhoneArt, SskOverviewArt } from "@/components/art/SmartShelfKartArt";
import { ButtonLink } from "@/components/ui/ButtonLink";

const media = (id: string) => project.media.find((m) => m.id === id)!;
const stagger = (i: number) => ({ "--reveal-i": i }) as CSSProperties;

export function SmartShelfKartChapter() {
  const overview = media("ssk-overview");
  const assistant = media("ssk-assistant");
  const [live, ...more] = project.links;

  return (
    <article aria-labelledby="ssk-title" className="surface-light section-y overflow-hidden bg-paper text-fg">
      <div className="container-page">
        <header className="max-w-4xl">
          <p data-reveal className="text-eyebrow flex items-center gap-3 text-muted">
            <span>Selected work · 01</span>
            <span aria-hidden="true" className="h-px w-8 bg-black/20" />
            <span className="text-ssk-deep">{project.title}</span>
          </p>
          <h3
            id="ssk-title"
            data-reveal
            style={stagger(1)}
            className="mt-5 text-display text-[clamp(2.5rem,6.4vw,5.5rem)] text-balance"
          >
            {project.tagline}
          </h3>
          <p data-reveal style={stagger(2)} className="text-lede mt-6 max-w-2xl text-muted">
            {project.summary}
          </p>
        </header>

        <figure data-reveal className="relative mt-14 md:mt-20">
          <div className="md:w-[84%]">
            <SskOverviewArt label={overview.alt} onLight />
          </div>
          <div className="relative mr-[4%] -mt-[30%] ml-auto w-[42%] md:absolute md:right-0 md:-bottom-[7%] md:m-0 md:w-[22%]">
            <NovaPhoneArt label={assistant.alt} conversation="confirm-write" onLight />
          </div>
          <figcaption className="mt-5 text-xs text-muted md:mt-10">Interface illustrations with sample data</figcaption>
        </figure>

        <ul className="mt-16 grid gap-10 border-t border-black/10 pt-10 md:mt-32 md:grid-cols-3 md:gap-12">
          {project.highlights.map((h, i) => (
            <li key={h.title} data-reveal style={stagger(i)}>
              <h4 className="text-lg font-semibold tracking-[-0.015em]">{h.title}</h4>
              <p className="mt-2 leading-relaxed text-muted">{h.body}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-16 grid gap-10 rounded-[1.75rem] bg-snow p-7 ring-1 ring-black/5 md:mt-20 md:grid-cols-[1.1fr_1.1fr_0.8fr] md:gap-12 md:p-10">
          <div data-reveal>
            <dt className="text-eyebrow text-muted">The problem</dt>
            <dd className="mt-3 leading-relaxed">{project.problem}</dd>
          </div>
          <div data-reveal style={stagger(1)}>
            <dt className="text-eyebrow text-muted">What I did</dt>
            <dd className="mt-3 leading-relaxed">
              <strong className="font-semibold">{project.role}.</strong> {project.contribution}
            </dd>
          </div>
          <div data-reveal style={stagger(2)}>
            <dt className="text-eyebrow text-muted">Built with</dt>
            <dd className="mt-3">
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li key={tech} className="rounded-full bg-paper px-3 py-1.5 text-sm ring-1 ring-black/8">
                    {tech}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ButtonLink href={`/work/${project.slug}`} tone="light">
            See how it works
          </ButtonLink>
          {[live, ...more].map((link) => (
            <ButtonLink key={link.href} href={link.href} tone="light" variant="secondary" external>
              {link.label}
            </ButtonLink>
          ))}
        </div>
      </div>
    </article>
  );
}
