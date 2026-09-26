import { memo, type CSSProperties, type ReactNode } from "react";
import { URL_CHECKS, URL_CODE, URL_DESTINATION, URL_ID, URL_ROWS, URL_SEQUENCE, type UrlCheck, type UrlFrame } from "@/lib/scenes/url";
import { Later } from "../IdleDraw";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";
import { FAIL, Mark, PASS } from "./marks";

type Props = { frame: UrlFrame; accent: string; still?: boolean; layout?: Layout };
/*
 * Panels fade rather than slide: moving an SVG group re-lays out every line
 * of text in it on each frame, and this drawing is mostly text. Each panel
 * only re-renders when its own `on` changes.
 */
const fade = (on: boolean, delay = 0) => ({ opacity: on ? 1 : 0, transitionDelay: on ? `${delay}ms` : "0ms" }) as CSSProperties;

/**
 * "39134 → abc": long division by 62 spells the code; the code redirects; an
 * alias that shadows the next code bumps the sequence; then a destination
 * goes through the SSRF checks and is refused. Wide: the division stays
 * beside the right-hand story. Tall: the division, then — once it has made
 * its point — a one-line reminder above each later panel.
 */
export function UrlVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

/** The division, one row per digit, and the code it spells; rows dim once the story moves on. */
const Division = memo(function Division({ lead, x, y, accent, size }: { lead: boolean; x: number; y: number; accent: string; size: number }) {
  return (
    <g>
      <text x={x} y={y} fontSize={size * 0.8} fill="#86868b">
        Row id
      </text>
      <text x={x} y={y + size * 2} fontSize={size * 2} fontWeight="650" className={s.mono} fill="#f5f5f7">
        {URL_ID}
      </text>
      {URL_ROWS.map((r, i) => (
        <g key={r.n} className={s.t} style={{ opacity: lead ? 1 : 0.55 }}>
          <text x={x} y={y + size * (3.6 + i * 1.7)} fontSize={size} className={s.mono} fill="#a1a1a6">
            {r.n} ÷ 62 = {r.quotient} r <tspan fill="#f5f5f7">{r.remainder}</tspan>
          </text>
          <text x={x + size * 14} y={y + size * (3.6 + i * 1.7)} fontSize={size} className={s.mono} fill={accent}>
            → {r.char}
          </text>
        </g>
      ))}
      <text x={x} y={y + size * 9.8} fontSize={size * 0.8} fill="#86868b">
        Code, most significant digit first
      </text>
      <text x={x} y={y + size * 12.4} fontSize={size * 2.6} fontWeight="650" className={s.mono} fill={accent} letterSpacing="4">
        {URL_CODE}
      </text>
    </g>
  );
});

const Redirect = memo(function Redirect({ on, x, y, w, size }: { on: boolean; x: number; y: number; w: number; size: number }) {
  return (
    <g className={s.t} style={fade(on)}>
      <rect x={x} y={y} width={w} height={size * 12.5} rx="14" fill="#0b0c0e" stroke="rgb(255 255 255 / 0.1)" />
      <text x={x + 16} y={y + size * 2.7} fontSize={size * 1.1} className={s.mono} fill="#f5f5f7">
        GET /{URL_CODE}
      </text>
      <text x={x + 16} y={y + size * 5.2} fontSize={size * 1.1} className={s.mono} fill={PASS}>
        301 Moved Permanently
      </text>
      <text x={x + 16} y={y + size * 7.5} fontSize={size * 0.95} className={s.mono} fill="#a1a1a6">
        Location:
      </text>
      <text x={x + 16} y={y + size * 9.2} fontSize={size * 0.95} className={s.mono} fill="#bae6fd">
        {URL_DESTINATION}
      </text>
      <text x={x + 16} y={y + size * 11.3} fontSize={size * 0.875} fill="#86868b">
        Browsers cache it: the mapping never changes
      </text>
    </g>
  );
});

/** Row id → code for the link, the alias, and the next generated one. Always drawn; shown at the alias step. */
const Sequence = memo(function Sequence({ on, x, y, w, accent }: { on: boolean; x: number; y: number; w: number; accent: string }) {
  const a = URL_SEQUENCE;
  const col = (w - 16) / 3;
  const cell = (i: number, id: number, code: string, tag: string, tone: "link" | "alias" | "next") => (
    <g key={id} className={s.t} style={fade(on, i * 90)}>
      <rect x={x + i * (col + 8)} y={y} width={col} height="92" rx="12" fill={tone === "alias" ? "rgb(251 191 36 / 0.12)" : tone === "next" ? `${accent}1f` : "rgb(255 255 255 / 0.05)"} stroke={tone === "next" ? accent : "rgb(255 255 255 / 0.1)"} />
      <text x={x + i * (col + 8) + 12} y={y + 24} fontSize="11" className={s.mono} fill="#86868b">
        id {id}
      </text>
      <text x={x + i * (col + 8) + 12} y={y + 56} fontSize="22" fontWeight="650" className={s.mono} fill={tone === "alias" ? "#fde68a" : tone === "next" ? accent : "#f5f5f7"}>
        {code}
      </text>
      <text x={x + i * (col + 8) + 12} y={y + 78} fontSize="10" fill="#a1a1a6">
        {tag}
      </text>
    </g>
  );
  return (
    <g>
      {cell(0, URL_ID, URL_CODE, "generated", "link")}
      {cell(1, a.id, a.code, "custom alias", "alias")}
      {cell(2, a.nextId, a.nextCode, "next generated", "next")}
      <g className={s.t} style={fade(on, 300)}>
        <path d={`M${x + col / 2} ${y + 110} C ${x + col / 2} ${y + 140}, ${x + 2 * (col + 8) + col / 2} ${y + 140}, ${x + 2 * (col + 8) + col / 2} ${y + 104}`} fill="none" stroke={accent} strokeWidth="2" strokeDasharray="4 5" />
        <text x={x + w / 2} y={y + 160} fontSize="10.5" textAnchor="middle" fill="#a1a1a6">
          the sequence skips the alias
        </text>
      </g>
    </g>
  );
});

/**
 * One destination and each check it passed or failed, detail under the
 * label. A DNS check lists every answer, so the one private address is
 * visible next to the public one. Always drawn (new SVG text mid-scroll is a
 * slow layout); shown when it's the frame's check, rows ticking in.
 */
const Checks = memo(function Checks({ check: c, on, x, y, w, size }: { check: UrlCheck; on: boolean; x: number; y: number; w: number; size: number }) {
  const rowH = size * 3.4;
  const fit = (text: string) => {
    const max = Math.floor((w - 28) / (size * 0.52));
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  };
  const answersFor = (label: string) => (label === "DNS" ? c.answers : null);
  // Each row's top; a DNS row grows by a line per extra answer. The last entry is where the verdict goes.
  const tops = [y + 54];
  for (const check of c.verdict.checks) tops.push(tops.at(-1)! + rowH + Math.max(0, (answersFor(check.label)?.length ?? 1) - 1) * size * 1.5);
  const verdictTop = tops.at(-1)!;
  // Icons (no text) pop in turn; the verdict fades in after them.
  const tick = (i: number) => ({ opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.6})`, transitionDelay: on ? `${120 + i * 80}ms` : "0ms" }) as CSSProperties;
  return (
    <g className={s.t} style={{ opacity: on ? 1 : 0 }}>
      <rect x={x} y={y} width={w} height="36" rx="10" fill="rgb(255 255 255 / 0.06)" />
      <text x={x + 14} y={y + 23} fontSize={size} className={s.mono} fill="#e4e4e7">
        {c.url}
      </text>
      {c.verdict.checks.map((check, i) => {
        const answers = answersFor(check.label);
        const rowTop = tops[i];
        return (
          <g key={check.label}>
            <g className={s.pop} style={tick(i)}>
              <Mark x={x + 10} y={rowTop + 6} ok={check.pass} />
            </g>
            <text x={x + 28} y={rowTop + 10} fontSize={size} fontWeight="600" fill="#e4e4e7">
              {check.label}
            </text>
            {answers ? (
              answers.map((a, k) => (
                <text key={a.ip} x={x + 28} y={rowTop + 10 + size * 1.5 * (k + 1)} fontSize={size * 0.9} fill={a.blocked ? FAIL : "#a1a1a6"}>
                  <tspan className={s.mono}>{a.ip}</tspan> · {a.blocked ?? "public"}
                </text>
              ))
            ) : (
              <text x={x + 28} y={rowTop + 10 + size * 1.5} fontSize={size * 0.9} fill={check.pass ? "#a1a1a6" : FAIL}>
                {fit(check.detail)}
              </text>
            )}
          </g>
        );
      })}
      <g className={s.t} style={fade(on, 120 + c.verdict.checks.length * 80)}>
        <rect x={x} y={verdictTop + 2} width="92" height="26" rx="13" fill={c.verdict.accepted ? "rgb(52 211 153 / 0.2)" : "rgb(251 113 133 / 0.22)"} />
        <text x={x + 46} y={verdictTop + 19} fontSize="11" fontWeight="700" textAnchor="middle" fill={c.verdict.accepted ? PASS : FAIL}>
          {c.verdict.accepted ? "Accepted" : "Refused"}
        </text>
      </g>
    </g>
  );
});

/**
 * A panel for a later step. Live, it's drawn in an idle moment (or when its
 * step comes), so the stage's first render is only what step 0 shows; a
 * static frame draws only the panels it shows.
 */
function part(on: boolean, still: boolean | undefined, node: ReactNode) {
  if (still) return on ? node : null;
  return <Later now={on}>{node}</Later>;
}

/** Both destinations' checks, in the same place; the frame's one shows. */
function AllChecks({ frame, still, x, y, w, size }: { frame: UrlFrame; still?: boolean; x: number; y: number; w: number; size: number }) {
  return (
    <>
      {URL_CHECKS.map((c) => (
        <g key={c.url}>{part(frame.check === c, still, <Checks check={c} on={frame.check === c} x={x} y={y} w={w} size={size} />)}</g>
      ))}
    </>
  );
}

function Wide({ frame, accent, still }: Props) {
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <Division lead={frame.step === 0} x={16} y={150} accent={accent} size={17} />
      {part(frame.redirect, still, <Redirect on={frame.redirect} x={330} y={180} w={294} size={12} />)}
      {part(frame.alias !== null, still, <Sequence on={frame.alias !== null} x={330} y={170} w={294} accent={accent} />)}
      <AllChecks frame={frame} still={still} x={330} y={100} w={294} size={12} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  const lead = frame.step === 0;
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <g className={s.t} style={fade(lead)}>
        <Division lead x={16} y={110} accent={accent} size={16} />
      </g>
      {/* Once the division has made its point: the id and its code, as a reminder. */}
      <g className={s.t} style={fade(!lead, 200)}>
        <text x="4" y="16" fontSize="11" fill="#86868b">
          Row id → code
        </text>
        <text x="4" y="44" fontSize="24" fontWeight="650" className={s.mono} fill="#f5f5f7">
          {URL_ID} <tspan fill="#86868b">→</tspan> <tspan fill={accent}>{URL_CODE}</tspan>
        </text>
      </g>
      {part(frame.redirect, still, <Redirect on={frame.redirect} x={4} y={120} w={352} size={13} />)}
      {part(frame.alias !== null, still, <Sequence on={frame.alias !== null} x={4} y={130} w={352} accent={accent} />)}
      <AllChecks frame={frame} still={still} x={4} y={76} w={352} size={13} />
    </svg>
  );
}
