"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { wipeTo } from "@/components/fx/Fx";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import { discover } from "@/lib/explored";

const PULL = 700;

/**
 * Keep scrolling at the very end of a case study, with the next-project door
 * fully in view, and a ring on the door fills; a full ring opens the next
 * project (with its accent wipe). It only ever counts downward wheel
 * movement at the bottom of the page, lets go after a pause or any upward
 * scroll, and is off for touch screens and reduced motion, where the door
 * is simply a link. Written straight to the ring's style: no React state.
 */
export function PullNext({ slug }: { slug: string }) {
  const router = useRouter();
  const { reduced } = useMotionPreference();
  const ref = useRef<HTMLSpanElement>(null);
  const arc = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ref.current;
    const door = el?.closest("a");
    if (!el || !door || reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let pulled = 0;
    let timer = 0;
    let gone = false;
    const show = (p: number) => {
      el.toggleAttribute("data-pulling", p > 0);
      arc.current?.style.setProperty("stroke-dashoffset", String(1 - p));
    };
    const onWheel = (event: WheelEvent) => {
      if (gone) return;
      if (event.deltaY < 0) {
        pulled = 0;
        return show(0);
      }
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      const box = door.getBoundingClientRect();
      if (!atBottom || box.top < 0 || box.bottom > window.innerHeight) return;
      pulled = Math.min(PULL, pulled + Math.min(event.deltaY, 120));
      show(pulled / PULL);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        pulled = 0;
        show(0);
      }, 700);
      if (pulled < PULL) return;
      gone = true;
      discover("pull");
      wipeTo(slug, box.left + box.width / 2, box.top + box.height / 2);
      router.push(`/work/${slug}`);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wheel", onWheel);
    };
  }, [slug, reduced, router]);

  return (
    <span ref={ref} aria-hidden="true" className="pull-next">
      <svg viewBox="0 0 20 20" focusable="false">
        <circle cx="10" cy="10" r="8" className="pull-next-track" />
        <circle ref={arc} cx="10" cy="10" r="8" pathLength={1} className="pull-next-arc" />
      </svg>
      Keep scrolling
    </span>
  );
}
