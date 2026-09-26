import type { CSSProperties } from "react";
import { StreakPaint } from "./StreakPaint";
import s from "./streak.module.css";

/** Columns × rows: a year-wide board from 768px, a squarer one on phones. */
const LAYOUTS = [
  { id: "wide", cols: 86, rows: 7 },
  { id: "narrow", cols: 43, rows: 14 },
] as const;

/**
 * The practice figure as a streak board, in the style of a coding site's
 * activity calendar — but it is an illustration, and says so: one square
 * for each problem solved, not a calendar of days, so nothing in it reads
 * as a date or a daily count. The squares fill as a streak running left to
 * right once the board is in view, with a flame riding the front of it; a
 * light sweeps across now and then; and a pointer or a finger paints the
 * squares it passes (StreakPaint). Server-rendered SVG: three copies of the
 * same squares (the track, the fill, the light) moved as layers, so the
 * motion is transforms only. Without JavaScript, or under reduced motion,
 * it's simply full.
 */
export function StreakBoard({ count }: { count: number }) {
  return (
    <>
      {LAYOUTS.map(({ id, cols, rows }) => {
        // Filled column by column, like weeks: the last column holds the remainder.
        const missing = cols * rows - count;
        const w = cols * 10;
        const h = rows * 10;
        const squares = (fill: "streak" | [string, number], key: string) => (
          <svg viewBox={`0 0 ${w} ${h}`} className={s.svg} aria-hidden="true" focusable="false">
            <defs>
              <pattern id={`sq-${key}`} width="10" height="10" patternUnits="userSpaceOnUse">
                <rect x="1" y="1" width="8" height="8" rx="2" fill="#fff" />
              </pattern>
              <mask id={`m-${key}`}>
                <rect width={w} height={h} fill={`url(#sq-${key})`} />
                {missing > 0 && <rect x={w - 10} y={h - missing * 10} width="10" height={missing * 10} fill="#000" />}
              </mask>
              <linearGradient id={`g-${key}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2={h}>
                {fill === "streak" ? (
                  <>
                    <stop offset="0" stopColor="#0f9f6e" />
                    <stop offset="0.55" stopColor="#2cbb5d" />
                    <stop offset="1" stopColor="#9be15d" />
                  </>
                ) : (
                  <stop offset="0" stopColor={fill[0]} stopOpacity={fill[1]} />
                )}
              </linearGradient>
            </defs>
            <rect width={w} height={h} fill={`url(#g-${key})`} mask={`url(#m-${key})`} />
          </svg>
        );
        return (
          <div key={id} className={s.board} data-layout={id} style={{ "--cols": cols, "--rows": rows } as CSSProperties}>
            <div className={s.grid}>
              {squares(["#fff", 0.07], `${id}-track`)}
              <div className={s.fill}>
                <div className={s.fillInner}>{squares("streak", `${id}-fill`)}</div>
              </div>
              <div className={s.band}>
                <div className={s.bandInner}>{squares(["#eafff1", 1], `${id}-light`)}</div>
              </div>
              <StreakPaint cols={cols} rows={rows} count={count} />
            </div>
            {/* Rides the front of the streak, then stays at its end. */}
            <div className={s.flameTrack} aria-hidden="true">
              <svg viewBox="0 0 24 32" className={s.flame} focusable="false">
                <defs>
                  <linearGradient id={`flame-${id}`} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor="#ff5a1f" />
                    <stop offset="0.55" stopColor="#ffa116" />
                    <stop offset="1" stopColor="#ffd84a" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 1.5c1.2 4.6 6.8 7.4 8.6 12.6 1.9 5.5-1.4 11.8-7.4 12.4C6.7 27.1 2 22.4 3.2 16.4c.6-3.2 2.8-5 3.5-7.6.8 2.4 1.8 3.7 3.2 4.3C9.4 9 10.2 5.3 12 1.5Z"
                  fill={`url(#flame-${id})`}
                />
                <path d="M12.3 15.5c.6 2.3 3.4 3.6 3.6 6.3.2 2.6-1.8 4.5-4 4.4-2.4-.1-4-2.3-3.4-4.8.4-1.9 2.5-3 3.8-5.9Z" fill="#fff3c4" />
              </svg>
            </div>
          </div>
        );
      })}
    </>
  );
}
