import type { CSSProperties } from "react";
import { PRELOAD_KB, type ElepeiaFrame } from "@/lib/scenes/elepeia";
import { Layouts, type Layout } from "../SceneStage";
import s from "../scenes.module.css";

const kb = (n: number) => (n >= 1000 ? `≈${Math.round(n / 1000)} MB` : `≈${n} KB`);
type Props = { frame: ElepeiaFrame; accent: string; still?: boolean; layout?: Layout };

/**
 * "The weight of a page": a sample product page that first ships only a
 * spinner, then real HTML; its main image arrives blurred behind a 5 MB
 * preload and sharp behind a 73 KB one; finally the two paths to an order
 * meet at one commit. Wide: a desktop page. Tall: the same page on a phone.
 */
export function ElepeiaVisual(props: Props) {
  return <Layouts wide={<Wide {...props} />} tall={<Tall {...props} />} only={props.layout} />;
}

/** The garment, drawn in a 180 × 220 box at (x, y). Blurred until the right image is preloaded. */
function Garment({ x, y, scale, sharp }: { x: number; y: number; scale: number; sharp: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={s.blur} style={{ filter: sharp ? "blur(0px)" : "blur(7px)" } as CSSProperties}>
        <path d="M54 6 L89 24 L124 6 L178 34 L196 92 L160 100 L156 222 L22 222 L18 100 L-18 92 L0 34 Z" fill="#f7f2ea" stroke="#c9b79c" strokeWidth="1.6" />
        <path d="M89 24 L89 222" stroke="#d8cbb6" strokeWidth="1.4" />
        {[62, 92, 122, 152, 182].map((cy) => (
          <circle key={cy} cx="95" cy={cy} r="2.6" fill="#b8a283" />
        ))}
      </g>
    </g>
  );
}

const QUARTER = (2 * Math.PI * 22) / 4;

function Spinner({ cx, cy, show }: { cx: number; cy: number; show: boolean }) {
  return (
    <g className={s.t} style={{ opacity: show ? 1 : 0 }}>
      <circle cx={cx} cy={cy} r="22" fill="none" stroke="#e7e2d9" strokeWidth="5" />
      {/* A quarter of the track, drawn as a dashed full circle so its own box is centred on the track and it spins in place.
          The offset puts the dash at 12 to 3 o'clock when still. */}
      <circle className={s.spin} cx={cx} cy={cy} r="22" fill="none" stroke="#78716c" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${QUARTER} ${QUARTER * 3}`} strokeDashoffset={QUARTER} />
      <text x={cx} y={cy + 56} fontSize="12" fill="#a8a29e" textAnchor="middle" className={s.mono}>
        0 products in the HTML
      </text>
    </g>
  );
}

function Checkout({ x, y, w, show }: { x: number; y: number; w: number; show: boolean }) {
  return (
    <g className={s.t} style={{ opacity: show ? 1 : 0, transform: `translateY(${show ? 0 : 14}px)` } as CSSProperties}>
      <rect x={x} y={y} width={w} height="104" rx="12" fill="#1c1917" />
      <text x={x + 16} y={y + 22} fontSize="10.5" fill="#a8a29e" className={s.mono}>
        4 · Browser → /api/orders/create
      </text>
      <line x1={x + 16} x2={x + 214} y1={y + 18} y2={y + 18} stroke="#f87171" strokeWidth="1.5" />
      <text x={x + 16} y={y + 44} fontSize="10.5" fill="#bae6fd" className={s.mono}>
        4 · Webhook → payment.captured
      </text>
      <rect x={x + 16} y={y + 58} width={w - 32} height="32" rx="8" fill="rgb(52 211 153 / 0.16)" stroke="rgb(52 211 153 / 0.6)" />
      <text x={x + 28} y={y + 78} fontSize="10.5" fill="#a7f3d0" className={s.mono}>
        5 · commitOrderWithStockDecrement
      </text>
    </g>
  );
}

function Preload({ x, y, w, frame, accent }: { x: number; y: number; w: number; frame: ElepeiaFrame; accent: string }) {
  const scale = Math.max(0.012, frame.preloadKb / PRELOAD_KB.before);
  const bar = (by: number, label: string, value: number, fill: string, scaleX: number) => (
    <g>
      <text x={x} y={by} fontSize="12" fill="#a1a1a6">
        {label}
      </text>
      <text x={x + w} y={by} fontSize="12" fill="#f5f5f7" textAnchor="end" className={s.mono}>
        {kb(value)}
      </text>
      <rect x={x} y={by + 12} width={w} height="12" rx="6" fill="rgb(255 255 255 / 0.08)" />
      <rect
        className={`${s.t} ${s.slow}`}
        x={x}
        y={by + 12}
        width={w}
        height="12"
        rx="6"
        fill={fill}
        style={{ transform: `scaleX(${scaleX})`, transformOrigin: `${x}px 0`, transformBox: "view-box" } as CSSProperties}
      />
    </g>
  );
  return (
    <>
      {bar(y, "Preloaded", frame.preloadKb, frame.sharp ? accent : "#fb7185", scale)}
      {bar(y + 54, "Rendered", PRELOAD_KB.after, accent, Math.max(0.012, PRELOAD_KB.after / PRELOAD_KB.before))}
    </>
  );
}

function Wide({ frame, accent, still }: Props) {
  const product = frame.html === "product";
  return (
    <svg viewBox="0 0 640 520" className={`${s.svg} ${still ? s.still : ""}`}>
      <rect x="20" y="12" width="600" height="380" rx="16" fill="#fbfaf8" />
      <path d="M20 28a16 16 0 0 1 16-16h568a16 16 0 0 1 16 16v14H20z" fill="#efebe4" />
      {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
        <circle key={c} cx={40 + i * 16} cy="28" r="5" fill={c} />
      ))}
      <rect x="220" y="19" width="200" height="18" rx="9" fill="#fff" />
      <text x="320" y="32" fontSize="10" fill="#78716c" textAnchor="middle">
        elepeia.com/products/…
      </text>
      <text y="64" fontSize="9" fill="#57534e" letterSpacing="1.5" textAnchor="middle">
        {["NEW", "SHIRTS", "TROUSERS", "KNITWEAR"].map((n, i) => (
          <tspan key={n} x={206 + i * 76}>
            {n}
          </tspan>
        ))}
      </text>
      <line x1="20" x2="620" y1="76" y2="76" stroke="#e7e2d9" />
      <Spinner cx={320} cy={210} show={!product} />
      <g className={s.t} style={{ opacity: product ? 1 : 0 }}>
        <rect x="44" y="92" width="250" height="280" rx="10" fill="#e8dfd0" />
        <Garment x={80} y={122} scale={1} sharp={frame.sharp} />
        <text x="318" y="112" fontSize="9" letterSpacing="1.5" fill="#a8a29e">
          SHIRTS · SUMMER EDIT
        </text>
        <text x="318" y="142" fontSize="24" fontFamily="Georgia, serif" fill="#1c1917">
          Linen overshirt
        </text>
        <text x="318" y="170" fontSize="14" fontWeight="600" fill="#1c1917">
          ₹4,490 <tspan fontSize="9" fontWeight="400" fill="#a8a29e">incl. GST</tspan>
        </text>
        {["S", "M", "L", "XL"].map((z, i) => (
          <g key={z}>
            <rect x={318 + i * 40} y="188" width="32" height="26" rx="4" fill={z === "M" ? "#1c1917" : "#fff"} stroke="#d6d3d1" />
            <text x={334 + i * 40} y="205" fontSize="10" textAnchor="middle" fill={z === "M" ? "#fff" : "#44403c"}>
              {z}
            </text>
          </g>
        ))}
        <rect x="318" y="228" width="276" height="34" rx="4" fill="#1c1917" />
        <text x="456" y="249" fontSize="10.5" letterSpacing="1.5" fill="#fff" textAnchor="middle">
          ADD TO BAG
        </text>
      </g>
      <Checkout x={306} y={276} w={300} show={frame.checkout} />
      <Preload x={40} y={428} w={560} frame={frame} accent={accent} />
    </svg>
  );
}

function Tall({ frame, accent, still }: Props) {
  const product = frame.html === "product";
  return (
    <svg viewBox="0 0 360 460" className={`${s.svg} ${still ? s.still : ""}`}>
      {/* A phone-width page */}
      <rect x="30" y="4" width="300" height="340" rx="22" fill="#fbfaf8" />
      <rect x="90" y="14" width="180" height="22" rx="11" fill="#efebe4" />
      <text x="180" y="29" fontSize="10.5" fill="#78716c" textAnchor="middle">
        elepeia.com/products/…
      </text>
      <Spinner cx={180} cy={170} show={!product} />
      <g className={s.t} style={{ opacity: product ? 1 : 0 }}>
        <rect x="46" y="46" width="268" height="178" rx="12" fill="#e8dfd0" />
        <Garment x={130} y={58} scale={0.7} sharp={frame.sharp} />
        <text x="46" y="254" fontSize="20" fontFamily="Georgia, serif" fill="#1c1917">
          Linen overshirt
        </text>
        <text x="46" y="276" fontSize="13" fontWeight="600" fill="#1c1917">
          ₹4,490 <tspan fontSize="9" fontWeight="400" fill="#a8a29e">incl. GST</tspan>
        </text>
        <rect x="46" y="292" width="268" height="36" rx="6" fill="#1c1917" />
        <text x="180" y="315" fontSize="11" letterSpacing="1.5" fill="#fff" textAnchor="middle">
          ADD TO BAG
        </text>
      </g>
      <Checkout x={30} y={216} w={300} show={frame.checkout} />
      <Preload x={30} y={378} w={300} frame={frame} accent={accent} />
    </svg>
  );
}
