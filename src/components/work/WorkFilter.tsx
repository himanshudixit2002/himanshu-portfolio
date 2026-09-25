"use client";

import { useState, type ReactNode } from "react";

type Props = {
  filters: { id: string; label: string; count: number }[];
  total: number;
  children: ReactNode;
};

/**
 * Filters server-rendered cards by setting data-filter on the list; CSS in
 * globals.css hides non-matching cards. Every card is in the HTML, so the
 * page works — unfiltered — without JavaScript.
 */
export function WorkFilter({ filters, total, children }: Props) {
  const [active, setActive] = useState("all");
  const count = active === "all" ? total : (filters.find((f) => f.id === active)?.count ?? total);

  return (
    <>
      <div role="group" aria-label="Filter projects" className="flex flex-wrap items-center gap-2">
        {[{ id: "all", label: "All", count: total }, ...filters].map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={active === f.id}
            onClick={() => setActive(f.id)}
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
      <div data-filter={active} className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </>
  );
}
