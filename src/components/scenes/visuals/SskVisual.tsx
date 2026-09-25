import type { CSSProperties } from "react";
import { systemLayers } from "@/content/surface-system";
import { SSK_ANSWER, SSK_PIPELINE, SSK_QUESTION, sskNoModelMetric, type SskFrame } from "@/lib/scenes/smartshelfkart";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";

const STAGE_LABEL: Record<string, string> = { verify: "Verify", cache: "Cache", route: "Route", answer: "Answer" };
const at = (x: number, y: number) => ({ transform: `translate(${x}px, ${y}px)` }) as CSSProperties;
type Props = { frame: SskFrame; accent: string; still?: boolean; layout?: Layout };

/**
 * "Ask Nova": a light carries the question to whichever layer the step is
 * in; the assistant's pipeline fills in as it passes; the answer lands back
 * on the phone. Wide: the phone beside the layers. Tall: the chat above them.
 */
export function SskVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

/** One layer card with its name, stack and, where it has them, pipeline chips. */
function Layer({ id, x, y, w, h, frame, accent, big }: { id: string; x: number; y: number; w: number; h: number; frame: SskFrame; accent: string; big: boolean }) {
  const layer = systemLayers.find((l) => l.id === id)!;
  const on = frame.layer === id;
  const chipW = big ? 78 : 68;
  const chipY = y + h - (big ? 32 : 26);
  const chip = (label: string, k: number, current: boolean, done: boolean) => (
    <g key={label}>
      <rect className={s.t} x={x + 20 + k * (chipW + 8)} y={chipY} width={chipW} height={big ? 22 : 20} rx="10" fill={current ? accent : done ? `${accent}33` : "rgb(255 255 255 / 0.06)"} />
      <text x={x + 20 + k * (chipW + 8) + chipW / 2} y={chipY + (big ? 15 : 14)} fontSize={big ? 10.5 : 10} fontWeight="600" textAnchor="middle" fill={current ? "#08090b" : done ? "#f5f5f7" : "#86868b"}>
        {label}
      </text>
    </g>
  );
  return (
    <g>
      <rect className={s.t} x={x} y={y} width={w} height={h} rx={big ? 18 : 14} fill={on ? `${accent}1f` : "rgb(255 255 255 / 0.04)"} stroke={on ? accent : "rgb(255 255 255 / 0.12)"} strokeWidth={on ? 2 : 1.5} />
      <text x={x + 20} y={y + (big ? 34 : 26)} fontSize={big ? 17 : 15} fontWeight="600" fill={on ? "#f5f5f7" : "#a1a1a6"}>
        {layer.name}
      </text>
      <text x={x + 20} y={y + (big ? 54 : 43)} fontSize={big ? 11.5 : 11} fill="#86868b">
        {layer.tech}
      </text>
      {id === "assistant" && SSK_PIPELINE.map((stage, k) => chip(STAGE_LABEL[stage], k, frame.stepId === stage, frame.done.includes(stage)))}
      {id === "rules" && chip("Read facts", 0, frame.stepId === "facts", false)}
    </g>
  );
}

function Light({ x, y, accent }: { x: number; y: number; accent: string }) {
  return (
    <g className={`${s.t} ${s.slow}`} style={at(x, y)}>
      <circle r="7" fill={accent} className={s.pulse} />
      <circle r="6" fill={accent} />
      <circle r="3" fill="#fff" />
    </g>
  );
}

function Metric({ x, y, w, accent, show }: { x: number; y: number; w: number; accent: string; show: boolean }) {
  return (
    <g className={s.t} style={{ opacity: show ? 1 : 0 }}>
      <text x={x} y={y} fontSize="22" fontWeight="650" fill="#f5f5f7">
        {sskNoModelMetric.value}
      </text>
      <text x={x + 52} y={y - 1} fontSize="11" fill="#a1a1a6">
        {sskNoModelMetric.label}
      </text>
      <rect x={x} y={y + 10} width={w} height="6" rx="3" fill={accent} fillOpacity="0.2" />
      <rect x={x} y={y + 10} width={w * (parseFloat(sskNoModelMetric.value) / 100)} height="6" rx="3" fill={accent} />
    </g>
  );
}

function Wide({ frame, accent, still }: Props) {
  const H = 96;
  const top = (i: number) => 24 + i * (H + 14);
  const active = frame.layers.indexOf(frame.layer);
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      {/* Phone */}
      <rect x="8" y="16" width="196" height="488" rx="34" fill="#0e0f12" stroke="rgb(255 255 255 / 0.14)" strokeWidth="2" />
      <rect x="18" y="26" width="176" height="468" rx="26" fill="#fafafa" />
      <rect x="76" y="34" width="60" height="16" rx="8" fill="#0e0f12" />
      <circle cx="42" cy="78" r="10" fill={accent} />
      <text x="58" y="76" fontSize="13" fontWeight="600" fill="#18181b">
        Nova
      </text>
      <text x="58" y="90" fontSize="9.5" fill="#71717a">
        Inventory assistant
      </text>
      <line x1="18" x2="194" y1="104" y2="104" stroke="#e4e4e7" />
      <rect x="62" y="118" width="124" height="30" rx="15" fill={accent} />
      <text x="124" y="137" fontSize="10.5" fontWeight="600" fill="#fff" textAnchor="middle">
        {SSK_QUESTION}
      </text>
      <g className={s.t} style={{ opacity: frame.phone === "thinking" ? 1 : 0 }}>
        <rect x="30" y="160" width="58" height="28" rx="14" fill="#f4f4f5" />
        {[0, 1, 2].map((i) => (
          <circle key={i} className={s.typing} style={{ animationDelay: `${i * 160}ms` }} cx={46 + i * 13} cy="174" r="3.5" fill="#71717a" />
        ))}
      </g>
      <g className={s.t} style={{ opacity: frame.phone === "answer" ? 1 : 0, ...at(0, frame.phone === "answer" ? 0 : 12) }}>
        <rect x="28" y="160" width="158" height="178" rx="14" fill="#f4f4f5" />
        <text fontSize="10.5" fill="#18181b">
          <tspan x="40" y="182">
            4 products are below their
          </tspan>
          <tspan x="40" dy="14">
            reorder point.
          </tspan>
        </text>
        {SSK_ANSWER.items.map((item, i) => (
          <g key={item.name}>
            <rect x="36" y={210 + i * 30} width="142" height="24" rx="7" fill="#fff" />
            <text x="44" y={226 + i * 30} fontSize="8.6" fill="#3f3f46">
              {item.name}
            </text>
            <text x="171" y={226 + i * 30} fontSize="8.6" fontWeight="700" fill="#d97706" textAnchor="end">
              {item.left} left
            </text>
          </g>
        ))}
      </g>
      <rect x="30" y="452" width="152" height="26" rx="13" fill="#fff" stroke="#e4e4e7" />
      <text x="44" y="469" fontSize="9.5" fill="#a1a1aa">
        Ask about your stock…
      </text>

      <path d={`M204 ${top(0) + H / 2} H232`} stroke={accent} strokeWidth="2" strokeDasharray="4 5" opacity="0.7" />
      {frame.layers.map((id, i) => (
        <Layer key={id} id={id} x={236} y={top(i)} w={396} h={H} frame={frame} accent={accent} big />
      ))}
      <Light x={612} y={top(active) + H / 2} accent={accent} />
      <Metric x={236} y={484} w={396} accent={accent} show={frame.showMetric} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  const H = 72;
  const top = (i: number) => 96 + i * (H + 8);
  const active = frame.layers.indexOf(frame.layer);
  const answered = frame.phone === "answer";
  return (
    <svg viewBox="0 0 360 460" className={`${s.svg} ${still ? s.still : ""}`}>
      {/* The chat, as a strip above the layers */}
      <rect x="146" y="6" width="210" height="34" rx="17" fill={accent} />
      <text x="251" y="28" fontSize="14" fontWeight="600" fill="#08090b" textAnchor="middle">
        {SSK_QUESTION}
      </text>
      <g className={s.t} style={{ opacity: frame.phone === "thinking" ? 1 : 0 }}>
        <rect x="4" y="50" width="66" height="32" rx="16" fill="rgb(255 255 255 / 0.1)" />
        {[0, 1, 2].map((i) => (
          <circle key={i} className={s.typing} style={{ animationDelay: `${i * 160}ms` }} cx={22 + i * 15} cy="66" r="4" fill="#d4d4d8" />
        ))}
      </g>
      <g className={s.t} style={{ opacity: answered ? 1 : 0, ...at(0, answered ? 0 : 8) }}>
        <rect x="4" y="50" width="300" height="34" rx="17" fill="rgb(255 255 255 / 0.1)" />
        <text x="20" y="72" fontSize="13" fill="#f5f5f7">
          {SSK_ANSWER.text}
        </text>
      </g>
      {frame.layers.map((id, i) => (
        <Layer key={id} id={id} x={4} y={top(i)} w={352} h={H} frame={frame} accent={accent} big={false} />
      ))}
      <Light x={336} y={top(active) + 22} accent={accent} />
      <Metric x={4} y={432} w={352} accent={accent} show={frame.showMetric} />
    </svg>
  );
}
