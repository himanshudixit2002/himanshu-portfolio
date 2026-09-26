import { memo, type CSSProperties } from "react";
import { PROGRAM, SCOPE_BATCH, SCOPE_GUARDS, type ScopeFrame } from "@/lib/scenes/scopeforge";
import { Later } from "../IdleDraw";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";
import { FAIL, Mark, PASS } from "./marks";

type Props = { frame: ScopeFrame; accent: string; still?: boolean; layout?: Layout };
const fade = (on: boolean, delay = 0) => ({ opacity: on ? 1 : 0, transitionDelay: on ? `${delay}ms` : "0ms" }) as CSSProperties;

/**
 * "Inside the fence": the sample program's scope, one request at a time
 * meeting the five guards — through, or stopped with the reason — and then
 * a batch going out one GET at a time. Wide: the program and the request
 * beside the fence. Tall: stacked. Text only fades (see README).
 */
export function ScopeVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

/** The program: its one origin, its excluded prefix, when it ends. */
const Program = memo(function Program({ x, y, w, accent, size }: { x: number; y: number; w: number; accent: string; size: number }) {
  const row = (dy: number, label: string, value: string, tone = "#e4e4e7") => (
    <g>
      <text x={x + 16} y={y + dy} fontSize={size * 0.82} fill="#86868b">
        {label}
      </text>
      <text x={x + 16} y={y + dy + size * 1.35} fontSize={size} className={s.mono} fill={tone}>
        {value}
      </text>
    </g>
  );
  return (
    <g>
      <rect x={x} y={y} width={w} height={size * 12.4} rx="16" fill="rgb(255 255 255 / 0.04)" stroke="rgb(255 255 255 / 0.1)" />
      <text x={x + 16} y={y + size * 2} fontSize={size * 1.05} fontWeight="650" fill="#f5f5f7">
        Program scope
      </text>
      <circle cx={x + w - 22} cy={y + size * 1.62} r="5" fill={accent} />
      {row(size * 4, "Authorized origin", PROGRAM.origin, accent)}
      {row(size * 7.1, "Excluded prefix", PROGRAM.excluded)}
      {row(size * 10.1, "Authorized until", PROGRAM.untilLabel)}
    </g>
  );
});

/** The request this step follows. Its text changes per step; the chip itself stays. */
function Request({ frame, x, y, w, size }: { frame: ScopeFrame; x: number; y: number; w: number; size: number }) {
  const r = frame.request;
  return (
    <g className={s.t} style={fade(Boolean(r))}>
      <rect x={x} y={y} width={w} height={size * 4.4} rx="12" fill="#0b0c0e" stroke="rgb(255 255 255 / 0.12)" />
      <text x={x + 14} y={y + size * 1.75} fontSize={size * 0.82} fill="#86868b">
        GET · {r?.onLabel ?? ""}
      </text>
      <text x={x + 14} y={y + size * 3.35} fontSize={size} className={s.mono} fill="#f5f5f7">
        {r?.url.replace("https://", "") ?? ""}
      </text>
    </g>
  );
}

/** The five guards as a fence: passed, the one that stopped the request, and the ones never reached. */
function Fence({ frame, x, y, w, rowH, size, accent }: { frame: ScopeFrame; x: number; y: number; w: number; rowH: number; size: number; accent: string }) {
  const v = frame.verdict;
  // The batch's URLs are all in scope: every guard passes for each.
  const passed = frame.batch ? SCOPE_GUARDS.length : (v?.passed ?? 0);
  const stop = frame.batch ? null : (v?.stop ?? null);
  return (
    <g>
      {SCOPE_GUARDS.map((g, i) => {
        const top = y + i * rowH;
        const ok = i < passed;
        const failed = i === stop;
        return (
          <g key={g.label}>
            <rect className={s.t} x={x} y={top} width={w} height={rowH - 8} rx="12" fill={failed ? "rgb(251 113 133 / 0.1)" : "rgb(255 255 255 / 0.04)"} stroke={failed ? FAIL : ok ? `${accent}55` : "rgb(255 255 255 / 0.08)"} />
            <text x={x + 14} y={top + (rowH - 8) / 2 + size * 0.36} fontSize={size} fontWeight="600" fill={ok || failed ? "#f5f5f7" : "#71717a"} className={s.t}>
              {i + 1}. {g.label}
            </text>
            <g className={s.pop} style={{ opacity: ok || failed ? 1 : 0, transform: `scale(${ok || failed ? 1 : 0.5})`, transitionDelay: ok || failed ? `${i * 90}ms` : "0ms" }}>
              <Mark x={x + w - 22} y={top + (rowH - 8) / 2} ok={!failed} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

/** Sent, or stopped and why. Both are drawn; the frame's one shows. */
function Verdict({ frame, x, y, size }: { frame: ScopeFrame; x: number; y: number; size: number }) {
  const v = frame.verdict;
  const sent = Boolean(v && v.stop === null);
  const refused = Boolean(v && v.stop !== null);
  return (
    <g>
      <g className={s.t} style={fade(sent, 480)}>
        <rect x={x} y={y} width={size * 11.5} height={size * 2.2} rx={size * 1.1} fill="rgb(52 211 153 / 0.18)" />
        <text x={x + size * 5.75} y={y + size * 1.45} fontSize={size * 0.92} fontWeight="700" textAnchor="middle" fill={PASS}>
          Sent · one GET
        </text>
      </g>
      <g className={s.t} style={fade(refused, 300)}>
        <rect x={x} y={y} width={size * 11.5} height={size * 2.2} rx={size * 1.1} fill="rgb(251 113 133 / 0.18)" />
        <text x={x + size * 5.75} y={y + size * 1.45} fontSize={size * 0.92} fontWeight="700" textAnchor="middle" fill={FAIL}>
          Never sent
        </text>
        <text x={x} y={y + size * 3.8} fontSize={size * 0.9} fill={FAIL}>
          {v?.reason ?? ""}
        </text>
      </g>
    </g>
  );
}

/** A batch: at most SCOPE_BATCH URLs, one GET each, paced — and a redirect that isn't followed. */
const Batch = memo(function Batch({ on, x, y, w, size, accent, solid }: { on: boolean; x: number; y: number; w: number; size: number; accent: string; solid?: boolean }) {
  const gap = (w - 40) / (SCOPE_BATCH - 1);
  return (
    <g className={s.t} style={fade(on)}>
      <rect x={x} y={y} width={w} height={size * 10.4} rx="16" fill={solid ? "#141519" : "rgb(255 255 255 / 0.04)"} stroke="rgb(255 255 255 / 0.1)" />
      <text x={x + 14} y={y + size * 1.9} fontSize={size} fontWeight="650" fill="#f5f5f7">
        One batch, {SCOPE_BATCH} URLs at most
      </text>
      <line x1={x + 20} x2={x + w - 20} y1={y + size * 4.4} y2={y + size * 4.4} stroke="rgb(255 255 255 / 0.12)" />
      {Array.from({ length: SCOPE_BATCH }, (_, i) => (
        <circle key={i} className={s.pop} cx={x + 20 + i * gap} cy={y + size * 4.4} r={size * 0.32} fill={accent} style={{ opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.3})`, transitionDelay: on ? `${120 + i * 45}ms` : "0ms" }} />
      ))}
      <text x={x + 14} y={y + size * 6.3} fontSize={size * 0.82} fill="#a1a1a6">
        One GET each, paced per program
      </text>
      <rect x={x + 14} y={y + size * 7.4} width={w - 28} height={size * 2.1} rx={size * 0.6} fill="#0b0c0e" />
      <text x={x + 24} y={y + size * 8.8} fontSize={size * 0.82} className={s.mono} fill="#a1a1a6">
        301 Moved · <tspan fill={FAIL}>not followed</tspan>
      </text>
    </g>
  );
});

function Wide({ frame, accent, still }: Props) {
  const batch = still ? (frame.batch ? <Batch on x={16} y={228} w={284} size={12} accent={accent} /> : null) : <Later now={frame.batch}><Batch on={frame.batch} x={16} y={228} w={284} size={12} accent={accent} /></Later>;
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <Program x={16} y={40} w={284} accent={accent} size={13} />
      <Request frame={frame} x={16} y={228} w={284} size={13} />
      {batch}
      <text x={330} y={32} fontSize="12" fill="#86868b">
        Before a request exists
      </text>
      <Fence frame={frame} x={330} y={44} w={294} rowH={62} size={13} accent={accent} />
      <Verdict frame={frame} x={330} y={372} size={13} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  const batch = still ? (frame.batch ? <Batch on solid x={4} y={144} w={352} size={13} accent={accent} /> : null) : <Later now={frame.batch}><Batch on={frame.batch} solid x={4} y={144} w={352} size={13} accent={accent} /></Later>;
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <Program x={4} y={0} w={352} accent={accent} size={11.5} />
      <Request frame={frame} x={4} y={144} w={352} size={12.5} />
      <g className={s.t} style={{ opacity: frame.batch ? 0.35 : 1 }}>
        <Fence frame={frame} x={4} y={210} w={352} rowH={40} size={12.5} accent={accent} />
      </g>
      <Verdict frame={frame} x={4} y={414} size={12.5} />
      {batch}
    </svg>
  );
}
