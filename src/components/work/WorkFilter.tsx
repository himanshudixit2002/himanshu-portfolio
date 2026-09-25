"use client";

import { useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

type Props = {
  filters: { id: string; label: string; count: number }[];
  total: number;
  children: ReactNode;
};

/** Each card needs its own snapshot name; without match-element, filter instantly. */
const canMorph = () =>
  typeof document.startViewTransition === "function" && CSS.supports("view-transition-name", "match-element");

/**
 * Filters server-rendered cards by setting data-filter on the list; CSS in
 * globals.css hides non-matching cards. Every card is in the HTML, so the
 * page works — unfiltered — without JavaScript. Where view transitions are
 * supported, cards that stay glide to their new places while the rest fade.
 */
export function WorkFilter({ filters, total, children }: Props) {
  const [active, setActive] = useState("all");
  const grid = useRef<HTMLDivElement>(null);
  const latest = useRef<ViewTransition>(null);
  const count = active === "all" ? total : (filters.find((f) => f.id === active)?.count ?? total);

  const choose = (id: string) => {
    const el = grid.current;
    const reduced = document.documentElement.getAttribute("data-motion") === "reduce";
    if (id === active || !el || reduced || !canMorph()) {
      setActive(id);
      return;
    }
    // Cards are named only for this transition (see globals.css), so they
    // never take part in anything else.
    el.setAttribute("data-animating", "");
    const transition = document.startViewTransition(() => flushSync(() => setActive(id)));
    latest.current = transition;
    // A quick second click skips this transition; leave the names to the new one.
    const done = () => latest.current === transition && el.removeAttribute("data-animating");
    transition.finished.then(done, done);
  };

  return (
    <>
      <div role="group" aria-label="Filter projects" className="flex flex-wrap items-center gap-2">
        {[{ id: "all", label: "All", count: total }, ...filters].map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={active === f.id}
            onClick={() => choose(f.id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
              active === f.id ? "bg-fg-inverse text-ink" : "text-muted-inverse ring-1 ring-white/15 ring-inset hover:text-fg-inverse"
            }`}
          >
            {f.label}
            <span className={`font-mono text-xs ${active === f.id ? "text-ink/60" : "text-dim-inverse"}`}>{f.count}</span>
          </button>
        ))}
        <p aria-live="polite" className="sr-only">
          Showing {count} project{count === 1 ? "" : "s"}
        </p>
      </div>
      <div ref={grid} data-filter={active} className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </>
  );
}
