import type { CSSProperties } from "react";
import { SKIN_STEPS } from "@/content/skintellect-pipeline";
import type { SkinFrame } from "@/lib/scenes/skintellect";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";

type Props = { frame: SkinFrame; accent: string; still?: boolean; layout?: Layout };
const show = (on: boolean, dy = 10) => ({ opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : dy}px)` }) as CSSProperties;

/**
 * "Photo to routine": an abstract face in a viewfinder; detection boxes; a
 * classified condition (a placeholder, never a named diagnosis); product
 * tiles; a short piece of advice. Output is drawn as placeholders — the
 * scene shows the pipeline's order, not a result.
 */
export function SkinVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

/** The viewfinder and face in a w × h box at (x, y). */
function Face({ x, y, w, h, frame, accent }: { x: number; y: number; w: number; h: number; frame: SkinFrame; accent: string }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w * 0.27;
  // A face's proportions, however tall the viewfinder.
  const ry = Math.min(h * 0.34, rx * 1.35);
  const corner = (px: number, py: number, dx: number, dy: number) => <path d={`M${px} ${py + dy * 18} V${py} H${px + dx * 18}`} fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="2.5" strokeLinecap="round" />;
  const box = (bx: number, by: number, bw: number, bh: number, color: string, delay: number) => (
    <rect className={s.pop} x={bx} y={by} width={bw} height={bh} rx="4" fill="none" stroke={color} strokeWidth="2" strokeDasharray="5 4" style={{ opacity: frame.boxes ? 1 : 0, transform: `scale(${frame.boxes ? 1 : 1.4})`, transitionDelay: `${delay}ms` }} />
  );
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="22" fill="#141016" />
      {corner(x + 20, y + 20, 1, 1)}
      {corner(x + w - 20, y + 20, -1, 1)}
      {corner(x + 20, y + h - 20, 1, -1)}
      {corner(x + w - 20, y + h - 20, -1, -1)}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`${accent}14`} stroke={`${accent}99`} strokeWidth="1.6" />
      <path d={`M${cx - rx * 0.42} ${cy - ry * 0.18} q ${rx * 0.12} -${ry * 0.07} ${rx * 0.24} 0 M${cx + rx * 0.18} ${cy - ry * 0.18} q ${rx * 0.12} -${ry * 0.07} ${rx * 0.24} 0`} fill="none" stroke={`${accent}cc`} strokeWidth="1.6" strokeLinecap="round" />
      <path d={`M${cx - rx * 0.22} ${cy + ry * 0.42} q ${rx * 0.22} ${ry * 0.12} ${rx * 0.44} 0`} fill="none" stroke={`${accent}cc`} strokeWidth="1.6" strokeLinecap="round" />
      {/* While detecting: a scan line passes over the face. */}
      {frame.step === 1 && (
        <g className={s.scan} style={{ "--scan-h": `${ry * 2}px` } as CSSProperties}>
          <rect x={cx - rx - 16} y={cy - ry - 1} width={rx * 2 + 32} height="2" rx="1" fill={accent} opacity="0.7" />
        </g>
      )}
      {box(cx - rx * 0.78, cy + ry * 0.02, rx * 0.46, ry * 0.3, accent, 0)}
      {box(cx + rx * 0.2, cy - ry * 0.66, rx * 0.4, ry * 0.26, "#fbbf24", 120)}
    </g>
  );
}

function Pipeline({ x, y, w, frame, accent, vertical }: { x: number; y: number; w: number; frame: SkinFrame; accent: string; vertical: boolean }) {
  return (
    <g>
      {SKIN_STEPS.map((st, i) => {
        const on = i === frame.step;
        const done = i < frame.step;
        const gx = vertical ? x : x + i * ((w + 6) / 5);
        const gy = vertical ? y + i * 46 : y;
        const gw = vertical ? w : (w + 6) / 5 - 6;
        return (
          <g key={st.title}>
            <rect className={s.t} x={gx} y={gy} width={gw} height={vertical ? 38 : 34} rx="10" fill={on ? accent : done ? `${accent}2e` : "rgb(255 255 255 / 0.05)"} />
            <text x={gx + (vertical ? 14 : gw / 2)} y={gy + (vertical ? 24 : 21.5)} fontSize="12.5" fontWeight="600" textAnchor={vertical ? "start" : "middle"} fill={on ? "#08090b" : done ? "#f5f5f7" : "#86868b"}>
              {vertical ? `${String(i + 1).padStart(2, "0")}  ${st.title}` : st.title}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Classification (a placeholder bar, not a name), products, and advice. */
function Output({ x, y, w, frame, accent }: { x: number; y: number; w: number; frame: SkinFrame; accent: string }) {
  const tiles = ["Cleanse", "Treat", "Protect"];
  const tw = (w - 16) / 3;
  return (
    <g>
      <g className={s.t} style={show(frame.classified)}>
        <text x={x} y={y + 12} fontSize="11" fill="#a1a1a6">
          Condition
        </text>
        <rect x={x + 76} y={y + 2} width={w * 0.44} height="14" rx="7" fill={`${accent}55`} />
      </g>
      {tiles.map((t, i) => (
        <g key={t} className={s.pop} style={{ ...show(frame.products, 16), transitionDelay: `${i * 90}ms` }}>
          <rect x={x + i * (tw + 8)} y={y + 30} width={tw} height="74" rx="12" fill="rgb(255 255 255 / 0.06)" />
          <rect x={x + i * (tw + 8) + 12} y={y + 42} width="20" height="28" rx="6" fill={`${accent}66`} />
          <text x={x + i * (tw + 8) + 12} y={y + 92} fontSize="11" fontWeight="600" fill="#e4e4e7">
            {t}
          </text>
        </g>
      ))}
      <g className={s.t} style={show(frame.advice)}>
        <rect x={x} y={y + 118} width={w} height="84" rx="14" fill="rgb(255 255 255 / 0.08)" />
        {[0.92, 0.84, 0.6].map((f, i) => (
          <rect key={i} x={x + 14} y={y + 134 + i * 16} width={(w - 28) * f} height="8" rx="4" fill="rgb(255 255 255 / 0.22)" />
        ))}
        <text x={x + w - 14} y={y + 192} fontSize="10" textAnchor="end" fill={accent}>
          under 50 words
        </text>
      </g>
    </g>
  );
}

function Wide({ frame, accent, still }: Props) {
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <Face x={8} y={20} w={300} h={452} frame={frame} accent={accent} />
      <Pipeline x={332} y={20} w={292} frame={frame} accent={accent} vertical />
      <Output x={332} y={270} w={292} frame={frame} accent={accent} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <Face x={60} y={0} w={240} h={214} frame={frame} accent={accent} />
      <Pipeline x={4} y={228} w={352} frame={frame} accent={accent} vertical={false} />
      <Output x={4} y={274} w={352} frame={frame} accent={accent} />
    </svg>
  );
}
