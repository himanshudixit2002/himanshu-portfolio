import type { CSSProperties, ReactNode } from "react";
import { complianceWatch as p } from "@/content/projects";
import { SEED_RULES } from "@/content/compliancewatch/rules";
import { SOURCES } from "@/content/compliancewatch/system";
import { CwHomeArt, CwPhoneArt } from "@/components/art/ComplianceWatchArt";
import { ButtonLink } from "@/components/ui/ButtonLink";
import artStyles from "@/components/art/cw.module.css";
import s from "./main.module.css";

const alt = (id: string) => p.media.find((m) => m.id === id)!.alt;
const figure = (start: string) => p.metrics.find((m) => m.label.startsWith(start))!;

/** The figures the spotlight leads with, found by what they count. */
const FIGURES = [figure("services"), figure("tests passing"), figure("standing GST rules")];

const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {d}
  </svg>
);

/** From a regulator's PDF to the owner's phone, in five stations. Every figure is the project's own. */
const STATIONS: { title: string; stat: string; body: string; icon: ReactNode }[] = [
  {
    title: "Watch",
    stat: `${SOURCES.length} regulator feeds`,
    body: "CBIC, the GST Council, GSTN and Maharashtra GST, read politely: robots.txt first, one request a second.",
    icon: icon(
      <>
        <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.8" />
      </>,
    ),
  },
  {
    title: "Read",
    stat: "PDF → clauses",
    body: "Each document split into numbered clauses, in Hindi and English, and a detector names the kind of change.",
    icon: icon(
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4M9 12h6M9 15.5h6M9 19h3.5" />
      </>,
    ),
  },
  {
    title: "Decide",
    stat: `${SEED_RULES.length} rules · 3 answers`,
    body: "Each rule a predicate over the business's own profile: applies, doesn't, or unsure — and unsure asks a person.",
    icon: icon(
      <>
        <path d="M12 3v6M12 9 5.5 15M12 9l6.5 6M12 9v6" />
        <circle cx="5.5" cy="18" r="2.5" />
        <circle cx="12" cy="18" r="2.5" />
        <circle cx="18.5" cy="18" r="2.5" />
      </>,
    ),
  },
  {
    title: "Date",
    stat: "one per period",
    body: "An obligation for every period, due at the end of the day in IST; an extension moves it, with the clause attached.",
    icon: icon(
      <>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
        <path d="m9.5 15 2 2 3.5-4" />
      </>,
    ),
  },
  {
    title: "Remind",
    stat: "WhatsApp · email",
    body: "In Hindi or English, held through the owner's quiet hours (21:00 to 08:00 unless they pick others), never sent twice.",
    icon: icon(
      <>
        <path d="M20.5 11.5a8 8 0 0 1-11.8 7.1L3.5 20l1.4-4.9A8 8 0 1 1 20.5 11.5Z" />
        <path d="M8.5 11.5h7M8.5 8.5h4.5" />
      </>,
    ),
  },
];

/**
 * The main project, first in the Work section: one wide card with the idea,
 * its figures and its stack beside the product itself (the web app, and the
 * reminder on the owner's phone), then the wire — five stations from a
 * regulator's PDF to that phone, with a light that runs along it.
 */
export function MainProject() {
  const source = p.links.find((l) => l.kind === "source");
  return (
    <article
      aria-labelledby="main-project-title"
      className={s.spot}
      style={{ "--accent": p.accent } as CSSProperties}
      data-xray="Server-rendered spotlight · the product drawn in its own tokens (cqw) · the wire's light is one CSS transform, each station's ring an opacity keyframe on the same 6 s clock"
    >
      <span aria-hidden="true" className={s.glow} />
      <span aria-hidden="true" className={s.glow2} />
      <div className={s.body}>
        <div className={s.top}>
          <div>
            <p className="flex flex-wrap items-center gap-3">
              <span className={s.badge}>Main project</span>
              <span className="text-eyebrow text-dim-inverse">
                <span className="tabular-nums">01</span> · {p.categories.join(" · ")}
              </span>
            </p>
            <h3 id="main-project-title" className="mt-4 text-display text-[clamp(2.25rem,4.4vw,3.75rem)]">
              {p.title}
            </h3>
            <p className="mt-3 text-xl leading-snug text-fg-inverse text-balance">{p.tagline}</p>
            <p className="mt-4 leading-relaxed text-muted-inverse text-pretty">{p.summary}</p>
            <dl className={s.figures}>
              {FIGURES.map((m) => (
                <div key={m.label}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span className="block text-title text-[clamp(1.5rem,2.2vw,2rem)] tabular-nums" style={{ color: p.accent }}>
                      {m.value}
                    </span>
                    <span aria-hidden="true" className="mt-1 block text-xs leading-snug text-muted-inverse">
                      {m.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href={`/work/${p.slug}`}>Case study</ButtonLink>
              <ButtonLink href={`/work/${p.slug}#try`} variant="secondary">
                Try the rules engine
              </ButtonLink>
              {source && (
                <ButtonLink href={source.href} variant="text" external>
                  {source.label}
                </ButtonLink>
              )}
            </div>
          </div>

          <div className={s.art}>
            <div className={s.artPair}>
              <div className={artStyles.duo}>
                <CwHomeArt label={alt("cw-home")} />
                <CwPhoneArt label={alt("cw-whatsapp")} sequence className={artStyles.duoPhone} />
              </div>
            </div>
            <CwPhoneArt label={alt("cw-whatsapp")} sequence className={s.artPhone} />
            <p className="mt-3 text-center text-xs text-dim-inverse">Interface illustrations with sample data</p>
          </div>
        </div>

        <div className="relative">
          <span aria-hidden="true" className={s.line}>
            <span className={s.comet} />
          </span>
          <ol className={s.wire} aria-label="How a rule change reaches a business">
            {STATIONS.map((st, i) => (
              <li key={st.title} className={s.station} style={{ "--i": i } as CSSProperties}>
                <span className={s.node}>{st.icon}</span>
                <span className={s.stationTitle}>
                  {st.title}
                  <span className={s.stat}>{st.stat}</span>
                </span>
                <span className={s.stationBody}>{st.body}</span>
              </li>
            ))}
          </ol>
        </div>

        <ul aria-label="Built with" className="flex flex-wrap gap-1.5">
          {p.stack.map((t) => (
            <li key={t} className={s.tech}>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
