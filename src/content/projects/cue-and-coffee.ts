import type { Project } from "../types";

export const cueAndCoffee: Project = {
  slug: "cue-and-coffee",
  title: "Cue & Coffee",
  tagline: "Built around the rhythm of a busy club.",
  summary:
    "Point of sale and back office for a snooker club and café: table sessions, café orders, customer wallets, memberships, tournaments and the day's books.",
  categories: ["Product"],
  tier: "flagship",
  period: { start: "2025-05" },
  status: "In use at the club",
  platform: "Android and web · Flutter",
  role: "Lead developer (freelance)",
  problem:
    "A snooker club that is also a café runs on timers, tabs and trust. Tables start and stop all evening, orders land on running sessions, regulars pay from prepaid credit — and at close, the books have to balance.",
  contribution:
    "Built the Flutter app and its Firebase backend: table sessions and billing, café and kitchen orders, wallets and receivables, memberships, the loser-pays competition mode, stock and the daily close.",
  stack: ["Flutter", "Riverpod", "Firebase Auth", "Cloud Firestore", "Firebase Storage"],
  highlights: [
    {
      title: "Every table, at a glance",
      body: "Snooker, pool, carrom, darts and PS5 stations with live timers and time-based billing, so staff can see what's free and what's owed.",
    },
    {
      title: "Orders follow the session",
      body: "Café orders go to the kitchen — pending, preparing, ready — and land on the running table's bill automatically.",
    },
    {
      title: "Regulars pay from credit",
      body: "Prepaid wallets, Bronze, Silver and Gold memberships with automatic discounts, and a competition mode where the loser pays the whole table.",
    },
  ],
  metrics: [
    { value: "5", label: "kinds of table, from snooker to PS5" },
    { value: "133", label: "Dart test files mirroring the app, plus rules tests" },
    { value: "6", label: "players at most in a loser-pays match" },
  ],
  decisions: [
    {
      title: "Two Firebase projects",
      body: "Production and test have separate sign-in pools and databases; a build flag picks one. The default deploy target is the test project, so a stray deploy can't touch the live café.",
    },
    {
      title: "The money lives in services",
      body: "Sessions, orders, credit, ledger and refunds each have one service, and money arithmetic lives in a single utility — screens never compute a bill themselves.",
    },
    {
      title: "Correctness tracked in the open",
      body: "A dated status document is the authority on release readiness: what has been verified, and which high-priority items remain.",
    },
  ],
  evidence: [
    "Unit and widget tests mirror the app, using a fake Firestore for service tests.",
    "Authorization rules are tested against the Firestore emulator.",
    "flutter analyze is expected to report zero errors and zero warnings.",
  ],
  limitations: [
    "Open high-priority items: repairing legacy financial records, restart-safe payment attempts, leaderboard period reset, and concurrency testing against the emulator.",
    "The screens shown are illustrations with sample data; the club's real data is never used here.",
  ],
  media: [
    {
      id: "cafe-floor",
      kind: "illustration",
      alt: "Illustration of the Cue & Coffee table screen with sample data: snooker, pool and PS5 tables showing free, running and billing states.",
    },
  ],
  links: [{ kind: "live", label: "Visit cueandcoffee.com", href: "https://cueandcoffee.com" }],
  visual: "cafe-night",
  accent: "#34d399",
};
