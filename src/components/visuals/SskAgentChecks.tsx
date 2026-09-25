"use client";

import { useState } from "react";
import { Control, Stage } from "./Stage";

type Phase = "idle" | "preview" | "done";

/**
 * Two of SmartShelfKart's documented guarantees, replayed:
 * the write-permission eval pair from its README (apples 15 → 65, or refused
 * and still 15), and the CI gate on deterministic coverage (16 of 21 golden
 * cases answered with no model call; the gate requires 70%).
 */
export default function SskAgentChecks() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PermissionPair />
      <CoverageGate />
    </div>
  );
}

function PermissionPair() {
  const [granted, setGranted] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const stock = phase === "done" && granted ? 65 : 15;

  const toggle = (value: boolean) => {
    setGranted(value);
    setPhase("idle");
  };

  return (
    <Stage
      title="The grant is the whole difference"
      kind="Simulation"
      caption="Replays two cases from the project's eval suite. Same words, same script, same confirmation — only the permission changes."
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-dim-inverse">Caller has canAdjustStock</span>
        <Control active={granted} onClick={() => toggle(true)} className="min-h-9 px-3 text-xs">
          Yes
        </Control>
        <Control active={!granted} onClick={() => toggle(false)} className="min-h-9 px-3 text-xs">
          No
        </Control>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-teal-600 px-3 py-2 text-white">Add 50 apples</p>
        {phase !== "idle" && (
          <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-white/6 px-3 py-2">
            {granted ? (
              <>
                <p className="text-[0.6875rem] font-semibold tracking-[0.06em] text-teal-300 uppercase">Stock in · preview</p>
                <p className="mt-1">Apples · SKU 89010001 · 15 → 65</p>
              </>
            ) : (
              <p className="text-rose-200">I can&rsquo;t make that change — your role doesn&rsquo;t include adjusting stock.</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {phase === "idle" && (
          <Control primary onClick={() => setPhase(granted ? "preview" : "done")}>
            Send
          </Control>
        )}
        {phase === "preview" && (
          <Control primary onClick={() => setPhase("done")}>
            Confirm
          </Control>
        )}
        {phase !== "idle" && <Control onClick={() => setPhase("idle")}>Again</Control>}
      </div>

      <p aria-live="polite" className="mt-4 rounded-xl bg-ink px-3 py-2.5 font-mono text-sm ring-1 ring-white/8">
        apples on hand: <span className={stock === 65 ? "text-emerald-300" : "text-fg-inverse"}>{stock}</span>
        {phase === "done" && <span className="text-dim-inverse"> · {granted ? "write landed" : "refused, nothing written"}</span>}
      </p>
    </Stage>
  );
}

const CASES = 21;
const DETERMINISTIC = 16;
const GATE = 0.7;

function CoverageGate() {
  const [allModel, setAllModel] = useState(false);
  const deterministic = allModel ? 0 : DETERMINISTIC;
  const coverage = deterministic / CASES;
  const passes = coverage >= GATE;

  return (
    <Stage
      title="A gate on the bill, not just the answers"
      kind="Diagram"
      caption="The project's 21 golden cases run offline with zero tokens. CI requires every case to pass and at least 70% to be answered without calling a model."
    >
      <div className="flex flex-wrap gap-2">
        <Control active={!allModel} onClick={() => setAllModel(false)} className="min-h-9 px-3 text-xs">
          As shipped
        </Control>
        <Control active={allModel} onClick={() => setAllModel(true)} className="min-h-9 px-3 text-xs">
          Route everything to the model
        </Control>
      </div>

      <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label={`${deterministic} of ${CASES} cases answered without a model call`}>
        {Array.from({ length: CASES }, (_, i) => (
          <li key={i} className={`aspect-square rounded-lg transition-colors duration-500 ${i < deterministic ? "bg-teal-400/80" : "bg-violet-400/70"}`} />
        ))}
      </ol>
      <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted-inverse">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-teal-400/80" />
          database answer, ~1 ms, 0 tokens
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-violet-400/70" />
          model call
        </li>
      </ul>

      <div className="mt-5">
        <div className="relative h-3 rounded-full bg-white/6">
          <div className="h-full rounded-full bg-teal-400/80 transition-[width] duration-700" style={{ width: `${coverage * 100}%` }} />
          <span className="absolute -top-1.5 h-6 w-0.5 bg-fg-inverse" style={{ left: `${GATE * 100}%` }} aria-hidden="true" />
        </div>
        <p className="mt-2 flex justify-between font-mono text-xs text-muted-inverse">
          <span>deterministic coverage {(coverage * 100).toFixed(1)}%</span>
          <span>gate 70%</span>
        </p>
      </div>

      <p aria-live="polite" className={`mt-4 rounded-xl px-3 py-2.5 text-sm ${passes ? "bg-emerald-300/10 text-emerald-100" : "bg-rose-300/10 text-rose-100"}`}>
        {passes
          ? "CI passes: every answer correct, and most of them cost nothing."
          : "Every answer is still correct — but CI fails, because the bill would grow for the life of the product."}
      </p>
    </Stage>
  );
}
