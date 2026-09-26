import type { Metadata } from "next";
import { achievements, certifications, education } from "@/content/experience";
import { profile } from "@/content/profile";
import { Experience } from "@/components/home/Experience";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CapabilityMap, Timeline } from "@/components/visuals/IdentityVisuals";

export const metadata: Metadata = {
  title: "About",
  description: "Himanshu Dixit — software engineer in Bengaluru. Experience at Cleartrip, education at VIT, and the capabilities his projects demonstrate.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="container-page pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))] pb-(--section-y)">
        <p className="text-eyebrow text-accent-bright">About</p>
        <h1 className="mt-4 max-w-4xl text-display text-[clamp(2.5rem,7vw,5.5rem)] text-balance">From the screen to the systems behind it.</h1>
        <div className="mt-8 grid max-w-3xl gap-4">
          {profile.bio.map((p) => (
            <p key={p} className="text-lede text-muted-inverse">
              {p}
            </p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/resume">View résumé</ButtonLink>
          <ButtonLink href="/#contact" variant="secondary">
            Get in touch
          </ButtonLink>
        </div>
      </section>

      <Experience full />

      <section aria-label="Timeline and capabilities" className="container-page grid gap-8 py-(--section-y)">
        <Timeline />
        <CapabilityMap />
      </section>

      <section aria-labelledby="education-title" className="surface-light section-y bg-paper text-fg">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div data-reveal>
            <h2 id="education-title" className="text-eyebrow text-muted">
              Education
            </h2>
            <p className="mt-4 text-2xl font-semibold tracking-[-0.02em]">{education.school}</p>
            <p className="mt-1 text-muted">
              {education.degree} — {education.specialization}
            </p>
            <p className="mt-1 text-sm text-muted">
              {education.period.start}–{education.period.end} · {education.location}
            </p>
          </div>
          <div data-reveal>
            <h2 className="text-eyebrow text-muted">Certifications &amp; practice</h2>
            <ul className="mt-4 grid gap-3">
              {certifications.map((c) => (
                <li key={c.name}>
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="link-draw font-semibold text-accent">
                    {c.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <span className="text-muted">
                    {" "}
                    — {c.issuer}, {c.year}
                  </span>
                </li>
              ))}
              {achievements.map((a) => (
                <li key={a} className="text-muted">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
