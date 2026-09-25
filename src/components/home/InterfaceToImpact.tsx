"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
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

function Overlays({ systems, checks, decorative }: { systems: Opacity; checks: Opacity; decorative?: boolean }) {
  return (
    <>
      <motion.div className={s.overlay} style={{ opacity: systems }} aria-hidden={decorative || undefined}>
        <div className={s.scrim} />
        <svg className={s.links} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {services.map((svc) => (
            <path key={svc.title} d={`M50 50 L${svc.x} ${svc.y}`} />
          ))}
        </svg>
        <div className={`${s.node} ${s.hub}`} style={{ left: "50%", top: "50%" }}>
          <div className={s.nodeTitle}>Flutter client</div>
          <div className={s.nodeSub}>Web · Android · iOS</div>
        </div>
        {services.map((svc) => (
          <div key={svc.title} className={s.node} style={{ left: `${svc.x}%`, top: `${svc.y}%` }}>
            <div className={s.nodeTitle}>{svc.title}</div>
            <div className={s.nodeSub}>{svc.sub}</div>
          </div>
        ))}
      </motion.div>
      <motion.div className={s.overlay} style={{ opacity: checks }} aria-hidden={decorative || undefined}>
        {guarantees.map((g) => (
          <div key={g.label} className={s.badge} style={{ left: `${g.x}%`, top: `${g.y}%` }}>
            <span className={s.badgeIcon}>
              <Check />
            </span>
            {g.label}
          </div>
        ))}
      </motion.div>
    </>
  );
}

/** Desktop, full motion: one pinned stage over ~210vh of native scrolling. */
function PinnedScene() {
  const track = useRef<HTMLDivElement>(null);
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

  // State only changes three times across the whole scene, never per frame.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < 0.36 ? 0 : v < 0.68 ? 1 : 2;
    setPhase((current) => (current === next ? current : next));
  });

  return (
    <div ref={track} className="scene-pinned relative h-[210vh]">
      <div className="sticky top-0 flex h-svh flex-col pt-[calc(var(--nav-h)+1.5rem)] pb-8">
        <div className="container-page flex items-end justify-between gap-6">
          <h2 className="text-title text-[clamp(1.75rem,2.6vw,2.5rem)]">From interface to impact.</h2>
          <ol aria-hidden="true" className="flex gap-2 pb-2">
            {phases.map((p, i) => (
              <li
                key={p.title}
                className={`h-1 w-10 rounded-full transition-colors duration-300 ${i <= phase ? "bg-accent-bright" : "bg-white/15"}`}
              />
            ))}
          </ol>
        </div>

        <div className={`container-page mt-6 flex-1 ${s.stage}`}>
          <div className={s.frameBox}>
            <motion.div style={{ scale, y: lift }} className="origin-center">
              <SskInventoryArt label={inventoryAlt} />
            </motion.div>
            <Overlays systems={systems} checks={checks} />
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
    <section aria-label="From interface to impact" className="bg-ink">
      <PinnedScene />
      <StaticScene />
    </section>
  );
}
