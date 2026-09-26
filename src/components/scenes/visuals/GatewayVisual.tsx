import { memo, type CSSProperties, type ReactNode } from "react";
import { GW_FEATURES, GW_NORMAL, GW_OUTLIER, GW_POINTS, GW_SCORES, GW_THRESHOLD, NORMAL_CUTS, OUTLIER_CUTS, type GatewayFrame } from "@/lib/scenes/gateway";
import type { Box, Cut } from "@/lib/sim/isolation-forest";
import { Later } from "../IdleDraw";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";
import { Arrow } from "./marks";

type Props = { frame: GatewayFrame; accent: string; still?: boolean; layout?: Layout };
type Plot = { x0: number; x1: number; y0: number; y1: number };
type Panel = { x: number; y: number; w: number };
const fade = (on: boolean, delay = 0) => ({ opacity: on ? 1 : 0, transitionDelay: on ? `${delay}ms` : "0ms" }) as CSSProperties;

/*
 * Log axes, so floods (a few ms, under 2 KB), the crowd (~180 ms, ~50 KB),
 * scrapers and probes each get room. Cuts are still straight lines.
 */
const X = [5, 1000] as const;
const Y = [0.3, 300] as const;
const X_TICKS = [10, 100, 1000];
const Y_TICKS = [1, 10, 100];
const FLAGGED = GW_SCORES.map((sc) => sc >= GW_THRESHOLD);
/** The top-scoring requests, for the audit log. */
const TOP = GW_SCORES.map((sc, i) => [sc, i] as const)
  .sort((a, b) => b[0] - a[0])
  .slice(0, 3);

/**
 * "Easy to isolate": requests become points (response time × size), random
 * cuts isolate a probe in a few and a typical request in many, and the
 * scores are logged for review, not acted on. A side panel carries each
 * step's detail, clear of the data. Wide: panel to the right. Tall: below.
 */
export function GatewayVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

const log = (v: number, [lo, hi]: readonly [number, number]) => (Math.log10(Math.min(hi, Math.max(lo, v))) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo));
const at = (p: Plot) => ({
  x: (v: number) => p.x0 + log(v, X) * (p.x1 - p.x0),
  y: (v: number) => p.y1 - log(v, Y) * (p.y1 - p.y0),
});

/** The region left around the target after every cut. */
function lastBox(cuts: Cut[], target: number): Box {
  const p = GW_POINTS[target];
  const last = cuts.at(-1)!;
  const below = p[last.dim] < last.at;
  return last.dim === "x" ? (below ? { ...last.box, x1: last.at } : { ...last.box, x0: last.at }) : below ? { ...last.box, y1: last.at } : { ...last.box, y0: last.at };
}

/** The points never change; only their colour does, at the audit step. */
const Points = memo(function Points({ plot, flagged, accent }: { plot: Plot; flagged: boolean; accent: string }) {
  const m = at(plot);
  return (
    <g>
      {GW_POINTS.map((p, i) => (
        <circle key={i} className={s.t} cx={m.x(p.x)} cy={m.y(p.y)} r="3" fill={flagged && FLAGGED[i] ? accent : "rgb(245 245 247 / 0.5)"} />
      ))}
    </g>
  );
});

const Axes = memo(function Axes({ plot, size }: { plot: Plot; size: number }) {
  const m = at(plot);
  return (
    <g>
      <line x1={plot.x0} y1={plot.y1 + 8} x2={plot.x1} y2={plot.y1 + 8} stroke="rgb(255 255 255 / 0.15)" />
      <line x1={plot.x0 - 8} y1={plot.y0} x2={plot.x0 - 8} y2={plot.y1} stroke="rgb(255 255 255 / 0.15)" />
      {X_TICKS.map((t) => (
        <text key={t} x={m.x(t)} y={plot.y1 + 8 + size * 1.25} fontSize={size * 0.75} textAnchor="middle" className={s.mono} fill="#71717a">
          {t}
        </text>
      ))}
      {Y_TICKS.map((t) => (
        <text key={t} x={plot.x0 - 12} y={m.y(t) + size * 0.3} fontSize={size * 0.75} textAnchor="end" className={s.mono} fill="#71717a">
          {t}
        </text>
      ))}
      <text x={plot.x1} y={plot.y1 + 8 + size * 2.5} fontSize={size * 0.82} textAnchor="end" fill="#86868b">
        response time, ms (log)
      </text>
      <text x={plot.x0 - 8} y={plot.y0 - size * 0.8} fontSize={size * 0.82} fill="#86868b">
        response size, KB (log)
      </text>
    </g>
  );
});

/** One target's cuts, drawn in turn, and the region left around it. Always drawn; shown on its step. */
const Cuts = memo(function Cuts({ plot, cuts, target, on, accent }: { plot: Plot; cuts: Cut[]; target: number; on: boolean; accent: string }) {
  const m = at(plot);
  const p = GW_POINTS[target];
  const box = lastBox(cuts, target);
  const step = Math.min(110, 1300 / cuts.length);
  return (
    <g>
      {cuts.map((c, i) =>
        c.dim === "x" ? (
          <line key={i} className={s.t} x1={m.x(c.at)} x2={m.x(c.at)} y1={m.y(c.box.y1)} y2={m.y(c.box.y0)} stroke={accent} strokeWidth="1.4" style={fade(on, i * step)} />
        ) : (
          <line key={i} className={s.t} x1={m.x(c.box.x0)} x2={m.x(c.box.x1)} y1={m.y(c.at)} y2={m.y(c.at)} stroke={accent} strokeWidth="1.4" style={fade(on, i * step)} />
        ),
      )}
      <g className={s.t} style={fade(on, cuts.length * step)}>
        <rect x={m.x(box.x0)} y={m.y(box.y1)} width={Math.max(2, m.x(box.x1) - m.x(box.x0))} height={Math.max(2, m.y(box.y0) - m.y(box.y1))} fill={`${accent}22`} stroke={accent} strokeWidth="1" />
        <circle cx={m.x(p.x)} cy={m.y(p.y)} r="7" fill="none" stroke={accent} strokeWidth="2" />
      </g>
    </g>
  );
});

/** Gateway → Kafka → scorer → audit store. */
const Pipeline = memo(function Pipeline({ x, y, w, cols, size, lit, audit, accent }: { x: number; y: number; w: number; cols: 2 | 4; size: number; lit: boolean; audit: boolean; accent: string }) {
  const parts = ["Gateway", "Kafka", "Scorer", "PostgreSQL"];
  const tech = ["Spring Boot", "event stream", "Isolation Forest", "audit log"];
  const bw = (w - (cols - 1) * 18) / cols;
  const bh = size * 3.2;
  return (
    <g>
      {parts.map((name, i) => {
        const bx = x + (i % cols) * (bw + 18);
        const by = y + Math.floor(i / cols) * (bh + 10);
        const on = lit || (audit && i === 3);
        return (
          <g key={name} className={s.t} style={{ opacity: on ? 1 : 0.45 }}>
            <rect x={bx} y={by} width={bw} height={bh} rx="11" fill="rgb(255 255 255 / 0.05)" stroke={on ? `${accent}77` : "rgb(255 255 255 / 0.1)"} />
            <text x={bx + 10} y={by + size * 1.35} fontSize={size * 0.95} fontWeight="600" fill="#f5f5f7">
              {name}
            </text>
            <text x={bx + 10} y={by + size * 2.55} fontSize={size * 0.78} fill="#a1a1a6">
              {tech[i]}
            </text>
            {(i + 1) % cols !== 0 && <Arrow x1={bx + bw + 3} x2={bx + bw + 15} y={by + bh / 2} />}
          </g>
        );
      })}
    </g>
  );
});

/** Step 0: what each event carries. */
const Features = memo(function Features({ on, p, size, accent, row }: { on: boolean; p: Panel; size: number; accent: string; row: boolean }) {
  const widths = GW_FEATURES.map((f) => f.length * size * 0.62 + 20);
  const lefts = widths.map((_, i) => p.x + (row ? widths.slice(0, i).reduce((a, b) => a + b + 6, 0) : 0));
  const tops = GW_FEATURES.map((_, i) => p.y + size * 1.2 + (row ? 0 : i * size * 2.5));
  return (
    <g>
      <text x={p.x} y={p.y} fontSize={size * 0.85} fill="#86868b" className={s.t} style={fade(on)}>
        Each event carries
      </text>
      {GW_FEATURES.map((f, i) => (
        <g key={f} className={s.t} style={fade(on, 200 + i * 70)}>
          <rect x={lefts[i]} y={tops[i]} width={widths[i]} height={size * 1.9} rx={size * 0.95} fill={`${accent}1f`} />
          <text x={lefts[i] + widths[i] / 2} y={tops[i] + size * 1.3} fontSize={size * 0.85} textAnchor="middle" className={s.mono} fill="#fed7aa">
            {f}
          </text>
        </g>
      ))}
    </g>
  );
});

/** A big number and a line under it: requests with no labels, or a target's cuts and score. */
const Figure = memo(function Figure({ on, p, size, big, small, accent }: { on: boolean; p: Panel; size: number; big: string; small: string; accent: string }) {
  return (
    <g className={s.t} style={fade(on, 150)}>
      <text x={p.x} y={p.y + size * 2.2} fontSize={size * 2.6} fontWeight="650" className={s.mono} fill={accent}>
        {big}
      </text>
      <text x={p.x} y={p.y + size * 3.9} fontSize={size * 0.9} fill="#a1a1a6">
        {small}
      </text>
    </g>
  );
});

/** The top scores, as the audit table would hold them: logged, not blocked. */
const Audit = memo(function Audit({ on, p, size, accent }: { on: boolean; p: Panel; size: number; accent: string }) {
  return (
    <g className={s.t} style={fade(on)}>
      <rect x={p.x} y={p.y} width={p.w} height={size * 9.2} rx="14" fill="#101114" stroke="rgb(255 255 255 / 0.12)" />
      <text x={p.x + 12} y={p.y + size * 1.7} fontSize={size * 0.9} fontWeight="650" fill="#f5f5f7">
        Audit log
      </text>
      {TOP.map(([score, i], k) => (
        <g key={i} className={s.t} style={fade(on, 150 + k * 100)}>
          <text x={p.x + 12} y={p.y + size * (3.6 + k * 1.7)} fontSize={size * 0.82} className={s.mono} fill="#e4e4e7">
            {Math.round(GW_POINTS[i].x)} ms · {GW_POINTS[i].y.toFixed(1)} KB
          </text>
          <text x={p.x + p.w - 12} y={p.y + size * (3.6 + k * 1.7)} fontSize={size * 0.82} textAnchor="end" className={s.mono} fill={accent}>
            {score.toFixed(2)}
          </text>
        </g>
      ))}
      <text x={p.x + 12} y={p.y + size * 8.3} fontSize={size * 0.78} fill="#a1a1a6">
        Logged for review · not blocked
      </text>
    </g>
  );
});

function Parts({ frame, accent, still, plot, panel, size, row }: Props & { plot: Plot; panel: Panel; size: number; row: boolean }) {
  const later = (on: boolean, node: ReactNode) => (still ? (on ? node : null) : <Later now={on}>{node}</Later>);
  const outlier = frame.target === GW_OUTLIER;
  const normal = frame.target === GW_NORMAL;
  return (
    <>
      <Axes plot={plot} size={size} />
      <Points plot={plot} flagged={frame.flagged} accent={accent} />
      {later(outlier, <Cuts plot={plot} cuts={OUTLIER_CUTS} target={GW_OUTLIER} on={outlier} accent={accent} />)}
      {later(normal, <Cuts plot={plot} cuts={NORMAL_CUTS} target={GW_NORMAL} on={normal} accent={accent} />)}
      <Features on={frame.pipeline} p={panel} size={size} accent={accent} row={row} />
      <Figure on={frame.step === 1} p={panel} size={size} big={String(GW_POINTS.length)} small="requests, no labels" accent="#f5f5f7" />
      <Figure on={outlier} p={panel} size={size} big={`${OUTLIER_CUTS.length} cuts`} small={`to isolate this probe · score ${GW_SCORES[GW_OUTLIER].toFixed(2)}`} accent={accent} />
      <Figure on={normal} p={panel} size={size} big={`${NORMAL_CUTS.length} cuts`} small={`for a typical request · score ${GW_SCORES[GW_NORMAL].toFixed(2)}`} accent={accent} />
      {later(frame.flagged, <Audit on={frame.flagged} p={panel} size={size} accent={accent} />)}
    </>
  );
}

function Wide(props: Props) {
  const { frame, accent, still } = props;
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <Pipeline x={16} y={10} w={608} cols={4} size={12} lit={frame.pipeline} audit={frame.flagged} accent={accent} />
      <Parts {...props} plot={{ x0: 52, x1: 404, y0: 104, y1: 470 }} panel={{ x: 424, y: 120, w: 200 }} size={12} row={false} />
    </svg>
  );
}

function Tall(props: Props) {
  const { frame, accent, still } = props;
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <Pipeline x={4} y={0} w={352} cols={2} size={11} lit={frame.pipeline} audit={frame.flagged} accent={accent} />
      <Parts {...props} plot={{ x0: 40, x1: 350, y0: 102, y1: 318 }} panel={{ x: 4, y: 368, w: 352 }} size={11} row />
    </svg>
  );
}
