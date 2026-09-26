"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";

type Section = { id: string; label: string };

type Props = {
  title: string;
  accent: string;
  sections: Section[];
  /** Where "Try it" goes: the interactive visual. */
  tryId?: string;
};

/**
 * Apple's product sub-nav, for a case study. It slides in under the site
 * header once the hero has scrolled away, marks the section being read with
 * an underline that glides between links, and draws a thin reading-progress
 * line. On phones the links become a row of chips that keeps the current one
 * in view. Hidden, it is inert.
 */
export function LocalNav({ title, accent, sections, tryId }: Props) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [bar, setBar] = useState({ x: 0, w: 0 });
  const row = useRef<HTMLUListElement>(null);
  const self = useRef<HTMLElement>(null);
  const { reduced } = useMotionPreference();

  // Once per frame while scrolling: show the bar once the hero's end reaches
  // it (so jumping to the first section keeps it in view), and mark the last
  // section whose top has passed just under both bars. Measured rather than observed, so a jump straight
  // past the hero (a deep link, a restored position) still counts.
  useEffect(() => {
    let frame = 0;
    const sentinel = document.querySelector("[data-local-sentinel]");
    const update = () => {
      // Layout heights, whether or not this bar is showing.
      const header = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 56;
      const line = header + (self.current?.offsetHeight ?? 48) + 24;
      setShown(sentinel ? sentinel.getBoundingClientRect().top < line : false);
      const current = sections.filter((s) => {
        const el = document.getElementById(s.id);
        return el !== null && el.getBoundingClientRect().top <= line;
      });
      setActive(current.at(-1)?.id ?? null);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    // First read on the next frame, not during hydration, so it shares the
    // frame's own layout instead of forcing an extra one.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  // Move the underline to the current link, and keep it in view on phones.
  useLayoutEffect(() => {
    const list = row.current;
    const link = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !link) return setBar((b) => (b.w === 0 ? b : { x: 0, w: 0 }));
    setBar({ x: link.offsetLeft, w: link.offsetWidth });
    if (list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
    }
  }, [active, reduced]);

  return (
    <nav
      ref={self}
      aria-label={`${title} sections`}
      inert={!shown}
      className={`local-nav fixed inset-x-0 top-(--nav-h) z-40 border-b border-white/8 bg-ink/72 backdrop-blur-xl backdrop-saturate-150 transition-[transform,opacity] duration-(--dur-base) ease-(--ease-out) ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="container-page flex h-12 items-center gap-4">
        <p className="hidden flex-none items-center gap-2 text-sm font-semibold tracking-[-0.01em] sm:flex">
          <span aria-hidden="true" className="size-2 rounded-full" style={{ background: accent }} />
          {title}
        </p>
        <ul ref={row} className="relative -mx-2 flex min-w-0 flex-1 items-center overflow-x-auto px-2 [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)] [scrollbar-width:none] sm:[mask-image:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s, i) => (
            <li key={s.id} className={`flex-none ${i === 0 ? "sm:ms-auto" : ""}`}>
              <a
                href={`#${s.id}`}
                data-id={s.id}
                aria-current={active === s.id ? "location" : undefined}
                className={`inline-flex h-12 items-center px-3 text-[0.8125rem] whitespace-nowrap transition-colors duration-(--dur-micro) ${
                  active === s.id ? "text-fg-inverse" : "text-muted-inverse hover:text-fg-inverse"
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
          <li
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full transition-[transform,width,opacity] duration-(--dur-base) ease-(--ease-out)"
            style={{ transform: `translateX(${bar.x}px)`, width: bar.w, opacity: bar.w ? 1 : 0, background: accent } as CSSProperties}
          />
        </ul>
        {tryId && (
          <a
            href={`#${tryId}`}
            className="inline-flex h-8 flex-none items-center rounded-full px-3.5 text-[0.8125rem] font-semibold text-ink transition-[filter,scale] duration-(--dur-micro) hover:brightness-110 active:scale-95"
            style={{ background: accent }}
          >
            Try it
          </a>
        )}
      </div>
      <span aria-hidden="true" className="sd-progress absolute inset-x-0 -bottom-px h-px origin-left" style={{ background: accent }} />
    </nav>
  );
}
