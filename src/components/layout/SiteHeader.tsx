"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/content/types";
import { Close, Menu } from "@/components/ui/icons";
import { Monogram } from "./Monogram";

type Props = { name: string; items: NavItem[]; resume?: NavItem };

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
  const heroPage = usePathname() === "/";

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
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const solid = !heroPage || pastHero || open;

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-200 ${
        solid
          ? "bg-ink/72 shadow-[inset_0_-1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-(--nav-h) items-center justify-between">
        <Link href="/#top" className="flex min-h-11 items-center gap-2.5 rounded-lg text-[0.9375rem] font-semibold tracking-[-0.01em]">
          <Monogram />
          {name}
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {live.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm text-muted-inverse transition-colors duration-200 hover:text-fg-inverse"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {resumeLink && (
              <li className="ml-2">
                <Link
                  href={resumeLink.href}
                  className="inline-flex min-h-9 items-center rounded-full px-3.5 text-sm text-fg-inverse ring-1 ring-white/20 transition-colors duration-200 ring-inset hover:bg-white/8"
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
          {open ? <Close className="size-6" /> : <Menu className="size-6" />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      <div
        id={menuId}
        ref={panelRef}
        hidden={!open}
        className="border-t border-white/8 md:hidden"
      >
        <nav aria-label="Primary" className="container-page pt-2 pb-6">
          <ul>
            {live.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-13 items-center border-b border-white/8 text-2xl font-semibold tracking-[-0.02em]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {resumeLink && (
              <li>
                <Link
                  href={resumeLink.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-13 items-center border-b border-white/8 text-2xl font-semibold tracking-[-0.02em]"
                >
                  {resumeLink.label}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
