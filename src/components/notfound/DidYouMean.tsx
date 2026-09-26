"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type CSSProperties } from "react";
import type { Place } from "@/content/places";
import { score, skipped } from "@/lib/fuzzy";

const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
const noSubscribe = () => () => {};
const FALLBACK = ["g-work", "g-lab", "g-about"];

/**
 * Three places the missing address might have meant, ranked with the
 * palette's own matching against its last part ("/work/kv-store" finds
 * KVStore), topped up with the main pages. Read after mount: the page is
 * built ahead, not knowing which address was asked for, so it first shows
 * the main pages (the same three-card size, so nothing moves).
 */
export function DidYouMean({ places }: { places: Place[] }) {
  const path = usePathname();
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  const last = mounted ? squash(decodeURIComponent(path.split("/").filter(Boolean).pop() ?? "")) : "";
  const ranked = last
    ? places
        .map((p) => ({ p, rank: score(squash(p.label), `${p.hint} ${p.keywords ?? ""}`, last) }))
        .filter((r) => r.rank > 0 && skipped(r.rank) <= last.length / 3)
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 3)
        .map((r) => r.p)
    : [];
  // Always three: the best matches, topped up with the main pages.
  const shown = [...ranked, ...places.filter((p) => FALLBACK.includes(p.id) && !ranked.includes(p))].slice(0, 3);

  return (
    <div className="relative mt-10" data-xray="Client · ranked after load with the palette's own matching · three fixed-size cards keyed by slot, so nothing moves">
      <p className="text-eyebrow text-dim-inverse">{ranked.length ? "Maybe you meant" : "Try one of these"}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {/* Keyed by slot, not by place: when the ranked list arrives, the three cards
            change what they say in place instead of trading positions. */}
        {shown.map((p, i) => (
          <li key={i}>
            <Link
              href={p.href}
              className="group flex h-[5.75rem] flex-col rounded-2xl bg-ink-2 p-4 ring-1 ring-white/8 transition-[translate,box-shadow] duration-(--dur-base) ease-(--ease-out) hover:-translate-y-0.5 hover:ring-white/20"
              style={{ "--accent": p.accent ?? "#5ca4ff" } as CSSProperties}
            >
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span aria-hidden="true" className="size-2 rounded-full bg-(--accent)" />
                {p.label}
              </span>
              {/* One fixed height whatever the text, so the list can change after load without moving anything. */}
              <span className="mt-1 line-clamp-2 text-sm text-muted-inverse">{p.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
