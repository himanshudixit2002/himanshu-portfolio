"use client";

import Image from "next/image";
import { profile } from "@/content/profile";
import { usePointerLight } from "@/components/motion/usePointerLight";
import s from "./portrait.module.css";

const SIZES = "(min-width: 768px) 19rem, 13rem";

/**
 * Himanshu's photo with depth: shoulders in a glowing disc, head rising out
 * of it, a ring and glow behind at their own depths. It opens and warms to
 * colour as it arrives, tilts toward a fine pointer, and floats at rest (see
 * portrait.module.css). The two images share one URL, so one download. No
 * blur placeholder: on a cut-out its haze shows through the transparent
 * parts until script removes it (and for good without script); the disc
 * holds the place instead.
 */
export function Portrait({ className = "" }: { className?: string }) {
  const ref = usePointerLight<HTMLDivElement>();
  const { src, alt } = profile.photo;
  return (
    <div ref={ref} className={`${s.portrait} ${className}`}>
      <div className={s.float}>
        <div className={s.stage}>
          <span aria-hidden="true" className={s.glow} />
          <span aria-hidden="true" className={s.ringBox}>
            <span className={s.ring} />
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
