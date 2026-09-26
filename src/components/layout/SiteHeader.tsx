"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { NavItem } from "@/content/types";
import { Avatar } from "@/components/identity/Portrait";

type Props = { name: string; items: NavItem[]; resume?: NavItem };

/** The section a path belongs to: /work/kvstore is under Work. Hash links (/#contact) never are. */
const isCurrent = (href: string, path: string) => !href.includes("#") && (path === href || path.startsWith(`${href}/`));

export function SiteHeader({ name, items, resume }: Props) {
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const live = items.filter((item) => item.status === "live");
  const resumeLink = resume?.status === "live" ? resume : null;
  // Only the homepage opens on a dark hero the bar can sit on transparently;
  // every other page may start on a light surface, so its bar is always frosted.
  const pathname = usePathname();
  const heroPage = pathname === "/";
  const list = useRef<HTMLUListElement>(null);
  // The current page's mark in the desktop nav: one pill clipped to the
  // current link, so moving between pages slides it (a clip-path
  // transition). On pages outside the nav it fades out where it is, and it
  // fades back in at its new place rather than sliding from the old one.
  const [mark, setMark] = useState<{ clip: string; on: boolean; slide: boolean } | null>(null);

  useLayoutEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const place = () => {
      const link = ul.querySelector<HTMLElement>('[aria-current="page"]');
      if (!link) return setMark((m) => (m ? { ...m, on: false, slide: false } : m));
      const inset = 6;
      const top = link.offsetTop + inset;
      const bottom = ul.clientHeight - link.offsetTop - link.offsetHeight + inset;
      const right = ul.clientWidth - link.offsetLeft - link.offsetWidth;
      const clip = `inset(${top}px ${right}px ${bottom}px ${link.offsetLeft}px round 999px)`;
      setMark((m) => ({ clip, on: true, slide: Boolean(m?.on) }));
    };
    place();
    // The nav is hidden on phones; it measures again when it appears or the font arrives.
    const resize = new ResizeObserver(place);
    resize.observe(ul);
    return () => resize.disconnect();
  }, [pathname]);

  // On the homepage the bar turns frosted once the hero's text has scrolled
  // under it, before any artwork can pass behind the name.
  useEffect(() => {
    const sentinel = heroPage ? document.querySelector("[data-nav-sentinel]") : null;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight / 2),
      { rootMargin: "-56px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [heroPage]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    // The page underneath stays put while the menu is open.
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      root.style.overflow = "";
    };
  }, [open]);

  const solid = !heroPage || pastHero || open;

  return (
    <>
      <header
        className={`site-header fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-200 ${
          solid
            ? `${open ? "bg-ink/95" : "bg-ink/72"} shadow-[inset_0_-1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl backdrop-saturate-150`
            : "bg-transparent"
        }`}
      >
        <div className="container-page flex h-(--nav-h) items-center justify-between">
          <Link href="/#top" className="group flex min-h-11 items-center gap-2.5 rounded-lg text-[0.9375rem] font-semibold tracking-[-0.01em]">
            <Avatar />
            {name}
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul ref={list} className="relative isolate flex items-center gap-1">
              {mark && (
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 -z-10 bg-white/10 duration-(--dur-base) ease-(--ease-emphasized) ${mark.slide ? "transition-[clip-path,opacity]" : "transition-opacity"} ${mark.on ? "" : "opacity-0"}`}
                  style={{ clipPath: mark.clip }}
                />
              )}
              {live.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isCurrent(item.href, pathname) ? "page" : undefined}
                    className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm text-muted-inverse transition-colors duration-200 hover:text-fg-inverse active:opacity-70 aria-[current=page]:text-fg-inverse"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {resumeLink && (
                <li className="ml-2">
                  <Link
                    href={resumeLink.href}
                    aria-current={isCurrent(resumeLink.href, pathname) ? "page" : undefined}
                    className="inline-flex min-h-9 items-center rounded-full px-3.5 text-sm text-fg-inverse ring-1 ring-white/20 transition-[background-color,scale] duration-200 ring-inset hover:bg-white/8 active:scale-[0.97] aria-[current=page]:bg-white/10"
                  >
                    {resumeLink.label}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <button
            ref={buttonRef}
            type="button"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-fg-inverse md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="menu-bars" />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>

        {/* Slides open rather than appearing; closed, it is inert and invisible,
            as `hidden` was (see .disclosure in globals.css). */}
        <div id={menuId} ref={panelRef} inert={!open} data-open={open || undefined} className="disclosure md:hidden">
          <div>
            <nav aria-label="Primary" className="container-page border-t border-white/8 pt-2 pb-6">
              <ul>
                {[...live, ...(resumeLink ? [resumeLink] : [])].map((item, i) => (
                  <li
                    key={item.href}
                    style={{ transitionDelay: open ? `${60 + i * 35}ms` : "0ms" }}
                    className={`transition-[opacity,translate] duration-300 ease-(--ease-out) ${
                      open ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0"
                    }`}
                  >
                    <Link
                      href={item.href}
                      aria-current={isCurrent(item.href, pathname) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="group flex min-h-13 items-center justify-between border-b border-white/8 text-2xl font-semibold tracking-[-0.02em] transition-opacity active:opacity-60"
                    >
                      {item.label}
                      <span aria-hidden="true" className="hidden size-1.5 rounded-full bg-accent-bright group-aria-[current=page]:block" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
      {/* Dims the page under the open menu; a tap on it closes the menu. */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-(--dur-base) ease-(--ease-out) md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
    </>
  );
}
