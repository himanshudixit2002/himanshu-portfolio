"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import { usePinShown } from "@/components/motion/ScrollScene";
import { smartShelfKart } from "@/content/projects";
import { SskInventoryArt } from "@/components/art/SmartShelfKartArt";
import { Check } from "@/components/ui/icons";
import s from "./impact.module.css";

const inventoryAlt = smartShelfKart.media.find((m) => m.id === "ssk-inventory")!.alt;

const phases = [
  {
    title: "Build the experience.",
    body: "Interfaces that keep a busy stockroom calm: what's low, what moved, and what to do next — on the web, Android and iOS.",
  },
  {
    title: "Connect the systems.",
    body: "Behind the screen, three services with separate jobs: a system of record, an assistant, and a reporting engine.",
  },
  {
    title: "Make it dependable.",
    body: "Rules re-check every client write, the assistant previews before it commits, reports rebuild all-or-nothing — and an offline eval suite gates every push.",
  },
];

const services = [
  { title: "Cloud Firestore", sub: "Records + security rules", x: 14, y: 50 },
  { title: "Assistant service", sub: "FastAPI · LangGraph", x: 83, y: 22 },
  { title: "Reporting service", sub: "Spring Boot · PostgreSQL", x: 83, y: 78 },
];

const guarantees = [
  { label: "Rules re-check every write", x: 30, y: 63 },
  { label: "Writes previewed, then confirmed", x: 66, y: 36 },
  { label: "Rebuilt in one transaction", x: 66, y: 64 },
];

type Opacity = MotionValue<number> | number;

/** An overlay piece that arrives on the scroll: fades and settles from 88% to full size between `from` and `to`. */
function Arrive({ progress, from, to, className, style, children }: { progress: MotionValue<number>; from: number; to: number; className: string; style: CSSProperties; children: ReactNode }) {
  const v = useTransform(progress, [0, from, to, 1], [0, 0, 1, 1]);
  const scale = useTransform(v, [0, 1], [0.88, 1]);
  return (
    <motion.div className={className} style={{ ...style, opacity: v, scale }}>
      {children}
    </motion.div>
  );
}

function DrawnLink({ progress, from, x, y }: { progress: MotionValue<number>; from: number; x: number; y: number }) {
  const drawn = useTransform(progress, [0, from, from + 0.08, 1], [0, 0, 1, 1]);
  return <motion.path d={`M50 50 L${x} ${y}`} style={{ pathLength: drawn }} />;
}

/** A piece that arrives with `progress` (the pinned scene) or simply sits there (the static frames — no motion components to hydrate). */
function Piece({ progress, from, to, className, style, children }: { progress?: MotionValue<number>; from: number; to: number; className: string; style: CSSProperties; children: ReactNode }) {
  if (progress)
    return (
      <Arrive progress={progress} from={from} to={to} className={className} style={style}>
        {children}
      </Arrive>
    );
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

function Link({ progress, from, x, y }: { progress?: MotionValue<number>; from: number; x: number; y: number }) {
  return progress ? <DrawnLink progress={progress} from={from} x={x} y={y} /> : <path d={`M50 50 L${x} ${y}`} />;
}

/**
 * The systems and guarantees over the drawing. Given `progress` (the pinned
 * scene), links draw out from the client and each node and badge arrives in
 * turn; the groups also fade as a whole with `systems` and `checks`.
 */
function Overlays({ systems, checks, progress, decorative }: { systems: Opacity; checks: Opacity; progress?: MotionValue<number>; decorative?: boolean }) {
  return (
    <>
      <motion.div className={s.overlay} style={{ opacity: systems }} aria-hidden={decorative || undefined}>
        <div className={s.scrim} />
        <svg className={s.links} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {services.map((svc, i) => (
            <Link key={svc.title} progress={progress} from={0.38 + i * 0.025} x={svc.x} y={svc.y} />
          ))}
        </svg>
        <Piece progress={progress} from={0.36} to={0.41} className={`${s.node} ${s.hub}`} style={{ left: "50%", top: "50%" }}>
          <div className={s.nodeTitle}>Flutter client</div>
          <div className={s.nodeSub}>Web · Android · iOS</div>
        </Piece>
        {services.map((svc, i) => (
          <Piece key={svc.title} progress={progress} from={0.42 + i * 0.03} to={0.47 + i * 0.03} className={s.node} style={{ left: `${svc.x}%`, top: `${svc.y}%` }}>
            <div className={s.nodeTitle}>{svc.title}</div>
            <div className={s.nodeSub}>{svc.sub}</div>
          </Piece>
        ))}
      </motion.div>
      <motion.div className={s.overlay} style={{ opacity: checks }} aria-hidden={decorative || undefined}>
        {guarantees.map((g, i) => (
          <Piece key={g.label} progress={progress} from={0.68 + i * 0.035} to={0.73 + i * 0.035} className={s.badge} style={{ left: `${g.x}%`, top: `${g.y}%` }}>
            <span className={s.badgeIcon}>
              <Check />
            </span>
            {g.label}
          </Piece>
        ))}
      </motion.div>
    </>
  );
}

/**
 * Desktop, full motion: one pinned stage over ~210vh of native scrolling.
 * The track always holds its height; the stage inside is only rendered where
 * the pin actually shows, so phones don't hydrate a scene they never see.
 */
function PinnedScene() {
  const track = useRef<HTMLDivElement>(null);
  const shown = usePinShown(track);
  return (
    <div ref={track} className="scene-pinned relative h-[210vh]">
      {shown && <PinnedStage track={track} />}
    </div>
  );
}

function PinnedStage({ track }: { track: RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const [phase, setPhase] = useState(0);

  // Every input range is anchored at 0 and 1. Motion hands opacity to a native
  // ViewTimeline, and without those end stops the browser fills the missing
  // keyframes from the element's base style — a caption that faded out at 36%
  // would drift back in by the end of the scene.
  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.78, 1, 1]);
  const lift = useTransform(scrollYProgress, [0, 0.3, 1], [48, 0, 0]);
  const systems = useTransform(scrollYProgress, [0, 0.36, 0.46, 1], [0, 0, 1, 1]);
  const checks = useTransform(scrollYProgress, [0, 0.68, 0.78, 1], [0, 0, 1, 1]);

  const captionOpacity = [
    useTransform(scrollYProgress, [0, 0.3, 0.36, 1], [1, 1, 0, 0]),
    useTransform(scrollYProgress, [0, 0.36, 0.42, 0.62, 0.68, 1], [0, 0, 1, 1, 0, 0]),
    useTransform(scrollYProgress, [0, 0.68, 0.74, 1], [0, 0, 1, 1]),
  ];
  const captionY = [
    useTransform(scrollYProgress, [0, 0.3, 0.36, 1], [0, 0, -16, -16]),
    useTransform(scrollYProgress, [0, 0.36, 0.42, 0.62, 0.68, 1], [16, 16, 0, 0, -16, -16]),
    useTransform(scrollYProgress, [0, 0.68, 0.74, 1], [16, 16, 0, 0]),
  ];

  const { reduced } = useMotionPreference();
  // The middle of each phase, as scroll progress through the track.
  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const at = [0.16, 0.52, 0.86][i];
    window.scrollTo({ top: top + at * (el.offsetHeight - window.innerHeight), behavior: reduced ? "auto" : "smooth" });
  };

  // State only changes three times across the whole scene, never per frame.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < 0.36 ? 0 : v < 0.68 ? 1 : 2;
    setPhase((current) => (current === next ? current : next));
  });

  return (
      <div className="sticky top-0 flex h-svh flex-col pt-[calc(var(--nav-h)+1.5rem)] pb-8">
        <div className="container-page flex items-end justify-between gap-6">
          <h2 className="text-title text-[clamp(1.75rem,2.6vw,2.5rem)]">From interface to impact.</h2>
          <div role="group" aria-label="Jump to a phase" className="flex">
            {phases.map((p, i) => (
              <button
                key={p.title}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}. ${p.title}`}
                aria-current={i === phase ? "step" : undefined}
                className="group grid h-11 w-12 place-items-center"
              >
                <span className={`h-1 w-10 rounded-full transition-colors duration-300 ${i <= phase ? "bg-accent-bright" : "bg-white/15 group-hover:bg-white/30"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className={`container-page mt-6 flex-1 ${s.stage}`}>
          <div className={s.frameBox}>
            <motion.div style={{ scale, y: lift }} className="origin-center">
              <SskInventoryArt label={inventoryAlt} />
            </motion.div>
            <Overlays systems={systems} checks={checks} progress={scrollYProgress} />
          </div>
        </div>

        <div className="container-page mt-6 grid min-h-[7.5rem]">
          {phases.map((p, i) => (
            <motion.div
              key={p.title}
              style={{ opacity: captionOpacity[i], y: captionY[i] }}
              className="[grid-area:1/1] max-w-2xl"
            >
              <h3 className="text-title text-[clamp(1.5rem,2.4vw,2.25rem)]">{p.title}</h3>
              <p className="mt-2 text-muted-inverse">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
  );
}

/** Phones, reduced motion and no-JS: three captioned frames, no pinning. */
function StaticScene() {
  return (
    <div className="scene-static container-page section-y">
      <h2 className="text-title text-[clamp(2rem,6vw,3rem)]">From interface to impact.</h2>
      <ol className="mt-10 grid gap-14 md:gap-20">
        {phases.map((p, i) => (
          <li key={p.title} className="grid gap-6 md:grid-cols-[1fr_1.6fr] md:items-center md:gap-12">
            <div className="md:order-2">
              <div className={s.staticBox}>
                <SskInventoryArt label={inventoryAlt} />
                {i > 0 && <Overlays systems={1} checks={i > 1 ? 1 : 0} decorative />}
              </div>
            </div>
            <div>
              <p className="text-eyebrow text-dim-inverse">
                {String(i + 1).padStart(2, "0")} / 03
              </p>
              <h3 className="mt-2 text-title text-[clamp(1.5rem,5vw,2.25rem)]">{p.title}</h3>
              <p className="mt-3 text-muted-inverse">{p.body}</p>
              {i === 1 && (
                <ul className="mt-4 grid gap-1.5 text-sm text-muted-inverse">
                  {services.map((svc) => (
                    <li key={svc.title}>
                      <span className="text-fg-inverse">{svc.title}</span> — {svc.sub}
                    </li>
                  ))}
                </ul>
              )}
              {i === 2 && (
                <ul className="mt-4 grid gap-1.5 text-sm text-muted-inverse">
                  {guarantees.map((g) => (
                    <li key={g.label} className="flex items-center gap-2">
                      <Check className="size-4 text-accent-bright" />
                      {g.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function InterfaceToImpact() {
  return (
    <section id="impact" aria-label="From interface to impact" className="bg-ink">
      <PinnedScene />
      <StaticScene />
    </section>
  );
}
