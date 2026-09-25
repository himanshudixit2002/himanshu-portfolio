"use client";

import { useId, useMemo, useState } from "react";
import { isolationScores, syntheticRequests } from "@/lib/sim/isolation-forest";
import { Readout, Stage } from "./Stage";

const X_MAX = 820;
const Y_MAX = 260;

export default function AnomalyScatter() {
  const points = useMemo(() => syntheticRequests(), []);
  const scores = useMemo(() => isolationScores(points), [points]);
  const [threshold, setThreshold] = useState(0.6);
  const slider = useId();

  const flagged = scores.filter((s) => s >= threshold).length;
  const caught = points.filter((p, i) => p.kind !== "normal" && scores[i] >= threshold).length;
  const injected = points.filter((p) => p.kind !== "normal").length;
  const falseAlarms = flagged - caught;

  return (
    <Stage
      title="Traffic that's easy to isolate"
      kind="Simulation"
      caption="A small Isolation Forest (60 trees) trained in your browser on synthetic requests — the same algorithm the gateway's scoring service runs with scikit-learn. The injected scrapers, floods and probes are invented."
    >
      <svg viewBox="0 0 100 62" className="block w-full" role="img" aria-label={`Scatter of ${points.length} synthetic requests by response time and size; ${flagged} scored at or above ${threshold.toFixed(2)}.`}>
        <line x1="6" y1="56" x2="98" y2="56" stroke="rgb(255 255 255 / 0.15)" strokeWidth="0.2" />
        <line x1="6" y1="2" x2="6" y2="56" stroke="rgb(255 255 255 / 0.15)" strokeWidth="0.2" />
        <text x="98" y="60.5" fontSize="2.2" fill="#86868b" textAnchor="end">
          response time →
        </text>
        <text x="7" y="4" fontSize="2.2" fill="#86868b">
          ↑ response size
        </text>
        {points.map((p, i) => {
          const hot = scores[i] >= threshold;
          return (
            <circle
              key={i}
              cx={6 + (p.x / X_MAX) * 92}
              cy={56 - (Math.min(p.y, Y_MAX) / Y_MAX) * 54}
              r={hot ? 1.1 : 0.7}
              fill={hot ? "#fb923c" : "rgb(245 245 247 / 0.45)"}
              className="transition-[r,fill] duration-300"
            />
          );
        })}
      </svg>

      <label htmlFor={slider} className="mt-5 grid gap-2 text-sm">
        <span className="flex justify-between">
          <span>Anomaly threshold</span>
          <span className="font-mono text-orange-200">{threshold.toFixed(2)}</span>
        </span>
        <input
          id={slider}
          type="range"
          min={0.45}
          max={0.8}
          step={0.01}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="accent-orange-300"
        />
      </label>

      <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-ink p-4 ring-1 ring-white/8">
        <Readout label="Flagged" value={flagged} tone="accent" />
        <Readout label="Injected caught" value={`${caught}/${injected}`} tone="good" />
        <Readout label="False alarms" value={falseAlarms} tone={falseAlarms ? "bad" : undefined} />
      </div>
    </Stage>
  );
}
