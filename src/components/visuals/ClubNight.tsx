"use client";

import { useReducer, useState } from "react";
import * as cafe from "@/lib/sim/cafe";
import { Control, Readout, Stage } from "./Stage";

type Action =
  | { type: "start"; tableId: string; players: number; membership: cafe.Membership }
  | { type: "order"; tableId: string; item: (typeof cafe.MENU)[number]["item"] }
  | { type: "advance"; minutes: number }
  | { type: "close"; tableId: string }
  | { type: "reset" };

function reducer(state: cafe.CafeState, action: Action): cafe.CafeState {
  switch (action.type) {
    case "start":
      return cafe.start(state, action.tableId, action.players, action.membership);
    case "order":
      return cafe.addOrder(state, action.tableId, action.item);
    case "advance":
      return cafe.advance(state, action.minutes);
    case "close":
      return cafe.close(state, action.tableId);
    case "reset":
      return cafe.initialCafe();
  }
}

const seed = () => {
  let s = cafe.start(cafe.initialCafe(), "s1", 2, "Silver");
  s = cafe.advance(s, 25);
  s = cafe.addOrder(s, "s1", "Cold coffee");
  s = cafe.start(s, "ps", 3, "None");
  return cafe.advance(s, 6);
};

const clock = (minutes: number) => {
  const total = 18 * 60 + minutes; // the club opens at 6 pm
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const STATUS_STYLE: Record<cafe.OrderStatus, string> = {
  Pending: "bg-white/8 text-muted-inverse",
  Preparing: "bg-amber-300/15 text-amber-200",
  Ready: "bg-emerald-300/15 text-emerald-200",
};

export default function ClubNight() {
  const [state, dispatch] = useReducer(reducer, undefined, seed);
  const [selected, setSelected] = useState("s1");
  const [players, setPlayers] = useState(2);
  const [membership, setMembership] = useState<cafe.Membership>("None");
  const [loser, setLoser] = useState(false);

  const table = cafe.TABLES.find((t) => t.id === selected)!;
  const session = cafe.sessionFor(state, selected);
  const bill = session ? cafe.bill(state, session) : null;

  return (
    <Stage
      title="A night at the club"
      kind="Simulation"
      caption="Sample rates, menu and membership discounts — not the club's real prices. The billing rules here (per started minute, even split rounded up) are illustrative, not the app's exact rules."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-2xl tabular-nums">{clock(state.now)}</p>
        <div className="flex flex-wrap gap-2">
          <Control onClick={() => dispatch({ type: "advance", minutes: 5 })}>+5 min</Control>
          <Control onClick={() => dispatch({ type: "advance", minutes: 30 })}>+30 min</Control>
          <Control onClick={() => dispatch({ type: "reset" })}>Reset night</Control>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Tables">
        {cafe.TABLES.map((t) => {
          const s = cafe.sessionFor(state, t.id);
          const b = s ? cafe.bill(state, s) : null;
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={selected === t.id}
                onClick={() => setSelected(t.id)}
                className={`flex min-h-24 w-full flex-col justify-between rounded-2xl p-3 text-left ring-1 transition-colors ${
                  selected === t.id ? "ring-2 ring-emerald-300" : "ring-white/10 hover:bg-white/5"
                } ${s ? "bg-emerald-400/10" : "bg-white/4"}`}
              >
                <span className="flex items-center justify-between text-sm font-semibold">
                  {t.name}
                  <span className={`size-2 rounded-full ${s ? "bg-emerald-300" : "bg-white/25"}`} aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted-inverse">
                  {s && b ? `${b.minutes} min · ${cafe.rupees(b.total)}` : `Free · ₹${t.ratePerHour}/h`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl bg-ink p-4 ring-1 ring-white/8">
          <p className="text-sm font-semibold">{table.name}</p>
          {!session ? (
            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-xs text-dim-inverse">
                Players: <span className="font-mono text-sm text-fg-inverse">{players}</span>
                <input type="range" min={1} max={6} value={players} onChange={(e) => setPlayers(Number(e.target.value))} className="accent-emerald-300" />
              </label>
              <fieldset>
                <legend className="text-xs text-dim-inverse">Membership</legend>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(Object.keys(cafe.DISCOUNT) as cafe.Membership[]).map((m) => (
                    <Control key={m} active={membership === m} onClick={() => setMembership(m)} className="min-h-9 px-3 text-xs">
                      {m}
                      {cafe.DISCOUNT[m] ? ` −${cafe.DISCOUNT[m]}%` : ""}
                    </Control>
                  ))}
                </div>
              </fieldset>
              <Control primary onClick={() => dispatch({ type: "start", tableId: selected, players, membership })}>
                Start session
              </Control>
            </div>
          ) : (
            <div className="mt-3 grid gap-3">
              <p className="text-xs text-muted-inverse">
                Started {clock(session.startedAt)} · {session.players} player{session.players > 1 ? "s" : ""} · {session.membership}
              </p>
              <div>
                <p className="text-xs text-dim-inverse">Add a café order</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {cafe.MENU.map((m) => (
                    <Control key={m.item} onClick={() => dispatch({ type: "order", tableId: selected, item: m.item })} className="min-h-9 px-3 text-xs">
                      {m.item} · ₹{m.price}
                    </Control>
                  ))}
                </div>
              </div>
              <ul className="grid gap-1" aria-label="Orders on this table">
                {session.orders.map((o) => {
                  const status = cafe.orderStatus(o, state.now);
                  return (
                    <li key={o.id} className="flex items-center justify-between text-sm">
                      <span>{o.item}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[status]}`}>{status}</span>
                    </li>
                  );
                })}
                {session.orders.length === 0 && <li className="text-xs text-dim-inverse">No orders yet.</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-ink p-4 ring-1 ring-white/8">
          <p className="text-sm font-semibold">Bill</p>
          {bill && session ? (
            <>
              <dl className="mt-3 grid gap-1.5 font-mono text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-inverse">
                    Table · {bill.minutes} min × ₹{table.ratePerHour}/h
                  </dt>
                  <dd>{cafe.rupees(bill.tableCharge)}</dd>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-emerald-300">
                    <dt>{session.membership} discount</dt>
                    <dd>−{cafe.rupees(bill.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-inverse">Café</dt>
                  <dd>{cafe.rupees(bill.cafe)}</dd>
                </div>
                <div className="mt-1 flex justify-between border-t border-white/10 pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{cafe.rupees(bill.total)}</dd>
                </div>
              </dl>
              {session.players > 1 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Control active={!loser} onClick={() => setLoser(false)} className="min-h-9 px-3 text-xs">
                    Split evenly
                  </Control>
                  <Control active={loser} onClick={() => setLoser(true)} className="min-h-9 px-3 text-xs">
                    Loser pays
                  </Control>
                  <span className="text-sm text-muted-inverse">
                    {loser ? `Loser pays ${cafe.rupees(bill.total)}` : `${cafe.rupees(bill.perPlayer)} each`}
                  </span>
                </div>
              )}
              <Control primary className="mt-4" onClick={() => dispatch({ type: "close", tableId: selected })}>
                Close table &amp; take payment
              </Control>
            </>
          ) : (
            <p className="mt-3 text-sm text-dim-inverse">Start a session to see the bill build up.</p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white/4 p-4">
        <Readout label="Tables running" value={state.sessions.length} />
        <Readout label="Closed tonight" value={state.closed.length} />
        <Readout label="Takings" value={cafe.rupees(cafe.takings(state))} tone="good" />
      </div>
    </Stage>
  );
}
