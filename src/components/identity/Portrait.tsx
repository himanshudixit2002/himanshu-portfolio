"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { discover } from "@/lib/explored";
import { usePointerLight } from "@/components/motion/usePointerLight";
import s from "./portrait.module.css";

const SIZES = "(min-width: 768px) 19rem, 13rem";

/** What the portrait says, one line per tap, round and round. Invitations only; the shortcuts where there's a keyboard. */
const LINES = {
  keys: [
    "Hi, I’m Himanshu.",
    "Everything here is live — poke the cards.",
    "Bet you can’t bounce the full stop up there.",
    "Psst… press ⌘K.",
    "Try x for x-ray mode.",
    "Even the 404 page can be fixed.",
    "Can’t pick one? Hit Surprise me.",
  ],
  touch: [
    "Hi, I’m Himanshu.",
    "Everything here is live — poke the cards.",
    "Bet you can’t bounce the full stop up there.",
    "Psst… try the search button up top.",
    "Flip on X-ray in the footer.",
    "Even the 404 page can be fixed.",
    "Can’t pick one? Hit Surprise me.",
  ],
};
const lines = () => (window.matchMedia("(hover: hover) and (pointer: fine)").matches ? LINES.keys : LINES.touch);

/**
 * Himanshu's photo with depth: shoulders in a glowing disc, head rising out
 * of it, a ring and glow behind at their own depths. It opens and warms to
 * colour as it arrives, tilts toward a fine pointer, and floats at rest (see
 * portrait.module.css). The two images share one URL, so one download. No
 * blur placeholder: on a cut-out its haze shows through the transparent
 * parts until script removes it (and for good without script); the disc
 * holds the place instead.
 *
 * He says hello by himself as he comes into view: he hops, the ring whirls
 * and a speech bubble opens with the first line, and it stays up. Each tap
 * says the next line; those are also announced politely to screen readers
 * (the greeting isn't, since nobody asked for it).
 */
export function Portrait({ className = "" }: { className?: string }) {
  const ref = usePointerLight<HTMLDivElement>();
  const { src, alt } = profile.photo;
  const button = useRef<HTMLButtonElement>(null);
  const said = useRef(0);
  const [taps, setTaps] = useState(0);
  const [line, setLine] = useState("");
  const [announced, setAnnounced] = useState("");

  const speak = (asked: boolean) => {
    const say = lines();
    const n = said.current;
    const ctrl = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl+K";
    const text = say[n % say.length].replace("⌘K", ctrl);
    setLine(text);
    if (asked) setAnnounced(text);
    // Heard every line: a discovery.
    if (n + 1 === say.length) discover("hello");
    said.current = n + 1;
    setTaps(n + 1);
  };
  const hello = () => speak(true);

  // Hello, unprompted, once he's well in view (and only if nobody has tapped yet).
  useEffect(() => {
    const el = button.current;
    if (!el) return;
    let timer = 0;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        timer = window.setTimeout(() => {
          if (said.current === 0) speak(false);
        }, 650);
      },
      { threshold: 0.6 },
    );
    seen.observe(el);
    return () => {
      seen.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Alternate between two identical animations so each tap starts a fresh one.
  const beat = taps ? (taps % 2 ? "a" : "b") : undefined;

  return (
    <div ref={ref} data-xray="Client · one photo download, layered in 3D with CSS · warms to colour on a view timeline" className={`${s.portrait} ${className}`}>
      <div className={s.float}>
        <div className={s.hop} data-beat={beat}>
          <div className={s.stage}>
            <span aria-hidden="true" className={s.glow} />
            <span aria-hidden="true" className={s.ringBox}>
              <span className={s.whirl}>
                <span className={s.ring} />
              </span>
            </span>
            <span aria-hidden="true" className={s.disc} />
            <div className={s.person}>
              <div className={s.rise}>
                <Image src={src} alt={alt} sizes={SIZES} className={s.photo} />
                <Image src={src} alt="" aria-hidden="true" sizes={SIZES} className={`${s.photo} ${s.gray}`} />
              </div>
            </div>
            <span aria-hidden="true" className={`${s.status} live-dot`} />
          </div>
        </div>
      </div>
      <button ref={button} type="button" onClick={hello} className={s.hi} aria-label="Say hi" />
      <p aria-hidden="true" className={s.bubble} data-show={taps > 0 || undefined} data-beat={beat}>
        {line === LINES.keys[0] && <Wave />}
        {line}
      </p>
      <p role="status" className="sr-only">
        {announced}
      </p>
    </div>
  );
}

/** A small drawn hand, waving. */
function Wave() {
  return (
    <svg viewBox="0 0 24 24" className={s.wave} focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.5 12.5V6.8a1.3 1.3 0 0 1 2.6 0v4.7" />
        <path d="M10.1 11.2V5.3a1.3 1.3 0 0 1 2.6 0v6" />
        <path d="M12.7 11.3V6.2a1.3 1.3 0 0 1 2.6 0v6.6" />
        <path d="M15.3 12.4V8.6a1.3 1.3 0 0 1 2.6 0v5.2c0 4-2.6 6.7-6.2 6.7-2.3 0-3.8-1-5-2.8l-2.2-3.4a1.3 1.3 0 0 1 2-1.6l1 1.1" />
      </g>
    </svg>
  );
}

/** The header's small round photo, with the availability dot; its ring turns under the pointer. Decorative: the name is beside it. */
export function Avatar() {
  return (
    <span aria-hidden="true" className={s.avatar}>
      <span className={s.avatarRing} />
      <span className={s.avatarDisc}>
        <Image src={profile.photo.src} alt="" sizes="3rem" loading="eager" fetchPriority="high" className={s.avatarImg} />
      </span>
      <span className={`${s.avatarDot} live-dot`} />
    </span>
  );
}
