/*
 * ComplianceWatch as a system: its ten services and two apps, the eighteen
 * event topics between them (packages/contracts/events/schemas), the sources
 * it watches, and the gates CI holds every change to. From the repository's
 * README, CODEOWNERS layout, contracts and .github/workflows.
 */

export type ServiceId =
  | "pipeline"
  | "rulebook"
  | "llm-gateway"
  | "eval"
  | "profile"
  | "applicability-engine"
  | "obligation"
  | "notification"
  | "qa"
  | "identity"
  | "web"
  | "whatsapp-bot";

export type Service = {
  id: ServiceId;
  name: string;
  kind: "service" | "app";
  /** Dev port and Postgres schema, for services. */
  port?: number;
  schema?: string;
  owns: string;
  emits: string[];
  consumes: string[];
  /** Other services it calls over HTTP. */
  calls: ServiceId[];
};

export const SERVICES: Service[] = [
  {
    id: "pipeline",
    name: "pipeline",
    kind: "service",
    port: 8010,
    schema: "pipeline",
    owns: "Crawls the regulators politely, parses PDF and HTML into clauses, detects what kind of change a document is, and proposes rules for review, as Temporal workflows.",
    emits: ["document.discovered", "document.parsed", "rule.candidate.created"],
    consumes: [],
    calls: ["rulebook", "llm-gateway"],
  },
  {
    id: "rulebook",
    name: "rulebook",
    kind: "service",
    port: 8003,
    schema: "rulebook",
    owns: "Documents and clauses (append-only), the knowledge graph, rule versions with citations, the analyst's review and publish flow, and hybrid clause search.",
    emits: ["rule.published", "rule.superseded", "rule.withdrawn", "rule.deadline_changed"],
    consumes: [],
    calls: ["llm-gateway"],
  },
  {
    id: "profile",
    name: "profile",
    kind: "service",
    port: 8002,
    schema: "profile",
    owns: "Each business as PAN, GSTIN and location, its attribute values per financial year, one-question onboarding, snapshots for the engine and review tasks.",
    emits: ["profile.updated"],
    consumes: [],
    calls: [],
  },
  {
    id: "applicability-engine",
    name: "applicability-engine",
    kind: "service",
    port: 8004,
    schema: "applicability",
    owns: "Evaluates every rule's predicate tree against a business's snapshot: applies, does not apply, or unsure — and unsure becomes a review task, never a guess.",
    emits: ["applicability.decided"],
    consumes: ["rule.published", "profile.updated"],
    calls: ["profile", "rulebook"],
  },
  {
    id: "obligation",
    name: "obligation",
    kind: "service",
    port: 8005,
    schema: "obligation",
    owns: "One obligation per business, rule and period, due at the end of the day in IST; deadline changes reschedule it, and every change is appended to a log.",
    emits: ["obligation.created", "obligation.rescheduled", "obligation.closed", "obligation.due_soon"],
    consumes: ["applicability.decided", "rule.deadline_changed", "rule.withdrawn", "rule.superseded"],
    calls: [],
  },
  {
    id: "notification",
    name: "notification",
    kind: "service",
    port: 8006,
    schema: "notification",
    owns: "Recipients and their preferences, templates in English and Hindi, WhatsApp and email, quiet hours, batching, digests, retries and a fallback channel.",
    emits: ["notification.sent", "notification.failed"],
    consumes: ["obligation.created", "obligation.rescheduled", "obligation.closed", "obligation.due_soon"],
    calls: ["rulebook"],
  },
  {
    id: "qa",
    name: "qa",
    kind: "service",
    port: 8007,
    schema: "qa",
    owns: "Answers questions in layers — structured, then a knowledge-graph plan and solve, then hybrid search — and checks every quote against its clause.",
    emits: [],
    consumes: [],
    calls: ["rulebook", "profile", "obligation", "llm-gateway"],
  },
  {
    id: "llm-gateway",
    name: "llm-gateway",
    kind: "service",
    port: 8008,
    schema: "llm_gateway",
    owns: "The one door to every model: routes and fallbacks, the prompt registry, budgets, PII masking, a cache, a circuit breaker, a cost ledger and traces.",
    emits: [],
    consumes: [],
    calls: [],
  },
  {
    id: "eval",
    name: "eval",
    kind: "service",
    port: 8009,
    schema: "eval",
    owns: "Golden sets for extraction, relations and question answering, run by a harness that gates CI and runs nightly against a real model.",
    emits: [],
    consumes: [],
    calls: ["llm-gateway"],
  },
  {
    id: "identity",
    name: "identity",
    kind: "service",
    port: 8001,
    schema: "identity",
    owns: "Tenants, users and roles, sign-in, ES256 access and service tokens every service verifies, consent records and billing.",
    emits: ["tenant.created", "tenant.deletion.requested", "user.role.changed"],
    consumes: [],
    calls: [],
  },
  {
    id: "web",
    name: "web",
    kind: "app",
    owns: "The Next.js app for owners and CA firms: businesses, onboarding, profile, snapshot, review tasks and settings, from a screen registry.",
    emits: [],
    consumes: [],
    calls: ["identity", "profile", "obligation"],
  },
  {
    id: "whatsapp-bot",
    name: "whatsapp-bot",
    kind: "app",
    owns: "Meta's webhook, signature-checked: keywords to opt in, opt out or ask for help in English, Hindi and Hinglish, answered in the language they were written in.",
    emits: [],
    consumes: [],
    calls: ["notification", "identity"],
  },
];

/** Every topic, in the order the flow uses them. */
export const TOPICS = [...new Set(SERVICES.flatMap((s) => s.emits))];

/** The five feeds the pipeline reads (services/pipeline/.../adapters/registry.py). */
export const SOURCES = [
  { id: "cbic_notifications", name: "CBIC notifications" },
  { id: "cbic_circulars", name: "CBIC circulars" },
  { id: "gstcouncil_press", name: "GST Council press releases" },
  { id: "gstn_advisories", name: "GSTN advisories" },
  { id: "mahagst_notifications", name: "Maharashtra GST notifications" },
] as const;

/**
 * What every change passes before it merges: one required "CI gate" job
 * that needs every other. Figures are the repository's own, counted
 * 2026-09-30 (see editorial/sources.ts).
 */
export const GATES: { name: string; detail: string }[] = [
  { name: "Types, both sides", detail: "mypy --strict over 797 files, tsc --strict" },
  { name: "Tests with a floor", detail: "80% on domain and application; 99.21% today" },
  { name: "Layers that can't leak", detail: "10 import-linter contracts: no service imports another" },
  { name: "Contracts that can't break", detail: "OpenAPI and event schemas checked against the base branch" },
  { name: "Row-level security", detail: "Migration lint fails any tenant table without a forced policy" },
  { name: "Cross-tenant routes", detail: "70 cases: tenant B never reads tenant A" },
  { name: "Evals", detail: "22 gates over the golden sets, nightly against a real model" },
  { name: "Fuzzed APIs", detail: "Schemathesis: 167 generated cases, no 5xx, spec-shaped bodies" },
  { name: "Security scans", detail: "Semgrep with 4 house rules, Trivy, gitleaks" },
  { name: "Flags with owners", detail: "20 flags, each with an owner and an expiry date" },
  { name: "Alerts with runbooks", detail: "12 paging rules, each linked to a runbook" },
  { name: "Accessible screens", detail: "Playwright with axe on every page" },
];
