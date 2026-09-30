import { describe, expect, it } from "vitest";
import { ANSWER_CASES, EXTENSION, N01_2026, N15_2025_P4 } from "@/content/compliancewatch/documents";
import { PII_SAMPLE } from "@/content/compliancewatch/messages";
import { ACME, AS_OF, QRMP_DELHI, SEED_RULES } from "@/content/compliancewatch/rules";
import { SERVICES, TOPICS } from "@/content/compliancewatch/system";
import {
  checkCitations,
  decide,
  decideAll,
  describe as describePredicate,
  detectIntent,
  detectLanguage,
  dueDate,
  evaluate,
  evidenceTokensMissing,
  factTokens,
  formatDate,
  materialise,
  nextAllowed,
  periodContaining,
  planDelivery,
  quoteMatch,
  quoteMatchRatio,
  render,
  scrub,
} from "@/lib/sim/compliance";

const rule = (key: string) => SEED_RULES.find((r) => r.key === key)!;
const P3 = N01_2026.clauses[2].text;
const P4 = N15_2025_P4.text;

describe("ComplianceWatch: applicability", () => {
  it("has the thirteen seed rules", () => {
    expect(SEED_RULES).toHaveLength(13);
    expect(new Set(SEED_RULES.map((r) => r.key)).size).toBe(13);
  });

  it("splits the rules for the demo tenant as `make demo` does: 4 apply, 8 don't, 1 unsure", () => {
    const { decisions, applies, notApplicable, unsure } = decideAll(SEED_RULES, ACME.profile);
    expect([applies, notApplicable, unsure]).toEqual([4, 8, 1]);
    expect(decisions.filter((d) => d.verdict === "applies").map((d) => d.rule.key)).toEqual(["gstr3b_monthly", "gstr1_monthly", "gstr9_annual", "eway_bill"]);
    expect(decisions.filter((d) => d.verdict === "unsure").map((d) => d.rule.key)).toEqual(["itc04_annual"]);
  });

  it("leaves a rule unsure when the profile hasn't answered, and says why", () => {
    const { decisions } = decideAll(SEED_RULES, QRMP_DELHI.profile);
    const by = (v: string) => decisions.filter((d) => d.verdict === v).map((d) => d.rule.key);
    expect(by("applies")).toEqual(["gstr3b_quarterly_group_b", "gstr1_quarterly"]);
    expect(by("unsure")).toEqual(["itc04_annual", "e_invoicing", "eway_bill"]);
    expect(decide(rule("eway_bill"), QRMP_DELHI.profile).because?.reason).toBe("generates_eway_bills is not set on the profile");
    expect(decide(rule("itc04_annual"), ACME.profile).because?.reason).toMatch(/^needs judgement: The business sends inputs/);
  });

  it("decides the QRMP GSTR-3B day by the state's group, through a `not`", () => {
    const qrmp = (state: string) => ({ ...ACME.profile, filing_scheme: "regular_qrmp", state_codes: [state] });
    expect(evaluate(rule("gstr3b_quarterly_group_a").spec, qrmp("29"))).toBe("applies");
    expect(evaluate(rule("gstr3b_quarterly_group_b").spec, qrmp("29"))).toBe("not_applicable");
    expect(evaluate(rule("gstr3b_quarterly_group_b").spec, qrmp("07"))).toBe("applies");
    const b = decide(rule("gstr3b_quarterly_group_b"), qrmp("29")).because!;
    expect(b.negated).toBe(true);
    expect(b.reason).toMatch(/^state_codes contains any \(22, 23, .*\) holds$/);
  });

  it("uses Kleene logic: not keeps unsure, and any not_applicable beats unsure", () => {
    const noState = { ...ACME.profile, filing_scheme: "regular_qrmp", state_codes: undefined };
    expect(evaluate(rule("gstr3b_quarterly_group_b").spec, noState)).toBe("unsure");
    expect(evaluate(rule("itc04_half_yearly").spec, ACME.profile)).toBe("not_applicable");
  });

  it("describes predicates as the kernel does", () => {
    expect(describePredicate({ attribute: "turnover_band", operator: "gt", value: "1_5_crore_to_2_crore" })).toBe("turnover_band > 1_5_crore_to_2_crore");
    expect(describePredicate({ attribute: "turnover_band", operator: "lte", value: "2_crore_to_5_crore" })).toBe("turnover_band <= 2_crore_to_5_crore");
  });
});

describe("ComplianceWatch: obligations", () => {
  it("materialises the demo's seven obligations, two periods per recurring rule", () => {
    expect(materialise(SEED_RULES, ACME.profile, AS_OF).map((o) => [o.due, o.title])).toEqual([
      ["2026-10-11", "File GSTR-1 for the month (2026-09)"],
      ["2026-10-12", "Generate e-way bills before moving goods"],
      ["2026-10-20", "File GSTR-3B for the month (2026-09)"],
      ["2026-11-11", "File GSTR-1 for the month (2026-10)"],
      ["2026-11-20", "File GSTR-3B for the month (2026-10)"],
      ["2027-12-31", "File GSTR-9 for the financial year (2026-27)"],
      ["2028-12-31", "File GSTR-9 for the financial year (2027-28)"],
    ]);
  });

  it("labels and dates periods on the financial year", () => {
    expect(periodContaining("2026-09-28", "quarterly").label).toBe("2026-27 Q2");
    expect(periodContaining("2026-02-10", "quarterly").label).toBe("2025-26 Q4");
    expect(periodContaining("2026-09-28", "half_yearly").label).toBe("2026-27 H1");
    expect(dueDate(periodContaining("2026-09-28", "quarterly"), rule("gstr3b_quarterly_group_b").recurrence!)).toBe("2026-10-24");
    expect(dueDate(periodContaining("2026-09-28", "half_yearly"), rule("itc04_half_yearly").recurrence!)).toBe("2026-10-25");
    expect(dueDate(periodContaining("2026-09-28", "annual"), rule("gstr4_annual").recurrence!)).toBe("2027-06-30");
    // Clamped to the month: day 31 in a thirty-day month.
    expect(dueDate(periodContaining("2026-10-05", "monthly"), { frequency: "monthly", dueDay: 31, dueMonthOffset: 0 })).toBe("2026-11-30");
  });

  it("writes dates and messages the way the notification service does", () => {
    expect(formatDate("2026-04-21")).toBe("21 Apr 2026");
    expect(formatDate("2026-04-21", "hi")).toBe("21 अप्रैल 2026");
    const values = {
      business_name: ACME.name,
      title: "File GSTR-3B for the month (2026-03)",
      previous_due_date: formatDate(EXTENSION.previousDue, "hi"),
      new_due_date: formatDate(EXTENSION.newDue, "hi"),
      source_ref: N01_2026.ref,
    };
    expect(render("deadline_extended", "hi", values)).toBe(
      "सूचना: Acme Bengaluru के लिए File GSTR-3B for the month (2026-03) की अंतिम तिथि 20 अप्रैल 2026 से बढ़ाकर 21 अप्रैल 2026 कर दी गई है। स्रोत: 01/2026-Central Tax। मदद के लिए HELP और बंद करने के लिए STOP लिखें।",
    );
  });
});

describe("ComplianceWatch: the quote check", () => {
  // Values from the kernel's own quote_match_ratio and evidence_tokens_missing (Python), on the same strings.
  const golden: [quote: string, text: string, ratio: number, missing: string[]][] = [
    ["hereby extends the due date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the twenty -first day of April, 2026", P3, 1, []],
    ["hereby extends the due date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the twenty-first day of April, 2026", P3, 1, []],
    ["extends the due date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the 21st day of April, 2026", P3, 0.919355, ["21st"]],
    ["hereby extends the due date for furnishing the return in FORM GSTR-3B for the month of February, 2026 till the twenty-first day of April, 2026", P3, 0.957746, ["february"]],
    ["hereby extends the due date for furnishing the return in FORM GSTR-1 for the month of March, 2026 till the twenty-first day of April, 2026", P3, 0.985507, ["gstr-1"]],
    ["the Commissioner moved the deadline for the March return", P3, 0.660714, []],
    ["till the 31st day of April, 2026", P3, 0.75, ["31st"]],
    ["exempts the registered person whose aggregate turnover is up to three crore rupees", P4, 0.731707, []],
    ["in respect of filing of annual return for the financial year 2023-24 onwards", P4, 0.973684, ["2023-24"]],
    ["Sub – Section (6)", "sub -section (6) of", 1, []],
    ["GSTR - 3B", "FORM GSTR-3B for", 1, []],
    ["  ", "x", 0, []],
    ["the twenty -first", "till the twenty - first day", 1, []],
  ];

  it.each(golden)("%s", (quote, text, ratio, missing) => {
    expect(quoteMatchRatio(quote, text)).toBeCloseTo(ratio, 6);
    expect(evidenceTokensMissing(quote, text)).toEqual(missing);
  });

  it("lists the tokens that carry a fact, once each", () => {
    expect(factTokens("for the month of March, 2026 till the 21st day of April, 2026 in FORM GSTR-3B")).toEqual(["march", "2026", "21st", "april", "gstr-3b"]);
  });

  it("finds the window it matched in the original text", () => {
    const quote = "till the twenty-first day of April, 2026";
    const { span } = quoteMatch(quote, P3);
    expect(Array.from(P3).slice(...span!).join("")).toBe("till the twenty -first day of April, 2026");
  });

  it("rejects each golden draft for the reason the answerer gives", () => {
    const [acme, threshold, fssai] = ANSWER_CASES;
    const bundle = (c: (typeof ANSWER_CASES)[number]) => c.evidence.map((e) => ({ label: e.label, text: e.clause.text }));
    const check = (c: (typeof ANSWER_CASES)[number], quote: string) => checkCitations({ covered: true, answer: c.answer, citations: [{ clause: c.cite, quote }] }, bundle(c));
    expect(check(acme, acme.draft)).toEqual(["citation 1 quote has 21st, which C1 lacks"]);
    expect(check(acme, acme.edits[0].quote)).toEqual([]);
    expect(check(acme, acme.edits[3].quote)).toEqual(["citation 1 quote is not in C1"]);
    expect(check(threshold, threshold.draft)).toEqual(["citation 1 quote is not in C1"]);
    expect(check(threshold, threshold.edits[0].quote)).toEqual([]);
    expect(check(fssai, fssai.draft)).toEqual(["citation 1 names 'C13', not a listed clause"]);
    expect(check(acme, "21 Apr")).toEqual(["citation 1 quote must be 8 to 400 characters"]);
  });
});

describe("ComplianceWatch: PII masking", () => {
  // Outputs of the gateway's own scrub() (Python) on the same strings.
  it("masks every kind, GSTIN before PAN", () => {
    const { text, counts } = scrub(PII_SAMPLE);
    expect(text).toBe(
      "Hi, I'm Ravi from Acme Traders (GSTIN [GSTIN], PAN [PAN]). My Aadhaar is [AADHAAR]. Call [PHONE] or [PHONE], or write to [EMAIL]. Invoice 12345 67890 came to ₹12,45,000 on 14-09-2026.",
    );
    expect(counts).toEqual({ gstin: 1, pan: 1, aadhaar: 1, phone: 2, email: 1 });
  });

  it.each([
    ["Call 09876543210 now", "Call [PHONE] now"],
    ["Ref 5876543210", "Ref 5876543210"],
    ["+919876543210", "[PHONE]"],
    ["0 98765 43210", "0 98765 43210"],
    ["98765 43210", "98765 43210"],
    ["Aadhaar 1234 5678 9012", "Aadhaar 1234 5678 9012"],
    ["id 234567890123 x", "id [AADHAAR] x"],
    ["PAN abcde1234f", "PAN abcde1234f"],
    ["मेरा नंबर 9876543210 है", "मेरा नंबर [PHONE] है"],
    ["+91-98765-43210", "[PHONE]"],
    ["GSTIN 07ABCDE1234F1Z9 and 27AAPFU0939F1ZV", "GSTIN [GSTIN] and [GSTIN]"],
  ])("%s", (input, output) => {
    expect(scrub(input).text).toBe(output);
  });
});

describe("ComplianceWatch: delivery", () => {
  const at = (h: number, m = 0) => h * 60 + m;

  it("gathers for five minutes, then sends free text inside the WhatsApp window", () => {
    const plan = planDelivery({ at: at(10, 15), hoursSinceInbound: 2, templateApproved: false, whatsappDown: false });
    expect(plan.readyAt).toBe(at(10, 20));
    expect(plan.heldUntil).toBeNull();
    expect(plan.attempts).toEqual([{ at: at(10, 20), channel: "whatsapp", ok: true, note: "free text, inside the window" }]);
  });

  it("holds through quiet hours until 08:00", () => {
    expect(nextAllowed(at(22, 45))).toBe(at(32));
    expect(nextAllowed(at(6, 30))).toBe(at(8));
    const plan = planDelivery({ at: at(22, 40), hoursSinceInbound: 2, templateApproved: true, whatsappDown: false });
    expect(plan.heldUntil).toBe(at(32));
    expect(plan.outcome).toBe("whatsapp");
  });

  it("falls back to email at once when only an unapproved template could go", () => {
    const plan = planDelivery({ at: at(10, 15), hoursSinceInbound: 30, templateApproved: false, whatsappDown: false });
    expect(plan.mode).toBe("template");
    expect(plan.attempts.map((a) => [a.channel, a.ok, a.at])).toEqual([
      ["whatsapp", false, at(10, 20)],
      ["email", true, at(10, 20)],
    ]);
  });

  it("retries after 1 and 5 minutes, respects quiet hours, then falls back once", () => {
    const plan = planDelivery({ at: at(20, 50), hoursSinceInbound: 1, templateApproved: true, whatsappDown: true });
    expect(plan.attempts.map((a) => [a.channel, a.at])).toEqual([
      ["whatsapp", at(20, 55)],
      ["whatsapp", at(20, 56)],
      ["whatsapp", at(32)],
      ["email", at(32)],
    ]);
  });

  it("waits for the 09:00 digest when the owner chose one", () => {
    expect(planDelivery({ at: at(22), hoursSinceInbound: 1, templateApproved: true, whatsappDown: false, digest: true }).readyAt).toBe(at(33));
    expect(planDelivery({ at: at(7), hoursSinceInbound: 1, templateApproved: true, whatsappDown: false, digest: true }).readyAt).toBe(at(9));
  });

  it("reads the bot's keywords in English, Hindi and Hinglish", () => {
    expect(detectIntent("Stop.")).toBe("opt_out");
    expect(detectIntent("बंद करो")).toBe("opt_out");
    expect(detectIntent("haan")).toBe("opt_in");
    expect(detectIntent("मदद")).toBe("help");
    expect(detectIntent("please stop sending")).toBe("message");
    expect(detectLanguage("बंद करो")).toBe("hi");
    expect(detectLanguage("STOP")).toBe("en");
  });
});

describe("ComplianceWatch: the system", () => {
  it("has ten services, two apps and eighteen event topics", () => {
    expect(SERVICES.filter((s) => s.kind === "service")).toHaveLength(10);
    expect(SERVICES.filter((s) => s.kind === "app")).toHaveLength(2);
    expect(TOPICS).toHaveLength(18);
  });

  it("every consumed topic has a producer", () => {
    for (const s of SERVICES) for (const t of s.consumes) expect(TOPICS, `${s.id} consumes ${t}`).toContain(t);
  });
});
