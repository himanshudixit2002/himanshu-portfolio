import type { Project } from "../types";

export const complianceWatch: Project = {
  slug: "compliancewatch",
  title: "ComplianceWatch",
  tagline: "Regulatory change, decided for one specific business.",
  summary:
    "Watches India's GST regulators for rule changes, decides which ones apply to one specific business, and turns each into a dated obligation — with reminders on WhatsApp in Hindi or English, and answers that quote the clause or say they can't.",
  categories: ["Product", "Systems", "AI & Data"],
  tier: "flagship",
  period: { start: "2026-09", end: "2026-09" },
  status: "Complete · GST first, FSSAI next",
  platform: "Web app, WhatsApp bot and 10 services",
  role: "Sole author — every service, both apps and the CI",
  problem:
    "A small business under GST answers to the CBIC, the GST Council, GSTN and its own state, which publish dozens of notifications, circulars and advisories a year, mostly as PDFs. Most don't apply to it. The few that do move a date or a threshold, and missing one costs late fees and interest. An owner needs the few that matter, dated, in their own language, with the source attached.",
  contribution:
    "Designed and built it end to end: a polite crawler and parser for five regulator feeds, a versioned rulebook with human review, a three-valued applicability engine, per-period obligations, reminders over WhatsApp and email, question answering that checks its own quotes, one gateway for every model call, the Next.js app for owners and CA firms, and the CI that holds it all to account.",
  stack: [
    "Python · FastAPI",
    "PostgreSQL · pgvector",
    "Kafka · Redpanda",
    "Temporal",
    "Next.js 16 · React 19",
    "TypeScript",
    "Tailwind CSS",
    "Hono",
    "OpenTelemetry · Prometheus",
    "Docker",
    "GitHub Actions",
    "Playwright",
  ],
  highlights: [
    {
      title: "Rules that know who they're for",
      body: "Every rule is a predicate tree over the business's profile, evaluated in three values: applies, doesn't, or unsure. Unsure becomes a question for the owner or an analyst, never a guess.",
    },
    {
      title: "Nothing publishes without a person",
      body: "A model proposes each rule and deterministic validators check it against the clause it came from. An analyst approves it — two, for high-impact changes — before it reaches a single business.",
    },
    {
      title: "Answers with receipts",
      body: "Every quote in an answer is checked against its clause before it goes out. Fail twice and the reply is “not covered”: the model can't talk its way past the check.",
    },
  ],
  metrics: [
    { value: "10", label: "services, each with its own Postgres schema, joined by an event backbone" },
    { value: "4 of 13", label: "standing GST rules apply to the demo wholesaler; 8 don't, and 1 waits for a person" },
    { value: "5,571", label: "tests passing: 4,523 in Python and 1,048 in TypeScript" },
    { value: "18", label: "event topics, each a JSON Schema checked for breaking changes in CI" },
    { value: "85%", label: "match a quote needs with its clause, or the answer is “not covered”" },
    { value: "56", label: "question-answering eval cases: 20 single-hop, 16 multi-hop, 10 date and threshold, 10 must-refuse" },
    { value: "99.21%", label: "coverage of the domain and application layers, against a floor of 80%" },
    { value: "19", label: "architecture decision records, from the monorepo to the web app's server layer" },
  ],
  decisions: [
    {
      title: "Deterministic predicates first",
      body: "Applicability is a predicate tree over the profile, not a model's opinion: cheap, explainable and testable. Anything it can't decide — a free-text condition, a missing answer, confidence under 0.8 — goes to review.",
    },
    {
      title: "A person approves every rule",
      body: "Enforced twice: in the service, and again by a Postgres trigger. A wrong rule fans out to thousands of businesses, so a high-impact change needs two different approvers.",
    },
    {
      title: "An outbox, not two writes",
      body: "Every event is written in the same transaction as the change it describes, then relayed to Kafka. Consumers record what they've handled, and a message that keeps failing goes to a dead-letter topic instead of blocking its partition.",
    },
    {
      title: "One door for every model call",
      body: "No framework in the middle: one gateway owns routes and fallbacks, the prompt registry, budgets, PII masking, the cache and the traces. A prompt the registry doesn't know is refused, and CI fails if a prompt drifts from its recorded hash.",
    },
    {
      title: "Deadline changes reschedule, history stays",
      body: "One obligation per business, rule and period. An extension moves it and a withdrawal closes it, and every change is appended to a log that a trigger keeps append-only.",
    },
    {
      title: "Postgres until it hurts",
      body: "Row-level security, filters and vector search in one engine, with written exit criteria — fifty million vectors, or a p95 over 150 ms — for when search moves out.",
    },
  ],
  evidence: [
    "4,523 Python tests pass with 99.21% coverage of the domain and application layers, and 1,048 Vitest tests pass across the web app, the UI kit, the bot and the flags package (run 2026-09-30).",
    "One required CI gate over 12 jobs: strict types on both sides, 10 import-linter contracts, OpenAPI and event-schema compatibility, row-level-security lint, a cross-tenant route suite, Semgrep, Trivy and gitleaks.",
    "The eval harness runs 22 gates over the golden sets in CI and runs nightly against a real model behind the gateway.",
    "One command — make demo — runs a sample business end to end in one process: consent, profile, 13 rules, 7 obligations and a reminder in Hindi.",
    "19 architecture decision records and a runbook for every paging alert.",
  ],
  limitations: [
    "GST first: FSSAI is the next regulator. The ontology and the rulebook are built for more; those rules aren't written yet.",
    "A rule reaches businesses only after an analyst approves it — by design, so a same-day notification can take hours to arrive.",
    "Conditions the ontology can't express, like job work, come back “unsure” and wait for a person; the engine never guesses.",
    "Outside WhatsApp's 24-hour window only a Meta-approved template may go, so every reminder has a template twin and an email fallback.",
    "It is not legal or tax advice: every answer cites its clause, so the owner, or their CA, can check it.",
  ],
  media: [
    {
      id: "cw-home",
      kind: "illustration",
      alt: "Illustration of the ComplianceWatch web app with sample data: Acme Bengaluru's business home, with this month's GSTR-1 and GSTR-3B due dates, a due-date change citing notification 01/2026-Central Tax, and its profile.",
    },
    {
      id: "cw-whatsapp",
      kind: "illustration",
      alt: "Illustration of a ComplianceWatch reminder on WhatsApp with sample data, in Hindi: the GSTR-3B due date for March 2026 extended from 20 to 21 April, citing notification 01/2026-Central Tax.",
    },
  ],
  links: [{ kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/compliancewatch" }],
  visual: "cw-applicability",
  accent: "#8ab4ff",
};
