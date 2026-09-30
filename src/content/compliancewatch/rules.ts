/*
 * ComplianceWatch's seed calendar: the thirteen standing GST obligations in
 * services/rulebook/seed/gst_calendar.yaml, with their predicates over
 * ontology 0.2.0, their recurrences and their citations, copied as written.
 * The simulations on the case study evaluate these, not a paraphrase.
 */

export type Operator = "eq" | "gt" | "lte" | "contains_any";
export type Scalar = string | boolean;

export type Predicate =
  | { attribute: string; operator: Operator; value: Scalar | readonly string[] }
  /** A condition the ontology can't express: always "unsure", for a person to judge. */
  | { attribute: string; freeText: string };

export type Spec = { allOf: Spec[] } | { anyOf: Spec[] } | { not: Spec } | Predicate;

export type Frequency = "monthly" | "quarterly" | "half_yearly" | "annual";

export type Rule = {
  key: string;
  /** The form or duty, as a short chip. */
  form: string;
  title: string;
  level: "entity" | "registration";
  spec: Spec;
  template: { title: string; steps: string[]; dueInDays?: number };
  recurrence?: { frequency: Frequency; dueDay: number; dueMonthOffset: number };
  source: { instrument: string; reference: string };
};

/** The first group of states and union territories: QRMP GSTR-3B is due on the 22nd there. */
export const GROUP_A_STATES = ["22", "23", "24", "26", "27", "29", "30", "31", "32", "33", "34", "35", "36", "37"] as const;

const regular = { attribute: "registration_type", operator: "eq", value: "regular" } as const;
const monthly = { attribute: "filing_scheme", operator: "eq", value: "regular_monthly" } as const;
const qrmp = { attribute: "filing_scheme", operator: "eq", value: "regular_qrmp" } as const;
const groupA = { attribute: "state_codes", operator: "contains_any", value: GROUP_A_STATES } as const;
const jobWork = {
  attribute: "sends_goods_to_job_workers",
  freeText: "The business sends inputs or capital goods to a job worker under section 143.",
} as const;

export const SEED_RULES: Rule[] = [
  {
    key: "gstr3b_monthly",
    form: "GSTR-3B",
    title: "File FORM GSTR-3B every month",
    level: "registration",
    spec: { allOf: [regular, monthly] },
    template: {
      title: "File GSTR-3B for the month",
      steps: ["Reconcile outward supplies and input tax credit for the month", "Pay the tax due through the electronic cash or credit ledger", "File FORM GSTR-3B on the GST portal"],
    },
    recurrence: { frequency: "monthly", dueDay: 20, dueMonthOffset: 0 },
    source: { instrument: "CGST Rules, 2017", reference: "rule 61(1)" },
  },
  {
    key: "gstr3b_quarterly_group_a",
    form: "GSTR-3B",
    title: "File FORM GSTR-3B every quarter (QRMP, due on the 22nd)",
    level: "registration",
    spec: { allOf: [regular, qrmp, groupA] },
    template: {
      title: "File GSTR-3B for the quarter (QRMP)",
      steps: [
        "Pay tax for the first two months of the quarter through FORM GST PMT-06 by the 25th of the next month",
        "Reconcile the quarter's outward supplies and input tax credit",
        "File FORM GSTR-3B on the GST portal",
      ],
    },
    recurrence: { frequency: "quarterly", dueDay: 22, dueMonthOffset: 0 },
    source: { instrument: "Notification No. 82/2020-Central Tax", reference: "rule 61(1) proviso, first group of states" },
  },
  {
    key: "gstr3b_quarterly_group_b",
    form: "GSTR-3B",
    title: "File FORM GSTR-3B every quarter (QRMP, due on the 24th)",
    level: "registration",
    spec: { allOf: [regular, qrmp, { not: groupA }] },
    template: {
      title: "File GSTR-3B for the quarter (QRMP)",
      steps: [
        "Pay tax for the first two months of the quarter through FORM GST PMT-06 by the 25th of the next month",
        "Reconcile the quarter's outward supplies and input tax credit",
        "File FORM GSTR-3B on the GST portal",
      ],
    },
    recurrence: { frequency: "quarterly", dueDay: 24, dueMonthOffset: 0 },
    source: { instrument: "Notification No. 82/2020-Central Tax", reference: "rule 61(1) proviso, second group of states" },
  },
  {
    key: "gstr1_monthly",
    form: "GSTR-1",
    title: "File FORM GSTR-1 every month",
    level: "registration",
    spec: { allOf: [regular, monthly] },
    template: { title: "File GSTR-1 for the month", steps: ["Upload invoice-wise outward supplies for the month", "File FORM GSTR-1 on the GST portal"] },
    recurrence: { frequency: "monthly", dueDay: 11, dueMonthOffset: 0 },
    source: { instrument: "Notification No. 83/2020-Central Tax", reference: "section 37(1) read with the notification" },
  },
  {
    key: "gstr1_quarterly",
    form: "GSTR-1",
    title: "File FORM GSTR-1 every quarter (QRMP)",
    level: "registration",
    spec: { allOf: [regular, qrmp] },
    template: {
      title: "File GSTR-1 for the quarter (QRMP)",
      steps: [
        "Optionally report B2B invoices for the first two months through the invoice furnishing facility by the 13th of the next month",
        "Upload the quarter's outward supplies",
        "File FORM GSTR-1 on the GST portal",
      ],
    },
    recurrence: { frequency: "quarterly", dueDay: 13, dueMonthOffset: 0 },
    source: { instrument: "Notification No. 83/2020-Central Tax", reference: "quarterly return proviso" },
  },
  {
    key: "cmp08_quarterly",
    form: "CMP-08",
    title: "Pay tax every quarter through FORM GST CMP-08",
    level: "registration",
    spec: {
      allOf: [
        { attribute: "registration_type", operator: "eq", value: "composition" },
        { attribute: "filing_scheme", operator: "eq", value: "composition" },
      ],
    },
    template: {
      title: "File CMP-08 and pay tax for the quarter",
      steps: ["Total the quarter's outward supplies and the tax at the composition rate", "File FORM GST CMP-08 and pay through the electronic cash ledger"],
    },
    recurrence: { frequency: "quarterly", dueDay: 18, dueMonthOffset: 0 },
    source: { instrument: "CGST Rules, 2017", reference: "rule 62(1)(i)" },
  },
  {
    key: "gstr4_annual",
    form: "GSTR-4",
    title: "File the annual return in FORM GSTR-4",
    level: "registration",
    spec: { allOf: [{ attribute: "registration_type", operator: "eq", value: "composition" }] },
    template: { title: "File GSTR-4 for the financial year", steps: ["Reconcile the four CMP-08 statements of the year", "File FORM GSTR-4 on the GST portal"] },
    recurrence: { frequency: "annual", dueDay: 30, dueMonthOffset: 2 },
    source: { instrument: "Notification No. 12/2024-Central Tax", reference: "rule 62(1)(ii) as amended" },
  },
  {
    key: "gstr9_annual",
    form: "GSTR-9",
    title: "File the annual return in FORM GSTR-9",
    level: "registration",
    spec: { allOf: [regular, { attribute: "turnover_band", operator: "gt", value: "1_5_crore_to_2_crore" }] },
    template: { title: "File GSTR-9 for the financial year", steps: ["Reconcile the year's GSTR-1 and GSTR-3B figures with the books", "File FORM GSTR-9 on the GST portal"] },
    recurrence: { frequency: "annual", dueDay: 31, dueMonthOffset: 8 },
    source: { instrument: "CGST Rules, 2017", reference: "rule 80(1)" },
  },
  {
    key: "gstr9c_annual",
    form: "GSTR-9C",
    title: "File the reconciliation statement in FORM GSTR-9C",
    level: "registration",
    spec: { allOf: [regular, { attribute: "turnover_band", operator: "gt", value: "2_crore_to_5_crore" }] },
    template: {
      title: "File GSTR-9C for the financial year",
      steps: ["Reconcile the audited financial statements with the annual return", "File FORM GSTR-9C on the GST portal with GSTR-9"],
    },
    recurrence: { frequency: "annual", dueDay: 31, dueMonthOffset: 8 },
    source: { instrument: "Notification No. 30/2021-Central Tax", reference: "rule 80(3)" },
  },
  {
    key: "itc04_half_yearly",
    form: "ITC-04",
    title: "File FORM GST ITC-04 every half year",
    level: "registration",
    spec: { allOf: [regular, { attribute: "turnover_band", operator: "gt", value: "2_crore_to_5_crore" }, jobWork] },
    template: {
      title: "File ITC-04 for the half year",
      steps: ["List the challans for goods sent to and received back from job workers in the half year", "File FORM GST ITC-04 on the GST portal"],
    },
    recurrence: { frequency: "half_yearly", dueDay: 25, dueMonthOffset: 0 },
    source: { instrument: "Notification No. 35/2021-Central Tax", reference: "rule 45(3)" },
  },
  {
    key: "itc04_annual",
    form: "ITC-04",
    title: "File FORM GST ITC-04 every year",
    level: "registration",
    spec: { allOf: [regular, { attribute: "turnover_band", operator: "lte", value: "2_crore_to_5_crore" }, jobWork] },
    template: {
      title: "File ITC-04 for the financial year",
      steps: ["List the challans for goods sent to and received back from job workers in the year", "File FORM GST ITC-04 on the GST portal"],
    },
    recurrence: { frequency: "annual", dueDay: 25, dueMonthOffset: 0 },
    source: { instrument: "Notification No. 35/2021-Central Tax", reference: "rule 45(3)" },
  },
  {
    key: "e_invoicing",
    form: "e-invoice",
    title: "Issue e-invoices for B2B supplies",
    level: "entity",
    spec: { allOf: [regular, { attribute: "peak_turnover_band", operator: "gt", value: "2_crore_to_5_crore" }] },
    template: {
      title: "Set up e-invoicing and issue e-invoices",
      steps: ["Register on an Invoice Registration Portal and enable e-invoicing in the billing software", "Issue every B2B invoice with an IRN and QR code from the start date"],
      dueInDays: 30,
    },
    source: { instrument: "Notification No. 10/2023-Central Tax", reference: "Notification No. 13/2020-Central Tax as amended" },
  },
  {
    key: "eway_bill",
    form: "EWB-01",
    title: "Generate e-way bills for movements of goods",
    level: "registration",
    spec: { allOf: [{ attribute: "generates_eway_bills", operator: "eq", value: true }] },
    template: {
      title: "Generate e-way bills before moving goods",
      steps: ["Register on the e-way bill portal", "Generate FORM GST EWB-01 for every consignment above the threshold before dispatch"],
      dueInDays: 14,
    },
    source: { instrument: "CGST Rules, 2017", reference: "rule 138" },
  },
];

/** Ontology 0.2.0's turnover bands, in order: `gt` and `lte` compare by position here. */
export const TURNOVER_BANDS = [
  "upto_10_lakh",
  "10_lakh_to_20_lakh",
  "20_lakh_to_40_lakh",
  "40_lakh_to_75_lakh",
  "75_lakh_to_1_5_crore",
  "1_5_crore_to_2_crore",
  "2_crore_to_5_crore",
  "5_crore_to_10_crore",
  "10_crore_to_20_crore",
  "20_crore_to_50_crore",
  "50_crore_to_100_crore",
  "100_crore_to_500_crore",
  "above_500_crore",
] as const;

export type TurnoverBand = (typeof TURNOVER_BANDS)[number];

/** The ontology's own labels (wording.en.yaml). */
export const BAND_LABELS: Record<TurnoverBand, string> = {
  upto_10_lakh: "Up to 10 lakh",
  "10_lakh_to_20_lakh": "10 lakh to 20 lakh",
  "20_lakh_to_40_lakh": "20 lakh to 40 lakh",
  "40_lakh_to_75_lakh": "40 lakh to 75 lakh",
  "75_lakh_to_1_5_crore": "75 lakh to 1.5 crore",
  "1_5_crore_to_2_crore": "1.5 crore to 2 crore",
  "2_crore_to_5_crore": "2 crore to 5 crore",
  "5_crore_to_10_crore": "5 crore to 10 crore",
  "10_crore_to_20_crore": "10 crore to 20 crore",
  "20_crore_to_50_crore": "20 crore to 50 crore",
  "50_crore_to_100_crore": "50 crore to 100 crore",
  "100_crore_to_500_crore": "100 crore to 500 crore",
  above_500_crore: "Above 500 crore",
};

/** The states the simulation offers, two from each QRMP group, with the ontology's labels. */
export const STATES: { code: string; label: string }[] = [
  { code: "29", label: "Karnataka" },
  { code: "27", label: "Maharashtra" },
  { code: "07", label: "Delhi" },
  { code: "09", label: "Uttar Pradesh" },
];

export const FILING_LABELS = {
  regular_monthly: "Regular, filing monthly",
  regular_qrmp: "Regular, filing quarterly under QRMP",
  composition: "Composition",
} as const;

export type Profile = Record<string, Scalar | readonly string[] | undefined>;

export type Business = { key: string; name: string; entity: string; gstin: string; profile: Profile };

/** The demo tenant (tools/demo) and the second business of the question-answering world. */
export const ACME: Business = {
  key: "acme_monthly",
  name: "Acme Bengaluru",
  entity: "Acme Traders Private Limited",
  gstin: "29ABCDE1234F1Z5",
  profile: {
    registration_type: "regular",
    state_codes: ["29"],
    turnover_band: "2_crore_to_5_crore",
    peak_turnover_band: "2_crore_to_5_crore",
    filing_scheme: "regular_monthly",
    generates_eway_bills: true,
  },
};

export const QRMP_DELHI: Business = {
  key: "qrmp_delhi",
  name: "QRMP Delhi",
  entity: "QRMP Test Traders",
  gstin: "07ABCDE1234F1Z9",
  profile: {
    registration_type: "regular",
    state_codes: ["07"],
    turnover_band: "75_lakh_to_1_5_crore",
    filing_scheme: "regular_qrmp",
  },
};

/** The demo's clock: noon IST on 28 September 2026 (`cw-demo --daytime`). */
export const AS_OF = "2026-09-28";
