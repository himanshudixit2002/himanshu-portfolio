/**
 * ComplianceWatch's decision logic, ported from its Python and TypeScript so
 * the case study's simulations run the real rules in the browser:
 *
 * - applicability: the kernel's three-valued (Kleene) predicate evaluation
 *   (packages/domain-kernel/.../predicates.py) over the seed calendar;
 * - obligations: periods and due dates (recurrence.py) and the two-period
 *   window the obligation service materialises (materialise.py);
 * - citations: the quote check the answerer must pass (citations.py,
 *   qa/domain/answer.py), including difflib's SequenceMatcher;
 * - PII: the llm-gateway's masking, pattern for pattern (domain/scrub.py);
 * - delivery: batching, quiet hours, the WhatsApp window, retries and the
 *   one fallback (notification/domain and application);
 * - the WhatsApp bot's keywords (apps/whatsapp-bot/src/consent.ts).
 *
 * Pure and deterministic; tests/unit/compliance.test.ts pins each port to
 * values computed by the original code.
 */
import { GROUP_A_STATES, TURNOVER_BANDS, type Operator, type Predicate, type Profile, type Rule, type Spec } from "@/content/compliancewatch/rules";
import { DELIVERY, KEYWORDS, MONTHS, TEMPLATES, type Intent, type Lang, type TemplateKey } from "@/content/compliancewatch/messages";

/* ── Applicability ─────────────────────────────────────────────────────── */

export type Verdict = "applies" | "not_applicable" | "unsure";

const negate = (v: Verdict): Verdict => (v === "applies" ? "not_applicable" : v === "not_applicable" ? "applies" : "unsure");

/** Kleene AND: any not_applicable wins, then any unsure, else applies. */
const conjoin = (vs: Verdict[]): Verdict => (vs.includes("not_applicable") ? "not_applicable" : vs.includes("unsure") ? "unsure" : "applies");

/** Kleene OR: any applies wins, then any unsure, else not_applicable. */
const disjoin = (vs: Verdict[]): Verdict => (vs.includes("applies") ? "applies" : vs.includes("unsure") ? "unsure" : "not_applicable");

const isPredicate = (s: Spec): s is Predicate => "attribute" in s;
const isFreeText = (p: Predicate): p is Extract<Predicate, { freeText: string }> => "freeText" in p;

const SYMBOLS: Record<Operator, string> = { eq: "=", gt: ">", lte: "<=", contains_any: "contains any" };

const rank = (band: unknown) => TURNOVER_BANDS.indexOf(band as (typeof TURNOVER_BANDS)[number]);

function compare(operator: Operator, actual: unknown, expected: unknown): boolean {
  switch (operator) {
    case "eq":
      return actual === expected;
    case "gt":
      return rank(actual) > rank(expected);
    case "lte":
      return rank(actual) <= rank(expected);
    case "contains_any":
      return Array.isArray(actual) && (expected as readonly string[]).some((v) => actual.includes(v));
  }
}

/** One predicate: unsure for free text or an attribute the profile hasn't set. */
export function evaluatePredicate(p: Predicate, profile: Profile): Verdict {
  if (isFreeText(p)) return "unsure";
  const actual = profile[p.attribute];
  if (actual === undefined || actual === null) return "unsure";
  return compare(p.operator, actual, p.value) ? "applies" : "not_applicable";
}

export function evaluate(spec: Spec, profile: Profile): Verdict {
  if (isPredicate(spec)) return evaluatePredicate(spec, profile);
  if ("allOf" in spec) return conjoin(spec.allOf.map((s) => evaluate(s, profile)));
  if ("anyOf" in spec) return disjoin(spec.anyOf.map((s) => evaluate(s, profile)));
  return negate(evaluate(spec.not, profile));
}

/** The kernel's short form of a predicate: "turnover_band > 1_5_crore_to_2_crore". */
export function describe(p: Predicate): string {
  if (isFreeText(p)) return `free text: "${p.freeText}"`;
  const value = Array.isArray(p.value) ? `(${p.value.join(", ")})` : String(p.value);
  return `${p.attribute} ${SYMBOLS[p.operator]} ${value}`;
}

export type LeafResult = {
  predicate: Predicate;
  /** Under a `not`, the outcome counts the other way round. */
  negated: boolean;
  /** The predicate's own outcome. */
  outcome: Verdict;
  /** What it contributes to the rule after any `not`. */
  effect: Verdict;
  reason: string;
};

/** Every predicate in order, with its outcome and the kernel's reason ("… holds", "needs judgement: …"). */
export function explain(spec: Spec, profile: Profile, negated = false): LeafResult[] {
  if (isPredicate(spec)) {
    const outcome = evaluatePredicate(spec, profile);
    const reason = isFreeText(spec)
      ? `needs judgement: ${spec.freeText}`
      : outcome === "unsure"
        ? `${spec.attribute} is not set on the profile`
        : `${describe(spec)} ${outcome === "applies" ? "holds" : "does not hold"}`;
    return [{ predicate: spec, negated, outcome, effect: negated ? negate(outcome) : outcome, reason }];
  }
  if ("allOf" in spec) return spec.allOf.flatMap((s) => explain(s, profile, negated));
  if ("anyOf" in spec) return spec.anyOf.flatMap((s) => explain(s, profile, negated));
  return explain(spec.not, profile, !negated);
}

export type Decision = { rule: Rule; verdict: Verdict; leaves: LeafResult[]; because: LeafResult | null };

/** A rule's verdict and the predicate that decided it: the first that failed, or the first left unsure. */
export function decide(rule: Rule, profile: Profile): Decision {
  const verdict = evaluate(rule.spec, profile);
  const leaves = explain(rule.spec, profile);
  const because = verdict === "applies" ? null : (leaves.find((l) => l.effect === verdict) ?? null);
  return { rule, verdict, leaves, because };
}

export function decideAll(rules: Rule[], profile: Profile) {
  const decisions = rules.map((r) => decide(r, profile));
  const count = (v: Verdict) => decisions.filter((d) => d.verdict === v).length;
  return { decisions, applies: count("applies"), notApplicable: count("not_applicable"), unsure: count("unsure") };
}

/** Which QRMP group a state falls in, for the GSTR-3B due day. */
export const qrmpGroup = (code: string) => ((GROUP_A_STATES as readonly string[]).includes(code) ? "A" : "B");

/* ── Periods, due dates and obligations ────────────────────────────────── */

type YM = { y: number; m: number };
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const addMonths = ({ y, m }: YM, n: number): YM => {
  const i = y * 12 + (m - 1) + n;
  return { y: Math.floor(i / 12), m: (i % 12) + 1 };
};
const daysIn = ({ y, m }: YM) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const parse = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return { y, m, d };
};

export type Frequency = NonNullable<Rule["recurrence"]>["frequency"];
/** A period as its first month and the month after its last (exclusive), with the kernel's label. */
export type Period = { start: YM; end: YM; label: string };

const FIRST_MONTH = 4;
const fyStart = ({ y, m }: YM) => (m >= FIRST_MONTH ? y : y - 1);
/** "2026-27". */
export const fyLabel = (startYear: number) => `${startYear}-${pad((startYear + 1) % 100)}`;

export function periodContaining(day: string, frequency: Frequency): Period {
  const { y, m } = parse(day);
  if (frequency === "monthly") return { start: { y, m }, end: addMonths({ y, m }, 1), label: `${y}-${pad(m)}` };
  const fy = fyStart({ y, m });
  if (frequency === "annual") return { start: { y: fy, m: FIRST_MONTH }, end: { y: fy + 1, m: FIRST_MONTH }, label: fyLabel(fy) };
  const length = frequency === "quarterly" ? 3 : 6;
  const index = Math.floor((m - FIRST_MONTH + 12) % 12 / length) + 1;
  const start = addMonths({ y: fy, m: FIRST_MONTH }, (index - 1) * length);
  return { start, end: addMonths(start, length), label: `${fyLabel(fy)} ${frequency === "quarterly" ? "Q" : "H"}${index}` };
}

/** `count` consecutive periods, starting with the one that contains `from`. */
export function periods(from: string, frequency: Frequency, count: number): Period[] {
  const out: Period[] = [];
  let p = periodContaining(from, frequency);
  while (out.length < count) {
    out.push(p);
    p = periodContaining(iso(p.end.y, p.end.m, 1), frequency);
  }
  return out;
}

/** `dueDay` of the month `dueMonthOffset` months after the period ends, clamped to that month. */
export function dueDate(period: Period, recurrence: NonNullable<Rule["recurrence"]>): string {
  const month = addMonths(period.end, recurrence.dueMonthOffset);
  return iso(month.y, month.m, Math.min(recurrence.dueDay, daysIn(month)));
}

export function addDays(day: string, n: number): string {
  const { y, m, d } = parse(day);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export type Obligation = { ruleKey: string; form: string; title: string; period: string | null; due: string };

/**
 * The obligations the service materialises for the rules that apply: one per
 * period in a window of two (the period containing `asOf` and the next), or
 * one due `dueInDays` after `asOf` for a one-off duty. Sorted by due date.
 */
export function materialise(rules: Rule[], profile: Profile, asOf: string, window = 2): Obligation[] {
  const out: Obligation[] = [];
  for (const rule of rules) {
    if (evaluate(rule.spec, profile) !== "applies") continue;
    const { recurrence, template } = rule;
    if (!recurrence) {
      if (template.dueInDays !== undefined) out.push({ ruleKey: rule.key, form: rule.form, title: template.title, period: null, due: addDays(asOf, template.dueInDays) });
      continue;
    }
    for (const p of periods(asOf, recurrence.frequency, window)) {
      out.push({ ruleKey: rule.key, form: rule.form, title: `${template.title} (${p.label})`, period: p.label, due: dueDate(p, recurrence) });
    }
  }
  return out.sort((a, b) => a.due.localeCompare(b.due) || a.title.localeCompare(b.title));
}

/** "21 Apr 2026" or "21 अप्रैल 2026", as the notification service writes dates. */
export function formatDate(day: string, lang: Lang = "en"): string {
  const { y, m, d } = parse(day);
  return `${d} ${MONTHS[lang][m - 1]} ${y}`;
}

/** A template with its {placeholders} filled. */
export function render(key: TemplateKey, lang: Lang, values: Record<string, string>): string {
  return TEMPLATES[key][lang].replace(/\{(\w+)\}/g, (_, name: string) => values[name] ?? `{${name}}`);
}

/* ── The quote check ───────────────────────────────────────────────────── */

export const QUOTE_MATCH_THRESHOLD = 0.85;
export const MIN_QUOTE_CHARS = 8;
export const MAX_QUOTE_CHARS = 400;
const MAX_TEXT_CHARS = 50_000;
const MIN_ANCHOR = 4;
const DASHES = new Set(["‐", "‑", "‒", "–", "—", "―", "−", "﹘", "﹣", "－"]);
const SPACE = /\s/u;
const MONTH_NAMES = new Set(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]);
// Python's [^\W_] is a letter or a number, in any script.
const TOKEN = new RegExp("[\\p{L}\\p{N}]+(?:[-/.][\\p{L}\\p{N}]+)*", "gu");
const DIGIT = new RegExp("\\p{Nd}", "u");

/** Folded text, one code point per entry, with each one's index in the original. */
export type Folded = { chars: string[]; from: number[] };

/** Casefold, every dash as "-", single spaces (Python's `_fold_spacing`). */
function foldSpacing(text: string): Folded {
  const chars: string[] = [];
  const from: number[] = [];
  let pendingSpace = -1;
  Array.from(text).forEach((c, i) => {
    if (SPACE.test(c)) {
      if (chars.length && pendingSpace < 0) pendingSpace = i;
      return;
    }
    if (pendingSpace >= 0) {
      chars.push(" ");
      from.push(pendingSpace);
      pendingSpace = -1;
    }
    for (const lower of Array.from(DASHES.has(c) ? "-" : c.toLowerCase())) {
      chars.push(lower);
      from.push(i);
    }
  });
  return { chars, from };
}

/** `foldSpacing` with no spaces around hyphens: "sub -section" reads "sub-section" (Python's `_fold`). */
export function fold(text: string): Folded {
  const spaced = foldSpacing(text);
  const chars: string[] = [];
  const from: number[] = [];
  spaced.chars.forEach((c, i) => {
    if (c === " " && (spaced.chars[i + 1] === "-" || chars.at(-1) === "-")) return;
    chars.push(c);
    from.push(spaced.from[i]);
  });
  return { chars, from };
}

type Block = [a: number, b: number, size: number];

/** difflib.SequenceMatcher with no junk (autojunk=False), as the kernel uses it. */
class SequenceMatcher {
  private readonly b2j = new Map<string, number[]>();

  constructor(
    private readonly a: string[],
    private readonly b: string[],
  ) {
    b.forEach((c, j) => {
      const list = this.b2j.get(c);
      if (list) list.push(j);
      else this.b2j.set(c, [j]);
    });
  }

  private longest(alo: number, ahi: number, blo: number, bhi: number): Block {
    let [besti, bestj, bestsize] = [alo, blo, 0];
    let j2len = new Map<number, number>();
    for (let i = alo; i < ahi; i++) {
      const next = new Map<number, number>();
      for (const j of this.b2j.get(this.a[i]) ?? []) {
        if (j < blo) continue;
        if (j >= bhi) break;
        const k = (j2len.get(j - 1) ?? 0) + 1;
        next.set(j, k);
        if (k > bestsize) [besti, bestj, bestsize] = [i - k + 1, j - k + 1, k];
      }
      j2len = next;
    }
    while (besti > alo && bestj > blo && this.a[besti - 1] === this.b[bestj - 1]) [besti, bestj, bestsize] = [besti - 1, bestj - 1, bestsize + 1];
    while (besti + bestsize < ahi && bestj + bestsize < bhi && this.a[besti + bestsize] === this.b[bestj + bestsize]) bestsize++;
    return [besti, bestj, bestsize];
  }

  blocks(): Block[] {
    const [la, lb] = [this.a.length, this.b.length];
    const queue: [number, number, number, number][] = [[0, la, 0, lb]];
    const found: Block[] = [];
    while (queue.length) {
      const [alo, ahi, blo, bhi] = queue.pop()!;
      const [i, j, k] = this.longest(alo, ahi, blo, bhi);
      if (!k) continue;
      found.push([i, j, k]);
      if (alo < i && blo < j) queue.push([alo, i, blo, j]);
      if (i + k < ahi && j + k < bhi) queue.push([i + k, ahi, j + k, bhi]);
    }
    found.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);
    const out: Block[] = [];
    let [i1, j1, k1] = [0, 0, 0];
    for (const [i2, j2, k2] of found) {
      if (i1 + k1 === i2 && j1 + k1 === j2) k1 += k2;
      else {
        if (k1) out.push([i1, j1, k1]);
        [i1, j1, k1] = [i2, j2, k2];
      }
    }
    if (k1) out.push([i1, j1, k1]);
    out.push([la, lb, 0]);
    return out;
  }

  ratio(): number {
    const matches = this.blocks().reduce((sum, [, , size]) => sum + size, 0);
    const length = this.a.length + this.b.length;
    return length ? (2 * matches) / length : 1;
  }
}

export type QuoteMatch = {
  ratio: number;
  /** The best-matching window, as code-point indices into the original text (end exclusive); null if none. */
  span: [number, number] | null;
};

/**
 * How well `quote` matches its best window of `text`, 0 to 1 (the kernel's
 * `quote_match_ratio`): 1 when the folded quote is inside the folded text;
 * otherwise every run of four or more matching characters anchors a window
 * of the quote's length, and the best difflib ratio over them wins.
 */
export function quoteMatch(quote: string, text: string): QuoteMatch {
  const q = fold(quote).chars.slice(0, MAX_QUOTE_CHARS);
  const t = fold(text);
  const tc = t.chars.slice(0, MAX_TEXT_CHARS);
  const toSpan = (start: number, length: number): [number, number] | null =>
    length > 0 && start < t.from.length ? [t.from[start], t.from[Math.min(start + length, t.from.length) - 1] + 1] : null;
  if (!q.length) return { ratio: 0, span: null };
  // Whole code points on both sides, so a string match is also a code-point match.
  const at = tc.join("").includes(q.join("")) ? codeIndex(tc, q) : -1;
  if (at >= 0) return { ratio: 1, span: toSpan(at, q.length) };
  let best = 0;
  let bestStart = -1;
  for (const [a, b, size] of new SequenceMatcher(q, tc).blocks()) {
    if (size < MIN_ANCHOR) continue;
    const start = Math.max(0, b - a);
    const r = new SequenceMatcher(q, tc.slice(start, start + q.length)).ratio();
    if (r > best) [best, bestStart] = [r, start];
  }
  return { ratio: best, span: bestStart >= 0 ? toSpan(bestStart, q.length) : null };
}

/** Where `needle` starts in `hay`, both arrays of code points; -1 if it doesn't. */
function codeIndex(hay: string[], needle: string[]): number {
  outer: for (let i = 0; i + needle.length <= hay.length; i++) {
    for (let k = 0; k < needle.length; k++) if (hay[i + k] !== needle[k]) continue outer;
    return i;
  }
  return -1;
}

export const quoteMatchRatio = (quote: string, text: string) => quoteMatch(quote, text).ratio;

/** Escapes regex syntax characters only: under the `u` flag "\-" outside a class is an error. */
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/** Every token of the quote that carries a fact — a digit, or an English month name — once each, in order. */
export function factTokens(quote: string): string[] {
  const out: string[] = [];
  for (const token of foldSpacing(quote).chars.join("").match(TOKEN) ?? []) {
    if ((DIGIT.test(token) || MONTH_NAMES.has(token)) && !out.includes(token)) out.push(token);
  }
  return out;
}

/**
 * The quote's tokens that carry a fact — a digit, or an English month name —
 * and that the text doesn't have as a whole token (the kernel's
 * `evidence_tokens_missing`). This is what stops "31st April" passing for
 * "twenty-first day of April".
 */
export function evidenceTokensMissing(quote: string, text: string): string[] {
  const folded = fold(text).chars.join("");
  const missing: string[] = [];
  for (const token of foldSpacing(quote).chars.join("").match(TOKEN) ?? []) {
    const carriesFact = DIGIT.test(token) || MONTH_NAMES.has(token);
    if (!carriesFact || missing.includes(token)) continue;
    const found = new RegExp(`(?<![\\p{L}\\p{N}])${escape(fold(token).chars.join(""))}(?![\\p{L}\\p{N}])`, "u").test(folded);
    if (!found) missing.push(token);
  }
  return missing;
}

export type Draft = { covered: boolean; answer: string; citations: { clause: string; quote: string }[] };
export type Bundle = { label: string; text: string }[];

/** Everything wrong with a draft's citations, in the answerer's own words; empty means it may stand. */
export function checkCitations(draft: Draft, bundle: Bundle): string[] {
  if (!draft.covered) return [];
  const problems: string[] = [];
  if (!draft.answer.trim()) problems.push("a covered answer needs answer text");
  if (!draft.citations.length) problems.push("a covered answer cites at least one clause");
  draft.citations.forEach((c, i) => {
    const n = i + 1;
    const clause = bundle.find((b) => b.label === c.clause);
    if (!clause) return problems.push(`citation ${n} names '${c.clause}', not a listed clause`);
    const length = Array.from(c.quote).length;
    if (length < MIN_QUOTE_CHARS || length > MAX_QUOTE_CHARS) return problems.push(`citation ${n} quote must be ${MIN_QUOTE_CHARS} to ${MAX_QUOTE_CHARS} characters`);
    if (quoteMatchRatio(c.quote, clause.text) < QUOTE_MATCH_THRESHOLD) return problems.push(`citation ${n} quote is not in ${c.clause}`);
    const missing = evidenceTokensMissing(c.quote, clause.text);
    if (missing.length) problems.push(`citation ${n} quote has ${missing.join(", ")}, which ${c.clause} lacks`);
  });
  return problems;
}

/* ── PII masking ───────────────────────────────────────────────────────── */

/** ASCII patterns, in the gateway's order: a GSTIN holds a PAN, and +91 keeps a phone from reading as Aadhaar. */
const PII: [kind: PiiKind, pattern: RegExp, placeholder: string][] = [
  ["gstin", /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]\b/g, "[GSTIN]"],
  ["pan", /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, "[PAN]"],
  ["aadhaar", new RegExp("(?<![0-9+])[2-9][0-9]{3}[ -]?[0-9]{4}[ -]?[0-9]{4}\\b", "g"), "[AADHAAR]"],
  ["phone", new RegExp("(?<![0-9])(?:(?:\\+91[ -]?|0)[6-9][0-9]{4}[ -][0-9]{5}|(?:\\+91[ -]?|0)?[6-9][0-9]{9})(?![0-9])", "g"), "[PHONE]"],
  ["email", /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]"],
];

export type PiiKind = "gstin" | "pan" | "aadhaar" | "phone" | "email";
export const PII_KINDS: PiiKind[] = PII.map(([kind]) => kind);

/** Every identifier replaced with a bracketed placeholder naming its kind, and how many of each. */
export function scrub(text: string): { text: string; counts: Record<PiiKind, number> } {
  const counts = {} as Record<PiiKind, number>;
  for (const [kind, pattern, placeholder] of PII) {
    counts[kind] = 0;
    text = text.replace(pattern, () => {
      counts[kind]++;
      return placeholder;
    });
  }
  return { text, counts };
}

/* ── Delivery ──────────────────────────────────────────────────────────── */

const DAY = 24 * 60;

/** Within the quiet hours (21:00–08:00 IST by default), which cross midnight. */
export const isQuiet = (minute: number) => {
  const m = ((minute % DAY) + DAY) % DAY;
  return m >= DELIVERY.quietStart || m < DELIVERY.quietEnd;
};

/** The minute itself outside quiet hours, otherwise the minute they end (counted from the same midnight). */
export function nextAllowed(minute: number): number {
  if (!isQuiet(minute)) return minute;
  const dayStart = minute - (((minute % DAY) + DAY) % DAY);
  const end = dayStart + DELIVERY.quietEnd;
  return end <= minute ? end + DAY : end;
}

/** Meta's customer service window: free text only within 24 hours of the person's last message. */
export const sessionOpen = (hoursSinceInbound: number | null) => hoursSinceInbound !== null && hoursSinceInbound < DELIVERY.sessionHours;

export type Attempt = { at: number; channel: "whatsapp" | "email"; ok: boolean; note: string };

export type DeliveryPlan = {
  queuedAt: number;
  /** When the batch leaves its gathering window (or the digest time). */
  readyAt: number;
  /** Quiet hours pushed it to here, if they did. */
  heldUntil: number | null;
  mode: "free text" | "template";
  attempts: Attempt[];
  outcome: "whatsapp" | "email";
};

/**
 * What the notification service does with one change, in minutes from the
 * day's midnight IST: gather for five minutes (or wait for the 09:00 digest),
 * hold through quiet hours, then WhatsApp — free text inside the 24-hour
 * window, an approved template outside it. An undeliverable message falls
 * back to email at once; a failing one retries after 1 and 5 minutes and
 * falls back after the third failure. A fallback never falls back again.
 */
export function planDelivery(opts: { at: number; hoursSinceInbound: number | null; templateApproved: boolean; whatsappDown: boolean; digest?: boolean }): DeliveryPlan {
  const { at, hoursSinceInbound, templateApproved, whatsappDown, digest = false } = opts;
  const digestToday = Math.floor(at / DAY) * DAY + DELIVERY.digestAt;
  const readyAt = digest ? (at < digestToday ? digestToday : digestToday + DAY) : at + DELIVERY.batchSeconds / 60;
  const sendAt = nextAllowed(readyAt);
  const open = sessionOpen(hoursSinceInbound);
  const mode = open ? "free text" : "template";
  const attempts: Attempt[] = [];
  const email = (t: number, note: string): DeliveryPlan => {
    const when = nextAllowed(t);
    attempts.push({ at: when, channel: "email", ok: true, note });
    return { queuedAt: at, readyAt, heldUntil: sendAt !== readyAt ? sendAt : null, mode, attempts, outcome: "email" };
  };
  if (!open && !templateApproved) {
    attempts.push({ at: sendAt, channel: "whatsapp", ok: false, note: "outside the 24-hour window, and the template isn't approved: undeliverable, no retries" });
    return email(sendAt, "fallback, at once");
  }
  if (whatsappDown) {
    let t = sendAt;
    for (let n = 1; n <= DELIVERY.maxAttempts; n++) {
      attempts.push({ at: t, channel: "whatsapp", ok: false, note: n < DELIVERY.maxAttempts ? `failed; retry in ${DELIVERY.backoffSeconds[n - 1] / 60} min` : "failed a third time" });
      // A retry that lands in quiet hours waits for them to end, like any dispatch.
      if (n < DELIVERY.maxAttempts) t = nextAllowed(t + DELIVERY.backoffSeconds[n - 1] / 60);
    }
    return email(t, "fallback after the third failure");
  }
  attempts.push({ at: sendAt, channel: "whatsapp", ok: true, note: open ? "free text, inside the window" : "approved template, outside the window" });
  return { queuedAt: at, readyAt, heldUntil: sendAt !== readyAt ? sendAt : null, mode, attempts, outcome: "whatsapp" };
}

/** "08:00", "21:05" and so on, for a minute of any day. */
export const clockTime = (minute: number) => {
  const m = ((Math.round(minute) % DAY) + DAY) % DAY;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};

/* ── The WhatsApp bot's keywords ───────────────────────────────────────── */

const PUNCTUATION = /[.!?,;:'"()।]+/g;
const DEVANAGARI = /[ऀ-ॿ]/;

export const normaliseKeyword = (text: string) => text.replace(PUNCTUATION, " ").replace(/\s+/g, " ").trim().toUpperCase();

export function detectIntent(text: string | null): Intent {
  if (text === null) return "message";
  const keyword = normaliseKeyword(text);
  for (const intent of ["opt_out", "opt_in", "help"] as const) if ((KEYWORDS[intent] as readonly string[]).includes(keyword)) return intent;
  return "message";
}

/** "hi" when the message is written in Devanagari, otherwise "en". */
export const detectLanguage = (text: string | null): Lang => (text !== null && DEVANAGARI.test(text) ? "hi" : "en");
