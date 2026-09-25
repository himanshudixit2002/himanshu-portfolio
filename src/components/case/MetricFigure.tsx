import type { CSSProperties } from "react";
import type { MetricViz } from "@/lib/metric-viz";
import s from "./case.module.css";

const u = (i: number) => ({ "--u": i }) as CSSProperties;
const TRACK = "rgb(255 255 255 / 0.14)";

/**
 * The small figure above a metric, drawn in the project's accent. Decorative:
 * the value and label beside it carry the meaning, and every number here is
 * read from them (lib/metric-viz).
 */
export function MetricFigure({ viz, accent }: { viz: MetricViz; accent: string }) {
  switch (viz.kind) {
    case "dots": {
      const cols = viz.n <= 12 ? viz.n : viz.n <= 24 ? Math.ceil(viz.n / 2) : 10;
      const rows = Math.ceil(viz.n / cols);
      return (
        <svg className={s.figure} width={cols * 10} height={rows * 10} viewBox={`0 0 ${cols * 10} ${rows * 10}`} aria-hidden="true">
          {Array.from({ length: viz.n }, (_, i) => (
            <circle key={i} className={s.unit} style={u(i)} cx={(i % cols) * 10 + 4} cy={Math.floor(i / cols) * 10 + 4} r="3.25" fill={accent} />
          ))}
        </svg>
      );
    }
    case "grid":
      return (
        <svg className={s.figure} width={viz.cols * 13} height={viz.rows * 13} viewBox={`0 0 ${viz.cols * 13} ${viz.rows * 13}`} aria-hidden="true">
          {Array.from({ length: viz.cols * viz.rows }, (_, i) => (
            <rect key={i} className={s.unit} style={u(i)} x={(i % viz.cols) * 13} y={Math.floor(i / viz.cols) * 13} width="10" height="10" rx="2.5" fill={accent} />
          ))}
        </svg>
      );
    case "meter":
      return (
        <svg className={`${s.figure} w-full max-w-56`} height="8" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true">
          <rect width="200" height="8" rx="4" fill={accent} fillOpacity="0.2" />
          <rect className={s.fill} width={viz.pct * 2} height="8" rx="4" fill={accent} />
        </svg>
      );
    case "part":
      return (
        <svg className={`${s.figure} w-full max-w-56`} height="8" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true">
          {Array.from({ length: viz.of }, (_, i) => {
            const w = (200 - (viz.of - 1) * 4) / viz.of;
            return <rect key={i} className={i < viz.n ? s.fill : undefined} style={u(i)} x={i * (w + 4)} width={w} height="8" rx="4" fill={i < viz.n ? accent : TRACK} />;
          })}
        </svg>
      );
    case "ratio": {
      const side = 44;
      const small = side / Math.sqrt(viz.factor);
      return (
        <svg className={s.figure} width={side} height={side} viewBox={`0 0 ${side} ${side}`} aria-hidden="true">
          <rect x="0.75" y="0.75" width={side - 1.5} height={side - 1.5} rx="4" fill="none" stroke={TRACK} strokeWidth="1.5" strokeDasharray="3 3" />
          <rect
            className={s.shrink}
            style={{ "--from": side / small } as CSSProperties}
            x="0"
            y={side - small}
            width={small}
            height={small}
            rx="1.5"
            fill={accent}
          />
        </svg>
      );
    }
    case "rings":
      return (
        <svg className={s.figure} width="56" height="56" viewBox="-28 -28 56 56" aria-hidden="true">
          {Array.from({ length: viz.n }, (_, i) => (
            <circle key={i} className={s.draw} style={u(i)} r={11 + i * 12} fill="none" stroke={accent} strokeOpacity={0.9 - i * 0.3} strokeWidth="2" pathLength={1} />
          ))}
          <circle r="4.5" fill={accent} />
        </svg>
      );
    case "segments": {
      const total = viz.parts.reduce((sum, p) => sum + p.n, 0);
      const gap = 3;
      const width = 240 - gap * (viz.parts.length - 1);
      const widths = viz.parts.map((p) => (p.n / total) * width);
      const starts = widths.map((_, i) => widths.slice(0, i).reduce((sum, w) => sum + w + gap, 0));
      return (
        <span className="block w-full max-w-60">
          <svg className={`${s.figure} w-full`} height="8" viewBox="0 0 240 8" preserveAspectRatio="none" aria-hidden="true">
            {viz.parts.map((p, i) => (
              <rect key={p.label} className={s.fill} style={u(i)} x={starts[i]} width={widths[i]} height="8" rx="3" fill={accent} />
            ))}
          </svg>
          <span aria-hidden="true" className="mt-2 flex text-[0.6875rem] text-dim-inverse">
            {viz.parts.map((p) => (
              <span key={p.label} style={{ width: `${(p.n / total) * 100}%` }} className="truncate pr-1">
                {p.n} {p.label}
              </span>
            ))}
          </span>
        </span>
      );
    }
    case "growing": {
      // Each wait longer than the last. Decorative spacing: the label, not
      // the figure, carries the policy.
      // The i-th gap is 6 + 3.2·i, so dot i sits at 4 + 6i + 1.6·i(i − 1).
      const xs = Array.from({ length: viz.n }, (_, i) => 4 + 6 * i + 1.6 * i * (i - 1));
      const w = xs.at(-1)! + 5;
      return (
        <svg className={s.figure} width={w} height="12" viewBox={`0 0 ${w} 12`} aria-hidden="true">
          <line x1="4" x2={w - 4} y1="6" y2="6" stroke={TRACK} strokeWidth="1.5" />
          {xs.map((cx, i) => (
            <circle key={i} className={s.unit} style={u(i * 3)} cx={cx} cy="6" r="3.5" fill={accent} />
          ))}
        </svg>
      );
    }
    case "before-after":
      return (
        <span aria-hidden="true" className="grid w-full max-w-60 grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 text-[0.6875rem]">
          <svg className={`${s.figure} w-full`} height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
            <rect width="100" height="6" rx="3" fill={TRACK} />
          </svg>
          <span className="font-mono text-dim-inverse">
            {viz.beforeText}
            {viz.unit}
          </span>
          <svg className={`${s.figure} w-full`} height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
            <rect className={s.fill} width={(viz.after / viz.before) * 100} height="6" rx="3" fill={accent} />
          </svg>
          <span className="font-mono text-muted-inverse">
            {viz.afterText}
            {viz.unit}
          </span>
        </span>
      );
    case "none":
      return null;
  }
}
