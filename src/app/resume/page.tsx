import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { achievements, certifications, cleartrip, education } from "@/content/experience";
import { profile } from "@/content/profile";
import { getProject } from "@/content/projects";
import { formatPeriod } from "@/lib/format";
import { PrintButton } from "@/components/ui/PrintButton";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Himanshu Dixit's résumé — software engineer in Bengaluru: Cleartrip, selected projects, education and certifications.",
  alternates: { canonical: "/resume" },
};

/** One neutral résumé: the same verified facts the rest of the site uses. */
const RESUME_PROJECTS: { slug: string; points: string[] }[] = [
  {
    slug: "smartshelfkart",
    points: [
      "Multi-tenant inventory platform on web and Google Play: 51 business modules, 800+ automated tests, a 7-job CI pipeline.",
      "Assistant answers 76% of benchmark questions with no model call by routing a LangGraph agent through a deterministic fact layer; an offline eval harness gates CI on correctness and cost.",
      "Reporting moved to a Spring Boot read model on PostgreSQL with integer minor units; 117 permission keys re-enforced in every service that bypasses Firestore's rules.",
    ],
  },
  {
    slug: "elepeia",
    points: [
      "Production storefront and admin console on Next.js 16 and React 19: 27 storefront routes, 18 admin screens, 29 API routes.",
      "Restored server rendering by moving a client-side gate to edge middleware; cut product-page image transfer 68× and removed a five-deep lazy-loading chain.",
      "Server-priced checkout with an order intent, idempotent Razorpay commit and stock decrement in one transaction.",
    ],
  },
  {
    slug: "cue-and-coffee",
    points: ["Point of sale and back office for a snooker club and café in Flutter and Firebase: timed tables, café orders, wallets, memberships and daily books, with 133 test files."],
  },
  {
    slug: "kvstore",
    points: ["Redis-style store in C++20: 16-shard lock-striped LRU cache, batched write-ahead log, thread-pooled TCP server, std::string_view-based command parsing."],
  },
  {
    slug: "self-healing-cache",
    points: ["Distributed cache in Go: consistent hashing, gossip membership, quorum replication, hinted handoff and anti-entropy healing."],
  },
  {
    slug: "scopeforge",
    points: ["Local security-research workbench: FastAPI, durable SQLite queue, 52 check rules, scope enforcement on every request, Playwright tests in CI."],
  },
];

const SKILLS = [
  { group: "Languages", items: "Java, Python, TypeScript, JavaScript, SQL, Dart, C++, Go, Swift" },
  { group: "Product", items: "React, Next.js, Tailwind CSS, Flutter, SwiftUI, accessible and responsive UI, web performance" },
  { group: "Backend & data", items: "Spring Boot, FastAPI, Express, Kafka, Flink, Redis, Elasticsearch, PostgreSQL, Firestore, SQLite" },
  { group: "AI", items: "LangGraph, tool-calling agents, LLM evaluation and guardrails, Model Context Protocol, scikit-learn, Keras" },
  { group: "Delivery", items: "Docker, GitHub Actions, OpenTelemetry, Prometheus, Vitest, Playwright, Vercel, GCP Cloud Run, AWS" },
];

export default function ResumePage() {
  return (
    <div className="surface-light min-h-svh bg-paper pt-[calc(var(--nav-h)+2.5rem)] pb-(--section-y) text-fg print:bg-white print:pt-0 print:pb-0">
      <div className="no-print container-page mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">One page, the same facts as the rest of the site.</p>
        <PrintButton />
      </div>

      <article className="container-page max-w-4xl print:max-w-none print:px-0">
        <header className="border-b border-black/15 pb-6">
          <h1 className="text-display text-[clamp(2.5rem,6vw,3.75rem)] print:text-4xl">{profile.name}</h1>
          <p className="mt-2 text-lg">
            {profile.role} · {profile.location}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
              {profile.email}
            </a>
            <a href={profile.links.linkedin.href} className="text-accent hover:underline">
              linkedin.com/in/himanshudixit2406
            </a>
            <a href={profile.links.github.href} className="text-accent hover:underline">
              github.com/himanshudixit2002
            </a>
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed">{profile.bio[0]}</p>
        </header>

        <Section title="Experience">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-semibold">
              {cleartrip.title} — {cleartrip.company} ({cleartrip.via})
            </h3>
            <p className="text-sm text-muted">
              {formatPeriod(cleartrip.period)} · {cleartrip.location}
            </p>
          </div>
          <ul className="mt-2 grid gap-1.5 pl-5 text-[0.9375rem] leading-relaxed [list-style:disc]">
            {cleartrip.achievements.map((a) => (
              <li key={a.title}>{a.metric ? `${a.body} (${a.metric.value} ${a.metric.label}).` : a.body}</li>
            ))}
          </ul>
        </Section>

        <Section title="Selected projects">
          <div className="grid gap-5">
            {RESUME_PROJECTS.map(({ slug, points }) => {
              const p = getProject(slug)!;
              return (
                <div key={slug} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-semibold">
                      <Link href={`/work/${slug}`} className="hover:underline">
                        {p.title}
                      </Link>{" "}
                      <span className="font-normal text-muted">— {p.stack.slice(0, 4).join(", ")}</span>
                    </h3>
                    <p className="text-sm text-muted">{formatPeriod(p.period)}</p>
                  </div>
                  <ul className="mt-1.5 grid gap-1 pl-5 text-[0.9375rem] leading-relaxed [list-style:disc]">
                    {points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-muted">
            More, with interactive walkthroughs: fraud-ring streaming pipeline, anomaly-scoring API gateway, offline-first field-sales app, macOS system HUD, URL shortener, computer-vision skincare app — see /work.
          </p>
        </Section>

        <Section title="Skills">
          <dl className="grid gap-1.5 text-[0.9375rem]">
            {SKILLS.map((s) => (
              <div key={s.group} className="grid gap-x-4 sm:grid-cols-[9rem_1fr]">
                <dt className="font-semibold">{s.group}</dt>
                <dd className="text-muted">{s.items}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Education">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-semibold">{education.school}</h3>
            <p className="text-sm text-muted">
              {education.period.start} – {education.period.end}
            </p>
          </div>
          <p className="text-[0.9375rem] text-muted">
            {education.degree} — {education.specialization}
          </p>
        </Section>

        <Section title="Certifications & achievements">
          <ul className="grid gap-1 pl-5 text-[0.9375rem] [list-style:disc]">
            {certifications.map((c) => (
              <li key={c.name}>
                <a href={c.href} className="text-accent hover:underline">
                  {c.name}
                </a>{" "}
                — {c.issuer} ({c.year})
              </li>
            ))}
            {achievements.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7 break-inside-avoid-page">
      <h2 className="border-b border-black/10 pb-1.5 text-eyebrow tracking-[0.08em] text-muted uppercase">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
