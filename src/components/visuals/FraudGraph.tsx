"use client";

import { useState } from "react";
import { edges, neighbourhood, nodes, sharedSignals, users, type NodeKind } from "@/lib/sim/fraud-graph";
import { Control, Stage } from "./Stage";

const KIND_STYLE: Record<NodeKind, { fill: string; r: number }> = {
  user: { fill: "#f5f5f7", r: 0.028 },
  card: { fill: "#fbbf24", r: 0.022 },
  device: { fill: "#a78bfa", r: 0.024 },
  merchant: { fill: "#38bdf8", r: 0.03 },
};

const W = 1;
const H = 0.62;
const pos = (n: { x: number; y: number }) => ({ x: 0.04 + n.x * 0.92 * W, y: 0.05 + n.y * 0.52 });

export default function FraudGraph() {
  const [focus, setFocus] = useState("u5");
  const hood = neighbourhood(focus, 2);
  const focusNode = nodes.find((n) => n.id === focus)!;
  const signals = sharedSignals(focus);

  return (
    <Stage
      title="Judge a transaction by the company it keeps"
      kind="Simulation"
      caption="Synthetic accounts, cards, devices and merchants in the shape the engine builds. The shared-signal count is an illustration, not the engine's model score — its graph network isn't trained yet."
    >
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose an account">
        {users.map((u) => (
          <Control key={u.id} active={focus === u.id} onClick={() => setFocus(u.id)} className="min-h-9 px-3 text-xs">
            {u.label}
          </Control>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 block w-full" role="img" aria-label={`Transaction graph. ${focusNode.label}'s two-hop neighbourhood is highlighted: ${[...hood].map((id) => nodes.find((n) => n.id === id)!.label).join(", ")}.`}>
        {edges.map((e, i) => {
          const a = pos(nodes.find((n) => n.id === e.from)!);
          const b = pos(nodes.find((n) => n.id === e.to)!);
          const on = hood.has(e.from) && hood.has(e.to);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={on ? "#f87171" : "rgb(255 255 255 / 0.12)"}
              strokeWidth={on ? 0.005 : 0.003}
              className="transition-[stroke] duration-500"
            />
          );
        })}
        {nodes.map((n) => {
          const p = pos(n);
          const s = KIND_STYLE[n.kind];
          const on = hood.has(n.id);
          return (
            <g key={n.id} opacity={on ? 1 : 0.35} className="transition-opacity duration-500">
              <circle cx={p.x} cy={p.y} r={s.r} fill={s.fill} stroke={n.id === focus ? "#f87171" : "none"} strokeWidth="0.008" />
              <text x={p.x} y={p.y + s.r + 0.03} fontSize="0.022" fill="#d4d4d8" textAnchor="middle">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted-inverse" aria-label="Legend">
        {(Object.keys(KIND_STYLE) as NodeKind[]).map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: KIND_STYLE[k].fill }} aria-hidden="true" />
            {k}
          </li>
        ))}
      </ul>

      <p
        aria-live="polite"
        className={`mt-4 rounded-xl px-3 py-2.5 text-sm ${signals ? "bg-rose-300/10 text-rose-100" : "bg-white/5 text-muted-inverse"}`}
      >
        {signals
          ? `${focusNode.label} shares a device or card with ${signals} other account${signals > 1 ? "s" : ""} within two hops — the pattern a ring leaves behind.`
          : `${focusNode.label}'s neighbourhood reaches shared merchants, but no other account shares their device or card.`}
      </p>
    </Stage>
  );
}
