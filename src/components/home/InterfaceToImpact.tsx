import type { CSSProperties, ReactNode } from "react";
import { smartShelfKart } from "@/content/projects";
import { SskInventoryArt } from "@/components/art/SmartShelfKartArt";
import { Check } from "@/components/ui/icons";
import { PhaseJump } from "./PhaseJump";
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

/** Where each phase begins and where the jump buttons land, as progress through the track. */
const PHASE_STARTS = [0, 0.36, 0.68];
const PHASE_MIDDLES = [0.16, 0.52, 0.86];

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

/**
 * Over the track's scroll (0 to 1), a piece that plays between `from` and
 * `to`: its keyframes are in impact.module.css, and this sets where on the
 * track they run.
 */
const during = (from: number, to: number) => ({ animationRange: `contain ${from * 100}% contain ${to * 100}%` }) as CSSProperties;

/** An overlay piece: in the pinned scene it fades and settles from 88% to full size between `from` and `to`. */
function Piece({ animated, from, to, className, style, children }: { animated?: boolean; from: number; to: number; className: string; style: CSSProperties; children: ReactNode }) {
  return (
    <div className={`${className} ${animated ? s.arrive : ""}`} style={animated ? { ...style, ...during(from, to) } : style}>
      {children}
    </div>
  );
}

/**
 * The systems and guarantees over the drawing. In the pinned scene, links
 * draw out from the client and each node and badge arrives in turn, and the
 * groups fade in as a whole; in the static frames they simply sit there.
 */
function Overlays({ animated, systems = true, checks = true, decorative }: { animated?: boolean; systems?: boolean; checks?: boolean; decorative?: boolean }) {
  return (
    <>
      {systems && (
        <div className={`${s.overlay} ${animated ? s.systems : ""}`} aria-hidden={decorative || undefined}>
          <div className={s.scrim} />
          <svg className={s.links} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {services.map((svc, i) => (
              <path
                key={svc.title}
                d={`M50 50 L${svc.x} ${svc.y}`}
                pathLength={animated ? 1 : undefined}
                className={animated ? s.draw : undefined}
                style={animated ? during(0.38 + i * 0.025, 0.46 + i * 0.025) : undefined}
              />
            ))}
          </svg>
          <Piece animated={animated} from={0.36} to={0.41} className={`${s.node} ${s.hub}`} style={{ left: "50%", top: "50%" }}>
            <div className={s.nodeTitle}>Flutter client</div>
            <div className={s.nodeSub}>Web · Android · iOS</div>
          </Piece>
          {services.map((svc, i) => (
            <Piece key={svc.title} animated={animated} from={0.42 + i * 0.03} to={0.47 + i * 0.03} className={s.node} style={{ left: `${svc.x}%`, top: `${svc.y}%` }}>
              <div className={s.nodeTitle}>{svc.title}</div>
              <div className={s.nodeSub}>{svc.sub}</div>
            </Piece>
          ))}
        </div>
      )}
      {checks && (
        <div className={`${s.overlay} ${animated ? s.checks : ""}`} aria-hidden={decorative || undefined}>
          {guarantees.map((g, i) => (
            <Piece key={g.label} animated={animated} from={0.68 + i * 0.035} to={0.73 + i * 0.035} className={s.badge} style={{ left: `${g.x}%`, top: `${g.y}%` }}>
              <span className={s.badgeIcon}>
                <Check />
              </span>
              {g.label}
            </Piece>
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Desktop: a pinned stage told by scrolling — the interface grows into place,
 * the systems behind it connect, then the guarantees arrive, each with its
 * caption. All of it is CSS on the track's own view timeline (impact.module.css):
 * nothing to mount or hydrate, and nothing runs per frame. The phase
 * buttons are the only script (PhaseJump).
 */
function PinnedScene() {
  return (
    <div className={s.track}>
      <div className="sticky top-0 flex h-svh flex-col pt-[calc(var(--nav-h)+1.5rem)] pb-8">
        <div className="container-page flex items-end justify-between gap-6">
          <h2 className="text-title text-[clamp(1.75rem,2.6vw,2.5rem)]">From interface to impact.</h2>
          <PhaseJump titles={phases.map((p) => p.title)} starts={PHASE_STARTS} middles={PHASE_MIDDLES} />
        </div>

        <div className={`container-page mt-6 flex-1 ${s.stage}`}>
          <div className={s.frameBox}>
            <div className={s.grow}>
              <SskInventoryArt label={inventoryAlt} />
            </div>
            <Overlays animated />
          </div>
        </div>

        <div className="container-page mt-6 grid min-h-[7.5rem]">
          {phases.map((p, i) => (
            <div key={p.title} className={`[grid-area:1/1] max-w-2xl ${s.caption} ${s[`caption${i}`]}`}>
              <h3 className="text-title text-[clamp(1.5rem,2.4vw,2.25rem)]">{p.title}</h3>
              <p className="mt-2 text-muted-inverse">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Phones, reduced motion and no-JS: three captioned frames, no pinning (phones draw only the last). */
function StaticScene() {
  return (
    <div className={`${s.still} container-page section-y`}>
      <h2 className="text-title text-[clamp(2rem,6vw,3rem)]">From interface to impact.</h2>
      <ol className="mt-10 grid gap-14 md:gap-20">
        {phases.map((p, i) => (
          <li key={p.title} className="grid gap-6 md:grid-cols-[1fr_1.6fr] md:items-center md:gap-12">
            {/* Phones draw only the last frame, which holds everything; the first two are said in words. */}
            <div className={`order-2 ${i < phases.length - 1 ? "max-md:hidden" : ""}`}>
              <div className={s.staticBox}>
                <SskInventoryArt label={inventoryAlt} />
                {i > 0 && <Overlays checks={i > 1} decorative />}
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
    <section
      id="impact"
      aria-label="From interface to impact"
      data-xray="Pinned scroll scene in pure CSS on a view timeline · three still frames on phones, with reduced motion, without JavaScript and where scroll timelines aren't supported"
      className="relative bg-ink"
    >
      <PinnedScene />
      <StaticScene />
    </section>
  );
}
