/*
 * Regulator text as ComplianceWatch recorded it. The clauses are the parser's
 * output, extraction noise included ("sub -section", "due  date", "twenty
 * -first"): the quote check exists to read past exactly that. Sources:
 * apps/web/scripts/seed/fixtures/rulebook/gst-ct-01-2026.document.json and
 * evals/golden/extraction/cbic_notifications/cases/15-2025-central-tax.yaml.
 */

export type Clause = { ref: string; text: string };

export type RegulatorDocument = {
  regulator: string;
  ref: string;
  title: string;
  publishedOn: string;
  url: `https://${string}`;
  clauses: Clause[];
};

/** CBIC Notification No. 01/2026-Central Tax: the worked example the case study follows. */
export const N01_2026: RegulatorDocument = {
  regulator: "CBIC",
  ref: "01/2026-Central Tax",
  title: "Seeks to extends the due date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the twenty-first day of April, 2026",
  publishedOn: "2026-04-21",
  url: "https://taxinformation.cbic.gov.in/content/pdf/tax_repository/gst/notifications/gst-ct-01-2026.pdf",
  clauses: [
    { ref: "en.p1", text: "[TO BE PUBLISHED IN THE GAZETTE OF INDIA, EXTRAORDINARY, PART II, SECTION 3, SUB- SECTION (i)]" },
    {
      ref: "en.p2",
      text: "GOVERNMENT OF INDIA MINISTRY OF FINANCE DEPARTMENT OF REVENUE CENTRAL BOARD OF INDIRECT TAXES AND CUSTOMS NOTIFICATION No. 01/2026 – Central Tax New Delhi, dated the 21st April, 2026",
    },
    {
      ref: "en.p3",
      text: "G.S.R … (E).— In exercise of the powers conferred by sub -section (6) of section 39 of the Central Goods and Services Tax Act, 2017 (12 of 2017), the Commissioner, on the recommendations of the GST Council, hereby extends the due  date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the twenty -first day of April, 2026, for the registered persons who are required to furnish return under sub-section (1) of section 39 read with clause (i) of sub -rule (1) of  rule 61 of the Central Goods and Services Tax Rules, 2017.",
    },
    { ref: "en.p4", text: "2.  This notification shall come into effect from 20th day of April, 2026." },
    { ref: "en.p5", text: "[F. No. CBIC-20006/45/2025-GST]" },
    { ref: "en.p6", text: "(Kangale Shrunkhala Motiram) Director" },
  ],
};

/** The operative clause of 01/2026 and the extension the relation extractor labels from it. */
export const EXTENSION = {
  clause: N01_2026.clauses[2],
  form: "GSTR-3B",
  period: "2026-03",
  ruleKey: "gstr3b_monthly",
  previousDue: "2026-04-20",
  newDue: "2026-04-21",
  relation: "extends_deadline",
  event: "rule.deadline_changed",
} as const;

/** Notification No. 15/2025-Central Tax, clause en.p4: the annual-return exemption. */
export const N15_2025_P4: Clause = {
  ref: "en.p4",
  text: "New Delhi, the 17th day of September 2025 S.O. ......(E).— In exercise of the powers conferred by the first proviso to sub-section (1) of section 44 of the Central Goods and Services Tax Act, 2017 (12 of 2017), the Commissioner, on the recommendations of the Council, in respect of filing of annual return for the financial year 2024-25 onwards, hereby exempts the registered person whose aggregate turnover in any financial year is up to two crore rupees, from filing annual return that said financial year. [F. No CBIC-20001/2/2025-GST]",
};

/** A quick edit to a draft's quote, offered as a one-tap fix. */
export type QuoteEdit = { label: string; quote: string };

/**
 * Three cases from the question-answering golden set (evals/golden/qa/kag),
 * with the evidence the answerer was given as labelled clauses. The first
 * draft of each is the kind of quote a model writes; `edits` are the
 * one-tap alternatives; `verbatim` is the quote as the clause has it.
 */
export type AnswerCase = {
  id: string;
  category: string;
  question: string;
  layer: "kag";
  evidence: { label: string; document: string; clause: Clause }[];
  answer: string;
  cite: string;
  draft: string;
  edits: QuoteEdit[];
};

const P3 = N01_2026.clauses[2];

export const ANSWER_CASES: AnswerCase[] = [
  {
    id: "mh-acme-gstr3b-2026-03",
    category: "Multi-hop",
    question: "When was Acme Bengaluru's GSTR-3B for March 2026 due?",
    layer: "kag",
    evidence: [{ label: "C1", document: N01_2026.ref, clause: P3 }],
    answer: "Acme Bengaluru files FORM GSTR-3B every month, and notification No. 01/2026-Central Tax extended the due date for March 2026 till 21 April 2026.",
    cite: "C1",
    draft: "extends the due date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the 21st day of April, 2026",
    edits: [
      { label: "Copy it from the clause", quote: "hereby extends the due date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the twenty -first day of April, 2026" },
      { label: "Tidy the spacing", quote: "hereby extends the due date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the twenty-first day of April, 2026" },
      { label: "Get the month wrong", quote: "hereby extends the due date for furnishing the return in FORM GSTR-3B for the month of February, 2026 till the twenty-first day of April, 2026" },
      { label: "Paraphrase it", quote: "the Commissioner moved the deadline for the March return" },
    ],
  },
  {
    id: "dt-15-2025-three-crore",
    category: "Threshold",
    question: "Does notification 15/2025-Central Tax exempt a registered person with an aggregate turnover of three crore rupees in financial year 2024-25 from the annual return?",
    layer: "kag",
    evidence: [{ label: "C1", document: "15/2025-Central Tax", clause: N15_2025_P4 }],
    answer: "No. The exemption covers a registered person whose aggregate turnover in the financial year is up to two crore rupees; three crore rupees is above that limit.",
    cite: "C1",
    draft: "exempts the registered person whose aggregate turnover is up to three crore rupees",
    edits: [
      { label: "Copy it from the clause", quote: "hereby exempts the registered person whose aggregate turnover in any financial year is up to two crore rupees, from filing annual return that said financial year" },
      { label: "Cite the wrong year", quote: "in respect of filing of annual return for the financial year 2023-24 onwards" },
    ],
  },
  {
    id: "mr-out-of-domain-fssai",
    category: "Must refuse",
    question: "When do I need to renew my FSSAI food business licence?",
    layer: "kag",
    evidence: [],
    answer: "The licence is renewed every year.",
    cite: "C13",
    draft: "the licence is renewed every year",
    edits: [{ label: "Try another clause", quote: "the licence is renewed every year before it expires" }],
  },
];

export const NOT_COVERED_TEXT = "I cannot answer this from the published rules and notifications in force on that date.";
