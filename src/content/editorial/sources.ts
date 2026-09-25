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
