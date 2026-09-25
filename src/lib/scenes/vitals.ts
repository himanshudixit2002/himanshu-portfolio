import { vitals } from "@/content/projects/selected";
import { vizFor } from "@/lib/metric-viz";
import type { SceneMeta } from "./types";

const [oneTimer, noFocus] = vitals.highlights;
const [measure] = vitals.decisions;

/** Rates read from the published metrics: [before, after] per second, and CPU share of one core. */
function rates() {
  const read = (match: RegExp) => {
    const m = vitals.metrics.find((x) => match.test(x.label))!;
    const viz = vizFor(m);
    if (viz.kind !== "before-after") throw new Error(`Vitals metric "${m.label}" is not a before/after figure`);
    return viz;
  };
  return { wakeups: read(/wake-ups/), redraws: read(/redraws/), cpu: read(/core/) };
}
export const VITALS_RATES = rates();

/** "Barely there": the HUD, then what it costs the Mac, before and after tuning. */
export const vitalsScene: SceneMeta = {
  kind: "Measured",
  note: "Average rates from the app's own benchmark mode, drawn as evenly spaced ticks over ten seconds — the spacing is illustrative, the counts per second are measured. The desktop and HUD are drawings.",
  steps: [
    { title: noFocus.title, body: noFocus.body },
    { title: "Before tuning", body: `It woke the Mac ${VITALS_RATES.wakeups.beforeText} times a second and redrew the screen ${VITALS_RATES.redraws.beforeText} times a second.` },
    { title: oneTimer.title, body: `${oneTimer.body} Wake-ups fell to ${VITALS_RATES.wakeups.afterText} a second, redraws to ${VITALS_RATES.redraws.afterText}.` },
    { title: measure.title, body: `${measure.body} Idle CPU went from ${VITALS_RATES.cpu.beforeText}% to ${VITALS_RATES.cpu.afterText}% of one core.` },
  ],
  keyFrames: [1, 2, 3],
};

export const WINDOW_S = 10;

/** Tick positions (0–1 across the window) for events at `perSecond`, evenly spaced from t = 0. */
export function ticks(perSecond: number, windowS = WINDOW_S): number[] {
  const count = Math.floor(perSecond * windowS - 1e-9) + 1;
  return Array.from({ length: count }, (_, k) => k / perSecond / windowS).filter((t) => t < 1);
}

export type VitalsFrame = { step: number; tuned: boolean; showTimeline: boolean; showCpu: boolean };

export function vitalsFrame(step: number): VitalsFrame {
  const i = Math.max(0, Math.min(3, step));
  return { step: i, tuned: i >= 2, showTimeline: i >= 1, showCpu: i >= 3 };
}
