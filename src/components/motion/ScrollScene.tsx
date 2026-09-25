"use client";

import { useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useMotionPreference } from "./MotionPreferences";

type Props = {
  /** Accessible name for the scene. */
  label: string;
  /** Scroll length of the pinned track on phones and from 768px up. */
  length?: { base: string; md: string };
  /**
   * What phones get: a short pinned stage, or the static frames — which the
   * frames themselves can lay out as swipeable cards (see SnapGallery).
   */
  mobile?: "pin" | "frames";
  /** The pinned stage, drawn from scroll progress (0 → 1 across the track). */
  children: (progress: MotionValue<number>) => ReactNode;
  /**
   * The same story as static frames, for reduced motion and — unless
   * mobile="pin" — phones. A node is rendered on the server (use it when the
   * frames are what phones see). A function is drawn on the client, and only
   * when the stage isn't showing, so nobody else parses or hydrates frames
   * they'll never see; give such a scene a <noscript> copy for no-JS.
   */
  frames: ReactNode | (() => ReactNode);
  className?: string;
};

/**
 * A pinned, scroll-scrubbed scene with a static twin. CSS in motion.css
 * decides which one shows, before any script runs, so nothing shifts. The
 * stage's content is only rendered once it is actually shown; its track
 * reserves the height either way.
 */
export function ScrollScene({ label, length = { base: "150lvh", md: "240lvh" }, mobile = "frames", children, frames, className = "" }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const shown = usePinShown(track);

  const style = { "--len": length.base, "--len-md": length.md } as CSSProperties;
  const staticFrames = typeof frames === "function" ? (shown === false ? frames() : null) : frames;

  return (
    <div role="group" aria-label={label} className={`scene ${className}`} data-mobile={mobile}>
      <div ref={track} className="scene-pin scene-track" style={style}>
        <div className="scene-stage">{shown ? children(scrollYProgress) : null}</div>
      </div>
      <div className="scene-frames">{staticFrames}</div>
    </div>
  );
}

/**
 * Whether the pinned track is displayed right now; follows resizes and the
 * motion switch. `null` until measured, so nothing is drawn on the server or
 * before the first check.
 */
function usePinShown(ref: RefObject<HTMLElement | null>) {
  const [shown, setShown] = useState<boolean | null>(null);
  const { reduced } = useMotionPreference();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setShown(getComputedStyle(el).display !== "none");
    check();
    const wide = window.matchMedia("(min-width: 768px)");
    wide.addEventListener("change", check);
    return () => wide.removeEventListener("change", check);
  }, [ref, reduced]);

  return shown;
}

/**
 * The current step of `count` equal steps, as React state that changes only
 * when a boundary is crossed — never per frame.
 */
export function useSceneStep(progress: MotionValue<number>, count: number) {
  const toStep = (v: number) => Math.min(count - 1, Math.max(0, Math.floor(v * count)));
  const [step, setStep] = useState(() => toStep(progress.get()));
  useMotionValueEvent(progress, "change", (v) => {
    const next = toStep(v);
    setStep((current) => (current === next ? current : next));
  });
  return step;
}

/** Dots showing where the scene is. Decorative: the captions carry the steps. */
export function SceneDots({ step, count, accent }: { step: number; count: number; accent?: string }) {
  return (
    <ol aria-hidden="true" className="flex gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="h-1 rounded-full transition-[width,background-color] duration-(--dur-base) ease-(--ease-out)"
          style={{ width: i === step ? "1.75rem" : "0.375rem", background: i <= step ? (accent ?? "var(--color-accent-bright)") : "rgb(255 255 255 / 0.2)" }}
        />
      ))}
    </ol>
  );
}

/** Step captions stacked in one cell; the current one shows. All stay readable to screen readers. */
export function SceneCaptions({ step, items, className = "" }: { step: number; items: { title: string; body: string }[]; className?: string }) {
  return (
    <div className={`grid ${className}`}>
      {items.map((item, i) => (
        <div key={item.title} className="scene-caption" data-current={i === step || undefined} data-past={i < step || undefined}>
          <h3 className="text-title text-[clamp(1.375rem,2.4vw,2.125rem)]">{item.title}</h3>
          <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-muted-inverse md:text-base">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
