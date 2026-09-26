import type { CSSProperties } from "react";
import * as cafe from "@/lib/sim/cafe";
import { clock, type CafeFrame } from "@/lib/scenes/cafe";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";

type Props = { frame: CafeFrame; accent: string; still?: boolean; layout?: Layout };
const show = (on: boolean, dy = 10) => ({ opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : dy}px)` }) as CSSProperties;
const STATUS_INK: Record<cafe.OrderStatus, [string, string]> = {
  Pending: ["rgb(255 255 255 / 0.08)", "#d4d4d8"],
  Preparing: ["rgb(251 191 36 / 0.16)", "#fde68a"],
  Ready: ["rgb(52 211 153 / 0.18)", "#a7f3d0"],
};

/**
 * "One night at the club": the floor tablet through one table's evening —
 * started, an order through the kitchen, the bill with its discount and
 * split, then closed into the day's takings. Wide: landscape tablet.
 * Tall: the same screen in portrait.
 */
export function CafeVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

/** A table seen from above — felt and six pockets — or, for the console, a pad. */
function Glyph({ kind, cx, cy, w, on, accent }: { kind: cafe.TableKind; cx: number; cy: number; w: number; on: boolean; accent: string }) {
  const ink = on ? `${accent}aa` : "rgb(255 255 255 / 0.18)";
  if (kind === "PS5") {
    const r = w * 0.17;
    return (
      <g className={s.t} fill="none" stroke={ink} strokeWidth="2">
        <path d={`M${cx - w * 0.3} ${cy - r} H${cx + w * 0.3} A${r} ${r} 0 0 1 ${cx + w * 0.3} ${cy + r} H${cx - w * 0.3} A${r} ${r} 0 0 1 ${cx - w * 0.3} ${cy - r} Z`} />
        <path d={`M${cx - w * 0.3} ${cy - 5} v10 M${cx - w * 0.3 - 5} ${cy} h10`} strokeLinecap="round" />
        <circle cx={cx + w * 0.3} cy={cy} r="3" fill={ink} stroke="none" />
      </g>
    );
  }
  const tw = kind === "Snooker" ? w : w * 0.82;
  const th = tw * 0.5;
  const pockets = [0, 0.5, 1].flatMap((f) => [
    [cx - tw / 2 + f * tw, cy - th / 2],
    [cx - tw / 2 + f * tw, cy + th / 2],
  ]);
  return (
    <g className={s.t}>
      <rect x={cx - tw / 2} y={cy - th / 2} width={tw} height={th} rx="6" fill={on ? `${accent}1f` : "none"} stroke={ink} strokeWidth="2" />
      {pockets.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="3.5" fill={ink} />
      ))}
    </g>
  );
}

function Tiles({ frame, x, y, w, h, accent }: { frame: CafeFrame; x: number; y: number; w: number; h: number; accent: string }) {
  const tw = (w - 10) / 2;
  const th = (h - 10) / 2;
  return (
    <g>
      {cafe.TABLES.map((t, i) => {
        const session = cafe.sessionFor(frame.state, t.id);
        const b = session ? cafe.bill(frame.state, session) : null;
        const focus = t.id === frame.focus;
        const tx = x + (i % 2) * (tw + 10);
        const ty = y + Math.floor(i / 2) * (th + 10);
        return (
          <g key={t.id}>
            <rect className={s.t} x={tx} y={ty} width={tw} height={th} rx="14" fill={session ? `${accent}1c` : "rgb(255 255 255 / 0.04)"} stroke={focus && session ? accent : "rgb(255 255 255 / 0.1)"} strokeWidth={focus && session ? 2 : 1} />
            <text x={tx + 14} y={ty + 26} fontSize="14" fontWeight="600" fill="#f5f5f7">
              {t.name}
            </text>
            <circle className={s.t} cx={tx + tw - 18} cy={ty + 21} r="5" fill={session ? accent : "rgb(255 255 255 / 0.25)"} />
            {th > 110 && <Glyph kind={t.kind} cx={tx + tw / 2} cy={ty + th / 2 + 2} w={Math.min(tw * 0.62, 96)} on={Boolean(session)} accent={accent} />}
            <text x={tx + 14} y={ty + th - 16} fontSize="12" className={s.mono} fill={session ? "#e4e4e7" : "#86868b"}>
              {session && b ? `${b.minutes} min · ${cafe.rupees(b.total)}` : `Free · ₹${t.ratePerHour}/h`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Panel({ frame, x, y, w, accent }: { frame: CafeFrame; x: number; y: number; w: number; accent: string }) {
  const orders = frame.session?.orders ?? [];
  const b = frame.bill;
  const line = (dy: number, label: string, value: string, tone = "#e4e4e7") => (
    <g>
      <text x={x + 16} y={y + dy} fontSize="12" fill="#a1a1a6">
        {label}
      </text>
      <text x={x + w - 16} y={y + dy} fontSize="12" textAnchor="end" className={s.mono} fill={tone}>
        {value}
      </text>
    </g>
  );
  return (
    <g>
      <rect x={x} y={y} width={w} height="280" rx="16" fill="rgb(255 255 255 / 0.04)" stroke="rgb(255 255 255 / 0.08)" />
      <text x={x + 16} y={y + 28} fontSize="14" fontWeight="600" fill="#f5f5f7">
        Snooker 1
      </text>
      <text x={x + w - 16} y={y + 28} fontSize="11" textAnchor="end" fill="#86868b">
        2 players · Silver
      </text>
      {/* Orders */}
      <text x={x + 16} y={y + 58} fontSize="11" fill="#86868b">
        Café orders
      </text>
      {orders.length === 0 && (
        <text x={x + 16} y={y + 82} fontSize="12" fill="#71717a">
          None yet
        </text>
      )}
      {orders.map((o) => {
        const st = cafe.orderStatus(o, frame.state.now);
        const [bg, ink] = STATUS_INK[st];
        return (
          <g key={o.id} className={s.t}>
            <text x={x + 16} y={y + 82} fontSize="12.5" fill="#e4e4e7">
              {o.item} · ₹{o.price}
            </text>
            <rect className={s.t} x={x + w - 96} y={y + 69} width="80" height="18" rx="9" fill={bg} />
            <text x={x + w - 56} y={y + 82} fontSize="10.5" fontWeight="600" textAnchor="middle" fill={ink}>
              {st}
            </text>
          </g>
        );
      })}
      {/* Bill */}
      <g className={s.t} style={show(frame.step >= 3)}>
        <line x1={x + 16} x2={x + w - 16} y1={y + 102} y2={y + 102} stroke="rgb(255 255 255 / 0.1)" />
        {b && (
          <>
            {line(126, `Table · ${b.minutes} min`, cafe.rupees(b.tableCharge))}
            {line(148, "Silver discount", `−${cafe.rupees(b.discount)}`, "#6ee7b7")}
            {line(170, "Café", cafe.rupees(b.cafe))}
            <line x1={x + 16} x2={x + w - 16} y1={y + 182} y2={y + 182} stroke="rgb(255 255 255 / 0.1)" />
            <text x={x + 16} y={y + 206} fontSize="14" fontWeight="650" fill="#f5f5f7">
              Total
            </text>
            <text x={x + w - 16} y={y + 206} fontSize="14" fontWeight="650" textAnchor="end" className={s.mono} fill="#f5f5f7">
              {cafe.rupees(b.total)}
            </text>
            <text x={x + 16} y={y + 234} fontSize="11.5" fill="#a1a1a6">
              {cafe.rupees(b.perPlayer)} each · or loser pays {cafe.rupees(b.total)}
            </text>
          </>
        )}
      </g>
      <g className={s.pop} style={{ opacity: frame.closed ? 1 : 0, transform: `scale(${frame.closed ? 1 : 0.8})` }}>
        <rect x={x + 16} y={y + 246} width={w - 32} height="24" rx="12" fill={accent} />
        <text x={x + w / 2} y={y + 262} fontSize="11.5" fontWeight="700" textAnchor="middle" fill="#08090b">
          Closed · takings {cafe.rupees(cafe.takings(frame.state))}
        </text>
      </g>
    </g>
  );
}

function Header({ frame, x, y, w }: { frame: CafeFrame; x: number; y: number; w: number }) {
  return (
    <g>
      <text x={x} y={y + 24} fontSize="18" fontWeight="650" fill="#f5f5f7">
        Tables
      </text>
      <text x={x + w} y={y + 26} fontSize="26" fontWeight="600" textAnchor="end" className={s.mono} fill="#f5f5f7">
        {clock(frame.state.now)}
      </text>
    </g>
  );
}

function Wide({ frame, accent, still }: Props) {
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <rect x="4" y="30" width="632" height="460" rx="30" fill="#0e0f12" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
      <rect x="18" y="44" width="604" height="432" rx="18" fill="#101114" />
      <Header frame={frame} x={38} y={60} w={564} />
      <Tiles frame={frame} x={38} y={112} w={290} h={340} accent={accent} />
      <Panel frame={frame} x={344} y={112} w={258} accent={accent} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  return (
    <svg viewBox="0 0 360 480" className={`${s.svg} ${still ? s.still : ""}`}>
      <Header frame={frame} x={6} y={0} w={348} />
      <Tiles frame={frame} x={4} y={44} w={352} h={150} accent={accent} />
      <Panel frame={frame} x={4} y={200} w={352} accent={accent} />
    </svg>
  );
}
