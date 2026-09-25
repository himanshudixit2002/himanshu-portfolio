"use client";

import { useReducer, useState } from "react";
import * as c from "@/lib/sim/cluster";
import { Control, Readout, Stage } from "./Stage";

type Action =
  | { type: "put"; key: string; value: string }
  | { type: "get"; key: string }
  | { type: "toggle"; node: c.NodeId }
  | { type: "reset" };

function reducer(state: c.ClusterState, action: Action): c.ClusterState {
  switch (action.type) {
    case "put":
      return c.put(state, action.key, action.value);
    case "get":
      return c.get(state, action.key);
    case "toggle":
      return state.up[action.node] ? c.takeDown(state, action.node) : c.restore(state, action.node);
    case "reset":
      return c.initialCluster();
  }
}

const seed = (): c.ClusterState =>
  [
    ["user:1", "alice"],
    ["cart:9", "3 items"],
    ["session:7", "active"],
  ].reduce((s, [k, v]) => c.put(s, k, v), c.initialCluster());

const NODE_COLOR: Record<c.NodeId, string> = { A: "#38bdf8", B: "#a78bfa", C: "#34d399" };
const EVENT_COLOR: Record<c.ClusterEvent["kind"], string> = {
  write: "text-fg-inverse",
  read: "text-sky-200",
  "quorum-failed": "text-rose-300",
  down: "text-rose-300",
  up: "text-emerald-300",
  "hint-stored": "text-amber-200",
  "hint-replayed": "text-emerald-300",
  "anti-entropy": "text-emerald-300",
  "re-home": "text-amber-200",
};

const VALUES = ["alice", "alicia", "bob", "cleo", "dev", "eve"];

export default function ClusterLab() {
  const [state, dispatch] = useReducer(reducer, undefined, seed);
  const [key, setKey] = useState("user:1");
  const [valueIndex, setValueIndex] = useState(1);
  const keys = c.keysIn(state);
  const up = c.upCount(state);

  const write = () => {
    dispatch({ type: "put", key, value: VALUES[valueIndex % VALUES.length] });
    setValueIndex((i) => i + 1);
  };

  return (
    <Stage
      title="Take a node down. Watch it heal."
      kind="Simulation"
      caption="A browser model of the cache's documented behaviour: three replicas per key, reads and writes need two, hints replay on recovery and anti-entropy fixes the rest. Simplified to three nodes with 8 virtual nodes each (the real default is 150)."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <svg viewBox="-1.25 -1.25 2.5 2.5" className="mx-auto block w-full max-w-[18rem]" role="img" aria-label={`Hash ring with ${c.VNODES} virtual nodes for each of nodes A, B and C; ${up} of 3 nodes up`}>
            <circle r="1" fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="0.02" />
            {c.ring.map((v, i) => {
              const a = v.position * 2 * Math.PI - Math.PI / 2;
              return (
                <circle
                  key={i}
                  cx={Math.cos(a)}
                  cy={Math.sin(a)}
                  r="0.055"
                  fill={state.up[v.node] ? NODE_COLOR[v.node] : "#3f3f46"}
                  className="transition-[fill] duration-500"
                />
              );
            })}
            {keys.map((k) => {
              const a = c.keyPosition(k) * 2 * Math.PI - Math.PI / 2;
              return (
                <g key={k}>
                  <circle cx={Math.cos(a) * 0.78} cy={Math.sin(a) * 0.78} r="0.035" fill="#f5f5f7" />
                  <text x={Math.cos(a) * 0.6} y={Math.sin(a) * 0.6} fontSize="0.11" fill="#a1a1a6" textAnchor="middle" dominantBaseline="middle">
                    {k}
                  </text>
                </g>
              );
            })}
            <text y="-0.06" fontSize="0.2" fill="#f5f5f7" textAnchor="middle" fontWeight="600">
              {up}/3
            </text>
            <text y="0.16" fontSize="0.1" fill="#86868b" textAnchor="middle">
              nodes up
            </text>
          </svg>

          <ul className="mt-5 grid grid-cols-3 gap-2">
            {c.NODES.map((n) => (
              <li key={n}>
                <button
                  type="button"
                  aria-pressed={!state.up[n]}
                  onClick={() => dispatch({ type: "toggle", node: n })}
                  className={`flex min-h-16 w-full flex-col items-center justify-center rounded-2xl text-sm font-semibold ring-1 transition-colors ${
                    state.up[n] ? "bg-white/5 ring-white/12 hover:bg-white/10" : "bg-rose-400/10 text-rose-200 ring-rose-400/50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="size-2 rounded-full" style={{ background: state.up[n] ? NODE_COLOR[n] : "#f87171" }} />
                    Node {n}
                  </span>
                  <span className="mt-0.5 text-xs font-normal text-muted-inverse">{state.up[n] ? "Take down" : "Restore"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid content-start gap-4">
          <div className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs text-dim-inverse">
              Key
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="min-h-11 rounded-full bg-ink px-3 font-mono text-sm text-fg-inverse ring-1 ring-white/15"
              >
                {["user:1", "cart:9", "session:7", "order:42"].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <Control primary onClick={write}>
              PUT {VALUES[valueIndex % VALUES.length]}
            </Control>
            <Control onClick={() => dispatch({ type: "get", key })}>GET</Control>
            <Control onClick={() => dispatch({ type: "reset" })}>Reset</Control>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-ink p-4 ring-1 ring-white/8">
            <Readout label="Replicas" value={c.REPLICATION} />
            <Readout label="Quorum" value={`${c.WRITE_QUORUM} of ${c.REPLICATION}`} tone={up >= c.WRITE_QUORUM ? "good" : "bad"} />
            <Readout label="Hints held" value={state.hints.length} tone={state.hints.length ? "accent" : undefined} />
          </div>

          <table className="w-full text-left font-mono text-xs">
            <caption className="sr-only">Value and version of each key on each node</caption>
            <thead>
              <tr className="text-dim-inverse">
                <th scope="col" className="py-1 font-normal">
                  key
                </th>
                {c.NODES.map((n) => (
                  <th key={n} scope="col" className="py-1 font-normal">
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k} className="border-t border-white/6">
                  <th scope="row" className="py-1.5 font-normal text-muted-inverse">
                    {k}
                  </th>
                  {c.NODES.map((n) => {
                    const entry = state.stores[n][k];
                    return (
                      <td key={n} className={`py-1.5 ${state.up[n] ? "" : "opacity-40"}`}>
                        {entry ? (
                          <>
                            {entry.value} <span className="text-dim-inverse">v{entry.version}</span>
                          </>
                        ) : (
                          <span className="text-dim-inverse">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <p className="mb-2 text-xs text-dim-inverse">Healing events, newest first</p>
            <ol aria-live="polite" className="max-h-44 overflow-y-auto rounded-2xl bg-ink p-3 font-mono text-[0.6875rem] ring-1 ring-white/8">
              {state.events.slice(0, 8).map((e) => (
                <li key={e.id} className={`py-0.5 ${EVENT_COLOR[e.kind]}`}>
                  {e.text}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Stage>
  );
}
