"use client";

import { useEffect, useState } from "react";
import s from "./rail.module.css";

type Section = { id: string; label: string };

/**
 * A slim column of dots at the right edge of wide screens, one per homepage
 * section: the one being read grows, a label slides out under the pointer
 * or focus, and each is a link to its section. One observer watches a line
 * across the middle of the screen; over the hero, where no section crosses
 * it, the rail steps aside. Without JavaScript it is a plain list of links.
 */
export function SectionRail({ sections }: { sections: Section[] }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const targets = sections.map((x) => document.getElementById(x.id)).filter((el): el is HTMLElement => Boolean(el));
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? crossing.add(e.target.id) : crossing.delete(e.target.id)));
        // Nested or touching sections: the last in page order wins.
        setCurrent(sections.findLast((x) => crossing.has(x.id))?.id ?? null);
        setReady(true);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Sections on this page" className={s.rail} data-ready={ready || undefined} data-away={ready && !current ? "" : undefined}>
      <ol className={s.list}>
        {sections.map((x) => (
          <li key={x.id}>
            <a href={`#${x.id}`} className={s.link} aria-current={current === x.id ? "true" : undefined}>
              <span aria-hidden="true" className={s.dot} />
              <span className={s.label}>{x.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
