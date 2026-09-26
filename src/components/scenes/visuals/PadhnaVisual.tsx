import { memo, type CSSProperties } from "react";
import { CODE, LANGS, TS_NUMS, TS_TARGET, type Lang, type PadhnaFrame } from "@/lib/scenes/padhna";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";
import { PASS } from "./marks";

type Props = { frame: PadhnaFrame; accent: string; still?: boolean; layout?: Layout };
const fade = (on: boolean, delay = 0) => ({ opacity: on ? 1 : 0, transitionDelay: on ? `${delay}ms` : "0ms" }) as CSSProperties;
/** Every language puts the same work on the same line. */
const LINE = { need: 3, check: 4, found: 5, remember: 6 } as const;

/**
 * "Watch it think": the editor, its tab moving from Java to Python to C++,
 * lights the lines each step runs, while the array and the hash map below
 * change with it. All three listings are drawn once and only fade; the
 * highlight bars (no text) are what move.
 */
export function PadhnaVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

type Geo = { x: number; y: number; w: number; lh: number; size: number; tabW: number };

const Listing = memo(function Listing({ lang, on, g }: { lang: Lang; on: boolean; g: Geo }) {
  return (
    <g className={s.t} style={fade(on)}>
      {CODE[lang].map((line, i) => (
        <g key={i}>
          <text x={g.x + 24} y={g.y + 58 + i * g.lh} fontSize={g.size * 0.85} className={s.mono} fill="#52525b" textAnchor="end">
            {i + 1}
          </text>
          <text x={g.x + 34} y={g.y + 58 + i * g.lh} fontSize={g.size} className={s.mono} fill={line.tag ? "#e4e4e7" : "#a1a1aa"} style={{ whiteSpace: "pre" }}>
            {line.text}
          </text>
        </g>
      ))}
    </g>
  );
});

function Editor({ frame, g, accent }: { frame: PadhnaFrame; g: Geo; accent: string }) {
  const h = 66 + 10 * g.lh;
  const second = frame.lit.includes("found") ? LINE.found : LINE.remember;
  const bar = (line: number, tone: string, delay: number) => (
    <rect className={s.t} x={g.x + 6} y={g.y + 58 - g.lh * 0.72} width={g.w - 12} height={g.lh} rx="5" fill={tone} style={{ transform: `translateY(${line * g.lh}px)`, transitionDelay: `${delay}ms` }} />
  );
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.w} height={h} rx="14" fill="#0b0c0e" stroke="rgb(255 255 255 / 0.1)" />
      {LANGS.map((lang, i) => {
        const on = lang === frame.lang;
        return (
          <g key={lang}>
            <rect className={s.t} x={g.x + 8 + i * (g.tabW + 6)} y={g.y + 8} width={g.tabW} height={g.size * 1.9} rx={g.size * 0.95} fill={on ? `${accent}26` : "rgb(255 255 255 / 0.04)"} stroke={on ? `${accent}99` : "none"} />
            <text className={s.t} x={g.x + 8 + i * (g.tabW + 6) + g.tabW / 2} y={g.y + 8 + g.size * 1.3} fontSize={g.size * 0.9} fontWeight="600" textAnchor="middle" fill={on ? "#fef9c3" : "#71717a"}>
              {lang}
            </text>
          </g>
        );
      })}
      {bar(LINE.check, "rgb(255 255 255 / 0.07)", 0)}
      {bar(second, frame.lit.includes("found") ? "rgb(52 211 153 / 0.18)" : `${accent}24`, 120)}
      {LANGS.map((lang) => (
        <Listing key={lang} lang={lang} on={lang === frame.lang} g={g} />
      ))}
    </g>
  );
}

/** The array, the current index, and the answer pair once found. */
function Cells({ frame, x, y, cw, ch, size, accent }: { frame: PadhnaFrame; x: number; y: number; cw: number; ch: number; size: number; accent: string }) {
  const { index, found } = frame.algo;
  return (
    <g>
      {TS_NUMS.map((n, i) => {
        const answer = found?.includes(i);
        const current = i === index;
        const cx = x + i * (cw + 8);
        return (
          <g key={i}>
            <rect
              className={s.t}
              x={cx}
              y={y}
              width={cw}
              height={ch}
              rx="12"
              fill={answer ? "rgb(52 211 153 / 0.18)" : current ? `${accent}26` : "rgb(255 255 255 / 0.05)"}
              stroke={answer ? PASS : current ? accent : "rgb(255 255 255 / 0.1)"}
              strokeWidth={answer || current ? 2 : 1}
            />
            <text className={`${s.t} ${s.mono}`} x={cx + cw / 2} y={y + ch / 2 + size * 0.4} fontSize={size * 1.3} fontWeight="600" textAnchor="middle" fill={i < index && !answer ? "#71717a" : "#f5f5f7"}>
              {n}
            </text>
            <text x={cx + cw / 2} y={y + ch + size * 1.3} fontSize={size * 0.8} textAnchor="middle" className={s.mono} fill="#71717a">
              {i}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/**
 * The hash map: value: index, one slot per element seen. Slots are fixed
 * (each value appears once), so a step only shows, marks or lights one.
 */
function Seen({ frame, x, y, w, size, accent }: { frame: PadhnaFrame; x: number; y: number; w: number; size: number; accent: string }) {
  const { seen, found, need, index } = frame.algo;
  const slots = TS_NUMS.length - 1;
  const sw = (w - (slots - 1) * 6) / slots;
  return (
    <g>
      <text x={x} y={y} fontSize={size * 0.85} fill="#86868b">
        seen (value: index)
      </text>
      {Array.from({ length: slots }, (_, k) => {
        const had = k < seen.length;
        const added = !found && k === index;
        const hit = found && TS_NUMS[k] === need;
        return (
          <g key={k} className={s.t} style={fade(had || added, added ? 260 : 0)}>
            <rect className={s.t} x={x + k * (sw + 6)} y={y + size * 0.7} width={sw} height={size * 2.3} rx={size * 0.6} fill={hit ? "rgb(52 211 153 / 0.2)" : added ? `${accent}2e` : "rgb(255 255 255 / 0.06)"} stroke={hit ? PASS : added ? accent : "none"} />
            <text x={x + k * (sw + 6) + sw / 2} y={y + size * 2.25} fontSize={size * 0.95} textAnchor="middle" className={s.mono} fill="#f5f5f7">
              {TS_NUMS[k]}: {k}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** need = target - value, and the answer when it comes. */
function Need({ frame, x, y, size }: { frame: PadhnaFrame; x: number; y: number; size: number }) {
  const { value, need, found } = frame.algo;
  return (
    <g>
      <text x={x} y={y} fontSize={size} className={s.mono} fill="#e4e4e7">
        need = {TS_TARGET} - {value} = <tspan fill="#fef08a">{need}</tspan>
      </text>
      <g className={s.t} style={fade(Boolean(found), 300)}>
        <text x={x} y={y + size * 1.9} fontSize={size} fontWeight="650" className={s.mono} fill={PASS}>
          return [{found?.join(", ") ?? ""}]
        </text>
      </g>
    </g>
  );
}

function Wide({ frame, accent, still }: Props) {
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <Editor frame={frame} g={{ x: 16, y: 12, w: 608, lh: 21, size: 13, tabW: 84 }} accent={accent} />
      <Cells frame={frame} x={16} y={326} cw={62} ch={56} size={13} accent={accent} />
      <Need frame={frame} x={16} y={440} size={14} />
      <Seen frame={frame} x={384} y={338} w={240} size={13} accent={accent} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <Editor frame={frame} g={{ x: 4, y: 0, w: 352, lh: 18.5, size: 10.2, tabW: 70 }} accent={accent} />
      <Cells frame={frame} x={4} y={266} cw={64} ch={48} size={12.5} accent={accent} />
      <Seen frame={frame} x={4} y={360} w={352} size={12} accent={accent} />
      <Need frame={frame} x={4} y={436} size={13} />
    </svg>
  );
}
