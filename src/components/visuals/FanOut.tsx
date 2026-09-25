"use client";

import { useState } from "react";
import { Control, Readout, Stage } from "./Stage";

const FARES = 12;

/** Per-fare lookups versus one bulk call, drawn as request lines. */
export default function FanOut() {
  const [bulk, setBulk] = useState(true);
  const calls = bulk ? 1 : FARES;

  return (
    <Stage
      title="One call per page, not one per fare"
      kind="Illustration"
      caption="A generic results page with invented fares, showing the shape of the change — not Cleartrip's services or traffic."
    >
      <div className="flex flex-wrap gap-2">
        <Control active={!bulk} onClick={() => setBulk(false)}>
          One lookup per fare
        </Control>
        <Control active={bulk} onClick={() => setBulk(true)}>
          Bulk benefits API
        </Control>
      </div>

      <svg viewBox="0 0 100 64" className="mt-5 block w-full" role="img" aria-label={`${FARES} fare rows making ${calls} request${calls > 1 ? "s" : ""} to the benefits service`}>
        {Array.from({ length: FARES }, (_, i) => {
          const y = 4 + i * 5;
          return (
            <g key={i}>
              <rect x="2" y={y} width="30" height="3.6" rx="1" fill="rgb(255 255 255 / 0.07)" />
              <rect x="4" y={y + 1.2} width={10 + ((i * 7) % 12)} height="1.2" rx="0.6" fill="rgb(255 255 255 / 0.25)" />
              {!bulk && (
                <line x1="32" y1={y + 1.8} x2="74" y2="32" stroke="#fb7185" strokeWidth="0.35" strokeOpacity="0.8" className="transition-opacity" />
              )}
            </g>
          );
        })}
        {bulk && (
          <>
            <path d="M32 4 C 36 4, 36 62, 32 62" fill="none" stroke="#5ca4ff" strokeWidth="0.5" />
            <line x1="36" y1="32" x2="74" y2="32" stroke="#5ca4ff" strokeWidth="1.1" />
            <text x="55" y="29.5" fontSize="2.6" fill="#a8d1ff" textAnchor="middle">
              POST fares[12]
            </text>
          </>
        )}
        <rect x="74" y="24" width="24" height="16" rx="2.5" fill="rgb(92 164 255 / 0.12)" stroke="rgb(92 164 255 / 0.6)" strokeWidth="0.4" />
        <text x="86" y="31" fontSize="2.8" fill="#f5f5f7" textAnchor="middle" fontWeight="600">
          Benefits
        </text>
        <text x="86" y="35" fontSize="2.4" fill="#a1a1a6" textAnchor="middle">
          service
        </text>
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-ink p-4 ring-1 ring-white/8">
        <Readout label="Requests per page" value={calls} tone={bulk ? "good" : "bad"} />
        <Readout label="Round trips waiting" value={bulk ? "1" : `up to ${FARES}`} tone={bulk ? "good" : "bad"} />
      </div>
    </Stage>
  );
}
