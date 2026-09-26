import type { CSSProperties } from "react";
import Link from "next/link";
import type { Project } from "@/content/types";
import { SeenTick } from "@/components/explore/Explored";
import { ArrowRight } from "@/components/ui/icons";
import { CardGrid } from "@/components/work/CardFocus";
import card from "@/components/work/card.module.css";
import { MiniVisual } from "@/components/visuals/MiniVisual";
import s from "./bento.module.css";

type Size = "large" | "wide" | "small";

/**
 * Where each project sits in the wall, in this order: from 1024px one large
 * tile (2×2), three wide (2×1) and six small ones fill four columns with no
 * holes; below that, two columns, the large and wide tiles spanning both.
 * A project not listed here joins the end as a small tile.
 */
const LAYOUT: [slug: string, size: Size][] = [
  ["kvstore", "large"],
  ["self-healing-cache", "wide"],
  ["vitals", "small"],
  ["url-shortener", "small"],
  ["scopeforge", "wide"],
  ["rxforce-sfa", "small"],
  ["ai-api-gateway", "small"],
  ["skintellect", "small"],
  ["padhna-tho-padega", "small"],
  ["fraud-ring-engine", "wide"],
];

/**
 * Every project after the three featured ones, as a bento wall: each tile
 * its project's signature (playing under the pointer, or mid-screen on a
 * touch screen), a glow in its accent, its category, title and stack, and
 * the whole tile a link into the case study. Numbered on from the featured
 * three. Tilt, light and the touch-screen "active" tile come from one
 * listener (CardGrid); the tiles rise in on their own scroll timelines.
 */
export function ProjectBento({ projects, start }: { projects: Project[]; start: number }) {
  const order = new Map(LAYOUT.map(([slug], i) => [slug, i]));
  const size = new Map(LAYOUT);
  const tiles = [...projects].sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));

  return (
    <CardGrid className={s.wall}>
      {tiles.map((p, i) => {
        const kind = size.get(p.slug) ?? "small";
        return (
          <article
            key={p.slug}
            data-card
            data-loops
            data-size={kind}
            className={`${card.card} ${s.tile} sd-rise group`}
            style={{ "--card-accent": p.accent, "--accent": p.accent, "--sd-i": i % 4 } as CSSProperties}
          >
            <span aria-hidden="true" data-card-light className={card.light} />
            <span aria-hidden="true" className={s.glow} />
            <div className={s.visual}>
              <MiniVisual id={p.visual} accent={p.accent} />
              <SeenTick slug={p.slug} />
            </div>
            <div className={s.text}>
              <p className={`${s.eyebrow} text-eyebrow`} style={{ color: p.accent }}>
                <span className="text-dim-inverse tabular-nums">{String(start + i).padStart(2, "0")}</span> · {p.categories.join(" · ")}
              </p>
              <h4 className={`${s.title} mt-1.5 font-semibold tracking-[-0.02em]`}>
                <Link href={`/work/${p.slug}`} className="after:absolute after:inset-0 after:z-2 after:content-['']">
                  {p.title}
                </Link>
              </h4>
              <p className={`${s.tagline} mt-1 text-sm text-muted-inverse`}>{p.tagline}</p>
              {kind === "large" && <p className="mt-2 hidden text-sm leading-relaxed text-dim-inverse lg:line-clamp-3">{p.summary}</p>}
              <ul aria-label="Built with" className={`${s.stack} mt-3 flex flex-wrap gap-1.5`}>
                {p.stack.slice(0, kind === "large" ? 6 : 3).map((t) => (
                  <li key={t} className="rounded-full bg-white/6 px-2.5 py-1 text-[0.6875rem] text-muted-inverse ring-1 ring-white/8 ring-inset">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <ArrowRight aria-hidden="true" className={`${s.arrow} size-4 text-fg-inverse`} />
          </article>
        );
      })}
    </CardGrid>
  );
}
