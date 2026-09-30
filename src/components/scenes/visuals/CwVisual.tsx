import type { CSSProperties, ReactNode } from "react";
import { EXTENSION, N01_2026 } from "@/content/compliancewatch/documents";
import { SOURCES } from "@/content/compliancewatch/system";
import { CW_BUSINESSES, CW_MESSAGE_LINES, CW_QUOTE, CW_STAGES, type CwFrame, type CwStage } from "@/lib/scenes/compliancewatch";
import { Later } from "../IdleDraw";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";
import { Mark } from "./marks";

type Props = { frame: CwFrame; accent: string; still?: boolean; layout?: Layout };
type Box = { x: number; y: number; w: number; size: number };

const FG = "#f5f5f7";
const MUTED = "#a1a1a6";
const DIM = "#86868b";
const CARD = "rgb(255 255 255 / 0.04)";
const EDGE = "rgb(255 255 255 / 0.1)";
const at = (x: number, y: number) => ({ transform: `translate(${x}px, ${y}px)` }) as CSSProperties;

const STATION: Record<CwStage, { label: string; service: string }> = {
  watch: { label: "Watch", service: "pipeline" },
  read: { label: "Read", service: "pipeline" },
  extract: { label: "Extract", service: "pipeline · llm-gateway" },
  approve: { label: "Approve", service: "rulebook" },
  decide: { label: "Decide", service: "applicability-engine" },
  date: { label: "Date", service: "obligation" },
  remind: { label: "Remind", service: "notification" },
};

/**
 * "One notification, all the way to one phone": a rail of the seven
 * stations, a light at the one the step has reached, and beside it what
 * happens there to notification 01/2026. Wide: the rail down the left.
 * Tall: the rail across the top. Panels hold text, so they fade (see README).
 */
export function CwVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

function Card({ x, y, w, h, children, strong }: { x: number; y: number; w: number; h: number; children?: ReactNode; strong?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="14" fill={CARD} stroke={strong ?? EDGE} />
      {children}
    </g>
  );
}

function Chip({ x, y, label, tone, size }: { x: number; y: number; label: string; tone: string; size: number }) {
  const w = label.length * size * 0.56 + size * 1.6;
  return (
    <g>
      <rect x={x} y={y} width={w} height={size * 1.9} rx={size * 0.95} fill={`${tone}24`} stroke={`${tone}66`} />
      <text x={x + w / 2} y={y + size * 1.28} fontSize={size * 0.86} fontWeight="600" textAnchor="middle" fill={tone}>
        {label}
      </text>
    </g>
  );
}

/* ── The panels, one per station ───────────────────────────────────────── */

function Watch({ x, y, w, size, accent }: Box & { accent: string }) {
  const row = size * 3.2;
  return (
    <g>
      <text x={x} y={y + size} fontSize={size * 0.85} fontWeight="600" fill={DIM} letterSpacing="0.06em">
        SOURCES, POLLED
      </text>
      {SOURCES.map((src, i) => {
        const top = y + size * 1.8 + i * row;
        const hot = i === 0;
        return (
          <g key={src.id}>
            <rect x={x} y={top} width={w} height={row - 6} rx="10" fill={hot ? `${accent}14` : CARD} stroke={hot ? `${accent}88` : EDGE} />
            <circle cx={x + 16} cy={top + (row - 6) / 2} r="4" fill={hot ? accent : "#52525b"} />
            <text x={x + 30} y={top + (row - 6) / 2 + size * 0.36} fontSize={size} fill={hot ? FG : MUTED}>
              {src.name}
            </text>
            {hot && (
              <text x={x + w - 14} y={top + (row - 6) / 2 + size * 0.36} fontSize={size * 0.8} fontWeight="700" textAnchor="end" fill={accent}>
                NEW
              </text>
            )}
          </g>
        );
      })}
      <Card x={x} y={y + size * 1.8 + 5 * row + 8} w={w} h={size * 7.2} strong={`${accent}66`}>
        <text x={x + 16} y={y + size * 1.8 + 5 * row + 8 + size * 2} fontSize={size * 1.1} fontWeight="700" className={s.mono} fill={FG}>
          {N01_2026.ref}
        </text>
        <text x={x + 16} y={y + size * 1.8 + 5 * row + 8 + size * 3.6} fontSize={size * 0.85} fill={MUTED}>
          Seeks to extends the due date for furnishing the
        </text>
        <text x={x + 16} y={y + size * 1.8 + 5 * row + 8 + size * 4.8} fontSize={size * 0.85} fill={MUTED}>
          return in FORM GSTR-3B for the month of March, 2026…
        </text>
        <text x={x + 16} y={y + size * 1.8 + 5 * row + 8 + size * 6.3} fontSize={size * 0.78} className={s.mono} fill={DIM}>
          sha256 51f5dbee…62bcebed · kept, never overwritten
        </text>
      </Card>
    </g>
  );
}

function Read({ x, y, w, size, accent }: Box & { accent: string }) {
  const clauses = N01_2026.clauses;
  const lineH = size * 1.45;
  const hot = (ref: string) => ref === EXTENSION.clause.ref;
  // Each clause's row: the operative one opens to three lines of its text.
  const tops = clauses.map((_, i) => clauses.slice(0, i).reduce((t, c) => t + (hot(c.ref) ? lineH * 4.4 : lineH * 1.35), y + size * 5.2));
  return (
    <g>
      <Card x={x} y={y} w={w} h={size * 22.5}>
        <text x={x + 16} y={y + size * 1.7} fontSize={size * 0.72} fontWeight="600" fill={DIM} letterSpacing="0.05em">
          CENTRAL BOARD OF INDIRECT TAXES AND CUSTOMS
        </text>
        <text x={x + 16} y={y + size * 3.1} fontSize={size * 1.02} fontWeight="700" fill={FG}>
          NOTIFICATION No. 01/2026 – Central Tax
        </text>
        {clauses.map((c, i) => {
          const rowTop = tops[i];
          return (
            <g key={c.ref}>
              <text x={x + 16} y={rowTop + size * 0.9} fontSize={size * 0.8} className={s.mono} fill={hot(c.ref) ? accent : DIM}>
                {c.ref}
              </text>
              {hot(c.ref) ? (
                <text fontSize={size * 0.86} fill={FG}>
                  <tspan x={x + 70} y={rowTop + size * 0.9}>
                    …hereby extends the due date for furnishing
                  </tspan>
                  <tspan x={x + 70} dy={lineH}>
                    the return in FORM GSTR-3B for the month of
                  </tspan>
                  <tspan x={x + 70} dy={lineH}>
                    March, 2026{" "}
                    <tspan fill={accent} fontWeight="600">
                      {CW_QUOTE}
                    </tspan>
                    , …
                  </tspan>
                </text>
              ) : (
                <rect x={x + 70} y={rowTop + size * 0.3} width={(w - 90) * (0.35 + ((c.text.length * 7) % 50) / 100)} height={size * 0.62} rx={size * 0.31} fill="rgb(255 255 255 / 0.1)" />
              )}
            </g>
          );
        })}
      </Card>
      <text x={x} y={y + size * 24.6} fontSize={size * 0.85} fontWeight="600" fill={DIM} letterSpacing="0.06em">
        THE DETECTOR, BY RULE
      </text>
      <Chip x={x} y={y + size * 25.6} label="notification" tone={accent} size={size} />
      <Chip x={x + size * 9.6} y={y + size * 25.6} label="extension" tone="#6ee7b7" size={size} />
      <Chip x={x + size * 17.8} y={y + size * 25.6} label="language: en" tone={MUTED} size={size} />
    </g>
  );
}

function Checks({ x, y, w, size, rows }: Box & { rows: [string, string][] }) {
  return (
    <g>
      {rows.map(([title, detail], i) => {
        const top = y + i * size * 3.3;
        return (
          <g key={title}>
            <Mark x={x + 10} y={top + size * 0.9} ok r={8} />
            <text x={x + 28} y={top + size * 1.2} fontSize={size} fontWeight="600" fill={FG}>
              {title}
            </text>
            <text x={x + 28} y={top + size * 2.45} fontSize={size * 0.8} className={s.mono} fill={MUTED}>
              {detail.length > w / (size * 0.5) ? `${detail.slice(0, Math.floor(w / (size * 0.5)) - 1)}…` : detail}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Extract({ x, y, w, size, accent }: Box & { accent: string }) {
  const fields: [string, string][] = [
    ["relation", EXTENSION.relation],
    ["rule", EXTENSION.ruleKey],
    ["form", EXTENSION.form],
    ["period", EXTENSION.period],
    ["new due date", EXTENSION.newDue],
  ];
  return (
    <g>
      <Card x={x} y={y} w={w} h={size * 10.6} strong={`${accent}55`}>
        <text x={x + 16} y={y + size * 1.8} fontSize={size * 0.85} fontWeight="600" fill={DIM} letterSpacing="0.06em">
          RULE CANDIDATE, FROM ONE GATEWAY CALL
        </text>
        {fields.map(([k, v], i) => (
          <g key={k}>
            <text x={x + 16} y={y + size * (3.6 + i * 1.5)} fontSize={size * 0.86} fill={MUTED}>
              {k}
            </text>
            <text x={x + 16 + size * 7.2} y={y + size * (3.6 + i * 1.5)} fontSize={size * 0.9} className={s.mono} fontWeight="600" fill={FG}>
              {v}
            </text>
          </g>
        ))}
      </Card>
      <text x={x} y={y + size * 12.9} fontSize={size * 0.85} fontWeight="600" fill={DIM} letterSpacing="0.06em">
        DETERMINISTIC VALIDATORS
      </text>
      <Checks
        x={x}
        y={y + size * 13.8}
        w={w}
        size={size}
        rows={[
          ["The clause exists", `${N01_2026.ref} · ${EXTENSION.clause.ref}`],
          ["The quote is in it", `“${CW_QUOTE}”`],
          ["The date is written in it", `twenty -first day of April, 2026 = ${EXTENSION.newDue}`],
          ["Then to an analyst", "nothing publishes on a model's word"],
        ]}
      />
    </g>
  );
}

function Approve({ x, y, w, size, accent }: Box & { accent: string }) {
  const states = ["Draft", "In review", "Approved", "Published"];
  const step = (w - 20) / states.length;
  return (
    <g>
      {states.map((st, i) => (
        <g key={st}>
          {i > 0 && <line x1={x + i * step - step / 2 + 22} x2={x + i * step + 2} y1={y + size * 1.2} y2={y + size * 1.2} stroke={`${accent}66`} strokeWidth="2" />}
          <rect x={x + i * step} y={y} width={step - 18} height={size * 2.4} rx={size * 1.2} fill={i === 3 ? accent : `${accent}22`} />
          <text x={x + i * step + (step - 18) / 2} y={y + size * 1.6} fontSize={size * 0.82} fontWeight="700" textAnchor="middle" fill={i === 3 ? "#08090b" : FG}>
            {st}
          </text>
        </g>
      ))}
      <Card x={x} y={y + size * 4} w={w} h={size * 8.4}>
        <text x={x + 16} y={y + size * 5.8} fontSize={size * 0.85} fontWeight="600" fill={DIM} letterSpacing="0.06em">
          HIGH IMPACT: TWO DIFFERENT APPROVERS
        </text>
        {[0, 1].map((i) => (
          <g key={i}>
            <circle cx={x + 34 + i * size * 11} cy={y + size * 8.6} r={size * 1.35} fill="rgb(255 255 255 / 0.08)" stroke={EDGE} />
            <text x={x + 34 + i * size * 11} y={y + size * 9} fontSize={size * 0.95} fontWeight="700" textAnchor="middle" fill={FG}>
              {i === 0 ? "A1" : "A2"}
            </text>
            <Mark x={x + 34 + i * size * 11 + size * 1.3} y={y + size * 7.5} ok r={7} />
            <text x={x + 34 + i * size * 11 + size * 2.2} y={y + size * 9} fontSize={size * 0.85} fill={MUTED}>
              Analyst {i + 1}
            </text>
          </g>
        ))}
        <text x={x + 16} y={y + size * 11.2} fontSize={size * 0.8} className={s.mono} fill={MUTED}>
          citation en.p3 · match 1.00 · verified
        </text>
      </Card>
      <text x={x} y={y + size * 14.6} fontSize={size * 0.85} fontWeight="600" fill={DIM} letterSpacing="0.06em">
        ONE TRANSACTION: THE RULE, AND ITS EVENT
      </text>
      <Card x={x} y={y + size * 15.5} w={w} h={size * 6.6} strong={`${accent}55`}>
        <text x={x + 16} y={y + size * 17.5} fontSize={size * 0.98} fontWeight="700" className={s.mono} fill={accent}>
          rule.deadline_changed
        </text>
        <text x={x + 16} y={y + size * 19.2} fontSize={size * 0.8} className={s.mono} fill={MUTED}>
          period_label &quot;{EXTENSION.period}&quot; · new_due_on &quot;{EXTENSION.newDue}&quot;
        </text>
        <text x={x + 16} y={y + size * 20.7} fontSize={size * 0.8} className={s.mono} fill={DIM}>
          outbox → Kafka, relayed after the commit
        </text>
      </Card>
    </g>
  );
}

/** The two businesses one above the other, so each predicate reads in full. */
function Decide({ x, y, w, size, accent }: Box & { accent: string }) {
  const cardH = size * 11.4;
  return (
    <g>
      <text x={x} y={y + size} fontSize={size * 0.85} fontWeight="600" fill={DIM} letterSpacing="0.06em">
        gstr3b_monthly · FILE FORM GSTR-3B EVERY MONTH
      </text>
      {CW_BUSINESSES.map((b, i) => {
        const bx = x;
        const by = y + size * 2 + i * (cardH + 12);
        const applies = b.verdict === "applies";
        return (
          <g key={b.name}>
            <Card x={bx} y={by} w={w} h={cardH} strong={applies ? `${accent}88` : undefined}>
              <text x={bx + 16} y={by + size * 2} fontSize={size * 1.12} fontWeight="700" fill={FG}>
                {b.name}
              </text>
              <text x={bx + 16} y={by + size * 3.4} fontSize={size * 0.82} fill={MUTED}>
                {b.note}
              </text>
              {b.reasons.map((r, k) => (
                <g key={k}>
                  <Mark x={bx + 24} y={by + size * (5.4 + k * 1.9)} ok={r.ok} r={7} />
                  <text x={bx + 38} y={by + size * (5.7 + k * 1.9)} fontSize={size * 0.76} className={s.mono} fill={r.ok ? MUTED : "#fda4af"}>
                    {r.text.replace(/ (holds|does not hold)$/, "")}
                  </text>
                </g>
              ))}
              <Chip x={bx + 16} y={by + cardH - size * 2.9} label={applies ? "Applies" : "Doesn’t apply"} tone={applies ? "#6ee7b7" : "#fda4af"} size={size} />
            </Card>
          </g>
        );
      })}
    </g>
  );
}

function DateMoves({ x, y, w, size, accent }: Box & { accent: string }) {
  // April 2026 begins on a Wednesday; weeks from Monday.
  const cell = Math.min((w - 12) / 7, size * 3.1);
  const offset = 2;
  return (
    <g>
      <text x={x} y={y + size} fontSize={size * 0.85} fontWeight="600" fill={DIM} letterSpacing="0.06em">
        APRIL 2026
      </text>
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <text key={i} x={x + i * cell + cell / 2} y={y + size * 2.6} fontSize={size * 0.75} textAnchor="middle" fill={DIM}>
          {d}
        </text>
      ))}
      {Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const col = (i + offset) % 7;
        const row = Math.floor((i + offset) / 7);
        const cx = x + col * cell;
        const cy = y + size * 3.2 + row * cell * 0.82;
        const was = day === 20;
        const now = day === 21;
        return (
          <g key={day}>
            <rect x={cx + 2} y={cy} width={cell - 4} height={cell * 0.72} rx="6" fill={now ? accent : was ? "rgb(251 113 133 / 0.14)" : "rgb(255 255 255 / 0.04)"} />
            <text x={cx + cell / 2} y={cy + cell * 0.48} fontSize={size * 0.82} textAnchor="middle" fontWeight={now || was ? 700 : 400} fill={now ? "#08090b" : was ? "#fda4af" : MUTED} textDecoration={was ? "line-through" : undefined}>
              {day}
            </text>
          </g>
        );
      })}
      <Card x={x} y={y + size * 3.2 + 5 * cell * 0.82 + 10} w={w} h={size * 7.6} strong={`${accent}55`}>
        <text x={x + 16} y={y + size * 3.2 + 5 * cell * 0.82 + 10 + size * 2} fontSize={size * 0.98} fontWeight="700" fill={FG}>
          File GSTR-3B for the month (2026-03)
        </text>
        <text x={x + 16} y={y + size * 3.2 + 5 * cell * 0.82 + 10 + size * 3.7} fontSize={size * 0.86} fill={MUTED}>
          Due 21 Apr 2026 · was 20 Apr 2026
        </text>
        <text x={x + 16} y={y + size * 3.2 + 5 * cell * 0.82 + 10 + size * 5.6} fontSize={size * 0.76} className={s.mono} fill={DIM}>
          obligation.rescheduled · appended to the change log
        </text>
      </Card>
    </g>
  );
}

function Remind({ x, y, w, size, accent, compact }: Box & { accent: string; compact: boolean }) {
  // The evening: 18:00 to 10:00, with the quiet hours shaded.
  const span = 16 * 60;
  const px = (min: number) => x + ((min - 18 * 60) / span) * w;
  const phoneY = y + size * 6.4;
  const lineH = size * (compact ? 1.5 : 1.42);
  const bubbleH = CW_MESSAGE_LINES.length * lineH + size * 3.2;
  return (
    <g>
      <rect x={px(21 * 60)} y={y} width={px(32 * 60) - px(21 * 60)} height={size * 2.2} rx="6" fill="rgb(255 255 255 / 0.06)" />
      <text x={(px(21 * 60) + px(32 * 60)) / 2} y={y + size * 1.45} fontSize={size * 0.78} textAnchor="middle" fill={DIM}>
        quiet hours, 21:00–08:00
      </text>
      <line x1={x} x2={x + w} y1={y + size * 3.1} y2={y + size * 3.1} stroke="rgb(255 255 255 / 0.15)" />
      {[
        { min: 22 * 60 + 40, label: "22:40 published", tone: MUTED },
        { min: 32 * 60, label: "08:00 sent", tone: accent },
      ].map((m) => (
        <g key={m.label}>
          <circle cx={px(m.min)} cy={y + size * 3.1} r="5" fill={m.tone} />
          <text x={px(m.min)} y={y + size * 4.9} fontSize={size * 0.8} textAnchor={m.min > 30 * 60 ? "end" : "middle"} className={s.mono} fill={m.tone}>
            {m.label}
          </text>
        </g>
      ))}
      <rect x={x} y={phoneY} width={w} height={bubbleH + size * 4.4} rx="18" fill="#efeae2" />
      <rect x={x} y={phoneY} width={w} height={size * 2.6} rx="18" fill="#f0f2f5" />
      <rect x={x} y={phoneY + size * 1.6} width={w} height={size} fill="#f0f2f5" />
      <rect x={x + 12} y={phoneY + size * 0.55} width={size * 1.5} height={size * 1.5} rx={size * 0.35} fill="#171717" />
      <text x={x + 12 + size * 2.1} y={phoneY + size * 1.7} fontSize={size * 0.95} fontWeight="700" fill="#111b21">
        ComplianceWatch
      </text>
      <rect x={x + 12} y={phoneY + size * 3.4} width={w - 40} height={bubbleH} rx="12" fill="#ffffff" />
      <text fontSize={size * (compact ? 0.9 : 0.86)} fill="#111b21">
        {CW_MESSAGE_LINES.map((line, i) => (
          <tspan key={i} x={x + 24} y={phoneY + size * 4.9 + i * lineH}>
            {line}
          </tspan>
        ))}
      </text>
      <text x={x + w - 40} y={phoneY + size * 3.4 + bubbleH - size * 0.7} fontSize={size * 0.72} textAnchor="end" fill="#667781">
        08:00
      </text>
    </g>
  );
}

/** Every panel, the current one shown; later ones drawn in idle time, or when their step comes. */
function Panels({ frame, accent, still, box, stacked }: { frame: CwFrame; accent: string; still?: boolean; box: Box; stacked: boolean }) {
  const panel = (stage: CwStage, node: ReactNode) => {
    const on = frame.stage === stage;
    if (still) return on ? <g key={stage}>{node}</g> : null;
    const body = (
      <g key={stage} className={s.t} style={{ opacity: on ? 1 : 0 }}>
        {node}
      </g>
    );
    return stage === "watch" ? body : (
      <Later key={stage} now={on}>
        {body}
      </Later>
    );
  };
  const p = { ...box, accent };
  return (
    <g>
      {panel("watch", <Watch {...p} />)}
      {panel("read", <Read {...p} />)}
      {panel("extract", <Extract {...p} />)}
      {panel("approve", <Approve {...p} />)}
      {panel("decide", <Decide {...p} />)}
      {panel("date", <DateMoves {...p} />)}
      {panel("remind", <Remind {...p} compact={stacked} />)}
    </g>
  );
}

function Light({ x, y, accent }: { x: number; y: number; accent: string }) {
  return (
    <g className={`${s.t} ${s.slow}`} style={at(x, y)}>
      <circle r="8" fill={accent} className={s.pulse} />
      <circle r="7" fill={accent} />
      <circle r="3" fill="#fff" />
    </g>
  );
}

function Wide({ frame, accent, still }: Props) {
  const railY = (i: number) => 34 + i * 74;
  const current = CW_STAGES.indexOf(frame.stage);
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <line x1="16" x2="16" y1={railY(0)} y2={railY(6)} stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
      <line className={s.t} x1="16" x2="16" y1={railY(0)} y2={railY(current)} stroke={accent} strokeOpacity="0.6" strokeWidth="2" />
      {CW_STAGES.map((stage, i) => {
        const reached = i <= current;
        return (
          <g key={stage}>
            <circle className={s.t} cx="16" cy={railY(i)} r="6" fill={reached ? accent : "#27272a"} stroke={reached ? "none" : "rgb(255 255 255 / 0.2)"} />
            <text x="34" y={railY(i) + 1} fontSize="14" fontWeight="650" className={s.t} fill={i === current ? FG : reached ? MUTED : "#52525b"}>
              {STATION[stage].label}
            </text>
            <text x="34" y={railY(i) + 17} fontSize="10.5" className={`${s.mono} ${s.t}`} fill={i === current ? MUTED : "#52525b"}>
              {STATION[stage].service}
            </text>
          </g>
        );
      })}
      <Light x={16} y={railY(current)} accent={accent} />
      <Panels frame={frame} accent={accent} still={still} box={{ x: 196, y: 14, w: 436, size: 13 }} stacked={false} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  const current = CW_STAGES.indexOf(frame.stage);
  const dotX = (i: number) => 14 + i * 55.3;
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <line x1={dotX(0)} x2={dotX(6)} y1="14" y2="14" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
      <line className={s.t} x1={dotX(0)} x2={dotX(current)} y1="14" y2="14" stroke={accent} strokeOpacity="0.6" strokeWidth="2" />
      {CW_STAGES.map((stage, i) => (
        <circle key={stage} className={s.t} cx={dotX(i)} cy="14" r="5.5" fill={i <= current ? accent : "#27272a"} stroke={i <= current ? "none" : "rgb(255 255 255 / 0.2)"} />
      ))}
      <text x={dotX(current)} y="42" fontSize="13" fontWeight="650" textAnchor={current === 0 ? "start" : current === 6 ? "end" : "middle"} fill={FG}>
        {STATION[frame.stage].label}
        <tspan fontSize="10.5" className={s.mono} fill={MUTED}>
          {" "}
          · {STATION[frame.stage].service}
        </tspan>
      </text>
      <Panels frame={frame} accent={accent} still={still} box={{ x: 4, y: 62, w: 352, size: 12.5 }} stacked />
    </svg>
  );
}
