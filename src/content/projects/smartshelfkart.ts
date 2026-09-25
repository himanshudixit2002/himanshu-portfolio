import type { Project } from "../types";

export const smartShelfKart: Project = {
  slug: "smartshelfkart",
  title: "SmartShelfKart",
  tagline: "Clarity for everything in stock.",
  summary:
    "A multi-tenant inventory platform for growing businesses, with an assistant that answers from the ledger instead of guessing.",
  categories: ["Product", "AI & Data"],
  tier: "flagship",
  period: { start: "2026-02" },
  status: "Live on the web and Google Play",
  platform: "Web, Android and iOS",
  role: "Architecture and nearly all of the implementation",
  problem:
    "Small businesses juggle purchasing, sales, warehouses and tax in spreadsheets. They need a tool that stays simple on a busy day — and answers they can trust, not a language model's impression of their numbers.",
  contribution:
    "Designed the architecture and built the Flutter client, the Python assistant service, the Java reporting service and the Firestore security rules.",
  stack: ["Flutter", "Cloud Firestore", "Python · FastAPI", "LangGraph", "Java 17 · Spring Boot", "PostgreSQL", "OpenTelemetry"],
  highlights: [
    {
      title: "One codebase, three platforms",
      body: "Web, Android and iOS from a single Flutter client, covering purchasing, sales, warehousing, manufacturing and reporting.",
    },
    {
      title: "Answers from real data",
      body: "Stock questions are computed from a live snapshot of the ledger. Inventory is queried, not embedded — vector search was taken out of the request path by design.",
    },
    {
      title: "Writes you confirm",
      body: "Every change the assistant proposes is previewed first and committed only after an explicit confirm, behind the same permissions as the app.",
    },
  ],
  metrics: [
    { value: "51", label: "business modules, from purchasing to financial reporting" },
    { value: "800+", label: "automated tests across client, assistant and reporting" },
    { value: "76%", label: "of benchmark questions answered with no model call" },
    { value: "980", label: "lines of security rules guarding 45 tenant-scoped collections" },
  ],
  decisions: [
    {
      title: "No vector search",
      body: "Inventory is structured, numeric data. A query returns the exact count; nearest-neighbour search over an embedded stock table is slower, costlier and can return a confidently wrong row — and it can never compute a SUM.",
    },
    {
      title: "Re-enforce the rules in every service that bypasses them",
      body: "The assistant and reporting services use the Admin SDK, which ignores Firestore's rules. Both resolve the same 117 permission keys the rules do, and fail closed — otherwise the assistant becomes a way around every permission in the product.",
    },
    {
      title: "Money is integer minor units",
      body: "Reporting stores amounts as BIGINT paise, converted once at the sync boundary. A floating-point column eventually reports a tax total of 4999.999999997.",
    },
    {
      title: "Rebuild the read model, don't merge it",
      body: "Firestore won't report deletions after the fact, so an incremental sync would leave deleted invoices in every report. A full rebuild is a few thousand rows in one transaction: all or nothing.",
    },
  ],
  evidence: [
    "816 tests: 781 client, 35 reporting (run on H2 and real PostgreSQL), plus 19 assistant test files.",
    "A 21-case golden set grades the agent offline with zero tokens; CI requires every case to pass and at least 70% to be answered deterministically.",
    "OpenAPI 3.1 contract and a generated typed client, both diff-checked in CI.",
    "A 22-page architecture reference covering the data model, authorization and the assistant end to end.",
  ],
  limitations: [
    "The eval harness scripts the model's tool choice, so it tests everything downstream of the model — not the model's judgement itself.",
    "Brand strings are still hard-coded in about 28 files, so adding a third brand is more than configuration.",
    "The screens shown here are illustrations with sample data; captures from a demo workspace are still to come.",
  ],
  media: [
    {
      id: "ssk-overview",
      kind: "illustration",
      alt: "Illustration of the SmartShelfKart dashboard with sample data: product, low-stock and out-of-stock counts, quick stock actions, a stock trend chart and a low-stock list.",
    },
    {
      id: "ssk-assistant",
      kind: "illustration",
      alt: "Illustration of the Nova assistant on a phone with sample data: a request to add 50 blue widgets, shown as a preview with a confirm button.",
    },
    {
      id: "ssk-inventory",
      kind: "illustration",
      alt: "Illustration of the SmartShelfKart inventory list with sample data: products with SKUs, quantities and stock status.",
    },
  ],
  links: [
    { kind: "live", label: "Visit smartshelfkart.com", href: "https://smartshelfkart.com" },
    {
      kind: "store",
      label: "Google Play",
      href: "https://play.google.com/store/apps/details?id=com.stockmanager.stock_management",
    },
    { kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/stock_management" },
  ],
  visual: "ssk-system",
  accent: "#2dd4bf",
};
