"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useExplored } from "@/components/explore/Explored";
import { wipeTo } from "@/components/fx/Fx";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import { ArrowRight, Check, Copy, Dice, Search, Sparkle } from "@/components/ui/icons";
import { useXray } from "@/components/xray/XRay";
import { DISCOVERIES } from "@/lib/discoveries";
import { discover, foundSnapshot, parseList, subscribeExplored } from "@/lib/explored";
import { score } from "@/lib/fuzzy";
import { toggleXray } from "@/lib/xray";
import type { PaletteProps } from "./PaletteHost";
import s from "./palette.module.css";

type Item = {
  id: string;
  group: string;
  label: string;
  hint: string;
  keywords?: string;
  icon: ReactNode;
  seen?: boolean;
  /** Where it goes; items without one are actions (see run). */
  href?: string;
};

/**
 * The command palette: every project, the places to go and a few things to
 * do, filtered as you type. A native modal <dialog> keeps focus inside and
 * closes on Escape; ↑ ↓ choose, Enter runs. Loaded on first open (see
 * PaletteHost).
 */
export default function Palette({ entries, email, onClose }: PaletteProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const seen = useExplored();
  const { reduced, setReduced } = useMotionPreference();
  const xray = useXray();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const base = useId();
  const foundRaw = useSyncExternalStore(subscribeExplored, foundSnapshot, () => "");

  useEffect(() => {
    const d = dialog.current;
    d?.showModal();
    discover("palette");
    return () => d?.close();
  }, []);

  // Close the modal first: while it's open the page is inert, and focus can't go back to the opener.
  const done = (restoreFocus = true) => {
    dialog.current?.close();
    onClose(restoreFocus);
  };

  const go = (href: string) => {
    done(false);
    const project = href.match(/^\/work\/([^/#?]+)/);
    if (project) wipeTo(project[1]);
    router.push(href);
  };

  const projects = entries.filter((e) => e.slug);
  const unseen = projects.filter((e) => !seen?.has(e.slug!));

  const items = useMemo<Item[]>(
    () => [
      ...entries.map((e) => ({
        id: e.id,
        group: e.group,
        label: e.label,
        hint: e.hint,
        keywords: e.keywords,
        href: e.href,
        seen: Boolean(e.slug && seen?.has(e.slug)),
        icon: e.accent ? <span className={s.swatch} style={{ "--swatch": e.accent } as CSSProperties} /> : <ArrowRight className={s.icon} />,
      })),
      {
        id: "surprise",
        group: "Do",
        label: "Surprise me",
        hint: unseen.length ? "A project you haven’t opened yet" : "Any project, at random",
        keywords: "random dice",
        icon: <Dice className={s.icon} />,
      },
      {
        id: "email",
        group: "Do",
        label: copied ? "Copied" : "Copy email address",
        hint: email,
        keywords: "copy email contact mail",
        icon: copied ? <Check className={s.icon} /> : <Copy className={s.icon} />,
      },
      {
        id: "xray",
        group: "Do",
        label: xray ? "Leave x-ray mode" : "X-ray mode",
        hint: "See how each part of the page is built · x",
        keywords: "inspect build outline how",
        icon: <Sparkle className={s.icon} />,
      },
      {
        id: "motion",
        group: "Do",
        label: reduced ? "Turn motion back on" : "Reduce motion",
        hint: reduced ? "Animations are off" : "Still frames instead of animation",
        keywords: "animation accessibility",
        icon: <span className={s.toggle} data-on={reduced || undefined} />,
      },
      ...(() => {
        const found = parseList(foundRaw);
        const group = `Discoveries · ${DISCOVERIES.filter((d) => found.includes(d.id)).length} of ${DISCOVERIES.length}`;
        return DISCOVERIES.map((d) => {
          const got = found.includes(d.id);
          return {
            id: `d-${d.id}`,
            group,
            label: got ? d.name : "Not found yet",
            hint: d.hint,
            keywords: `discovery secret ${got ? "" : "hint"}`,
            href: d.href,
            seen: got,
            icon: <Sparkle className={got ? s.iconFound : s.icon} />,
          };
        });
      })(),
    ],
    [entries, seen, unseen.length, copied, email, xray, reduced, foundRaw],
  );

  /** What choosing an item does; only ever called from a key press or click. */
  const run = (item: Item) => {
    if (item.href) return go(item.href);
    if (item.id.startsWith("d-")) return done();
    switch (item.id) {
      case "surprise": {
        const pool = unseen.length ? unseen : projects;
        return go(`/work/${pool[Math.floor(Math.random() * pool.length)].slug}`);
      }
      case "email":
        // Where the clipboard is unavailable, open the mail app instead.
        return navigator.clipboard?.writeText(email).then(
          () => setCopied(true),
          () => (window.location.href = `mailto:${email}`),
        );
      case "xray":
        toggleXray();
        return done();
      case "motion":
        return setReduced(!reduced);
    }
  };

  // Filtered and ranked within each group; while searching, the group with the best match comes first.
  const shown = useMemo(() => {
    const ranked = items.map((item, order) => ({ item, order, rank: score(item.label, `${item.hint} ${item.keywords ?? ""}`, query) })).filter((r) => r.rank > 0);
    const best = (g: string) => Math.max(...ranked.filter((r) => r.item.group === g).map((r) => r.rank));
    const groups = [...new Set(ranked.map((r) => r.item.group))];
    if (query.trim()) groups.sort((a, b) => best(b) - best(a));
    return groups.flatMap((g) =>
      ranked
        .filter((r) => r.item.group === g)
        .sort((a, b) => (query ? b.rank - a.rank : 0) || a.order - b.order)
        .map((r) => r.item),
    );
  }, [items, query]);

  const current = Math.min(active, Math.max(0, shown.length - 1));
  const optionId = (i: number) => `${base}-o${i}`;

  useEffect(() => {
    list.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!shown.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + shown.length) % shown.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : shown.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (shown[current]) run(shown[current]);
    }
  };

  const groups = shown.reduce<{ name: string; items: { item: Item; i: number }[] }[]>((acc, item, i) => {
    const last = acc[acc.length - 1];
    if (last?.name === item.group) last.items.push({ item, i });
    else acc.push({ name: item.group, items: [{ item, i }] });
    return acc;
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label="Command palette"
      className={s.dialog}
      onCancel={(event) => {
        event.preventDefault();
        done();
      }}
      onClick={(event) => event.target === dialog.current && done()}
    >
      <div className={s.panel}>
        <label className={s.field}>
          <Search className={s.searchIcon} />
          <span className="sr-only">Search projects, places and actions</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKey}
            placeholder="Search projects, places, actions…"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${base}-list`}
            aria-activedescendant={shown.length ? optionId(current) : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            className={s.input}
          />
          <kbd className={s.esc}>esc</kbd>
        </label>

        <div ref={list} id={`${base}-list`} role="listbox" aria-label="Results" className={s.list}>
          {shown.length === 0 && <p className={s.empty}>Nothing matches “{query}”.</p>}
          {groups.map((g) => (
            <div key={g.name} role="group" aria-labelledby={`${base}-${g.name.replace(/\W/g, "")}`}>
              <p id={`${base}-${g.name.replace(/\W/g, "")}`} aria-hidden="true" className={s.group}>
                {g.name}
              </p>
              {g.items.map(({ item, i }) => (
                <div
                  key={item.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === current}
                  data-index={i}
                  className={s.option}
                  onPointerMove={() => i !== current && setActive(i)}
                  onClick={() => run(item)}
                >
                  <span className={s.lead}>{item.icon}</span>
                  <span className={s.text}>
                    <span className={s.label}>
                      {item.label}
                      {item.seen && (
                        <span className={s.seen}>
                          <Check className="size-3" />
                          {item.id.startsWith("d-") ? "Found" : "Seen"}
                        </span>
                      )}
                    </span>
                    <span className={s.hint}>{item.hint}</span>
                  </span>
                  <kbd aria-hidden="true" className={s.enter}>
                    ↵
                  </kbd>
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className={s.foot}>
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> to choose
          </span>
          <span>
            <kbd>↵</kbd> to open
          </span>
          <span className="max-sm:hidden">
            <kbd>x</kbd> x-ray, anywhere
          </span>
        </p>
      </div>
    </dialog>
  );
}
