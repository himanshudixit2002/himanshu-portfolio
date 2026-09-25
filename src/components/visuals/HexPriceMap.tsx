"use client";

import { useId, useMemo, useState } from "react";
import { aggregate, band, hexPoints, RESOLUTIONS, syntheticHotels } from "@/lib/sim/hexmap";
import { Stage } from "./Stage";

const BANDS = ["#1e3a5f", "#1d4f91", "#2f6fd6", "#5ca4ff", "#a8d1ff"];
const BAND_LABELS = ["under ₹2.5k", "₹2.5–3.8k", "₹3.8–5k", "₹5–6.5k", "₹6.5k+"];

export default function HexPriceMap() {
  const hotels = useMemo(() => syntheticHotels(), []);
  const [res, setRes] = useState(0);
  const [showPins, setShowPins] = useState(false);
  const slider = useId();
  const { size, label } = RESOLUTIONS[res];
  const cells = useMemo(() => aggregate(hotels, size), [hotels, size]);

  return (
    <Stage
      title="One summary per hexagon, not one lookup per hotel"
      kind="Illustration"
      caption="A synthetic city with invented hotels and prices — not Cleartrip data. It shows the technique: aggregate results into hexagonal cells (H3-style) at a resolution that fits the zoom level, and serve a median per cell."
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <svg viewBox="-0.02 -0.02 1.04 1.04" className="block w-full rounded-2xl bg-[#0b1220]" role="img" aria-label={`${cells.length} hexagonal clusters summarising ${hotels.length} synthetic hotels at ${label.toLowerCase()} resolution`}>
          {/* abstract city: a river and a ring road */}
          <path d="M-0.05 0.58 C 0.2 0.5, 0.35 0.66, 0.55 0.56 S 0.85 0.42, 1.05 0.5" fill="none" stroke="#12304f" strokeWidth="0.035" />
          <ellipse cx="0.42" cy="0.46" rx="0.3" ry="0.26" fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="0.006" />
          {cells.map((c) => (
            <g key={`${c.q},${c.r}`}>
              <polygon
                points={hexPoints(c.cx, c.cy, size * 0.96)}
                fill={BANDS[band(c.median)]}
                fillOpacity={showPins ? 0.35 : 0.85}
                stroke="#0b1220"
                strokeWidth="0.004"
                className="transition-[fill-opacity] duration-300"
              />
              {res < 2 && !showPins && (
                <text x={c.cx} y={c.cy + size * 0.12} fontSize={size * 0.34} fill={band(c.median) > 2 ? "#0b1220" : "#e2e8f0"} textAnchor="middle" fontWeight="600">
                  ₹{(c.median / 1000).toFixed(1)}k
                </text>
              )}
            </g>
          ))}
          {showPins &&
            hotels.map((h, i) => <circle key={i} cx={h.x} cy={h.y} r="0.0055" fill="#f5f5f7" fillOpacity="0.8" />)}
        </svg>

        <div className="grid content-start gap-5">
          <label htmlFor={slider} className="grid gap-2 text-sm">
            <span className="flex justify-between">
              <span>Zoom</span>
              <span className="font-semibold text-accent-bright">{label}</span>
            </span>
            <input id={slider} type="range" min={0} max={RESOLUTIONS.length - 1} step={1} value={res} onChange={(e) => setRes(Number(e.target.value))} className="accent-[#5ca4ff]" />
          </label>

          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-ink p-4 ring-1 ring-white/8">
            <div>
              <p className="text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">Per-hotel</p>
              <p className="mt-1 font-mono text-lg">{hotels.length} pins</p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">Clustered</p>
              <p className="mt-1 font-mono text-lg text-accent-bright" aria-live="polite">
                {cells.length} cells
              </p>
            </div>
          </div>

          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={showPins} onChange={(e) => setShowPins(e.target.checked)} className="size-4 accent-[#5ca4ff]" />
            Show every hotel as a pin
          </label>

          <ul className="grid gap-1.5 text-xs text-muted-inverse" aria-label="Median price per night">
            {BANDS.map((color, i) => (
              <li key={color} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-5 rounded-sm" style={{ background: color }} />
                {BAND_LABELS[i]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Stage>
  );
}
