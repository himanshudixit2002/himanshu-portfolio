"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useCardFocus } from "./CardFocus";

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
 *
 * The chosen chip's fill is one pill that slides between chips: a layer the
 * size of the row, clipped to the chosen chip, so moving it is a clip-path
 * transition rather than a layout change. Until it has been measured — and
 * without JavaScript — the chosen chip fills itself.
 */
export function WorkFilter({ filters, total, children }: Props) {
  const [active, setActive] = useState("all");
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const latest = useRef<ViewTransition>(null);
  const [pill, setPill] = useState<string | null>(null);
  useCardFocus(grid);

  useLayoutEffect(() => {
    const row = chips.current;
    const chosen = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !chosen) return;
    const place = () => {
      const top = chosen.offsetTop;
      const left = chosen.offsetLeft;
      const right = row.clientWidth - left - chosen.offsetWidth;
      const bottom = row.clientHeight - top - chosen.offsetHeight;
      setPill(`inset(${top}px ${right}px ${bottom}px ${left}px round 999px)`);
    };
    place();
    // Chips move when the row wraps differently or the font arrives.
    const resize = new ResizeObserver(place);
    resize.observe(row);
    row.querySelectorAll("button").forEach((b) => resize.observe(b));
    return () => resize.disconnect();
  }, [active]);
  const count = active === "all" ? total : (filters.find((f) => f.id === active)?.count ?? total);

  const choose = (id: string) => {
    const el = root.current;
    const reduced = document.documentElement.getAttribute("data-motion") === "reduce";
    if (id === active || !el || reduced || !canMorph()) {
      setActive(id);
      return;
    }
    // Cards and the chip row are named only for this transition (see
    // globals.css), so they never take part in anything else.
    el.setAttribute("data-animating", "");
    const transition = document.startViewTransition(() => flushSync(() => setActive(id)));
    latest.current = transition;
    // A quick second click skips this transition; leave the names to the new one.
    const done = () => latest.current === transition && el.removeAttribute("data-animating");
    transition.finished.then(done, done);
  };

  return (
    <div ref={root}>
      <div ref={chips} role="group" aria-label="Filter projects" data-chips className="relative isolate flex flex-wrap items-center gap-2">
        {pill && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-fg-inverse transition-[clip-path] duration-(--dur-base) ease-(--ease-emphasized)"
            style={{ clipPath: pill }}
          />
        )}
        {[{ id: "all", label: "All", count: total }, ...filters].map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={active === f.id}
            onClick={() => choose(f.id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-[color,box-shadow,scale] duration-(--dur-micro) active:scale-[0.97] ${
              active === f.id
                ? `text-ink ${pill ? "" : "bg-fg-inverse"}`
                : "text-muted-inverse ring-1 ring-white/15 ring-inset hover:text-fg-inverse hover:ring-white/30"
            }`}
          >
            {f.label}
            <span className={`font-mono text-xs tabular-nums ${active === f.id ? "text-ink/60" : "text-dim-inverse"}`}>{f.count}</span>
          </button>
        ))}
        <p aria-live="polite" className="sr-only">
          Showing {count} project{count === 1 ? "" : "s"}
        </p>
      </div>
      <div ref={grid} data-filter={active} className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}
