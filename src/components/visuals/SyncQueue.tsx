"use client";

import { useReducer, useState } from "react";
import * as q from "@/lib/sim/sync-queue";
import { Control, Stage } from "./Stage";
import { useInterval, useOnScreen } from "./useNearViewport";

type Action = { type: "record"; label: string } | { type: "online"; online: boolean } | { type: "tick"; ms: number } | { type: "reset" };

function reducer(state: q.SyncState, action: Action): q.SyncState {
  switch (action.type) {
    case "record":
      return q.record(state, action.label);
    case "online":
      return q.setOnline(state, action.online);
    case "tick":
      return q.tick(state, action.ms);
    case "reset":
      return q.initialSync();
  }
}

const ROLES = ["Super admin", "Admin", "Regional manager", "Area manager", "Medical rep"];

export default function SyncQueue() {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    ["Visit report", "Order"].reduce((s, l) => q.record(s, l), q.initialSync()),
  );
  const [running, setRunning] = useState(true);
  const [frame, onScreen] = useOnScreen<HTMLDivElement>();
  useInterval(() => dispatch({ type: "tick", ms: 500 }), 500, running && onScreen);

  const synced = state.items.filter((i) => i.status === "synced").length;

  return (
    <div ref={frame}>
      <Stage
        title="Work offline. Sync when you can."
        kind="Simulation"
        caption="Every action is saved locally and queued; the worker retries with growing delays (illustrative here: 1 s, doubling) and gives up after ten attempts. The role ladder is the app's own."
      >
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Control active={!state.online} onClick={() => dispatch({ type: "online", online: false })}>
                No signal
              </Control>
              <Control active={state.online} onClick={() => dispatch({ type: "online", online: true })}>
                Back online
              </Control>
              <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${state.online ? "bg-emerald-300/15 text-emerald-200" : "bg-rose-300/15 text-rose-200"}`}>
                {state.online ? "Online" : "Offline"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {q.ACTIONS.map((a) => (
                <Control key={a} onClick={() => dispatch({ type: "record", label: a })} className="min-h-9 px-3 text-xs">
                  + {a}
                </Control>
              ))}
            </div>
            <ol className="mt-4 grid gap-1.5" aria-live="polite">
              {state.items.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ring-1 transition-colors duration-500 ${
                    item.status === "synced"
                      ? "bg-emerald-300/10 ring-emerald-300/40"
                      : item.status === "failed"
                        ? "bg-rose-300/10 ring-rose-300/40"
                        : "bg-white/4 ring-white/10"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-xs text-muted-inverse">
                    {item.status === "synced"
                      ? "synced"
                      : item.status === "failed"
                        ? `gave up after ${item.attempts}`
                        : item.attempts === 0
                          ? "queued"
                          : `try ${item.attempts} · next in ${Math.max(0, Math.ceil((item.nextAt - state.now) / 1000))} s`}
                  </span>
                </li>
              ))}
              {state.items.length === 0 && <li className="text-sm text-dim-inverse">Record an action to queue it.</li>}
            </ol>
            <div className="mt-4 flex gap-2">
              <Control onClick={() => setRunning((r) => !r)} active={!running}>
                {running ? "Pause" : "Resume"}
              </Control>
              <Control onClick={() => dispatch({ type: "reset" })}>Reset</Control>
              <span className="ml-auto self-center font-mono text-xs text-dim-inverse">
                {synced}/{state.items.length} synced
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Who approves what</p>
            <ol className="mt-3 grid gap-1.5">
              {ROLES.map((r, i) => (
                <li key={r} className="rounded-xl bg-white/4 px-3 py-2 text-sm ring-1 ring-white/8" style={{ marginLeft: `${i * 0.75}rem` }}>
                  {r}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Stage>
    </div>
  );
}
