import type { CSSProperties } from "react";
import Link from "next/link";
import { certifications, cleartrip, education } from "@/content/experience";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { formatPeriod } from "@/lib/format";
import s from "./journey.module.css";

type Milestone = {
  key: string;
  /** "2021" or "2025-08": sorts within its year. */
  when: string;
  title: string;
  body: string;
  href?: string;
  external?: boolean;
  color: string;
  live?: boolean;
};

const BLUE = "#0a66d8";

const month = (ym: string) =>
  new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1, 1)).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });

/**
 * Every dated fact on the site, in order: VIT, the certifications, the
 * Cleartrip role and each project by the month it began (from its
 * repository), ending with what Himanshu is looking for now.
 */
function milestones(): [string, Milestone[]][] {
  const all: Milestone[] = [
    {
      key: "vit",
      when: education.period.start,
      title: education.school,
      body: `${education.degree}, ${education.specialization.toLowerCase()} · ${education.period.start}–${education.period.end}`,
      color: BLUE,
    },
    ...certifications.map((c) => ({ key: c.name, when: c.year, title: c.name, body: `${c.issuer}, ${c.year}`, href: c.href, external: true, color: BLUE })),
    {
      key: "cleartrip",
      when: cleartrip.period.start,
      title: `${cleartrip.title}, ${cleartrip.company}`,
      body: `${formatPeriod(cleartrip.period)} · ${cleartrip.location}`,
      href: "/about#experience",
      color: BLUE,
    },
    ...projects.map((p) => ({ key: p.slug, when: p.period.start, title: p.title, body: p.tagline, href: `/work/${p.slug}`, color: p.accent })),
  ].sort((a, b) => a.when.localeCompare(b.when));

  const years = new Map<string, Milestone[]>();
  for (const m of all) years.set(m.when.slice(0, 4), [...(years.get(m.when.slice(0, 4)) ?? []), m]);
  years.set("Now", [{ key: "now", when: "", title: profile.availability, body: profile.location, href: "#contact", color: "#34d399", live: true }]);
  return [...years];
}

/** Scene: the path so far, drawn as you read down it. */
export function Journey() {
  return (
    <section
      id="journey"
      aria-labelledby="journey-title"
      data-xray="Server-rendered · the rail draws and the dots light on CSS scroll timelines"
      className="surface-light sd-sheet relative section-y bg-paper text-fg"
    >
      <div className="container-page">
        <p data-reveal className="text-eyebrow text-muted">
          Journey
        </p>
        <h2 id="journey-title" data-reveal className="mt-4 max-w-4xl text-display text-[clamp(2.25rem,5.6vw,4.5rem)]">
          The path so far.
        </h2>
        <p data-reveal className="text-lede mt-5 max-w-2xl text-muted">
          From Computer Science at VIT to everything on this site, in order. Project dates come from each repository&rsquo;s first commit, or file dates where there is no repository.
        </p>

        <ol className={`${s.path} mt-14 grid gap-12 md:mt-20 md:gap-16`}>
          {milestones().map(([year, items]) => (
            <li key={year} className="grid gap-5 md:grid-cols-[11rem_1fr] md:gap-10">
              <h3 className={`${s.year} sd-rise pl-8 text-display md:pl-0 text-[clamp(2.5rem,5vw,4rem)] tabular-nums ${year === "Now" ? "text-accent" : ""}`}>{year}</h3>
              <ol className="grid gap-7">
                {items.map((m) => (
                  <li key={m.key} className={`${s.entry} sd-rise`}>
                    <span aria-hidden="true" className={m.live ? `${s.dot} live-dot` : s.dot} style={{ "--dot": m.color, "--live": m.color } as CSSProperties} />
                    {m.when.length > 4 && <p className="font-mono text-xs text-muted">{month(m.when)}</p>}
                    <p className="mt-0.5 text-lg font-semibold tracking-[-0.015em]">
                      {m.href ? (
                        m.external ? (
                          <a href={m.href} target="_blank" rel="noopener noreferrer" className="link-draw">
                            {m.title}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        ) : (
                          <Link href={m.href} className="link-draw">
                            {m.title}
                          </Link>
                        )
                      ) : (
                        m.title
                      )}
                    </p>
                    <p className="mt-1 max-w-xl leading-relaxed text-muted">{m.body}</p>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
