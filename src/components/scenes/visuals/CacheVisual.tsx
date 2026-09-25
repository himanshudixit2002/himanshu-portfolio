import type { CSSProperties } from "react";
import * as c from "@/lib/sim/cluster";
import { CACHE_DOWN, CACHE_KEY, type CacheFrame } from "@/lib/scenes/cache";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";

const NODE_COLOR: Record<c.NodeId, string> = { A: "#38bdf8", B: "#a78bfa", C: "#34d399" };
type Props = { frame: CacheFrame; accent: string; still?: boolean; layout?: Layout };

type Geometry = {
  view: string;
  ring: { cx: number; cy: number; r: number };
  card: (i: number) => { x: number; y: number };
  cardW: number;
  cardH: number;
  /** Where a wire meets a card: its left edge (cards in a column) or its top (in a row). */
  wireEnd: (i: number) => { x: number; y: number };
  quorum: { x: number; y: number };
  compact: boolean;
};

const WIDE: Geometry = {
  view: "0 0 640 520",
  ring: { cx: 210, cy: 262, r: 168 },
  card: (i) => ({ x: 440, y: 58 + i * 142 }),
  cardW: 184,
  cardH: 100,
  wireEnd: (i) => ({ x: 440, y: 108 + i * 142 }),
  quorum: { x: 440, y: 506 },
  compact: false,
};

const TALL: Geometry = {
  view: "0 0 360 480",
  ring: { cx: 180, cy: 146, r: 118 },
  card: (i) => ({ x: 4 + i * 120, y: 320 }),
  cardW: 112,
  cardH: 110,
  wireEnd: (i) => ({ x: 60 + i * 120, y: 320 }),
  quorum: { x: 4, y: 466 },
  compact: true,
};

/**
 * "Lose a node": the hash ring and its three nodes. The key's replicas are
 * wired to it; one node goes dark; a write still lands on two and leaves a
 * hint; the node returns, the hint flies home, and anti-entropy sweeps.
 * Wide: nodes beside the ring. Tall: the ring above a row of nodes.
 */
export function CacheVisual(props: Props) {
  return <Layouts wide={<Drawing {...props} g={WIDE} />} tall={<Drawing {...props} g={TALL} />} only={props.layout} />;
}

function Drawing({ frame, accent, still, g }: Props & { g: Geometry }) {
  const { state } = frame;
  const { cx, cy, r } = g.ring;
  const polar = (t: number, radius = r) => {
    const a = t * 2 * Math.PI - Math.PI / 2;
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
  };
  const key = polar(c.keyPosition(CACHE_KEY));
  const coordinator = frame.replicas.find((n) => state.up[n]) ?? frame.replicas[0];
  const hintSpot = (n: c.NodeId) => {
    const card = g.card(c.NODES.indexOf(n));
    return { x: card.x + g.cardW - 16, y: card.y + g.cardH - 17 };
  };
  const hint = hintSpot(frame.replayed ? CACHE_DOWN : coordinator);
  const sweepEnd = polar(0.18);

  return (
    <svg viewBox={g.view} className={`${s.svg} ${still ? s.still : ""}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
      {c.ring.map((v, i) => {
        const p = polar(v.position);
        return <circle key={i} className={s.t} cx={p.x} cy={p.y} r={g.compact ? 5.5 : 7} fill={state.up[v.node] ? NODE_COLOR[v.node] : "#3f3f46"} />;
      })}

      <g className={s.t} style={{ opacity: frame.sweep ? 1 : 0 }}>
        <path
          className={s.sweep}
          style={{ "--cx": `${cx}px`, "--cy": `${cy}px` } as CSSProperties}
          d={`M${cx} ${cy - r} A${r} ${r} 0 0 1 ${sweepEnd.x} ${sweepEnd.y}`}
          fill="none"
          stroke="#6ee7b7"
          strokeWidth={g.compact ? 5 : 6}
          strokeLinecap="round"
        />
      </g>

      {c.NODES.map((n, i) => {
        const holds = frame.replicas.includes(n);
        const wired = holds && state.up[n];
        const end = g.wireEnd(i);
        const d = g.compact
          ? `M${key.x} ${key.y} C ${key.x} ${key.y + 60}, ${end.x} ${end.y - 60}, ${end.x} ${end.y}`
          : `M${key.x} ${key.y} C ${key.x + 120} ${key.y}, ${end.x - 90} ${end.y}, ${end.x} ${end.y}`;
        return (
          <path
            key={n}
            className={s.t}
            d={d}
            fill="none"
            stroke={wired ? NODE_COLOR[n] : "rgb(255 255 255 / 0.12)"}
            strokeWidth={wired && frame.writing ? 2.5 : 1.5}
            strokeDasharray={wired ? "none" : "4 6"}
            opacity={holds ? 0.85 : 0.2}
          />
        );
      })}

      <circle cx={key.x} cy={key.y} r={g.compact ? 9 : 11} fill="#f5f5f7" />
      <text x={key.x} y={key.y - (g.compact ? 15 : 18)} fontSize={g.compact ? 12 : 13} textAnchor="middle" className={s.mono} fill="#e4e4e7">
        {CACHE_KEY}
      </text>
      <text x={cx} y={cy - 4} fontSize={g.compact ? 28 : 34} fontWeight="650" textAnchor="middle" fill="#f5f5f7" className={s.t}>
        {c.upCount(state)}/3
      </text>
      <text x={cx} y={cy + 18} fontSize="12" textAnchor="middle" fill="#86868b">
        nodes up
      </text>

      {c.NODES.map((n, i) => {
        const up = state.up[n];
        const entry = state.stores[n][CACHE_KEY];
        const { x, y } = g.card(i);
        const holding = state.hints.filter((h) => h.heldBy === n).length;
        return (
          <g key={n}>
            <rect className={s.t} x={x} y={y} width={g.cardW} height={g.cardH} rx="16" fill={up ? "rgb(255 255 255 / 0.05)" : "rgb(251 113 133 / 0.1)"} stroke={up ? "rgb(255 255 255 / 0.12)" : "rgb(251 113 133 / 0.6)"} />
            <circle cx={x + 18} cy={y + 24} r="5.5" fill={up ? NODE_COLOR[n] : "#fb7185"} className={s.t} />
            <text x={x + 30} y={y + 29} fontSize={g.compact ? 13.5 : 15} fontWeight="600" fill="#f5f5f7">
              Node {n}
            </text>
            {g.compact ? (
              <text x={x + 14} y={y + 50} fontSize="11" fill={up ? "#86868b" : "#fda4af"} className={s.t}>
                {up ? "up" : "down"}
              </text>
            ) : (
              <text x={x + g.cardW - 16} y={y + 29} fontSize="11" textAnchor="end" fill={up ? "#86868b" : "#fda4af"} className={s.t}>
                {up ? "up" : "down"}
              </text>
            )}
            <text x={x + 14} y={y + (g.compact ? 74 : 64)} fontSize={g.compact ? 13 : 14} className={s.mono} fill={up ? "#e4e4e7" : "#71717a"}>
              {entry ? entry.value : "—"}
              <tspan fill="#86868b" fontSize="11">
                {entry ? ` v${entry.version}` : ""}
              </tspan>
            </text>
            <g className={s.t} style={{ opacity: holding ? 1 : 0 }}>
              <rect x={x + 12} y={y + g.cardH - 26} width={g.compact ? 70 : 116} height="18" rx="9" fill="rgb(251 191 36 / 0.16)" />
              <text x={x + 12 + (g.compact ? 35 : 58)} y={y + g.cardH - 13} fontSize={g.compact ? 9.5 : 10.5} textAnchor="middle" fill="#fde68a">
                {g.compact ? `hint for ${CACHE_DOWN}` : `holds a hint for ${CACHE_DOWN}`}
              </text>
            </g>
          </g>
        );
      })}

      <g
        className={`${s.t} ${s.slow}`}
        style={{ transform: `translate(${hint.x}px, ${hint.y}px)`, opacity: frame.hints || (frame.replayed && !frame.sweep) ? 1 : 0 }}
      >
        <circle r="6.5" fill="#fbbf24" />
        <circle r="6.5" fill="#fbbf24" className={s.pulse} />
      </g>
      <text x={g.quorum.x} y={g.quorum.y} fontSize="12" fill="#86868b">
        Quorum: {c.WRITE_QUORUM} of {c.REPLICATION}
        <tspan fill={c.upCount(state) >= c.WRITE_QUORUM ? accent : "#fb7185"}>{c.upCount(state) >= c.WRITE_QUORUM ? "  · met" : "  · not met"}</tspan>
      </text>
    </svg>
  );
}
