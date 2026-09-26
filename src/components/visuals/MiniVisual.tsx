import type { CSSProperties, ReactNode } from "react";
import type { VisualId } from "@/content/types";
import m from "./mini.module.css";

/**
 * Small SVG signatures for project cards — one idea per project, drawn in its
 * accent colour. Still by default; while the card holding one is active, its
 * idea plays as a short loop (mini.module.css). Decorative: the card text
 * carries the meaning.
 */
export function MiniVisual({ id, accent }: { id: VisualId; accent: string }) {
  return (
    <svg viewBox="0 0 160 100" className="block h-full w-full" aria-hidden="true" focusable="false">
      {/* The glow is an ellipse centred at (80, 40), 112 × 70 in radius, drawn
          past the viewBox: where a large card letterboxes the drawing, it keeps
          fading instead of stopping at a hard edge. */}
      <defs>
        <radialGradient id={`glow-${id}`} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(80 40) scale(112 70)">
          <stop offset="0" stopColor={accent} stopOpacity="0.22" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-400" y="-300" width="960" height="700" fill={`url(#glow-${id})`} />
      {DRAW[id](accent)}
    </svg>
  );
}

const soft = "rgb(255 255 255 / 0.14)";
/** A loop's stagger index. */
const k = (n: number) => ({ "--k": n }) as CSSProperties;
const loop = (name: string) => `${m.loop} ${name}`;

/** Anomaly Gateway: a dense crowd of ordinary requests (a sunflower spiral), and four far from it. */
const CROWD = Array.from({ length: 30 }, (_, i) => {
  const r = 3.3 * Math.sqrt(i + 0.5);
  const t = i * 2.39996;
  return [+(80 + r * Math.cos(t) * 1.35).toFixed(1), +(52 + r * Math.sin(t)).toFixed(1)];
});
const OUTLIERS = [
  [30, 26],
  [134, 30],
  [42, 80],
  [124, 78],
];

const DRAW: Record<VisualId, (a: string) => ReactNode> = {
  "ssk-system": (a) =>
    [0, 1, 2, 3].map((i) => (
      <path
        key={i}
        className={loop(m.spread)}
        style={k(i - 1.5)}
        d={`M40 ${30 + i * 13} L80 ${18 + i * 13} L120 ${30 + i * 13} L80 ${42 + i * 13} Z`}
        fill={i === 0 ? a : "none"}
        fillOpacity={i === 0 ? 0.35 : 0}
        stroke={i === 0 ? a : soft}
        strokeWidth="1.2"
      />
    )),
  "elepeia-teardown": (a) => (
    <>
      <rect className={loop(m.shrink)} x="30" y="34" width="100" height="10" rx="5" fill="rgb(251 113 133 / 0.55)" />
      <rect x="30" y="56" width="3" height="10" rx="1.5" fill={a} />
      <text x="30" y="30" fontSize="7" fill="#a1a1a6">≈5 MB</text>
      <text x="37" y="64" fontSize="7" fill={a}>≈73 KB · 68× less</text>
    </>
  ),
  "cafe-night": (a) =>
    [0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect
          className={i < 2 ? m.glow : undefined}
          style={i < 2 ? k(i) : undefined}
          x={22 + (i % 2) * 60}
          y={20 + Math.floor(i / 2) * 34}
          width="54"
          height="28"
          rx="6"
          fill={i < 2 ? a : "none"}
          fillOpacity="0.2"
          stroke={i < 2 ? a : soft}
        />
        <text x={30 + (i % 2) * 60} y={38 + Math.floor(i / 2) * 34} fontSize="8" fill={i < 2 ? a : "#86868b"} fontFamily="monospace">
          {i < 2 ? `0${i + 1}:${i ? "12" : "42"}` : "free"}
        </text>
      </g>
    )),
  "kv-explorer": (a) => (
    <>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={36 + (i % 8) * 11.5} y={32 + Math.floor(i / 8) * 20} width="9" height="16" rx="2" fill={soft} />
      ))}
      {/* Shard 11 lit; the loop moves it to the shards the next keys land in. */}
      <rect className={loop(m.hop)} x="70.5" y="52" width="9" height="16" rx="2" fill={a} fillOpacity="0.9" />
    </>
  ),
  "cluster-lab": (a) => (
    <>
      <circle cx="80" cy="50" r="30" fill="none" stroke={soft} strokeWidth="1.2" />
      <g className={loop(m.turn)}>
        {[0, 120, 240].map((deg, i) => {
          const r = ((deg - 90) * Math.PI) / 180;
          return <circle key={deg} className={i === 1 ? m.blink : undefined} cx={80 + Math.cos(r) * 30} cy={50 + Math.sin(r) * 30} r="7" fill={i === 1 ? "#52525b" : a} />;
        })}
      </g>
    </>
  ),
  "vitals-efficiency": (a) => (
    <>
      <circle cx="80" cy="50" r="26" fill="none" stroke={soft} strokeWidth="6" />
      <circle className={m.fill} cx="80" cy="50" r="26" fill="none" stroke={a} strokeWidth="6" strokeLinecap="round" strokeDasharray="40 164" transform="rotate(-90 80 50)" />
    </>
  ),
  "scopeforge-guard": (a) => (
    <>
      {[34, 24, 14].map((r, i) => (
        <circle key={r} className={loop(m.inward)} style={k(i)} cx="80" cy="50" r={r} fill="none" stroke={r === 14 ? a : soft} strokeDasharray={r === 34 ? "3 3" : undefined} />
      ))}
      <circle cx="80" cy="50" r="3" fill={a} />
    </>
  ),
  "rx-sync": (a) =>
    [0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <rect x={30 + i * 21} y="42" width="16" height="16" rx="4" fill={i < 2 ? a : soft} fillOpacity={i < 2 ? 0.8 : 1} />
        {/* The queued ones sync in turn while the card is active. */}
        {i >= 2 && <rect className={m.sync} style={k(i - 2)} x={30 + i * 21} y="42" width="16" height="16" rx="4" fill={a} />}
      </g>
    )),
  "fraud-graph": (a) => (
    <>
      {[
        [50, 30, 80, 50],
        [110, 30, 80, 50],
        [80, 80, 80, 50],
        [50, 30, 110, 30],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} className={m.draw} style={k(i)} x1={x1} y1={y1} x2={x2} y2={y2} stroke={a} strokeOpacity="0.7" />
      ))}
      {[
        [50, 30],
        [110, 30],
        [80, 80],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="6" fill={a} />
      ))}
      <circle cx="80" cy="50" r="5" fill="#a78bfa" />
    </>
  ),
  "gateway-anomaly": (a) => (
    <>
      {CROWD.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="rgb(255 255 255 / 0.4)" />
      ))}
      {OUTLIERS.map(([x, y], i) => (
        <circle key={i} className={m.flag} style={k(i)} cx={x} cy={y} r="3" fill={a} />
      ))}
    </>
  ),
  "skintellect-pipeline": (a) => (
    <>
      <defs>
        <clipPath id="mini-face">
          <ellipse cx="54" cy="50" rx="18" ry="24" />
        </clipPath>
      </defs>
      <ellipse cx="54" cy="50" rx="18" ry="24" fill="none" stroke={soft} />
      <g clipPath="url(#mini-face)">
        <rect className={loop(m.scan)} x="36" y="27" width="36" height="1.2" fill={a} />
      </g>
      <rect x="44" y="50" width="12" height="9" rx="2" fill="none" stroke={a} strokeDasharray="2 1.5" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={86 + i * 16} y="44" width="12" height="12" rx="3" fill={a} fillOpacity={0.3 + i * 0.25} />
      ))}
    </>
  ),
  "shortener-lab": (a) => (
    <>
      <text x="80" y="46" fontSize="11" fill="#a1a1a6" textAnchor="middle" fontFamily="monospace">39134</text>
      <text className={loop(m.pop)} x="80" y="70" fontSize="18" fill={a} textAnchor="middle" fontFamily="monospace" fontWeight="600">
        abc
      </text>
    </>
  ),
  "two-sum": (a) =>
    [2, 7, 11, 15].map((n, i) => (
      <g key={n}>
        <rect
          className={i < 2 ? m.pair : undefined}
          style={i < 2 ? k(i) : undefined}
          x={36 + i * 23}
          y="38"
          width="19"
          height="24"
          rx="4"
          fill={i < 2 ? a : soft}
          fillOpacity={i < 2 ? 0.3 : 1}
          stroke={i < 2 ? a : "none"}
        />
        <text x={45.5 + i * 23} y="54" fontSize="9" fill="#f5f5f7" textAnchor="middle" fontFamily="monospace">
          {n}
        </text>
      </g>
    )),
};
