import { EXTENSION, N01_2026 } from "@/content/compliancewatch/documents";
import { ACME, QRMP_DELHI, SEED_RULES } from "@/content/compliancewatch/rules";
import { SOURCES } from "@/content/compliancewatch/system";
import { decide, formatDate, render, type Verdict } from "@/lib/sim/compliance";
import type { SceneMeta } from "./types";

/**
 * "One notification, all the way to one phone": CBIC Notification No.
 * 01/2026-Central Tax followed from the regulator's site to Acme Bengaluru's
 * WhatsApp. Every document, rule, business and message is ComplianceWatch's
 * own recorded data or copy; the decisions come from the ported engine.
 */
export const cwScene: SceneMeta = {
  kind: "Illustration",
  note: "The notification, its clause, the rule, the two businesses and the messages are ComplianceWatch's own recorded data and copy, and the verdicts come from its ported engine; the times of day are samples, and nothing here calls the service.",
  steps: [
    {
      title: "Five feeds, read politely",
      body: `The pipeline polls ${SOURCES.length} regulator feeds — robots.txt first, one request a second — and keeps every file by its SHA-256, never overwritten. On ${formatDate(N01_2026.publishedOn)}, CBIC publishes ${N01_2026.ref}.`,
    },
    {
      title: "From a PDF to clauses",
      body: "Its text becomes numbered clauses. A detector made of rules, not a model, reads the title and the first clauses: a notification, and an extension.",
    },
    {
      title: "A model proposes, rules check",
      body: "One call through the gateway proposes the change. Deterministic validators then check it against the clause: the quote is really there, and the date is written in it.",
    },
    {
      title: "A person signs off",
      body: "An analyst verifies the citation and approves; a due-date change needs two. Publishing writes rule.deadline_changed to the outbox in the same transaction.",
    },
    {
      title: "Only where it applies",
      body: `It extends monthly GSTR-3B, which applies to ${ACME.name}, a monthly filer. A quarterly filer in Delhi has nothing to move.`,
    },
    {
      title: "The date moves, the history stays",
      body: `Acme's March return moves from ${formatDate(EXTENSION.previousDue)} to ${formatDate(EXTENSION.newDue)}, and the change is appended to a log that keeps the clause behind it.`,
    },
    {
      title: "In their language, at a decent hour",
      body: "Published late in the evening, the message waits out the quiet hours and goes at 08:00 — in Hindi, the owner's choice, with the source attached.",
    },
  ],
  keyFrames: [0, 2, 4, 6],
  mobile: "cards",
};

export type CwStage = "watch" | "read" | "extract" | "approve" | "decide" | "date" | "remind";
export const CW_STAGES: CwStage[] = ["watch", "read", "extract", "approve", "decide", "date", "remind"];

const rule = SEED_RULES.find((r) => r.key === EXTENSION.ruleKey)!;

/** The two businesses the extension is tried against, with the engine's verdict and its reasons. */
export const CW_BUSINESSES: { name: string; note: string; verdict: Verdict; reasons: { text: string; ok: boolean }[] }[] = [ACME, QRMP_DELHI].map((b) => {
  const d = decide(rule, b.profile);
  return {
    name: b.name,
    note: b.profile.filing_scheme === "regular_qrmp" ? "Quarterly (QRMP) · Delhi" : "Monthly · Karnataka",
    verdict: d.verdict,
    reasons: d.leaves.map((l) => ({ text: l.reason, ok: l.effect === "applies" })),
  };
});

/** The reminder as the notification service words it, in Hindi, broken into the lines the phone draws. */
export const CW_MESSAGE = render("deadline_extended", "hi", {
  business_name: ACME.name,
  title: "File GSTR-3B for the month (2026-03)",
  previous_due_date: formatDate(EXTENSION.previousDue, "hi"),
  new_due_date: formatDate(EXTENSION.newDue, "hi"),
  source_ref: N01_2026.ref,
});

export const CW_MESSAGE_LINES = [
  "सूचना: Acme Bengaluru के लिए",
  "File GSTR-3B for the month (2026-03)",
  "की अंतिम तिथि 20 अप्रैल 2026 से",
  "बढ़ाकर 21 अप्रैल 2026 कर दी गई है।",
  "स्रोत: 01/2026-Central Tax। मदद के लिए",
  "HELP और बंद करने के लिए STOP लिखें।",
];

/** The operative clause's words the validators and the analyst check, as the parser left them. */
export const CW_QUOTE = "till the twenty -first day of April, 2026";

export type CwFrame = { step: number; stage: CwStage; reached: CwStage[] };

export function cwFrame(step: number): CwFrame {
  const i = Math.max(0, Math.min(CW_STAGES.length - 1, step));
  return { step: i, stage: CW_STAGES[i], reached: CW_STAGES.slice(0, i + 1) };
}
