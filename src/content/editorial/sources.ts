/**
 * Editorial record — build-time only. Nothing in src/components or src/app
 * may import this file; tests/unit/content.test.ts enforces that.
 *
 * `verified` notes what was checked and how. `open` lists decisions that
 * belong to Himanshu before launch. Every figure shown on the site should
 * appear here.
 */

export type SourceNote = {
  claim: string;
  source: string;
  verified: string;
};

export type OpenQuestion = {
  topic: string;
  detail: string;
  blocks: string;
};

const R_FULL = "~/Downloads/HimanshuDixitResume.pdf (full-stack)";
const R_FE = "~/Downloads/frontend/Himanshu.Dixit.Resume.pdf (frontend)";
const R_DS = "~/Downloads/DataScience/HimanshuDixitResume.pdf (data science)";

export const sources: SourceNote[] = [
  // ── Identity and experience ──────────────────────────────────────────────
  {
    claim: "Cleartrip (via Teamlease), Product Solution Engineer, Aug 2025 – Aug 2026",
    source: `${R_FULL}; ${R_FE}; ${R_DS}; ~/Desktop/resume.tex`,
    verified: "All three current PDFs agree on the dates. Only the oldest LaTeX résumé says 'Present'.",
  },
  {
    claim: "Cleartrip achievements: H3/Elasticsearch price map (sub-second), bulk benefits API, Redis cache invalidated from Kafka, regression suites (−30% production tickets)",
    source: `${R_FULL}; ${R_FE}`,
    verified: "Each achievement stated in both PDFs; the data-science PDF phrases the first three differently and omits the 30%. Employer claims cannot be checked publicly — shown as text, never as animated counters.",
  },
  {
    claim: "Profile photo",
    source: "Himanshu's GitHub profile picture (avatars.githubusercontent.com/u/116220539), fetched 2026-09-26",
    verified: "Used at Himanshu's request. Background removed by colour key (src/content/media/himanshu.png); replace that one file with a sharper photo to update the header, the introduction and the link previews.",
  },
  {
    claim: "Availability: open to full-time roles",
    source: "Himanshu, in conversation (2026-09-26)",
    verified: "Stated by Himanshu for the hero badge and the homepage introduction. Update or remove when it changes.",
  },
  {
    claim: "Education: VIT B.Tech CSE, specialization in Data Science, 2021–2025",
    source: `${R_DS}; ~/Desktop/resume/resume`,
    verified: "Specialization stated in two sources; the other résumés omit it rather than contradict it.",
  },
  {
    claim: "Omitted: FIFTHGEN internship; 150+ incidents / 25% MTTR",
    source: "~/Desktop/resume/resume only",
    verified: "Absent from all three current PDFs. FIFTHGEN omission confirmed by Himanshu (2026-09-25).",
  },
  {
    claim: "Certifications (AWS CCP 2024, Google Cloud Digital Leader 2024) and 600+ DSA problems",
    source: "All résumés",
    verified: "Identical in every source. Credential links come from the résumés; current status not re-checked.",
  },

  // ── ComplianceWatch (the main project) ──────────────────────────────────
  {
    claim: "ComplianceWatch is presented as complete",
    source: "Himanshu, in conversation (2026-09-30): “assume it's completed” and show it as the main project",
    verified:
      "At 55f7ef3 (2026-09-29) each hop is built and tested on its own, but the chain is not yet wired end to end: the applicability-engine service is a template (the kernel evaluates the predicates, and `make demo` stitches profile → evaluation → obligations → a reminder in one process), nothing consumes the rule.* events yet, the ingest workflow runs on in-memory fakes, the bot doesn't answer questions yet, and infra/terraform, helm and argocd are placeholders. Nothing is deployed. The page describes the product as designed and claims no deployment, users or traffic.",
  },
  {
    claim: "Role: sole author; Sep 2026",
    source: "git log of github.com/himanshudixit2002/compliancewatch (full history, fetched 2026-09-30)",
    verified: "22 commits, 2026-09-27 → 2026-09-29, 21 squash-merged PRs (highest #37): 20 by Himanshu Dixit, 1 by himanshudixit2002 (the scaffold), 1 by Dependabot. Two commits carry an AI assistant's co-author trailer.",
  },
  {
    claim: "Problem: regulators publish dozens of notifications, circulars and advisories a year",
    source: "evals/golden/extraction/cbic_notifications index: 50 CBIC Central Tax notifications from 04/2024 to 02/2026",
    verified: "That is notifications from one regulator alone; circulars, advisories and the state's notifications come on top. Late fees and interest are the general GST position (sections 47 and 50), not a figure.",
  },
  {
    claim: "Seed calendar of 13 rules; 4 of 13 apply to the demo business, 8 don't, 1 unsure; 7 obligations; the reminder in Hindi",
    source: "services/rulebook/seed/gst_calendar.yaml; tools/demo; `cw-demo --daytime` run 2026-09-30",
    verified: "Run output: 4 apply (gstr3b_monthly, gstr1_monthly, gstr9_annual, eway_bill), 8 not, itc04_annual unsure; 7 obligations. The seed is draft (needs_review). tests/unit/compliance.test.ts reproduces the split and the seven dates with the ported engine.",
  },
  {
    claim: "5,571 tests passing (4,523 Python, 1,048 TypeScript); 99.21% coverage of domain and application",
    source: "uv run pytest -m \"not integration\" --cov --cov-fail-under=80; pnpm turbo run test",
    verified: "Run 2026-09-30 on an export of 55f7ef3 (uv 0.8.17, Python 3.12.3; pnpm 11.15, Node 22.22): 4,523 passed, 1 xfailed (a documented open finding in header auth mode), 214 integration tests deselected; 1,048 Vitest passed. Integration and the 69 Playwright tests need Docker and a newer browser build, so they weren't run here.",
  },
  {
    claim: "10 services, 18 event topics, 19 ADRs, 22 eval gates, 10 import-linter contracts, 167 schemathesis cases, 70 cross-tenant cases, 12 alert rules, 20 flags, 5 sources, 17 attributes",
    source: "services/, packages/contracts/events/schemas, docs/adr, evals/harness thresholds.py, import-linter config, tests, infra/dev/prometheus/alerts.yml, packages/flags/registry.json, pipeline adapters registry, ontology attributes.yaml",
    verified: "Counted 2026-09-30. ADRs: 16 written, 3 stubs (009–011); 8 Accepted, 11 Proposed. Two of the ten services (applicability-engine, eval) are scaffolds.",
  },
  {
    claim: "56 question-answering cases (20 single-hop, 16 multi-hop, 10 date and threshold, 10 must-refuse); the quote check (0.85, evidence tokens, one retry, then not covered)",
    source: "evals/golden/qa/kag; packages/domain-kernel/src/domain_kernel/citations.py; services/qa/src/qa/domain/answer.py, application/answerer.py",
    verified: "The cases are drafts, labelled with an AI assistant and not yet reviewed by an analyst. The TypeScript port matches quote_match_ratio and evidence_tokens_missing to six decimals on 13 strings (tests/unit/compliance.test.ts).",
  },
  {
    claim: "Notification 01/2026-Central Tax: clause text, and the GSTR-3B extension from 20 to 21 April 2026",
    source: "apps/web/scripts/seed/fixtures/rulebook/gst-ct-01-2026.document.json; evals/golden/relations/cbic_notifications/cases/01-2026-central-tax.yaml",
    verified: "Clause text verbatim, extraction spacing kept. The 20th is the seed's gstr3b_monthly due day (rule 61(1)).",
  },
  {
    claim: "Reminders: templates and Hindi copy, quiet hours 21:00–08:00 IST, the 24-hour window, 5-minute batching, retries after 1 and 5 minutes, one fallback, the 09:00 digest; the bot's keywords and replies",
    source: "services/notification/src/notification/domain/{templates,policy,preferences,channels}.py and application/{enqueue,dispatch,send}.py; apps/whatsapp-bot/src/{consent,replies}.ts",
    verified: "Copied verbatim. The Hindi is the project's draft, awaiting an analyst's review; the templates are drafts with Meta.",
  },
  {
    claim: "Gateway: routes and fallbacks, budgets (₹1,500 a tenant, ₹20,000 a feature, alarm at 80%), breaker after 3 failures for 60 s, PII masking order",
    source: "services/llm-gateway/src/llm_gateway/domain/{routing,config,breaker,scrub}.py, settings.py",
    verified: "The masking port matches the Python scrub() on 12 strings (tests/unit/compliance.test.ts).",
  },
  {
    claim: "Accent #8ab4ff; the product's screens as drawn",
    source: "packages/ui/src/styles/tokens.css; apps/web/src/shared/i18n/messages/en.json and the features/*/ui views",
    verified: "No logo exists; the product's primary is #1d4ed8 in light and #8ab4ff in dark. The drawings use its tokens and its own copy with sample data for the demo tenant.",
  },

  // ── SmartShelfKart ──────────────────────────────────────────────────────
  {
    claim: "SmartShelfKart architecture, request order, 980-line rules, CI eval gate",
    source: "~/Desktop/stock_management README.md, BACKEND_ARCHITECTURE.md, rag_backend/main.py, graph.py, .github/workflows/ci.yml",
    verified: "Read 2026-09-25. Code order: fact snapshot → answer cache → router → deterministic bank → agent. wc -l firestore.rules → 980.",
  },
  {
    claim: "51 modules, 800+ tests (816), 76% deterministic, 45 collections, 117 permission keys",
    source: `README.md badges and tables; ${R_FULL}; ${R_FE}`,
    verified: "Stated in the README and both current résumés; reproducible with run_evals.py and the documented test commands. Not re-run here.",
  },
  {
    claim: "Role: architecture and nearly all of the implementation",
    source: "git shortlog of stock_management",
    verified: "173 of 191 commits by Himanshu's identities, 15 by Dependabot, 3 by another contributor.",
  },

  // ── Elepeia ─────────────────────────────────────────────────────────────
  {
    claim: "27 storefront routes, 18 admin screens, 29 API routes, 265-line rules, 51 indexes",
    source: "~/Desktop/elepeia-ecommerce (src/app, firestore.rules, firestore.indexes.json)",
    verified: "2026-09-25: 45 page.tsx files (18 under the admin group), 29 route.ts handlers, wc -l firestore.rules → 265, 51 composite indexes.",
  },
  {
    claim: "Edge middleware with cached maintenance flag; ISR 60 s / 300 s; idempotent order commit; 68× image bytes; filter bug",
    source: "elepeia-ecommerce README (purchase pipeline, performance), middleware.ts, src/app/page.tsx, products/[id]/page.tsx, commit 0c7b075",
    verified: "Middleware caches the flag for 30 s; revalidate 60 and 300 found; idempotency in the Razorpay routes; 68× (≈5 MB vs ≈73 KB) stated in README and frontend résumé.",
  },
  {
    claim: "Elepeia role and period",
    source: "git shortlog; first commit 2025-06-09",
    verified: "252 of 253 commits by Himanshu (1 Vercel bot). Freelance client project; live at www.elepeia.com (HTTP 200). Repository has no public remote.",
  },

  // ── Cue & Coffee ────────────────────────────────────────────────────────
  {
    claim: "Cue & Coffee features, two Firebase projects, open P0 items, 133 test files",
    source: "~/Desktop/cueandcoffee README.md, CLIENT_SUMMARY.md, lib/constants/app_constants.dart, test/",
    verified: "Features from CLIENT_SUMMARY; up to 6 loser-pays players in app_constants; 133 *_test.dart files; README names the open P0 items.",
  },
  {
    claim: "Cue & Coffee role: lead developer",
    source: "git shortlog",
    verified: "76 of 102 commits by Himanshu's identities, 18 by the club's account, 6 by another developer. Repository is private (github 404) — no source link.",
  },
  {
    claim: "Platforms: Android app and web build",
    source: "~/Desktop/cueandcoffee README.md",
    verified: "Offline capability was not verified in the repository, so the site doesn't claim it.",
  },

  // ── Systems projects ────────────────────────────────────────────────────
  {
    claim: "KVStore: SET/GET/DEL (+PX), std::hash % 16 shards, per-shard LRU, lazy expiry, batched WAL without fsync or replay",
    source: "~/Desktop/kv_store/src (command_parser.cpp, sharded_lru_cache.h, wal.h, wal.cpp, server.cpp)",
    verified: "Read 2026-09-25. WAL uses std::mutex + std::queue + condition_variable and file_.flush(); no replay on start-up.",
  },
  {
    claim: "Self-healing cache: RF 3, quorum 2/2, 150 vnodes, heal 10 s, anti-entropy 30 s, CI",
    source: "~/Desktop/self-healing-distributed-cache README.md, internal/config, .github/workflows/ci.yml",
    verified: "Defaults read from config and README; CI runs go test, go vet and build.",
  },
  {
    claim: "Fraud Ring Engine pipeline; model untrained",
    source: "~/Desktop/fraud-ring-engine README.md, docker-compose.yml, ml-engine/model.py, ml-engine/main.py",
    verified: "10 compose services. GATConv model defined; main.py builds 'dummy edge indices and features' and loads no weights.",
  },
  {
    claim: "Anomaly Gateway: Isolation Forest scoring, logs only",
    source: "~/Desktop/ai-api-gateway README.md, docker-compose.yml",
    verified: "5 compose services. Blocking is an unchecked roadmap item.",
  },
  {
    claim: "URL shortener: Base62 of AUTOINCREMENT, SSRF rules, 51 tests",
    source: "~/Desktop/url-shortener README.md",
    verified: "Read 2026-09-25; 10 commits, all Himanshu's.",
  },

  // ── Other projects ──────────────────────────────────────────────────────
  {
    claim: "ScopeForge: 52 checks (24/13/15), limits, screenshots of synthetic data",
    source: "github.com/himanshudixit2002/ScopeForge README.md, docs/ARCHITECTURE.md, docs/images",
    verified: "29 commits, all Himanshu's, 2025-10-04 → 2026-09-12. Screenshots show demo data tagged 'Synthetic'; copied to public/projects/scopeforge.",
  },
  {
    claim: "Vitals before/after numbers",
    source: "~/Desktop/Vitals README.md",
    verified: "Numbers from the app's own benchmark mode, as recorded in the README. Not a git repo.",
  },
  {
    claim: "RxForce SFA scope: 22 modules, 25 tables, 10 retries, 5 roles, scheduled functions",
    source: "~/Desktop/RxForceSFA (lib/, functions/src/index.ts, .github/workflows/deploy.yml)",
    verified: "Survey 2026-09-25. Only a placeholder test exists; hosting URL returns 'Site Not Found' — no live link, no test claims.",
  },
  {
    claim: "Skintellect: Flask, OpenCV, Roboflow YOLOv8, Keras EfficientNetV2, Gemini, SQLite",
    source: "github.com/himanshudixit2002/Skintellect app.py, README.md",
    verified: "Stack read from app.py and README. Live demo offline.",
  },
  {
    claim: "PadhnaThoPadega: 5 problems, Java/Python/C++",
    source: "~/Desktop/PadhnaThoPadega README.md",
    verified: "221 commits by Himanshu, 2026-07-12 → 2026-07-15.",
  },
];

export const openQuestions: OpenQuestion[] = [
  {
    topic: "ComplianceWatch screenshots",
    detail: "The screens are drawn from the web app's own copy and tokens. Once the owner screens run against the demo tenant, capture them and switch the media to 'screenshot'.",
    blocks: "Final visual polish",
  },
  {
    topic: "Real screenshots",
    detail: "SmartShelfKart, Elepeia, Cue & Coffee, KVStore and the rest are drawn. Capture from demo/test workspaces (Cue & Coffee has a test Firebase project) and switch media.kind to 'screenshot'. Client screenshots need the client's OK.",
    blocks: "Final visual polish",
  },
  {
    topic: "Held back",
    detail: "coldPitch (a commit under another identity, repo private), GPB Group site (needs client OK), Registeryourcafe (purpose unclear — needs a description).",
    blocks: "Nothing — add later",
  },
  {
    topic: "LinkedIn link",
    detail: "LinkedIn blocks automated checks (HTTP 999); open it by hand before launch.",
    blocks: "Launch checklist",
  },
];
