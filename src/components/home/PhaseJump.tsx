"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import s from "./impact.module.css";

/**
 * The pinned scene's three phase buttons: each jumps to the middle of its
 * phase. Their fills follow the scroll in CSS (impact.module.css); this only
 * keeps aria-current in step, reading the track's position once a frame
 * while it's on screen and setting state only when the phase changes.
 */
export function PhaseJump({ titles, starts, middles }: { titles: string[]; starts: number[]; middles: number[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const { reduced } = useMotionPreference();

  const trackOf = () => ref.current?.closest<HTMLElement>(`.${s.track}`) ?? null;
  const progressOf = (track: HTMLElement) => -track.getBoundingClientRect().top / (track.offsetHeight - window.innerHeight);

  useEffect(() => {
    const track = trackOf();
    if (!track) return;
    let frame = 0;
    const update = () => {
      const p = progressOf(track);
      const next = starts.filter((start) => p >= start).length - 1;
      setPhase(Math.max(0, next));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    // Listen only while the track is on screen.
    const seen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } else window.removeEventListener("scroll", onScroll);
    });
    seen.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [starts]);

  const go = (i: number) => {
    const track = trackOf();
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + middles[i] * (track.offsetHeight - window.innerHeight), behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div ref={ref} role="group" aria-label="Jump to a phase" className="flex">
      {titles.map((title, i) => (
        <button
          key={title}
          type="button"
          onClick={() => go(i)}
          aria-label={`${i + 1}. ${title}`}
          aria-current={i === phase ? "step" : undefined}
          className="group grid h-11 w-12 place-items-center"
        >
          <span className="relative h-1 w-10 overflow-clip rounded-full bg-white/15 transition-colors group-hover:bg-white/30">
            <span className={`absolute inset-0 rounded-full bg-accent-bright ${s.fill} ${s[`fill${i}`]}`} />
          </span>
        </button>
      ))}
    </div>
  );
}
