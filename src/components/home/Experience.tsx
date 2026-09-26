import Link from "next/link";
import { cleartrip } from "@/content/experience";
import { formatPeriod } from "@/lib/format";
import { Hint } from "@/components/explore/Hint";
import { ArrowRight } from "@/components/ui/icons";
import { PriceFreshness } from "@/components/visuals/IdentityVisuals";
import { LazyVisual } from "@/components/visuals/LazyVisual";
import { SnapGallery } from "@/components/motion/SnapGallery";

/**
 * The Cleartrip role. Employer systems are described generically and every
 * visual uses synthetic data; figures are Himanshu's own résumé claims, shown
 * as plain text rather than animated counters.
 */
export function Experience({ full = false, headingLevel = 2 }: { full?: boolean; headingLevel?: 1 | 2 }) {
  const Heading = `h${headingLevel}` as const;
  const role = cleartrip;

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      data-xray="Server-rendered · figures are plain text from the résumé, never counted up"
      data-tone="light"
      className="surface-light relative section-y bg-paper text-fg"
    >
      <div className="container-page">
        <p data-reveal className="text-eyebrow text-muted">
          Experience
        </p>
        <Heading id="experience-title" data-reveal className="mt-4 max-w-4xl text-display text-[clamp(2.25rem,5.6vw,4.5rem)] text-balance">
          Fast search, fresh prices, quiet releases.
        </Heading>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div data-reveal>
            <p className="text-xl font-semibold tracking-[-0.015em]">
              {role.title}, {role.company} <span className="font-normal text-muted">({role.via})</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              {formatPeriod(role.period)} · {role.location}
            </p>
            <p className="mt-5 leading-relaxed text-muted">{role.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {role.stack.map((t) => (
                <li key={t} className="rounded-full bg-snow px-3 py-1.5 text-sm ring-1 ring-black/8">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* On phones the achievements are a swipeable row; from 768px, a grid. */}
          <SnapGallery
            label="What the role delivered"
            tone="light"
            stackFrom="md"
            columns={2}
            itemWidth="min(84%, 20rem)"
            items={role.achievements.map((a) => (
              <article
                key={a.title}
                className="flex h-full flex-col rounded-[1.5rem] bg-snow p-5 ring-1 ring-black/5 transition-[translate,box-shadow] duration-(--dur-base) ease-(--ease-out) hover:-translate-y-1 hover:shadow-[0_1.25rem_2.5rem_-1.25rem_rgb(0_0_0/0.25),0_0_0_1px_rgb(10_102_216/0.35)]"
              >
                {a.metric && (
                  <p className="mb-3">
                    <span className="block text-title text-3xl text-accent">{a.metric.value}</span>
                    <span className="text-xs text-muted">{a.metric.label}</span>
                  </p>
                )}
                <h3 className="font-semibold tracking-[-0.01em]">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a.body}</p>
              </article>
            ))}
          />
        </div>

        {/* The walkthroughs of how these work live on /about; the homepage links to them. */}
        {full ? (
          <div className="mt-14 grid gap-6">
            <div className="relative">
              <Hint id="hex-map" arrow="down-left" tone="light" className="right-8 bottom-[calc(100%+0.25rem)] md:right-24">
                slide to zoom
              </Hint>
              <LazyVisual id="hex-map" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <LazyVisual id="fan-out" />
              <PriceFreshness />
            </div>
          </div>
        ) : (
          <Link href="/about#experience" className="group mt-8 inline-flex min-h-11 items-center gap-2 text-accent">
            <span className="link-draw">See how these work, with interactive walkthroughs</span>
            <ArrowRight className="size-4 transition-transform duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </section>
  );
}
