"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ACME, AS_OF, BAND_LABELS, QRMP_DELHI, SEED_RULES, STATES, TURNOVER_BANDS, type Profile } from "@/content/compliancewatch/rules";
import { decideAll, formatDate, materialise, qrmpGroup, type Verdict } from "@/lib/sim/compliance";
import { Control, Stage } from "./Stage";

const ACCENT = "#8ab4ff";
const TONE: Record<Verdict, { label: string; text: string; cell: string; ring: string }> = {
  applies: { label: "Applies", text: "text-emerald-300", cell: "bg-emerald-400/80", ring: "ring-emerald-300/30" },
  unsure: { label: "Unsure", text: "text-amber-300", cell: "bg-amber-400/80", ring: "ring-amber-300/30" },
  not_applicable: { label: "Doesn’t apply", text: "text-dim-inverse", cell: "bg-white/10", ring: "ring-white/8" },
};

const PRESETS: { name: string; note: string; profile: Profile }[] = [
  { name: ACME.name, note: "the demo tenant", profile: ACME.profile },
  { name: QRMP_DELHI.name, note: "quarterly, in Delhi", profile: QRMP_DELHI.profile },
  { name: "A new shop", note: "nothing answered yet", profile: {} },
];

type Field = {
  key: string;
  label: string;
  options: { value: string | boolean; label: string }[];
};

const FIELDS: Field[] = [
  {
    key: "registration_type",
    label: "Registration",
    options: [
      { value: "regular", label: "Regular" },
      { value: "composition", label: "Composition" },
    ],
  },
  {
    key: "filing_scheme",
    label: "Filing scheme",
    options: [
      { value: "regular_monthly", label: "Monthly" },
      { value: "regular_qrmp", label: "Quarterly (QRMP)" },
      { value: "composition", label: "Composition" },
    ],
  },
  { key: "state_codes", label: "State", options: STATES.map((s) => ({ value: s.code, label: s.label })) },
  {
    key: "generates_eway_bills",
    label: "Moves goods needing e-way bills",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  },
];

/** The stored value as the control reads it: a state list's one state, or the value itself. */
const current = (profile: Profile, key: string) => {
  const v = profile[key];
  return Array.isArray(v) ? v[0] : v;
};

/**
 * ComplianceWatch's applicability, live: the thirteen seed rules evaluated
 * against a profile you edit, with the kernel's three-valued logic, and the
 * obligations the service would materialise for the rules that apply.
 */
export default function CwApplicability() {
  const [profile, setProfile] = useState<Profile>(ACME.profile);
  const { decisions, applies, notApplicable, unsure } = useMemo(() => decideAll(SEED_RULES, profile), [profile]);
  const obligations = useMemo(() => materialise(SEED_RULES, profile, AS_OF), [profile]);
  const set = (key: string, value: string | boolean | undefined) =>
    setProfile((p) => ({ ...p, [key]: key === "state_codes" && typeof value === "string" ? [value] : value }));
  const state = current(profile, "state_codes") as string | undefined;
  const gstin = `${state ?? "··"}ABCDE1234F1Z5`.slice(0, 15);

  return (
    <Stage
      title="Thirteen rules, one business"
      kind="Simulation"
      xray="Client island · the kernel's three-valued predicate logic and the obligation service's recurrences, ported to TypeScript and tested against the Python (lib/sim/compliance)"
      caption={`ComplianceWatch's seed calendar, evaluated in your browser with the same three-valued logic as its domain kernel, as of ${formatDate(AS_OF)} (the demo's clock). The businesses are the project's demo tenant and test data; nothing here calls the service, and none of it is tax advice.`}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-8">
        {/* The profile. */}
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">Start from</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Control key={p.name} active={profile === p.profile} onClick={() => setProfile(p.profile)} className="min-h-9 px-3 text-xs">
                {p.name}
              </Control>
            ))}
          </div>
          <p className="mt-2 text-xs text-dim-inverse">{PRESETS.find((p) => p.profile === profile)?.note ?? "your edits"}</p>

          <div className="mt-5 rounded-2xl bg-ink px-4 py-3 ring-1 ring-white/8">
            <p className="text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">GSTIN</p>
            <p className="mt-1 font-mono text-lg tracking-wide" aria-label={state ? `GSTIN beginning with state code ${state}` : "GSTIN without a state"}>
              <span style={{ color: ACCENT }}>{gstin.slice(0, 2)}</span>
              <span className="text-muted-inverse">{gstin.slice(2)}</span>
            </p>
            <p className="mt-1 text-xs text-dim-inverse">
              The first two digits are the state code{state ? `: QRMP returns there are due on the ${qrmpGroup(state) === "A" ? "22nd" : "24th"}.` : "."}
            </p>
          </div>

          <div className="mt-5 grid gap-4">
            {FIELDS.map((f) => (
              <fieldset key={f.key} className="min-w-0">
                <legend className="text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">{f.label}</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {f.options.map((o) => (
                    <Control key={String(o.value)} active={current(profile, f.key) === o.value} onClick={() => set(f.key, o.value)} className="min-h-9 px-3 text-xs">
                      {o.label}
                    </Control>
                  ))}
                  <Control active={current(profile, f.key) === undefined} onClick={() => set(f.key, undefined)} className="min-h-9 px-3 text-xs">
                    Not answered
                  </Control>
                </div>
              </fieldset>
            ))}
            {(["turnover_band", "peak_turnover_band"] as const).map((key) => (
              <label key={key} className="grid gap-1.5">
                <span className="text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">
                  {key === "turnover_band" ? "Turnover last year" : "Highest turnover since 2017-18"}
                </span>
                <select
                  value={(profile[key] as string | undefined) ?? ""}
                  onChange={(e) => set(key, e.target.value || undefined)}
                  className="min-h-11 rounded-xl bg-ink px-3 text-sm text-fg-inverse ring-1 ring-white/12 outline-none focus-visible:ring-2 focus-visible:ring-accent-bright"
                >
                  <option value="">Not answered</option>
                  {TURNOVER_BANDS.map((b) => (
                    <option key={b} value={b}>
                      ₹{BAND_LABELS[b]}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <p className="text-xs leading-relaxed text-dim-inverse">
              Job work has no attribute in the ontology, so both ITC-04 rules carry it as free text: when nothing else rules them out, they wait for a person.
            </p>
          </div>
        </div>

        {/* The verdicts. */}
        <div className="min-w-0">
          <div aria-live="polite" className="grid grid-cols-3 gap-3">
            {(
              [
                ["applies", applies],
                ["unsure", unsure],
                ["not_applicable", notApplicable],
              ] as const
            ).map(([v, n]) => (
              <div key={v} className={`rounded-2xl bg-ink px-3 py-2.5 ring-1 ${TONE[v].ring}`}>
                <p className="text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">{TONE[v].label}</p>
                <p className={`mt-0.5 font-mono text-2xl tabular-nums ${TONE[v].text}`}>{n}</p>
              </div>
            ))}
          </div>
          <ol className="mt-3 grid gap-1" aria-hidden="true" style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}>
            {decisions.map((d) => (
              <li key={d.rule.key} className={`h-2 rounded-full transition-colors duration-500 ${TONE[d.verdict].cell}`} />
            ))}
          </ol>

          <ul className="mt-4 grid gap-1.5">
            {decisions.map((d) => {
              const due = obligations.filter((o) => o.ruleKey === d.rule.key);
              return (
                <li key={d.rule.key}>
                  <details className="group rounded-xl bg-white/[0.03] ring-1 ring-white/6 open:bg-white/[0.05]">
                    <summary className="grid cursor-pointer list-none grid-cols-[4.75rem_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                      <span className="justify-self-start rounded-md bg-white/6 px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-inverse">{d.rule.form}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-fg-inverse">{d.rule.title}</span>
                        <span className="block truncate text-xs text-dim-inverse">
                          {d.verdict === "applies"
                            ? due.map((o) => formatDate(o.due)).join(" · ")
                            : d.because?.reason}
                        </span>
                      </span>
                      <span className={`text-xs font-semibold whitespace-nowrap ${TONE[d.verdict].text}`}>{TONE[d.verdict].label}</span>
                    </summary>
                    <div className="border-t border-white/6 px-3 py-2.5">
                      <p className="text-xs text-dim-inverse">
                        {d.rule.source.instrument} · {d.rule.source.reference}
                      </p>
                      <ul className="mt-2 grid gap-1">
                        {d.leaves.map((l, i) => (
                          <li key={i} className="flex items-start gap-2 font-mono text-[0.6875rem] leading-relaxed">
                            <span aria-hidden="true" className={`mt-1 size-2 flex-none rounded-full ${TONE[l.effect].cell}`} />
                            <span className="min-w-0 break-words text-muted-inverse">
                              {l.negated && <span className="text-dim-inverse">not </span>}
                              {l.reason}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>

          <Timeline obligations={obligations} />
        </div>
      </div>
    </Stage>
  );
}

const START = Date.UTC(2026, 8, 28);
const DAYS = 95;
const dayOf = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - START) / 86_400_000);
};

/** The next three months, with a pin on each due date the service would put in the calendar. */
function Timeline({ obligations }: { obligations: ReturnType<typeof materialise> }) {
  const near = obligations.filter((o) => dayOf(o.due) <= DAYS);
  const later = obligations.length - near.length;
  const months = ["Oct", "Nov", "Dec"];
  return (
    <div className="mt-5 rounded-2xl bg-ink px-4 pt-3 pb-4 ring-1 ring-white/8">
      <p className="flex flex-wrap items-baseline justify-between gap-2 text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">
        <span>Obligations, the next three months</span>
        <span className="font-mono normal-case tracking-normal">
          {obligations.length} materialised{later > 0 ? ` · ${later} later` : ""}
        </span>
      </p>
      {/* Pins on a line; labels alternate between two heights so neighbouring dates don't collide. */}
      <div className="relative mt-3 h-[5.25rem]" role="list" aria-label={`${near.length} due in the next three months`}>
        <div aria-hidden="true" className="absolute inset-x-0 top-[3.6rem] h-px bg-white/15" />
        {months.map((m, i) => (
          <span key={m} aria-hidden="true" className="absolute top-[4.1rem] font-mono text-[0.625rem] text-dim-inverse" style={{ left: `${(dayOf(`2026-${10 + i}-01`) / DAYS) * 100}%` }}>
            {m}
          </span>
        ))}
        {near.map((o, i) => (
          <span
            key={`${o.ruleKey}-${o.due}`}
            role="listitem"
            className="absolute bottom-[1.3rem] flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${(dayOf(o.due) / DAYS) * 100}%` } as CSSProperties}
          >
            <span className="sr-only">
              {o.title}, due {formatDate(o.due)}
            </span>
            <span aria-hidden="true" className="font-mono text-[0.5625rem] leading-none whitespace-nowrap text-muted-inverse">
              {o.form}
            </span>
            <span aria-hidden="true" className="w-px bg-white/20" style={{ height: i % 2 ? "0.35rem" : "1.6rem" }} />
            <span aria-hidden="true" className="size-2.5 rounded-full ring-2 ring-ink" style={{ background: ACCENT }} />
          </span>
        ))}
        {near.length === 0 && <p className="absolute inset-x-0 top-2 text-sm text-dim-inverse">Nothing is dated until a rule applies.</p>}
      </div>
    </div>
  );
}
