import type { CSSProperties, ReactNode } from "react";
import { cueAndCoffee, elepeia, smartShelfKart } from "@/content/projects";
import type { Project } from "@/content/types";
import { CafeFloorArt, ElepeiaArt } from "@/components/art/ChapterArt";
import { SskOverviewArt } from "@/components/art/SmartShelfKartArt";
import { ButtonLink } from "@/components/ui/ButtonLink";
import s from "./featured.module.css";

const alt = (p: Project, i = 0) => p.media[i]?.alt ?? p.title;

const FEATURED: { project: Project; art: ReactNode }[] = [
  { project: smartShelfKart, art: <SskOverviewArt label={alt(smartShelfKart)} /> },
  { project: elepeia, art: <ElepeiaArt label={alt(elepeia)} onDark /> },
  { project: cueAndCoffee, art: <CafeFloorArt label={alt(cueAndCoffee)} /> },
];

/**
 * The three flagship projects as big cards that stack as you scroll: each
 * sticks under the header and the next slides up over it, while the one
 * underneath settles back and dims (CSS on the next card's view timeline;
 * featured.module.css). Each card says it in one look: the idea, its own
 * figures, its stack, and the way in. On phones they're simply a column.
 */
export function Featured() {
  return (
    <ol className={s.stack} data-xray="Sticky stacking cards · each one settles back on the next card's CSS view timeline">
      {FEATURED.map(({ project: p, art }, i) => {
        const live = p.links.find((l) => l.kind === "live");
        return (
          <li key={p.slug} className={`${s.item} ${s[`item${i}`]}`} style={{ "--n": i, "--accent": p.accent } as CSSProperties}>
            <article aria-labelledby={`featured-${p.slug}`} className={s.card}>
              <span aria-hidden="true" className={s.glow} />
              <div className={s.text}>
                <p className="text-eyebrow" style={{ color: p.accent }}>
                  {String(i + 1).padStart(2, "0")} · {p.categories.join(" · ")}
                </p>
                <h3 id={`featured-${p.slug}`} className="mt-3 text-title text-[clamp(1.75rem,3.2vw,2.75rem)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-lg text-muted-inverse text-balance">{p.tagline}</p>
                {p.metrics.length > 0 && (
                  <dl className={s.figures}>
                    {p.metrics.slice(0, 3).map((m) => (
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
                )}
                <ul aria-label="Built with" className="mt-5 flex flex-wrap gap-1.5">
                  {p.stack.map((t) => (
                    <li key={t} className={s.tech}>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href={`/work/${p.slug}`}>Case study</ButtonLink>
                  {live && (
                    <ButtonLink href={live.href} variant="secondary" external>
                      {live.label}
                    </ButtonLink>
                  )}
                </div>
              </div>
              <div className={s.art}>{art}</div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
