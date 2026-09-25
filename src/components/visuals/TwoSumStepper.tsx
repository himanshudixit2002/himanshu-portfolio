"use client";

import { useMemo, useState } from "react";
import { twoSumSteps } from "@/lib/sim/two-sum";
import { Control, Stage } from "./Stage";

const CASES = [
  { nums: [2, 7, 11, 15], target: 9 },
  { nums: [3, 2, 4], target: 6 },
  { nums: [1, 5, 3, 8, 4], target: 12 },
];

export default function TwoSumStepper() {
  const [caseIndex, setCaseIndex] = useState(2);
  const [step, setStep] = useState(0);
  const { nums, target } = CASES[caseIndex];
  const steps = useMemo(() => twoSumSteps(nums, target), [nums, target]);
  const current = steps[Math.min(step, steps.length - 1)];
  const last = step >= steps.length - 1;

  const choose = (i: number) => {
    setCaseIndex(i);
    setStep(0);
  };

  return (
    <Stage
      title="Two Sum, one step at a time"
      kind="Simulation"
      caption="The one-pass hash-map solution, stepped through in the style of PadhnaThoPadega's visualizations."
    >
      <div className="flex flex-wrap gap-2">
        {CASES.map((c, i) => (
          <Control key={i} active={caseIndex === i} onClick={() => choose(i)} className="min-h-9 px-3 font-mono text-xs">
            [{c.nums.join(",")}] → {c.target}
          </Control>
        ))}
      </div>

      <ol className="mt-6 flex flex-wrap gap-2" aria-label="Array">
        {nums.map((n, i) => {
          const isCurrent = i === current.index;
          const isAnswer = current.found?.includes(i);
          return (
            <li
              key={i}
              aria-current={isCurrent ? "step" : undefined}
              className={`grid size-14 place-items-center rounded-2xl font-mono text-lg ring-1 transition-colors duration-300 ${
                isAnswer ? "bg-emerald-300/20 ring-emerald-300" : isCurrent ? "bg-yellow-300/20 ring-yellow-300" : i < current.index ? "bg-white/4 text-dim-inverse ring-white/8" : "bg-white/6 ring-white/12"
              }`}
            >
              {n}
              <span className="sr-only"> at index {i}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-ink p-4 ring-1 ring-white/8">
          <p className="text-xs text-dim-inverse">seen (value → index)</p>
          <p className="mt-2 min-h-7 font-mono text-sm">
            {current.seen.length ? `{ ${current.seen.map(([v, i]) => `${v}: ${i}`).join(", ")} }` : "{ }"}
          </p>
        </div>
        <div className="rounded-2xl bg-ink p-4 ring-1 ring-white/8">
          <p className="text-xs text-dim-inverse">
            nums[{current.index}] = {current.value} · need {target} − {current.value} = {current.need}
          </p>
          <p aria-live="polite" className={`mt-2 text-sm ${current.found ? "text-emerald-200" : ""}`}>
            {current.note}
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Control onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Previous
        </Control>
        <Control primary onClick={() => (last ? setStep(0) : setStep((s) => s + 1))}>
          {last ? "Start over" : "Next step"}
        </Control>
      </div>
    </Stage>
  );
}
