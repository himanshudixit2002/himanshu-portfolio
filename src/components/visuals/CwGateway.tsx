"use client";

import { useId, useMemo, useState } from "react";
import { BUDGET, PII_SAMPLE, ROUTES } from "@/content/compliancewatch/messages";
import { PII_KINDS, scrub, type PiiKind } from "@/lib/sim/compliance";
import { Control, Stage } from "./Stage";

const ACCENT = "#8ab4ff";
const LABEL = "text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase";
const FADE = "transition-opacity duration-(--dur-base)";

/**
 * ComplianceWatch's llm-gateway, the one door every model call goes through:
 * the PII masking a prompt passes through before it leaves (the gateway's own
 * patterns, ported), the per-feature routes with the qa route's circuit
 * breaker replayed call by call (domain/breaker.py, application/complete.py),
 * and a tenant's monthly budget with its alarm and its refusal
 * (application/metering.py).
 */
export default function CwGateway() {
  return (
    <Stage
      title="What leaves, and what it costs"
      kind="Simulation"
      xray="Client island · the llm-gateway's masking patterns (ported and tested), its routes, circuit breaker and budget rules (lib/sim/compliance, content/compliancewatch)"
      caption="ComplianceWatch's llm-gateway, in your browser: the PII masking every prompt passes through before it leaves, the per-feature routes with a fallback and a circuit breaker, and the monthly budgets. The message is sample text, and nothing is sent anywhere."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)]">
        <Masking />
        <div className="grid min-w-0 content-start gap-6">
          <Routes />
          <Budgets />
        </div>
      </div>
    </Stage>
  );
}

/* ── Masking ───────────────────────────────────────────────────────────── */

const PRESETS = [
  { name: "The sample", text: PII_SAMPLE },
  { name: "A split mobile", text: "Call 98765 43210, or +91 98765 43210 from abroad, about invoice 12345 67890." },
  { name: "Hindi", text: "मेरा नंबर 9876543210 है, GSTIN 29ABCDE1234F1Z5" },
];

const KIND: Record<PiiKind, string> = { gstin: "GSTIN", pan: "PAN", aadhaar: "Aadhaar", phone: "Phone", email: "Email" };

/** The placeholders scrub() writes. Split on the group, they land at the odd indices. */
const PLACEHOLDER = /(\[(?:GSTIN|PAN|AADHAAR|PHONE|EMAIL)\])/;

function Masking() {
  const id = useId();
  const [text, setText] = useState(PII_SAMPLE);
  const { text: masked, counts } = useMemo(() => scrub(text), [text]);

  return (
    <div className="flex min-w-0 flex-col">
      <p className="text-sm font-semibold">Masked before it leaves</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Control key={p.name} active={text === p.text} onClick={() => setText(p.text)} className="min-h-9 px-3 text-xs">
            {p.name}
          </Control>
        ))}
      </div>

      <label htmlFor={`${id}-in`} className={`mt-4 ${LABEL}`}>
        A question a CA might paste
      </label>
      <textarea
        id={`${id}-in`}
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="mt-1.5 w-full resize-none rounded-2xl bg-ink px-4 py-3 text-sm leading-relaxed text-fg-inverse ring-1 ring-white/8 outline-none focus-visible:ring-2 focus-visible:ring-accent-bright"
      />

      <p className={`mt-4 flex flex-wrap justify-between gap-x-3 ${LABEL}`}>
        <span>As it leaves</span>
        <span className="font-normal tracking-normal normal-case">what the model, the cache and the trace see</span>
      </p>
      <p
        aria-live="polite"
        className="mt-1.5 min-h-40 flex-1 rounded-2xl bg-ink px-4 py-3 text-sm leading-relaxed break-words text-muted-inverse ring-1 ring-white/8 sm:min-h-28"
      >
        {masked.trim() ? (
          masked.split(PLACEHOLDER).map((part, i) =>
            i % 2 ? (
              <span
                key={i}
                className="rounded-md bg-[#8ab4ff]/12 px-1 py-px font-mono text-xs whitespace-nowrap text-[#8ab4ff] ring-1 ring-[#8ab4ff]/30 ring-inset"
              >
                {part}
              </span>
            ) : (
              part
            ),
          )
        ) : (
          <span className="text-dim-inverse">Nothing to send.</span>
        )}
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Masked, by kind">
        {PII_KINDS.map((kind) => (
          <li
            key={kind}
            className={`rounded-full px-2.5 py-1 font-mono text-[0.6875rem] ring-1 ring-inset transition-colors duration-(--dur-base) ${
              counts[kind] ? "text-[#8ab4ff] ring-[#8ab4ff]/35" : "text-dim-inverse ring-white/10"
            }`}
          >
            {KIND[kind]} {counts[kind]}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-dim-inverse">
        No provider on these routes runs in India, so these five are masked before any call. GSTINs go first, since a GSTIN holds a PAN. A ten-digit mobile is
        masked as written, a split one only behind +91 or 0, so two amounts side by side stay as they are. The patterns are ASCII: Devanagari is never touched.
      </p>
    </div>
  );
}

/* ── Routes and the breaker ────────────────────────────────────────────── */

const QA = ROUTES.find((r) => r.feature === "qa")!;
const EVERY = 10;
const CALLS = 10;

type Try = "answered" | "failed" | "skipped";
type Call = { t: number; primary: Try; probe: boolean; opens: boolean };

/**
 * One qa call every ten seconds, through the gateway's rules: each call tries
 * the primary unless its breaker is open, and a failed or skipped primary
 * leaves the call to the fallback. The breaker opens at the third failure in a
 * row; once its wait is over it lets exactly one probe through, and a failed
 * probe opens it again for a full window. The fallback stays healthy.
 */
function replay(primaryFails: boolean): Call[] {
  let failures = 0;
  let state: "closed" | "open" | "half_open" = "closed";
  let openedAt = 0;
  const calls: Call[] = [];
  for (let i = 0; i < CALLS; i++) {
    const t = i * EVERY;
    let probe = false;
    if (state === "open") {
      if (t < openedAt + BUDGET.breakerSeconds) {
        calls.push({ t, primary: "skipped", probe, opens: false });
        continue;
      }
      state = "half_open";
      probe = true;
    }
    if (!primaryFails) {
      failures = 0;
      state = "closed";
      calls.push({ t, primary: "answered", probe, opens: false });
      continue;
    }
    failures += 1;
    const opens = state === "half_open" || failures >= BUDGET.breakerFailures;
    if (opens) {
      state = "open";
      openedAt = t;
    }
    calls.push({ t, primary: "failed", probe, opens });
  }
  return calls;
}

const HEALTHY = replay(false);
const OUTAGE = replay(true);
const PROBE = OUTAGE.find((c) => c.probe)?.t;

/** A time on the axis as a percentage of its width; each call sits mid-column. */
const at = (t: number) => Math.min(1, (t / EVERY + 0.5) / CALLS) * 100;

const WINDOWS = OUTAGE.filter((c) => c.opens).map((c, i) => ({ from: at(c.t), to: at(c.t + BUDGET.breakerSeconds), again: i > 0 }));

const describe = (c: Call) =>
  c.primary === "answered"
    ? `${c.t} s: the primary answers.`
    : c.primary === "skipped"
      ? `${c.t} s: breaker open, straight to the fallback.`
      : c.probe
        ? `${c.t} s: one probe tries the primary and fails, so the breaker opens again; the fallback answers.`
        : c.opens
          ? `${c.t} s: the primary fails again, ${BUDGET.breakerFailures} in a row, and the breaker opens; the fallback answers.`
          : `${c.t} s: the primary fails; the fallback answers.`;

const modelName = (id: string) => {
  const [creator, name] = id.split("/");
  return (
    <>
      {creator}/<wbr />
      {name}
    </>
  );
};

function Routes() {
  const id = useId();
  const [failing, setFailing] = useState(false);
  const calls = failing ? OUTAGE : HEALTHY;

  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold">Routes, with a fallback and a breaker</p>
      <table className="mt-2 w-full text-left font-mono text-[0.6875rem]">
        <caption className="sr-only">The gateway&rsquo;s routes: per feature, the primary model, the fallback and the timeout per call</caption>
        <thead>
          <tr className={LABEL}>
            <th scope="col" className="pr-3 pb-1 font-semibold">
              Feature
            </th>
            <th scope="col" className="pr-3 pb-1 font-semibold">
              Primary <span aria-hidden="true">→</span>
              <span className="sr-only">, then</span> fallback
            </th>
            <th scope="col" className="hidden pb-1 text-right font-semibold sm:table-cell">
              Timeout
            </th>
          </tr>
        </thead>
        <tbody>
          {ROUTES.map((r) => (
            <tr key={r.feature} className="border-t border-white/6 align-baseline">
              <th scope="row" className="py-1 pr-3 font-normal text-fg-inverse">
                {r.feature}
              </th>
              {/* Below sm the timeout joins this cell, so the model ids get the width. */}
              <td className="py-1 leading-relaxed [overflow-wrap:anywhere] sm:pr-3">
                <span style={{ color: ACCENT }}>{modelName(r.primary)}</span>{" "}
                {r.fallback ? (
                  <>
                    <span aria-hidden="true" className="text-dim-inverse">
                      →
                    </span>
                    <span className="sr-only">, then</span> <span className="text-amber-300">{modelName(r.fallback)}</span>
                  </>
                ) : (
                  <span className="text-dim-inverse">· no fallback</span>
                )}
                <span className="text-dim-inverse sm:hidden"> · {r.timeout}&nbsp;s timeout</span>
              </td>
              <td className="hidden py-1 text-right whitespace-nowrap text-muted-inverse tabular-nums sm:table-cell">{r.timeout} s</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs leading-relaxed text-dim-inverse">
        Retrieval has none: two models&rsquo; vectors don&rsquo;t compare, so the gateway won&rsquo;t start with one.
      </p>

      <div className="mt-3 rounded-2xl bg-ink p-3 ring-1 ring-white/8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={LABEL}>
            {QA.feature} · a call every {EVERY} seconds
          </p>
          <div role="group" aria-labelledby={`${id}-fail`} className="flex items-center gap-1.5">
            <span id={`${id}-fail`} className="mr-1 text-xs text-dim-inverse">
              Primary failing
            </span>
            <Control active={!failing} onClick={() => setFailing(false)} className="min-h-9 px-3 text-xs">
              No
            </Control>
            <Control active={failing} onClick={() => setFailing(true)} className="min-h-9 px-3 text-xs">
              Yes
            </Control>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-2 gap-y-1 text-[0.6875rem] text-muted-inverse">
          <div aria-hidden="true" className="grid grid-rows-[1.125rem_1.125rem] items-center">
            <span>Primary</span>
            <span>Fallback</span>
          </div>
          <ol className="grid grid-cols-10" aria-label={`${CALLS} ${QA.feature} calls, one every ${EVERY} seconds`}>
            {calls.map((c) => (
              <li key={c.t} className="grid grid-rows-[1.125rem_1.125rem] place-items-center">
                <span className="sr-only">{describe(c)}</span>
                <PrimaryMark state={c.primary} />
                <span aria-hidden="true" className="relative grid size-3 place-items-center">
                  <span className="size-1 rounded-full bg-white/15" />
                  <span className={`absolute inset-0 rounded-full bg-amber-300 ${FADE} ${c.primary === "answered" ? "opacity-0" : ""}`} />
                </span>
              </li>
            ))}
          </ol>

          <span aria-hidden="true" className="self-center">
            Breaker
          </span>
          <div aria-hidden="true" className="relative h-4 self-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
            <span className="absolute top-1/2 left-0 -translate-y-1/2 bg-ink pr-1.5 font-mono text-[0.625rem] text-dim-inverse">closed</span>
            {WINDOWS.map((w) => (
              <span
                key={w.from}
                className={`absolute inset-y-0 grid place-items-center overflow-hidden rounded-full bg-rose-400/25 font-mono text-[0.625rem] whitespace-nowrap text-rose-100 ring-1 ring-rose-300/40 ring-inset ${FADE} ${
                  failing ? "" : "opacity-0"
                }`}
                style={{ left: `calc(${w.from}% + 1px)`, width: `calc(${w.to - w.from}% - 2px)` }}
              >
                {w.again ? (
                  "again"
                ) : (
                  <span>
                    <span className="hidden sm:inline">{BUDGET.breakerFailures} failures in a row: </span>open {BUDGET.breakerSeconds}&nbsp;s
                  </span>
                )}
              </span>
            ))}
          </div>

          <span aria-hidden="true" className="text-dim-inverse">
            Seconds
          </span>
          <div aria-hidden="true" className="grid grid-cols-10 font-mono text-[0.625rem] text-dim-inverse">
            {calls.map((c) => (
              <span key={c.t} className="text-center">
                {c.t}
              </span>
            ))}
          </div>
        </div>

        <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-muted-inverse">
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: ACCENT }} />
            primary answers
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-amber-300" />
            fallback answers
          </li>
          <li className="flex items-center gap-1.5">
            <Cross className="size-2.5" />
            failed, up to {QA.timeout}&nbsp;s lost
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-0.5 w-2.5 rounded-full bg-white/30" />
            not tried
          </li>
        </ul>

        <p aria-live="polite" className="mt-2 min-h-10 text-xs leading-relaxed text-muted-inverse sm:min-h-5">
          {failing ? (
            <>
              <span className="font-semibold text-rose-200">Breaker open for {BUDGET.breakerSeconds}&nbsp;s: straight to the fallback.</span> The probe at{" "}
              {PROBE}&nbsp;s fails: open again.
            </>
          ) : (
            <>
              <span className="font-semibold text-fg-inverse">Breaker closed:</span> the primary answers every call; the fallback is never asked.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" className={`text-rose-300 ${className}`}>
      <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** What the primary did for one call: answered, tried and failed, or not tried. */
function PrimaryMark({ state }: { state: Try }) {
  const shown = (s: Try) => `${FADE} ${state === s ? "" : "opacity-0"}`;
  return (
    <span aria-hidden="true" className="relative grid size-3 place-items-center">
      <span className={`absolute inset-0 rounded-full ${shown("answered")}`} style={{ background: ACCENT }} />
      <Cross className={`absolute inset-0 size-3 ${shown("failed")}`} />
      <span className={`h-0.5 w-2.5 rounded-full bg-white/30 ${shown("skipped")}`} />
    </span>
  );
}

/* ── Budgets ───────────────────────────────────────────────────────────── */

const SPEND_MAX = 1800;
const LIMIT = BUDGET.tenantMonthly;
const ALARM = LIMIT * BUDGET.alarmAt;

type Standing = "within" | "alarm" | "refused";

/** BudgetStatus (domain/budgets.py): used up at the limit, alarmed at the ratio. */
const standing = (spent: number): Standing => (spent >= LIMIT ? "refused" : spent / LIMIT >= BUDGET.alarmAt ? "alarm" : "within");

const TONE: Record<Standing, { text: string; bar: string; box: string }> = {
  within: { text: "text-emerald-300", bar: "bg-emerald-400/80", box: "bg-emerald-300/10" },
  alarm: { text: "text-amber-300", bar: "bg-amber-400/80", box: "bg-amber-300/10" },
  refused: { text: "text-rose-300", bar: "bg-rose-400/80", box: "bg-rose-300/10" },
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const pct = (n: number) => `${(n / SPEND_MAX) * 100}%`;

function Budgets() {
  const id = useId();
  const [spent, setSpent] = useState(1240);
  const now = standing(spent);

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`${id}-spent`} className="text-sm font-semibold">
          Budgets <span className="font-normal text-dim-inverse">· spent this month by one tenant</span>
        </label>
        <span className={`min-w-16 text-right font-mono text-sm tabular-nums transition-colors duration-(--dur-base) ${TONE[now].text}`}>{inr(spent)}</span>
      </div>
      <input
        id={`${id}-spent`}
        type="range"
        min={0}
        max={SPEND_MAX}
        step={10}
        value={spent}
        onChange={(e) => setSpent(Number(e.target.value))}
        aria-valuetext={`${inr(spent)} of ${inr(LIMIT)}`}
        className="mt-1.5 block w-full accent-[#5ca4ff] outline-none focus-visible:ring-2 focus-visible:ring-accent-bright"
      />
      {/* Inset by half the native thumb, so the fill ends under it. */}
      <div aria-hidden="true" className="mx-2 mt-1.5">
        <div className="relative h-2 rounded-full bg-white/8">
          <span className="absolute inset-y-0 bg-amber-300/12" style={{ left: pct(ALARM), right: `calc(100% - ${pct(LIMIT)})` }} />
          <span className="absolute inset-y-0 right-0 rounded-r-full bg-rose-300/15" style={{ left: pct(LIMIT) }} />
          <div className={`relative h-full rounded-full transition-[width,background-color] duration-(--dur-base) ${TONE[now].bar}`} style={{ width: pct(spent) }} />
          <span className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 rounded-full bg-amber-300" style={{ left: pct(ALARM) }} />
          <span className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 rounded-full bg-rose-300" style={{ left: pct(LIMIT) }} />
        </div>
        <div className="relative mt-1 h-4 font-mono text-[0.625rem] text-dim-inverse">
          <span className="absolute left-0">{inr(0)}</span>
          <span className="absolute -translate-x-full pr-1.5 text-amber-200/80" style={{ left: pct(ALARM) }}>
            alarm {inr(ALARM)}
          </span>
          <span className="absolute pl-1.5 text-rose-200/80" style={{ left: pct(LIMIT) }}>
            {inr(LIMIT)}
          </span>
        </div>
      </div>

      <div aria-live="polite" className={`mt-2 min-h-[4.625rem] rounded-xl px-3 py-1.5 transition-colors duration-(--dur-base) sm:min-h-[3.375rem] ${TONE[now].box}`}>
        {now === "within" ? (
          <>
            <p className="text-sm font-medium text-emerald-200">Within budget</p>
            <p className="text-xs leading-relaxed text-muted-inverse">
              {inr(ALARM - spent)} to go before the alarm at {BUDGET.alarmAt * 100}% of {inr(LIMIT)}.
            </p>
          </>
        ) : now === "alarm" ? (
          <>
            <p className="text-sm font-medium text-amber-200">Alarm raised at {BUDGET.alarmAt * 100}%</p>
            <p className="text-xs leading-relaxed text-muted-inverse">
              Calls still go through; <span className="font-mono">llm.budget.alarmed</span> fires once this month.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-rose-200">
              <span className="font-mono">429</span> · LLM budget exceeded
            </p>
            <p className="text-xs leading-relaxed text-muted-inverse">
              Refused before any model is called; <span className="font-mono">Retry-After</span>: until the UTC month turns.
            </p>
          </>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-dim-inverse">
        Each feature also has {inr(BUDGET.featureMonthly)} a month across tenants; a regulatory call, made for no tenant, meets only that one.
      </p>
    </div>
  );
}
