"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight } from "@/components/ui/icons";

type Props = {
  /** Accessible name for the list of cards. */
  label: string;
  items: ReactNode[];
  /** Become a plain vertical stack from 768px up. */
  stackFrom?: "md";
  /** Card width, as a CSS length. */
  itemWidth?: string;
  tone?: "dark" | "light";
  className?: string;
};

/**
 * A row of cards that snaps one at a time, Apple gallery style: the next card
 * peeks in from the screen edge, a dot pager and paddles follow along, and
 * the row scrolls with a finger, trackpad, keyboard or the controls. Without
 * JavaScript it is still a swipeable, snapping row.
 */
export function SnapGallery({ label, items, stackFrom, itemWidth, tone = "dark", className = "" }: Props) {
  const track = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  // Whether the row is wider than its box; if every card fits there is nothing to page through.
  const [overflowing, setOverflowing] = useState(true);
  const light = tone === "light";

  useEffect(() => {
    const root = track.current;
    if (!root) return;
    let frame = 0;
    // The active card is the one resting at the snap line — or the last, once the row can't scroll further.
    const measure = () => {
      const cards = Array.from(root.children) as HTMLElement[];
      const max = root.scrollWidth - root.clientWidth;
      setOverflowing(max > 2);
      if (root.scrollLeft >= max - 2) return setActive(cards.length - 1);
      const line = root.scrollLeft + parseFloat(getComputedStyle(root).scrollPaddingLeft || "0");
      let nearest = 0;
      cards.forEach((card, i) => {
        if (Math.abs(card.offsetLeft - line) < Math.abs(cards[nearest].offsetLeft - line)) nearest = i;
      });
      setActive(nearest);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const resize = new ResizeObserver(onScroll);
    resize.observe(root);
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      root.removeEventListener("scroll", onScroll);
    };
  }, [items.length]);

  const go = (index: number) => {
    const target = track.current?.children[Math.max(0, Math.min(items.length - 1, index))];
    target?.scrollIntoView({ inline: "start", block: "nearest" });
  };

  const style = itemWidth ? ({ "--snap-w": itemWidth } as CSSProperties) : undefined;
  const control = `grid size-11 place-items-center rounded-full transition-[background-color,opacity,transform] duration-(--dur-micro) active:scale-95 disabled:opacity-30 ${
    light ? "bg-black/6 text-fg enabled:hover:bg-black/10" : "bg-white/8 text-fg-inverse enabled:hover:bg-white/14"
  }`;

  return (
    <div className={`snap-gallery ${className}`} data-stack={stackFrom} data-static={overflowing ? undefined : ""} style={style}>
      <ol ref={track} aria-label={label} tabIndex={0} className="snap-track relative rounded-[1.75rem] outline-offset-4">
        {items.map((item, i) => (
          <li key={i} data-index={i} data-active={i === active || undefined} className="snap-item">
            {item}
          </li>
        ))}
      </ol>
      {items.length > 1 && overflowing && (
        <div className="snap-controls mt-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5" role="group" aria-label={`${label}: choose a card`}>
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${i + 1} of ${items.length}`}
                aria-current={i === active || undefined}
                className="grid h-11 min-w-6 place-items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-[width,background-color] duration-(--dur-base) ease-(--ease-out) ${
                    i === active ? `w-6 ${light ? "bg-fg" : "bg-fg-inverse"}` : `w-1.5 ${light ? "bg-black/20" : "bg-white/25"}`
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(active - 1)} disabled={active === 0} className={control} aria-label="Previous">
              <ArrowRight className="size-4 rotate-180" />
            </button>
            <button type="button" onClick={() => go(active + 1)} disabled={active === items.length - 1} className={control} aria-label="Next">
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
