"use client";

import { useEffect, useId, useReducer, useRef, useState, type FormEvent } from "react";
import { useMotionPreference } from "@/components/motion/MotionPreferences";
import * as kv from "@/lib/sim/kvstore";
import { Control, Stage } from "./Stage";
import { useInterval, useOnScreen } from "./useNearViewport";

type Action =
  | { type: "run"; input: string }
  | { type: "runMany"; inputs: string[] }
  | { type: "tick"; ms: number }
  | { type: "flush" }
  | { type: "reset" };

function reducer(state: kv.KvState, action: Action): kv.KvState {
  switch (action.type) {
    case "run":
      return kv.execute(state, action.input);
    case "runMany":
      return action.inputs.reduce(kv.execute, state);
    case "tick":
      return kv.advance(state, action.ms);
    case "flush":
      return kv.flushLog(state);
    case "reset":
      return kv.initialKv();
  }
}

// Four keys that land on the same shard, to show LRU eviction.
const crowd = (() => {
  const target = kv.shardFor("user:1");
  const keys = ["user:1"];
  for (let i = 2; keys.length <= kv.SHARD_CAPACITY; i++) if (kv.shardFor(`user:${i}`) === target) keys.push(`user:${i}`);
  return keys.map((k, i) => `SET ${k} v${i + 1}`);
})();

const EXAMPLES = ["SET name Alice", "GET name", "SET session_token abc PX 5000", "GET session_token", "DEL name"];
const TICK = 250;
/** Typed and run once, the first time the explorer is well in view, so it shows how it's used. */
const INTRO = ["SET city Pune", "GET city"];

export default function KvExplorer({ compact = false }: { compact?: boolean }) {
  const [state, dispatch] = useReducer(reducer, undefined, kv.initialKv);
  const [input, setInput] = useState("");
  const [paused, setPaused] = useState(false);
  const [ticks, setTicks] = useState(0);
  const inputId = useId();
  const [frame, onScreen] = useOnScreen<HTMLDivElement>();

  // The clock drives TTLs; every fourth tick the background worker writes the log.
  useInterval(
    () => {
      dispatch({ type: "tick", ms: TICK });
      setTicks((t) => t + 1);
      if ((ticks + 1) % 4 === 0) dispatch({ type: "flush" });
    },
    TICK,
    !paused && onScreen,
  );

  // The intro: type each command a key at a time, run it, then hand over.
  // Full motion only, before anything has been run, and it stops the moment
  // the reader presses or focuses anything in the explorer.
  const { reduced } = useMotionPreference();
  const [introDone, setIntroDone] = useState(false);
  // Read when the intro would start (not a dependency: running its own commands mustn't cancel it).
  const ran = useRef(0);
  useEffect(() => {
    ran.current = state.history.length;
  });
  useEffect(() => {
    const el = frame.current;
    if (!el || introDone || reduced) return;
    const timers: number[] = [];
    const stop = () => {
      timers.forEach(window.clearTimeout);
      if (timers.length) setInput("");
      setIntroDone(true);
    };
    const start = () => {
      if (ran.current > 0) return setIntroDone(true);
      let t = 400;
      for (const cmd of INTRO) {
        for (let i = 1; i <= cmd.length; i++) {
          const text = cmd.slice(0, i);
          timers.push(window.setTimeout(() => setInput(text), t));
          t += 60;
        }
        t += 380;
        timers.push(
          window.setTimeout(() => {
            dispatch({ type: "run", input: cmd });
            setInput("");
          }, t),
        );
        t += 1100;
      }
      timers.push(window.setTimeout(() => setIntroDone(true), t));
    };
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        start();
      },
      { threshold: 0.4 },
    );
    seen.observe(el);
    el.addEventListener("pointerdown", stop);
    el.addEventListener("focusin", stop);
    return () => {
      seen.disconnect();
      timers.forEach(window.clearTimeout);
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("focusin", stop);
    };
  }, [frame, introDone, reduced]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    dispatch({ type: "run", input });
    setInput("");
  };

  const latest = state.history[0];
  const queued = kv.queuedCount(state);

  return (
    <div ref={frame}>
    <Stage
      title="KVStore, command by command"
      kind="Simulation"
      caption="A browser model of KVStore's design, not the C++ server. Keys hash with FNV-1a here (the server uses std::hash), and shards hold 3 keys instead of about 62 so eviction is visible. The real log is flushed to the OS but not fsynced, and isn't yet replayed on start-up."
    >
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Command
        </label>
        <div className="flex min-h-11 flex-1 items-center gap-2 rounded-full bg-ink px-4 font-mono text-sm ring-1 ring-white/15 focus-within:ring-accent-bright">
          <span aria-hidden="true" className="text-dim-inverse">
            &gt;
          </span>
          <input
            id={inputId}
            value={input}
            maxLength={kv.MAX_INPUT}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SET city Pune"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent py-2 text-fg-inverse outline-none placeholder:text-dim-inverse"
          />
        </div>
        <Control primary type="submit">
          Run
        </Control>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => dispatch({ type: "run", input: e })}
            className="min-h-9 rounded-full bg-white/6 px-3 font-mono text-xs text-muted-inverse transition-colors hover:bg-white/12 hover:text-fg-inverse"
          >
            {e}
          </button>
        ))}
        <button
          type="button"
          onClick={() => dispatch({ type: "runMany", inputs: crowd })}
          className="min-h-9 rounded-full bg-amber-300/12 px-3 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-300/20"
        >
          Overfill one shard
        </button>
      </div>

      <div className={`mt-6 grid gap-6 ${compact ? "" : "lg:grid-cols-[1.35fr_1fr]"}`}>
        <div>
          <p className="mb-2 text-xs text-dim-inverse">16 shards · most recently used first</p>
          <ol className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {state.shards.map((entries, i) => (
              <li
                key={i}
                aria-label={`Shard ${i}: ${entries.length ? entries.map((e) => e.key).join(", ") : "empty"}`}
                className={`min-h-[4.75rem] rounded-xl p-1.5 transition-colors duration-300 ${
                  state.active === i ? "bg-amber-300/15 ring-1 ring-amber-300/70" : "bg-white/4 ring-1 ring-white/6"
                }`}
              >
                <span className="block font-mono text-[0.625rem] text-dim-inverse">{String(i).padStart(2, "0")}</span>
                <span className="mt-1 flex flex-col gap-0.5">
                  {entries.map((e) => {
                    const ttl = kv.ttlOf(e, state.now);
                    const expired = ttl === 0;
                    return (
                      <span
                        key={e.key}
                        title={`${e.key} = ${e.value}`}
                        className={`truncate rounded-md px-1 py-0.5 font-mono text-[0.625rem] ${
                          expired ? "bg-white/5 text-dim-inverse line-through" : "bg-amber-300/15 text-amber-100"
                        }`}
                      >
                        {e.key}
                        {ttl !== null && !expired && <span className="text-amber-300/80"> {Math.ceil(ttl / 1000)}s</span>}
                      </span>
                    );
                  })}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-xs text-dim-inverse">Replies</p>
            <div aria-live="polite" className="sr-only">
              {latest ? `${latest.input}: ${latest.reply}${latest.note ? `. ${latest.note}` : ""}` : ""}
            </div>
            <ol className="min-h-[7.5rem] rounded-2xl bg-ink p-3 font-mono text-xs ring-1 ring-white/8">
              {state.history.length === 0 && <li className="text-dim-inverse">Run a command to see the reply.</li>}
              {state.history.slice(0, compact ? 4 : 6).map((h, i) => (
                <li key={state.history.length - i} className={`py-0.5 ${i === 0 ? "" : "opacity-55"}`}>
                  <span className="text-dim-inverse">&gt; </span>
                  <span className="break-all">{h.input}</span>
                  <span className={`ml-2 ${h.ok ? "text-emerald-300" : "text-rose-300"}`}>{h.reply}</span>
                  {h.shard !== null && <span className="ml-2 text-amber-300/80">shard {h.shard}</span>}
                  {h.note && i === 0 && <span className="block text-muted-inverse">{h.note}</span>}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="mb-2 flex justify-between text-xs text-dim-inverse">
              <span>Write-ahead log</span>
              <span>{queued ? `${queued} queued` : "all written"}</span>
            </p>
            <ol className="flex min-h-11 flex-wrap gap-1.5">
              {state.log.length === 0 && <li className="text-xs text-dim-inverse">SET and DEL are queued here, then written in a batch.</li>}
              {state.log.map((r) => (
                <li
                  key={r.seq}
                  className={`rounded-md px-2 py-1 font-mono text-[0.6875rem] transition-colors duration-500 ${
                    r.state === "queued" ? "bg-sky-300/15 text-sky-200 ring-1 ring-sky-300/50" : "bg-white/5 text-dim-inverse"
                  }`}
                >
                  {r.line}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Control onClick={() => setPaused((p) => !p)} active={paused}>
          {paused ? "Resume clock" : "Pause clock"}
        </Control>
        <Control onClick={() => dispatch({ type: "tick", ms: 1000 })}>+1 s</Control>
        <Control onClick={() => dispatch({ type: "flush" })} disabled={!queued}>
          Write log now
        </Control>
        <Control onClick={() => dispatch({ type: "reset" })}>Reset</Control>
        <span className="ml-auto font-mono text-xs text-dim-inverse">t = {(state.now / 1000).toFixed(1)} s</span>
      </div>
    </Stage>
    </div>
  );
}
