"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { SkillEvidence } from "@/content/skills";
import s from "./skills.module.css";

type Group = { group: string; skills: SkillEvidence[] };
type Slim = { slug: string; title: string; accent: string };

/**
 * The skills as chips, grouped as on the résumé. Pointing at one (or
 * focusing it) shows where it's used, and a tap or click keeps it: the
 * projects whose stack shows it light up and the rest step back. Wide
 * screens show every project beside the chips; phones show just the
 * matches, in a bar that stays in view while the section is. Skills
 * without a project or role to show them are listed plainly.
 */
export function SkillExplorer({ groups, projects }: { groups: Group[]; projects: Slim[] }) {
  const [pinned, setPinned] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const all = groups.flatMap((g) => g.skills);
  const current = all.find((k) => k.name === (preview ?? pinned)) ?? null;
  const lit = (slug: string) => !current || current.projects.includes(slug);
  const matches = current ? projects.filter((p) => current.projects.includes(p.slug)) : [];

  return (
    <div className={s.explorer} data-choosing={current ? "" : undefined}>
      <div className="grid gap-7">
        {groups.map((g, gi) => (
          <div key={g.group} data-reveal style={{ "--reveal-i": gi } as CSSProperties}>
            <p className="text-eyebrow text-dim-inverse">{g.group}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {g.skills.map((k) => {
                const shown = k.projects.length > 0 || k.cleartrip;
                return (
                  <li key={k.name}>
                    {shown ? (
                      <button
                        type="button"
                        aria-pressed={pinned === k.name}
                        onClick={() => setPinned((p) => (p === k.name ? null : k.name))}
                        onPointerEnter={(e) => e.pointerType === "mouse" && setPreview(k.name)}
                        onPointerLeave={() => setPreview(null)}
                        onFocus={() => setPreview(k.name)}
                        onBlur={() => setPreview(null)}
                        className={s.chip}
                        data-current={current?.name === k.name || undefined}
                      >
                        {k.name}
                      </button>
                    ) : (
                      <span className={`${s.chip} ${s.plain}`}>{k.name}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Wide screens: every project, lit where the skill shows. */}
      <aside aria-label="Where it shows up" className={s.panel}>
        <p className="text-sm text-muted-inverse" aria-live="polite">
          {current ? (
            <>
              Where <span className="font-semibold text-fg-inverse">{current.name}</span> shows up:
            </>
          ) : (
            "Point at a skill to see where it shows up."
          )}
        </p>
        <ul className="mt-4 grid gap-1.5">
          <li className={s.row} data-lit={!current || current.cleartrip || undefined} style={{ "--i": 0, "--accent": "#5ca4ff" } as CSSProperties}>
            <Link href="/about#experience" className={s.rowLink}>
              <span className={s.dot} />
              Cleartrip <span className="text-dim-inverse">· the role</span>
            </Link>
          </li>
          {projects.map((p, i) => (
            <li key={p.slug} className={s.row} data-lit={lit(p.slug) || undefined} style={{ "--i": i + 1, "--accent": p.accent } as CSSProperties}>
              <Link href={`/work/${p.slug}`} className={s.rowLink}>
                <span className={s.dot} />
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Phones: just the matches, in a bar that stays in view. */}
      <div className={s.bar} data-open={current ? "" : undefined} aria-hidden={!current || undefined}>
        {current && (
          <>
            <p className="text-xs font-semibold text-fg-inverse">{current.name}</p>
            <ul className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
              {current.cleartrip && (
                <li>
                  <Link href="/about#experience" className={s.pill} style={{ "--accent": "#5ca4ff" } as CSSProperties}>
                    Cleartrip
                  </Link>
                </li>
              )}
              {matches.map((p) => (
                <li key={p.slug}>
                  <Link href={`/work/${p.slug}`} className={s.pill} style={{ "--accent": p.accent } as CSSProperties}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
