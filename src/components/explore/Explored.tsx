"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import { exploredSnapshot, hasCelebrated, markCelebrated, markExplored, parseList, subscribeExplored } from "@/lib/explored";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import { Check, Dice } from "@/components/ui/icons";
import s from "./explore.module.css";

const Celebration = dynamic(() => import("./Celebration"), { ssr: false });

/**
 * The case studies this visitor has opened (see lib/explored). Null on the
 * server and while hydrating, so the HTML never depends on it.
 */
export function useExplored() {
  const raw = useSyncExternalStore<string | null>(subscribeExplored, exploredSnapshot, () => null);
  return useMemo(() => (raw === null ? null : new Set(parseList(raw))), [raw]);
}

type Slim = { slug: string; accent: string };

/**
 * Records the case study being read. The visit that completes the set plays
 * the thank-you, once.
 */
export function MarkExplored({ slug, projects }: { slug: string; projects: Slim[] }) {
  const [party, setParty] = useState(false);
  useEffect(() => {
    const seen = markExplored(slug);
    if (hasCelebrated() || !projects.every((p) => seen.includes(p.slug))) return;
    markCelebrated();
    // A beat after arrival, once the page has settled.
    const timer = window.setTimeout(() => setParty(true), 900);
    return () => window.clearTimeout(timer);
  }, [slug, projects]);
  return party ? <Celebration accents={projects.map((p) => p.accent)} total={projects.length} onClose={() => setParty(false)} /> : null;
}

/** A card's "Seen" mark, once its case study has been opened. */
export function SeenTick({ slug }: { slug: string }) {
  const seen = useExplored();
  if (!seen?.has(slug)) return null;
  return (
    <span className={s.tick}>
      <Check className="size-3" />
      Seen
    </span>
  );
}

const count = (seen: Set<string> | null, slugs: string[]) => (seen ? slugs.filter((x) => seen.has(x)).length : 0);

/**
 * "4 of 13 explored" with a ring. Laid out from the start, invisible until
 * the count is known, so nothing moves when it appears.
 */
export function ExploredPill({ slugs, className = "" }: { slugs: string[]; className?: string }) {
  const seen = useExplored();
  const n = count(seen, slugs);
  const total = slugs.length;
  const done = n === total;
  const r = 7;
  const c = 2 * Math.PI * r;
  return (
    <p
      className={`${s.pill} ${className}`}
      data-ready={seen ? "" : undefined}
      data-done={done || undefined}
      title="Kept only in this browser"
    >
      <svg viewBox="0 0 18 18" className={s.ring} aria-hidden="true" focusable="false">
        <circle cx="9" cy="9" r={r} className={s.track} />
        {n > 0 && <circle cx="9" cy="9" r={r} className={s.arc} strokeDasharray={`${(c * n) / total} ${c}`} />}
      </svg>
      <span className={s.pillText}>{done ? `All ${total} explored` : `${n} of ${total} explored`}</span>
    </p>
  );
}

/** The door's " · 4 of 13 explored", in the same way. */
export function ExploredCount({ slugs }: { slugs: string[] }) {
  const seen = useExplored();
  const n = count(seen, slugs);
  return (
    <span className={seen ? s.fadeIn : "invisible"}>
      {" "}
      · {n === slugs.length ? `all ${n}` : `${n} of ${slugs.length}`} explored
    </span>
  );
}

/**
 * Opens a random project the visitor hasn't seen (any, once they've seen
 * them all). The pick is made on hover, focus or touch and prefetched, then
 * the die rolls and the page opens. Without JavaScript it is a plain link to
 * the first project.
 */
export function SurpriseMe({ slugs, className = "" }: { slugs: string[]; className?: string }) {
  const seen = useExplored();
  const router = useRouter();
  const path = usePathname();
  const { reduced } = useMotionPreference();
  const [rolls, setRolls] = useState(0);
  const target = useRef<string | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pick = () => {
    if (target.current) return target.current;
    const here = path.startsWith("/work/") ? path.slice("/work/".length) : null;
    const others = slugs.filter((x) => x !== here);
    const fresh = others.filter((x) => !seen?.has(x));
    const pool = fresh.length ? fresh : others;
    target.current = pool[Math.floor(Math.random() * pool.length)];
    router.prefetch(`/work/${target.current}`);
    return target.current;
  };

  const go = (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const href = `/work/${pick()}`;
    target.current = null;
    if (reduced) return router.push(href);
    setRolls((n) => n + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => router.push(href), 520);
  };

  return (
    <Link
      href={`/work/${slugs[0]}`}
      prefetch={false}
      onPointerEnter={pick}
      onFocus={pick}
      onClick={go}
      className={`${s.surprise} ${className}`}
    >
      <Dice className={s.dice} data-roll={rolls ? (rolls % 2 ? "a" : "b") : undefined} />
      Surprise me
      <span className="sr-only">: open a random project</span>
    </Link>
  );
}
