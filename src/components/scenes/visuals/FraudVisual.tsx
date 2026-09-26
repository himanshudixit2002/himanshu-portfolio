import { memo } from "react";
import { ORDINARY_EDGES, type FraudFrame } from "@/lib/scenes/fraud";
import { edges, nodes, type GraphNode, type NodeKind } from "@/lib/sim/fraud-graph";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";
import { Arrow } from "./marks";

type Props = { frame: FraudFrame; accent: string; still?: boolean; layout?: Layout };
type Place = (n: GraphNode) => { x: number; y: number };

/** The interactive's colours per kind of node. */
const KIND: Record<NodeKind, { fill: string; r: number; name: string }> = {
  user: { fill: "#f5f5f7", r: 7, name: "Account" },
  card: { fill: "#fbbf24", r: 5.5, name: "Card" },
  device: { fill: "#a78bfa", r: 6, name: "Device" },
  merchant: { fill: "#38bdf8", r: 7.5, name: "Merchant" },
};
const byId = new Map(nodes.map((n) => [n.id, n]));

/**
 * "Follow the edges": the graph fills as transactions stream in — ordinary
 * customers, then the ring — and one account's neighbourhood lights, one hop
 * then two. Last, the pipeline that builds it, with the model honestly
 * marked untrained. Wide: columns left to right. Tall: the same graph turned
 * to rows.
 */
export function FraudVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

/** `labels`: every node, or (on phones, where space is short) accounts, merchants and whatever is lit. */
function Graph({ frame, place, accent, size, labels = "all" }: { frame: FraudFrame; place: Place; accent: string; size: number; labels?: "all" | "key" }) {
  const hood = new Set(frame.hood);
  const shownIds = new Set(edges.slice(0, frame.shown).flatMap((e) => [e.from, e.to]));
  const focus = frame.focus ? place(byId.get(frame.focus)!) : null;
  return (
    <g className={s.t} style={{ opacity: frame.pipeline ? 0.35 : 1 }}>
      {edges.map((e, i) => {
        const a = place(byId.get(e.from)!);
        const b = place(byId.get(e.to)!);
        const shown = i < frame.shown;
        const lit = hood.has(e.from) && hood.has(e.to);
        // Streamed in order: each edge arrives a beat after the one before.
        const delay = shown ? (i < ORDINARY_EDGES ? i : i - ORDINARY_EDGES) * 70 : 0;
        return (
          <line
            key={i}
            className={s.t}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={lit ? accent : "rgb(255 255 255 / 0.22)"}
            strokeWidth={lit ? 2.2 : 1.2}
            style={{ opacity: shown ? (frame.focus && !lit ? 0.3 : 1) : 0, transitionDelay: `${delay}ms` }}
          />
        );
      })}
      {focus && (
        <g>
          <circle className={s.pulse} cx={focus.x} cy={focus.y} r="16" fill="none" stroke={accent} strokeWidth="1.5" />
        </g>
      )}
      {nodes.map((n) => {
        const p = place(n);
        const k = KIND[n.kind];
        const on = shownIds.has(n.id);
        const lit = hood.has(n.id);
        const dim = !on ? 0.18 : frame.focus && !lit ? 0.35 : 1;
        return (
          <g key={n.id} className={s.t} style={{ opacity: dim }}>
            <circle cx={p.x} cy={p.y} r={k.r * (size / 11)} fill={k.fill} stroke={lit ? accent : "#08090b"} strokeWidth={lit ? 2.5 : 2} />
            {(labels === "all" || lit || n.kind === "user" || n.kind === "merchant") && (
              <text x={p.x} y={n.kind === "device" && labels === "key" ? p.y - k.r * (size / 11) - size * 0.5 : p.y + k.r * (size / 11) + size * 1.2} fontSize={size * 0.9} textAnchor="middle" fill={lit ? "#fecaca" : "#a1a1a6"} stroke="#08090b" strokeWidth="3" paintOrder="stroke" className={n.kind === "card" ? s.mono : undefined}>
                {n.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** The last few transactions to arrive. */
function Stream({ frame, x, y, w, size }: { frame: FraudFrame; x: number; y: number; w: number; size: number }) {
  const col = (w - 8) / 2;
  return (
    <g className={s.t} style={{ opacity: frame.pipeline ? 0.35 : 1 }}>
      <text x={x} y={y} fontSize={size * 0.85} fill="#86868b">
        Transactions arriving
      </text>
      {frame.stream.map((t, i) => (
        <g key={`${frame.shown}-${i}`}>
          <rect x={x + i * (col + 8)} y={y + size * 0.7} width={col} height={size * 2.3} rx={size * 0.7} fill="rgb(255 255 255 / 0.06)" />
          <text x={x + i * (col + 8) + 10} y={y + size * 2.25} fontSize={size * 0.85} className={s.mono} fill="#e4e4e7">
            {t}
          </text>
        </g>
      ))}
    </g>
  );
}

const Legend = memo(function Legend({ x, y, size, gap }: { x: number; y: number; size: number; gap: number }) {
  return (
    <g>
      {(Object.keys(KIND) as NodeKind[]).map((k, i) => (
        <g key={k}>
          <circle cx={x + i * gap + 5} cy={y - size * 0.3} r="4.5" fill={KIND[k].fill} />
          <text x={x + i * gap + 14} y={y} fontSize={size * 0.85} fill="#a1a1a6">
            {KIND[k].name}
          </text>
        </g>
      ))}
    </g>
  );
});

/** The services that build the graph and score it; the model is the one part not done. */
const Pipeline = memo(function Pipeline({ on, x, y, w, rows, size, accent }: { on: boolean; x: number; y: number; w: number; rows: 1 | 2; size: number; accent: string }) {
  const parts = [
    { name: "Ingest API", tech: "Spring Boot" },
    { name: "Kafka", tech: "event log" },
    { name: "Flink", tech: "streaming job" },
    { name: "Memgraph", tech: "+ Redis counts" },
    { name: "Scoring", tech: "GAT · not trained", todo: true },
  ];
  const perRow = rows === 1 ? 5 : 3;
  const bw = (w - (perRow - 1) * 18) / perRow;
  const bh = size * 3.6;
  return (
    <g className={s.t} style={{ opacity: on ? 1 : 0.5 }}>
      {parts.map((p, i) => {
        const r = Math.floor(i / perRow);
        const c = i % perRow;
        const bx = x + c * (bw + 18);
        const by = y + r * (bh + 14);
        return (
          <g key={p.name}>
            <rect x={bx} y={by} width={bw} height={bh} rx="12" fill={p.todo ? "rgb(251 191 36 / 0.08)" : "rgb(255 255 255 / 0.05)"} stroke={p.todo ? "rgb(251 191 36 / 0.5)" : on ? `${accent}66` : "rgb(255 255 255 / 0.1)"} strokeDasharray={p.todo ? "4 4" : undefined} />
            <text x={bx + 10} y={by + size * 1.5} fontSize={size * 0.95} fontWeight="600" fill="#f5f5f7">
              {p.name}
            </text>
            <text x={bx + 10} y={by + size * 2.85} fontSize={size * 0.8} fill={p.todo ? "#fcd34d" : "#a1a1a6"}>
              {p.tech}
            </text>
            {c < perRow - 1 && i < parts.length - 1 && <Arrow x1={bx + bw + 3} x2={bx + bw + 15} y={by + bh / 2} />}
          </g>
        );
      })}
    </g>
  );
});

function Wide({ frame, accent, still }: Props) {
  const place: Place = (n) => ({ x: 34 + n.x * 572, y: 64 + n.y * 290 });
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <Stream frame={frame} x={16} y={18} w={420} size={12} />
      <Graph frame={frame} place={place} accent={accent} size={11} />
      <Legend x={16} y={392} size={12} gap={90} />
      <Pipeline on={frame.pipeline} x={16} y={420} w={608} rows={1} size={12} accent={accent} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  // The wide graph turned: its columns become rows (customers, merchants, the ring).
  const place: Place = (n) => ({ x: 8 + n.y * 344, y: 92 + n.x * 262 });
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <Stream frame={frame} x={4} y={12} w={352} size={12.5} />
      <Graph frame={frame} place={place} accent={accent} size={13} labels="key" />
      <Legend x={4} y={372} size={11.5} gap={86} />
      <Pipeline on={frame.pipeline} x={4} y={386} w={352} rows={2} size={11} accent={accent} />
    </svg>
  );
}
