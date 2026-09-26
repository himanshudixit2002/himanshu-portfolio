import type { CSSProperties } from "react";
import { attemptTimes, type RxFrame } from "@/lib/scenes/rxforce";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";

type Props = { frame: RxFrame; accent: string; still?: boolean; layout?: Layout };

/**
 * "No signal": the rep's app, offline, filling its queue; each item's
 * attempts spaced further apart; signal back and the queue draining; then
 * the one conflict rule. Wide: phone beside the queue. Tall: the app alone.
 */
export function RxVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

const STATUS = {
  queued: { fill: "rgb(251 191 36 / 0.16)", ink: "#fde68a", text: "queued" },
  synced: { fill: "rgb(52 211 153 / 0.16)", ink: "#a7f3d0", text: "synced" },
  failed: { fill: "rgb(251 113 133 / 0.16)", ink: "#fecdd3", text: "failed" },
} as const;

function Signal({ x, y, online, accent }: { x: number; y: number; online: boolean; accent: string }) {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} className={s.t} x={x + i * 6} y={y - 4 - i * 3} width="4" height={6 + i * 3} rx="1" fill={online ? "#f5f5f7" : "rgb(255 255 255 / 0.2)"} />
      ))}
      <g className={s.t}>
        <rect x={x + 30} y={y - 15} width={online ? 56 : 58} height="18" rx="9" fill={online ? `${accent}33` : "rgb(251 113 133 / 0.18)"} />
        <text x={x + 30 + (online ? 28 : 29)} y={y - 2} fontSize="10" fontWeight="600" textAnchor="middle" fill={online ? accent : "#fda4af"}>
          {online ? "Online" : "Offline"}
        </text>
      </g>
    </g>
  );
}

/** The queue as rows: label, status, and a line of attempts spaced as they happened. `k` scales the type. */
function Queue({ frame, x, y, w, rowH, accent, k = 1 }: { frame: RxFrame; x: number; y: number; w: number; rowH: number; accent: string; k?: number }) {
  const lineX = x + 12 * k;
  const lineW = w - 24 * k;
  // Show the first few seconds of the schedule, where the spacing is visible.
  const window = attemptTimes(5).at(-1)!;
  const pillW = 62 * k;
  return (
    <g>
      {frame.items.map((item, i) => {
        const st = STATUS[item.status];
        const top = y + i * rowH;
        return (
          <g key={item.id} className={s.t}>
            <rect x={x} y={top} width={w} height={rowH - 10} rx="12" fill="rgb(255 255 255 / 0.05)" />
            <text x={x + 12 * k} y={top + 22 * k} fontSize={13 * k} fontWeight="600" fill="#f5f5f7">
              {item.label}
            </text>
            <rect x={x + w - pillW - 12 * k} y={top + 9 * k} width={pillW} height={18 * k} rx={9 * k} fill={st.fill} />
            <text x={x + w - pillW / 2 - 12 * k} y={top + 22 * k} fontSize={10 * k} fontWeight="600" textAnchor="middle" fill={st.ink}>
              {st.text}
            </text>
            <line x1={lineX} x2={lineX + lineW} y1={top + rowH - 24} y2={top + rowH - 24} stroke="rgb(255 255 255 / 0.1)" />
            {attemptTimes(item.attempts).map((t, n) => (
              <circle key={n} className={s.pop} cx={lineX + Math.min(1, t / window) * lineW} cy={top + rowH - 24} r={3.5 * k} fill={item.status === "synced" && n === item.attempts - 1 ? "#6ee7b7" : accent} />
            ))}
            {item.attempts > 0 && (
              <text x={x + w - 12 * k} y={top + rowH - 32} fontSize={9.5 * k} textAnchor="end" fill="#86868b">
                {item.attempts} {item.attempts === 1 ? "try" : "tries"}
              </text>
            )}
          </g>
        );
      })}
      <text x={x} y={y + 3 * rowH + 8 * k} fontSize={10 * k} fill="#86868b">
        Attempts over the first {Math.round(window / 1000)} s · each wait doubles
      </text>
    </g>
  );
}

/** Two edits to one visit report; the later one is kept. */
function Conflict({ x, y, w, show, accent, k = 1 }: { x: number; y: number; w: number; show: boolean; accent: string; k?: number }) {
  const row = (dy: number, label: string, time: string, kept: boolean) => (
    <g>
      <rect x={x} y={y + dy} width={w} height={40 * k} rx="10" fill={kept ? `${accent}1f` : "rgb(255 255 255 / 0.04)"} stroke={kept ? accent : "rgb(255 255 255 / 0.1)"} />
      <text x={x + 14} y={y + dy + 25 * k} fontSize={12 * k} fill={kept ? "#f5f5f7" : "#71717a"} textDecoration={kept ? undefined : "line-through"}>
        {label}
      </text>
      <text x={x + w - 14} y={y + dy + 25 * k} fontSize={11 * k} textAnchor="end" className={s.mono} fill={kept ? accent : "#71717a"}>
        {time}
        {kept ? " · kept" : ""}
      </text>
    </g>
  );
  return (
    <g className={s.t} style={{ opacity: show ? 1 : 0, transform: `translateY(${show ? 0 : 12}px)` } as CSSProperties}>
      <text x={x} y={y - 10} fontSize={11 * k} fill="#a1a1a6">
        One visit report, edited twice
      </text>
      {row(0, "Edit on the phone", "10:02", false)}
      {row(48 * k, "Edit on the web", "10:05", true)}
    </g>
  );
}

function Wide({ frame, accent, still }: Props) {
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      {/* Phone */}
      <rect x="10" y="12" width="210" height="496" rx="36" fill="#0e0f12" stroke="rgb(255 255 255 / 0.14)" strokeWidth="2" />
      <rect x="20" y="22" width="190" height="476" rx="28" fill="#111827" />
      <rect x="84" y="30" width="62" height="16" rx="8" fill="#050506" />
      <text x="38" y="72" fontSize="10" fill="#f5f5f7" className={s.mono}>
        9:41
      </text>
      <Signal x={100} y={72} online={frame.online} accent={accent} />
      <text x="36" y="108" fontSize="16" fontWeight="650" fill="#f5f5f7">
        Today
      </text>
      <text x="36" y="126" fontSize="10.5" fill="#86868b">
        Sample day · 3 entries
      </text>
      {["Visit report", "Order", "Expense"].map((label, i) => {
        const item = frame.items.find((it) => it.label === label);
        return (
          <g key={label} className={s.t} style={{ opacity: item ? 1 : 0.25 }}>
            <rect x="32" y={146 + i * 58} width="166" height="48" rx="12" fill="rgb(255 255 255 / 0.06)" />
            <text x="46" y={170 + i * 58} fontSize="12" fontWeight="600" fill="#e5e7eb">
              {label}
            </text>
            <text x="46" y={185 + i * 58} fontSize="9.5" fill={item?.status === "synced" ? "#6ee7b7" : "#fcd34d"}>
              {item ? (item.status === "synced" ? "Saved · synced" : "Saved on phone") : "—"}
            </text>
          </g>
        );
      })}
      <rect x="32" y="440" width="166" height="40" rx="20" fill={accent} />
      <text x="115" y="465" fontSize="12" fontWeight="600" textAnchor="middle" fill="#08090b">
        + New entry
      </text>

      {/* Queue */}
      <text x="250" y="40" fontSize="12" fill="#a1a1a6">
        Sync queue
      </text>
      <Queue frame={frame} x={250} y={54} w={374} rowH={78} accent={accent} />
      <Conflict x={250} y={402} w={374} show={frame.showConflict} accent={accent} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  // Until the conflict arrives, the queue sits lower, centred; then it makes room.
  const lift = frame.showConflict ? 0 : 56;
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <g className={s.t} style={{ transform: `translateY(${lift}px)` }}>
        <text x="4" y="22" fontSize="18" fontWeight="650" fill="#f5f5f7">
          Sync queue
        </text>
        <Signal x={242} y={22} online={frame.online} accent={accent} />
        <Queue frame={frame} x={4} y={40} w={352} rowH={84} accent={accent} k={1.2} />
      </g>
      <Conflict x={4} y={366} w={352} show={frame.showConflict} accent={accent} k={1.1} />
    </svg>
  );
}
