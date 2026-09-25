import type { CSSProperties } from "react";
import * as kv from "@/lib/sim/kvstore";
import { KV_KEY, type KvFrame } from "@/lib/scenes/kvstore";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";

const hex = (n: number) => `0x${n.toString(16).padStart(8, "0")}`;
const at = (x: number, y: number) => ({ transform: `translate(${x}px, ${y}px)` }) as CSSProperties;
const short = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
type Props = { frame: KvFrame; accent: string; still?: boolean; layout?: Layout };

/**
 * "Where a key lands": the command in a terminal; its key through FNV-1a and
 * modulo 16; the key flying into its shard; the shard overflowing and
 * dropping its least recently used key; the log written in one batch.
 * Wide: 8 × 2 shards. Tall: 4 × 4.
 */
export function KvVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

type Grid = { x: number; y: number; w: number; h: number; cols: number; gap: number; chip: number; font: number };

/** The 16 shards, their keys, and the key in flight from `from` to its shard. */
function Shards({ frame, accent, grid, from }: { frame: KvFrame; accent: string; grid: Grid; from: { x: number; y: number } }) {
  const { state, shard } = frame;
  const cx = (i: number) => grid.x + (i % grid.cols) * (grid.w + grid.gap);
  const cy = (i: number) => grid.y + Math.floor(i / grid.cols) * (grid.h + grid.gap);
  const row = (r: number) => 18 + r * (grid.chip + 3);
  const flying = frame.step === 1 || frame.step === 2;
  const keyAt = frame.step >= 2 ? at(cx(shard) + 5, cy(shard) + row(0)) : at(from.x, from.y);
  const chip = (key: string, mine: boolean) => (
    <>
      <rect width={grid.w - 10} height={grid.chip} rx="4" fill={mine ? accent : "rgb(251 191 36 / 0.16)"} />
      <text x="5" y={grid.chip - 4} fontSize={grid.font} className={s.mono} fill={mine ? "#08090b" : "#fde68a"}>
        {short(key, grid.w > 60 ? 9 : 8)}
      </text>
    </>
  );
  return (
    <g>
      {state.shards.map((entries, i) => {
        const hot = i === shard && frame.step >= 1;
        return (
          <g key={i}>
            <rect className={s.t} x={cx(i)} y={cy(i)} width={grid.w} height={grid.h} rx="9" fill={hot ? `${accent}1f` : "rgb(255 255 255 / 0.04)"} stroke={hot ? accent : "rgb(255 255 255 / 0.08)"} />
            <text x={cx(i) + 7} y={cy(i) + 14} fontSize="10" className={s.mono} fill="#86868b">
              {String(i).padStart(2, "0")}
            </text>
            {entries
              .filter((e) => !(flying && e.key === KV_KEY))
              .map((e, r) => (
                <g key={e.key} className={s.t} style={at(cx(i) + 5, cy(i) + row(r))}>
                  {chip(e.key, e.key === KV_KEY)}
                </g>
              ))}
          </g>
        );
      })}
      <g className={`${s.t} ${s.slow}`} style={{ ...keyAt, opacity: flying ? 1 : 0 }}>
        {chip(KV_KEY, true)}
      </g>
    </g>
  );
}

function Log({ frame, x, y, w, per }: { frame: KvFrame; x: number; y: number; w: number; per: number }) {
  const queued = kv.queuedCount(frame.state);
  const slot = (w - (per - 1) * 6) / per;
  return (
    <g>
      <text x={x} y={y} fontSize="12" fill="#a1a1a6">
        Write-ahead log
      </text>
      <text x={x + w} y={y} fontSize="12" textAnchor="end" fill={queued ? "#fcd34d" : "#6ee7b7"}>
        {queued ? `${queued} queued` : "all written"}
      </text>
      {frame.state.log.slice(-per).map((r, i) => (
        <g key={r.seq}>
          <rect className={s.t} x={x + i * (slot + 6)} y={y + 10} width={slot} height="24" rx="7" fill={r.state === "queued" ? "rgb(56 189 248 / 0.16)" : "rgb(255 255 255 / 0.05)"} stroke={r.state === "queued" ? "rgb(125 211 252 / 0.6)" : "transparent"} />
          <text x={x + i * (slot + 6) + 6} y={y + 26} fontSize="9.5" className={s.mono} fill={r.state === "queued" ? "#bae6fd" : "#71717a"}>
            {short(r.line, Math.floor(slot / 6.2))}
          </text>
        </g>
      ))}
      <rect className={s.t} x={x - 6} y={y + 4} width={w + 12} height="36" rx="10" fill="none" stroke="#6ee7b7" strokeWidth="1.5" style={{ opacity: frame.flushed ? 0.8 : 0 }} />
    </g>
  );
}

function Terminal({ frame, accent, x, y, w, size }: { frame: KvFrame; accent: string; x: number; y: number; w: number; size: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={size * 5.6} rx="14" fill="#0b0c0e" stroke="rgb(255 255 255 / 0.1)" />
      <text x={x + 18} y={y + size * 2} fontSize={size} className={s.mono} fill="#f5f5f7">
        <tspan fill={accent}>&gt; </tspan>
        {frame.typed}
        <tspan className={s.blink} fill={accent}>
          ▍
        </tspan>
      </text>
      <text x={x + 18} y={y + size * 4} fontSize={size * 0.85} className={`${s.mono} ${s.t}`} fill="#6ee7b7" style={{ opacity: frame.landed ? 1 : 0 }}>
        +OK
      </text>
    </g>
  );
}

function Pill({ x, y, w, label, on, strong, accent }: { x: number; y: number; w: number; label: string; on: boolean; strong?: boolean; accent: string }) {
  return (
    <g className={s.t} style={{ opacity: on ? 1 : 0.3 }}>
      <rect x={x} y={y} width={w} height="36" rx="10" fill={strong ? `${accent}26` : "rgb(255 255 255 / 0.08)"} stroke={strong ? accent : "none"} />
      <text x={x + w / 2} y={y + 23} fontSize="13" textAnchor="middle" className={s.mono} fill={strong ? accent : "#e4e4e7"}>
        {label}
      </text>
    </g>
  );
}

function Wide({ frame, accent, still }: Props) {
  const on = frame.step >= 1;
  const grid: Grid = { x: 26, y: 208, w: 70, h: 96, cols: 8, gap: 4, chip: 18, font: 10 };
  const evictedAt = { x: grid.x + (frame.shard % 8) * 74 + 35, y: frame.shard < 8 ? 200 : 420 };
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <Terminal frame={frame} accent={accent} x={16} y={10} w={608} size={17} />
      <Pill x={16} y={126} w={88} label={`"${KV_KEY}"`} on accent={accent} />
      <Pill x={118} y={126} w={92} label="FNV-1a" on={on} accent={accent} />
      <Pill x={224} y={126} w={138} label={hex(frame.hash)} on={on} accent={accent} />
      <Pill x={376} y={126} w={76} label="% 16" on={on} accent={accent} />
      <Pill x={466} y={126} w={158} label={`shard ${String(frame.shard).padStart(2, "0")}`} on={on} strong accent={accent} />
      <Shards frame={frame} accent={accent} grid={grid} from={{ x: 470, y: 176 }} />
      <text className={s.t} x={evictedAt.x} y={evictedAt.y} fontSize="11" textAnchor="middle" fill="#fda4af" style={{ opacity: frame.evicted ? 1 : 0 }}>
        {frame.evicted ? `${frame.evicted} evicted` : ""}
      </text>
      <Log frame={frame} x={26} y={446} w={588} per={6} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  const on = frame.step >= 1;
  const grid: Grid = { x: 4, y: 176, w: 84, h: 58, cols: 4, gap: 5, chip: 11, font: 8.5 };
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <Terminal frame={frame} accent={accent} x={4} y={0} w={352} size={14} />
      <Pill x={4} y={88} w={84} label={`"${KV_KEY}"`} on accent={accent} />
      <Pill x={96} y={88} w={78} label="FNV-1a" on={on} accent={accent} />
      <Pill x={182} y={88} w={174} label={hex(frame.hash)} on={on} accent={accent} />
      <Pill x={4} y={130} w={84} label="% 16" on={on} accent={accent} />
      <Pill x={96} y={130} w={130} label={`shard ${String(frame.shard).padStart(2, "0")}`} on={on} strong accent={accent} />
      <text className={s.t} x="236" y="153" fontSize="12" fill="#fda4af" style={{ opacity: frame.evicted ? 1 : 0 }}>
        {frame.evicted ? `${frame.evicted} evicted` : ""}
      </text>
      <Shards frame={frame} accent={accent} grid={grid} from={{ x: 236, y: 142 }} />
      <Log frame={frame} x={4} y={446} w={352} per={3} />
    </svg>
  );
}
