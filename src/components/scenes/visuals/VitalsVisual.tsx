import { ticks, VITALS_RATES, WINDOW_S, type VitalsFrame } from "@/lib/scenes/vitals";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";

type Props = { frame: VitalsFrame; accent: string; still?: boolean; layout?: Layout };

/**
 * "Barely there": a desktop with the HUD floating above a document that
 * keeps its caret; below, ten seconds of what the app costs the Mac — each
 * tick an event at the measured average rate, before and after tuning.
 */
export function VitalsVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

function Wall() {
  return (
    <defs>
      <radialGradient id="vitals-wall-a" cx="0.15" cy="0" r="0.9">
        <stop offset="0" stopColor="#4c1d95" />
        <stop offset="1" stopColor="#4c1d95" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="vitals-wall-b" cx="1" cy="1" r="0.9">
        <stop offset="0" stopColor="#0c4a6e" />
        <stop offset="1" stopColor="#0c4a6e" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Desktop, document with its caret, and the HUD, in a w × h box at (x, y). */
function Desktop({ x, y, w, h, accent, compact }: { x: number; y: number; w: number; h: number; accent: string; compact: boolean }) {
  const doc = { x: x + (compact ? 14 : 30), y: y + 34, w: w * (compact ? 0.5 : 0.54), h: h - (compact ? 58 : 70) };
  const hud = { w: compact ? 148 : 196, h: compact ? 124 : 150 };
  const hx = x + w - hud.w - (compact ? 8 : 22);
  const hy = y + (compact ? 30 : 36);
  const ring = compact ? 19 : 26;
  const lines = [0.76, 0.85, 0.64, 0.36];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="14" fill="#0b0b14" />
      <rect x={x} y={y} width={w} height={h} rx="14" fill="url(#vitals-wall-a)" />
      <rect x={x} y={y} width={w} height={h} rx="14" fill="url(#vitals-wall-b)" />
      <path d={`M${x} ${y + 14}a14 14 0 0 1 14-14h${w - 28}a14 14 0 0 1 14 14v8H${x}z`} fill="rgb(255 255 255 / 0.1)" />
      <text x={x + 16} y={y + 16} fontSize="10" fontWeight="600" fill="#f5f5f7">
        Notes
      </text>
      <text x={x + w - 12} y={y + 16} fontSize="10" fill="#f5f5f7" textAnchor="end">
        9:41
      </text>
      <rect x={doc.x} y={doc.y} width={doc.w} height={doc.h} rx="10" fill="#f5f5f7" />
      {lines.map((f, i) => (
        <rect key={i} x={doc.x + 16} y={doc.y + 22 + i * 20} width={(doc.w - 32) * f} height="7" rx="3.5" fill="#d4d4d8" />
      ))}
      {/* The caret stays in the document: the HUD never takes focus. */}
      <rect className={s.blink} x={doc.x + 20 + (doc.w - 32) * lines[3]} y={doc.y + 80} width="2" height="15" fill={accent} />
      <rect x={hx} y={hy} width={hud.w} height={hud.h} rx="22" fill="#1b1830" fillOpacity="0.92" stroke="rgb(255 255 255 / 0.16)" />
      {[
        { label: "CPU", pct: 12, color: "#a78bfa", dx: 0.27 },
        { label: "MEM", pct: 58, color: "#38bdf8", dx: 0.73 },
      ].map((g) => {
        const gx = hx + hud.w * g.dx;
        const gy = hy + ring + 14;
        const len = 2 * Math.PI * ring;
        return (
          <g key={g.label}>
            <circle cx={gx} cy={gy} r={ring} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth={compact ? 5 : 6} />
            <circle cx={gx} cy={gy} r={ring} fill="none" stroke={g.color} strokeWidth={compact ? 5 : 6} strokeLinecap="round" strokeDasharray={`${(g.pct / 100) * len} ${len}`} transform={`rotate(-90 ${gx} ${gy})`} />
            <text x={gx} y={gy + 4} fontSize={compact ? 10 : 12} fontWeight="600" textAnchor="middle" fill="#f5f5f7">
              {g.pct}%
            </text>
          </g>
        );
      })}
      <text x={hx + 16} y={hy + hud.h - (compact ? 34 : 42)} fontSize={compact ? 9 : 10} fill="#a1a1a6">
        Next · Design review
      </text>
      <text x={hx + 16} y={hy + hud.h - (compact ? 14 : 20)} fontSize={compact ? 13 : 15} className={s.mono} fill="#f5f5f7">
        in 24 min
      </text>
    </g>
  );
}

/** One row of ticks: before fades to ghosts once tuned, after pops in. */
function Ticks({ x, y, w, h, before, after, tuned, accent }: { x: number; y: number; w: number; h: number; before: number; after: number; tuned: boolean; accent: string }) {
  return (
    <g>
      {ticks(before).map((t, i) => (
        <rect key={`b${i}`} className={s.t} x={x + t * w} y={y} width="3" height={h} rx="1.5" fill="#fb7185" style={{ opacity: tuned ? 0.14 : 0.9 }} />
      ))}
      {ticks(after).map((t, i) => (
        <rect key={`a${i}`} className={s.pop} x={x + t * w + 1} y={y} width="3" height={h} rx="1.5" fill={accent} style={{ opacity: tuned ? 1 : 0, transform: `scaleY(${tuned ? 1 : 0.2})` }} />
      ))}
    </g>
  );
}

const ROWS = [
  { label: "Timer wake-ups", rate: VITALS_RATES.wakeups },
  { label: "Screen redraws", rate: VITALS_RATES.redraws },
];
const rateText = (r: (typeof ROWS)[number]["rate"], tuned: boolean) => `${tuned ? r.afterText : r.beforeText}${r.unit}`;

function Wide({ frame, accent, still }: Props) {
  const X = 150;
  const W = 396;
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <Wall />
      <g className={s.t} style={{ transform: `translateY(${frame.showTimeline ? 0 : 40}px)` }}>
        <Desktop x={16} y={8} w={608} h={250} accent={accent} compact={false} />
      </g>
      <g className={s.t} style={{ opacity: frame.showTimeline ? 1 : 0 }}>
        <text x="16" y="296" fontSize="11" fill="#86868b">
          {WINDOW_S} seconds
        </text>
        <line x1={X} x2={X + W} y1="292" y2="292" stroke="rgb(255 255 255 / 0.14)" />
        {ROWS.map((row, r) => {
          const y = 320 + r * 58;
          return (
            <g key={row.label}>
              <text x="16" y={y + 18} fontSize="13" fill="#e4e4e7">
                {row.label}
              </text>
              <Ticks x={X} y={y} w={W} h={28} before={row.rate.before} after={row.rate.after} tuned={frame.tuned} accent={accent} />
              <text x="624" y={y + 18} fontSize="12" textAnchor="end" className={s.mono} fill={frame.tuned ? "#f5f5f7" : "#fda4af"}>
                {rateText(row.rate, frame.tuned)}
              </text>
            </g>
          );
        })}
        <g className={s.t} style={{ opacity: frame.showCpu ? 1 : 0 }}>
          <text x="16" y="470" fontSize="13" fill="#e4e4e7">
            CPU at idle
          </text>
          <text x="16" y="490" fontSize="10.5" fill="#86868b">
            of one core
          </text>
          <rect x={X} y="458" width={W} height="10" rx="5" fill="rgb(255 255 255 / 0.12)" />
          <rect x={X} y="476" width={W * (VITALS_RATES.cpu.after / VITALS_RATES.cpu.before)} height="10" rx="5" fill={accent} />
          <text x="624" y="467" fontSize="11" textAnchor="end" className={s.mono} fill="#86868b">
            {VITALS_RATES.cpu.beforeText}%
          </text>
          <text x="624" y="486" fontSize="11" textAnchor="end" className={s.mono} fill="#f5f5f7">
            {VITALS_RATES.cpu.afterText}%
          </text>
        </g>
      </g>
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <Wall />
      <g className={s.t} style={{ transform: `translateY(${frame.showTimeline ? 0 : 60}px)` }}>
        <Desktop x={4} y={0} w={352} h={196} accent={accent} compact />
      </g>
      <g className={s.t} style={{ opacity: frame.showTimeline ? 1 : 0 }}>
        <text x="4" y="232" fontSize="11" fill="#86868b">
          {WINDOW_S} seconds
        </text>
        {ROWS.map((row, r) => {
          const y = 256 + r * 66;
          return (
            <g key={row.label}>
              <text x="4" y={y} fontSize="13" fill="#e4e4e7">
                {row.label}
              </text>
              <text x="356" y={y} fontSize="12" textAnchor="end" className={s.mono} fill={frame.tuned ? "#f5f5f7" : "#fda4af"}>
                {rateText(row.rate, frame.tuned)}
              </text>
              <Ticks x={4} y={y + 10} w={348} h={26} before={row.rate.before} after={row.rate.after} tuned={frame.tuned} accent={accent} />
            </g>
          );
        })}
        <g className={s.t} style={{ opacity: frame.showCpu ? 1 : 0 }}>
          <text x="4" y="402" fontSize="13" fill="#e4e4e7">
            CPU at idle, one core
          </text>
          <text x="356" y="402" fontSize="11" textAnchor="end" className={s.mono} fill="#f5f5f7">
            {VITALS_RATES.cpu.beforeText}% → {VITALS_RATES.cpu.afterText}%
          </text>
          <rect x="4" y="414" width="352" height="10" rx="5" fill="rgb(255 255 255 / 0.12)" />
          <rect x="4" y="432" width={352 * (VITALS_RATES.cpu.after / VITALS_RATES.cpu.before)} height="10" rx="5" fill={accent} />
        </g>
      </g>
    </svg>
  );
}
