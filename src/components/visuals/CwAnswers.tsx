"use client";

import { useDeferredValue, useId, useMemo, useState, type MouseEvent } from "react";
import { ANSWER_CASES, NOT_COVERED_TEXT, type AnswerCase } from "@/content/compliancewatch/documents";
import { checkCitations, evidenceTokensMissing, factTokens, MAX_QUOTE_CHARS, MIN_QUOTE_CHARS, QUOTE_MATCH_THRESHOLD, quoteMatch } from "@/lib/sim/compliance";
import { Control, Stage } from "./Stage";

/** Sends a draft gets: the first, and one retry with the problems. */
const TRIES = 2;
/** Room to type past the check's limit and see it refuse, not to paste a book. */
const MAX_TYPED = 1000;
/** Fact-token chips shown before the rest are counted. */
const MAX_CHIPS = 12;
const THRESHOLD = Math.round(QUOTE_MATCH_THRESHOLD * 100);
const LABEL = "text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase";

type Work = { index: number; quote: string };
type Attempt = { quote: string; problems: string[] };

const start = (index: number): Work => ({ index, quote: ANSWER_CASES[index].draft });

/** The check as the answerer runs it on this draft: one covered answer, one citation, the labelled evidence. */
const check = (c: AnswerCase, quote: string) =>
  checkCitations(
    { covered: true, answer: c.answer, citations: [{ clause: c.cite, quote }] },
    c.evidence.map((e) => ({ label: e.label, text: e.clause.text })),
  );

/** What the check makes of a quote as it's typed: its window in the cited clause, its fact tokens, the verdict. */
function inspect({ index, quote }: Work) {
  const c = ANSWER_CASES[index];
  const text = c.evidence.find((e) => e.label === c.cite)?.clause.text;
  return {
    match: text === undefined ? null : quoteMatch(quote, text),
    tokens: factTokens(quote),
    missing: text === undefined ? [] : evidenceTokensMissing(quote, text),
    passes: check(c, quote).length === 0,
  };
}

/**
 * ComplianceWatch's answerer, with the visitor as the model. An answer goes
 * out only if its quote passes the check against the clause it cites: a
 * fuzzy match of 85% or better, and no fact-carrying token (a digit, a month)
 * the clause lacks. A failure goes back to the model for one retry; a second
 * one answers "not covered".
 */
export default function CwAnswers() {
  const [work, setWork] = useState<Work>(() => start(0));
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const deferred = useDeferredValue(work);
  // Typing is deferred, but a new case is inspected at once, so its clause never meets the last case's quote.
  const shown = deferred.index === work.index ? deferred : work;
  const live = useMemo(() => inspect(shown), [shown]);
  const field = useId();

  const c = ANSWER_CASES[work.index];
  const cited = c.evidence.find((e) => e.label === c.cite);
  const last = attempts.at(-1);
  const problems = last?.problems ?? [];
  const passed = last && !problems.length ? last : null;
  const refused = problems.length > 0 && attempts.length >= TRIES;
  const done = passed !== null || refused;
  const length = Array.from(work.quote).length;
  const ratio = live.match?.ratio ?? null;

  const load = (index: number) => {
    setWork(start(index));
    setAttempts([]);
  };
  const edit = (quote: string) => setWork((w) => ({ ...w, quote }));
  const press = (e: MouseEvent<HTMLButtonElement>) => {
    // A double click's second click would spend the retry, or clear an answer the first just showed.
    if (e.detail > 1) return;
    if (done) load(work.index);
    else setAttempts((a) => [...a, { quote: work.quote, problems: check(c, work.quote) }]);
  };

  return (
    <Stage
      title="Quote it, or it isn't an answer"
      kind="Simulation"
      xray="Client island · the answerer's citation check (quote match and fact tokens) ported from ComplianceWatch's kernel and tested against the Python (lib/sim/compliance)"
      caption="Three cases from ComplianceWatch's question-answering golden set. The check is the project's own, running in your browser: a quote must match its clause at 85% or better and carry no number or month the clause lacks. You write the model's quote; one retry, then 'not covered'."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* The question, and what the answerer was given to answer it. */}
        <div className="min-w-0">
          <fieldset className="min-w-0">
            <legend className={LABEL}>Case</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ANSWER_CASES.map((x, i) => (
                <Control key={x.id} active={i === work.index} onClick={() => load(i)} className="min-h-9 px-3 text-xs">
                  {x.category}
                </Control>
              ))}
            </div>
          </fieldset>

          <p className="mt-5 ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-white/8 px-3.5 py-2 text-sm leading-relaxed">
            <span className="sr-only">The question: </span>
            {c.question}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className={LABEL}>Evidence the answerer was given</p>
            {cited && (
              <p aria-hidden="true" className={`flex items-center gap-1.5 text-[0.6875rem] text-dim-inverse ${live.match?.span ? "" : "invisible"}`}>
                <span className={`size-2.5 rounded-sm transition-colors duration-200 ${live.passes ? "bg-emerald-400/40" : "bg-amber-400/40"}`} />
                best match for the quote
              </p>
            )}
          </div>
          {c.evidence.length ? (
            <ul className="mt-2 grid gap-2">
              {c.evidence.map((e) => (
                <li key={e.label} className="rounded-2xl bg-ink px-4 py-3 ring-1 ring-white/8">
                  <p className="flex flex-wrap items-center gap-2 text-xs text-dim-inverse">
                    <span className="rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[0.6875rem] text-fg-inverse">{e.label}</span>
                    {e.document} · {e.clause.ref}
                  </p>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed break-words text-muted-inverse">
                    <Marked text={e.clause.text} span={e.label === c.cite ? (live.match?.span ?? null) : null} passes={live.passes} />
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 rounded-2xl bg-ink px-4 py-3 text-sm text-dim-inverse ring-1 ring-white/8">No clause in the evidence mentions FSSAI.</p>
          )}
        </div>

        {/* The draft, the quote you write for it, and the check. */}
        <div className="min-w-0">
          <p className={LABEL}>The model&rsquo;s draft</p>
          <p className="mt-1.5 text-sm leading-relaxed">{c.answer}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <label htmlFor={field} className="text-xs text-muted-inverse">
              Cites <span className="rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[0.6875rem] text-fg-inverse">{c.cite}</span>, quoting
            </label>
            <span className={`font-mono text-[0.6875rem] ${length < MIN_QUOTE_CHARS || length > MAX_QUOTE_CHARS ? "text-rose-200" : "text-dim-inverse"}`}>
              {length} / {MAX_QUOTE_CHARS}
            </span>
          </div>
          <textarea
            id={field}
            rows={3}
            value={work.quote}
            maxLength={MAX_TYPED}
            readOnly={done}
            spellCheck={false}
            onChange={(e) => edit(e.target.value)}
            className="mt-1.5 block w-full resize-none rounded-xl bg-ink px-3 py-2 text-sm leading-relaxed text-fg-inverse ring-1 ring-white/12 outline-none read-only:text-muted-inverse focus-visible:ring-2 focus-visible:ring-accent-bright max-sm:h-[calc(4lh+1rem)]"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {c.edits.map((x) => (
              <Control key={x.label} active={work.quote === x.quote} disabled={done} onClick={() => edit(x.quote)} className="min-h-9 px-3 text-xs">
                {x.label}
              </Control>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="min-w-0">
              <p className={`${LABEL} flex items-baseline justify-between gap-2`}>
                Match
                <span className={`font-mono text-sm tracking-normal normal-case ${ratio === null ? "" : ratio >= QUOTE_MATCH_THRESHOLD ? "text-emerald-300" : "text-amber-300"}`}>
                  {ratio === null ? "—" : `${(ratio * 100).toFixed(1)}%`}
                </span>
              </p>
              <div aria-hidden="true" className="relative mt-2 h-2 rounded-full bg-white/6">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${ratio !== null && ratio >= QUOTE_MATCH_THRESHOLD ? "bg-emerald-400/80" : "bg-amber-400/80"}`}
                  style={{ width: `${(ratio ?? 0) * 100}%` }}
                />
                <span className="absolute -top-1 -ml-px h-4 w-0.5 rounded-full bg-fg-inverse" style={{ left: `${THRESHOLD}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-dim-inverse">
                {cited ? `needs ${THRESHOLD}% or better` : <span className="text-rose-200">{c.cite} isn&rsquo;t in the evidence</span>}
              </p>
            </div>

            <div className="min-w-0">
              <p className={LABEL}>Fact tokens</p>
              {live.tokens.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {live.tokens.slice(0, MAX_CHIPS).map((t) => {
                    const found = !live.missing.includes(t);
                    const tone = !cited ? "bg-white/6 text-muted-inverse" : found ? "bg-emerald-300/10 text-emerald-200" : "bg-rose-300/12 text-rose-200";
                    return (
                      <li key={t} className={`inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[0.6875rem] break-all transition-colors duration-200 ${tone}`}>
                        {cited && <Tick ok={found} />}
                        {t}
                        {cited && <span className="sr-only">{found ? `, found in ${c.cite}` : `, missing from ${c.cite}`}</span>}
                      </li>
                    );
                  })}
                  {live.tokens.length > MAX_CHIPS && (
                    <li className="px-1 py-0.5 font-mono text-[0.6875rem] text-dim-inverse">+{live.tokens.length - MAX_CHIPS} more</li>
                  )}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-dim-inverse">None: no digits or month names in the quote.</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Control primary={!done} onClick={press} aria-describedby={done ? undefined : `${field}-try`}>
              {done ? "Start over" : "Send to the check"}
            </Control>
            {!done && (
              <span id={`${field}-try`} className="font-mono text-xs text-dim-inverse">
                attempt {attempts.length + 1} of {TRIES}
              </span>
            )}
          </div>

          <div className="mt-4 min-h-[11rem]">
            {!attempts.length && (
              <p className="rounded-2xl border border-dashed border-white/12 px-4 py-3 text-xs leading-relaxed text-dim-inverse">
                Nothing sent yet. The answer goes out only if the check finds no problems; a failure goes back to the model once.
              </p>
            )}
            <div aria-live="polite">
              {problems.length > 0 && (
                <ul aria-label="The check's problems" className="grid gap-1 border-l-2 border-rose-300/70 py-0.5 pl-3 font-mono text-xs leading-relaxed text-rose-200">
                  {problems.map((p) => (
                    <li key={p} className="break-words">
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              {problems.length > 0 && !refused && (
                <p className="mt-2.5 text-sm text-amber-200">
                  Attempt {attempts.length} of {TRIES} failed — the problems go back to the model for one retry.
                </p>
              )}

              {refused && (
                <div className="mt-3">
                  <p className={`${LABEL} flex flex-wrap items-baseline justify-between gap-x-3`}>
                    <span className="text-rose-300">Not covered</span>
                    <span className="font-mono tracking-normal normal-case">reason: citation_check_failed</span>
                  </p>
                  <p className="mt-1.5 max-w-[92%] rounded-2xl rounded-bl-md bg-rose-300/10 px-3.5 py-2 text-sm leading-relaxed text-rose-100">{NOT_COVERED_TEXT}</p>
                </div>
              )}

              {passed && cited && (
                <div>
                  <p className={`${LABEL} flex flex-wrap items-baseline justify-between gap-x-3`}>
                    <span className="text-emerald-300">Answered{attempts.length > 1 ? " on the retry" : ""}</span>
                    <span className="font-mono tracking-normal normal-case">layer: {c.layer}</span>
                  </p>
                  <div className="mt-1.5 max-w-[96%] rounded-2xl rounded-bl-md bg-white/6 px-3.5 py-2.5 text-sm leading-relaxed">
                    <p>{c.answer}</p>
                    <div className="mt-2 rounded-xl bg-ink px-3 py-2 ring-1 ring-white/8">
                      <p className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.6875rem] text-muted-inverse">
                        {cited.document} · {cited.clause.ref}
                        <span className="rounded-full bg-emerald-300/12 px-2 py-0.5 font-sans font-semibold text-emerald-200">Verified</span>
                      </p>
                      <blockquote className="mt-1.5 border-l-2 border-emerald-300/40 pl-2.5 text-xs leading-relaxed break-words text-muted-inverse">
                        &ldquo;{passed.quote}&rdquo;
                      </blockquote>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}

/** A clause with the quote's best-matching window marked: green while the check passes, amber while it doesn't. */
function Marked({ text, span, passes }: { text: string; span: [number, number] | null; passes: boolean }) {
  if (!span) return text;
  const chars = Array.from(text);
  return (
    <>
      {chars.slice(0, span[0]).join("")}
      <mark className={`rounded-sm box-decoration-clone py-0.5 transition-colors duration-200 ${passes ? "bg-emerald-400/20 text-emerald-50" : "bg-amber-400/20 text-amber-50"}`}>
        {chars.slice(span[0], span[1]).join("")}
      </mark>
      {chars.slice(span[1]).join("")}
    </>
  );
}

/** A drawn tick or cross: ✓ and ✕ aren't in the site's fonts. */
function Tick({ ok }: { ok: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" className="size-2.5 flex-none">
      <path d={ok ? "M2 5.3 4.1 7.4 8 3" : "M3 3l4 4m0-4-4 4"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
