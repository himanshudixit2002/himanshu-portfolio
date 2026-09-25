import type { QuestionStep, SystemLayer } from "./types";

/**
 * SmartShelfKart's runtime layers, as described in the project's README and
 * BACKEND_ARCHITECTURE.md and confirmed against rag_backend/main.py and
 * graph.py (see ./editorial/sources.ts). Ordered top to bottom as the diagram
 * stacks them: the surface first, the system of record as the foundation.
 */
export const systemLayers: SystemLayer[] = [
  {
    id: "client",
    name: "Client",
    tech: "Flutter · web, Android, iOS",
    summary: "Everything a person touches — and trusted with nothing.",
    body: "One Flutter codebase ships to the web and both app stores. It reads and writes Firestore directly, so every write it makes is checked again by the security rules.",
  },
  {
    id: "assistant",
    name: "Assistant",
    tech: "Python · FastAPI · LangGraph",
    summary: "Answers questions and makes stock changes on request.",
    body: "It writes through the Firebase Admin SDK, which bypasses the rules — so it re-implements the same membership and permission checks, and both fail closed. Every chat-driven write passes one choke point: preview, then confirm.",
  },
  {
    id: "reporting",
    name: "Reporting",
    tech: "Java 17 · Spring Boot · PostgreSQL",
    summary: "Tax, aging and profit-and-loss over a relational read model.",
    body: "Firestore data is projected into PostgreSQL by a full rebuild in one transaction, so deleted records can never linger in a report. Money is stored as integer minor units, never floating point.",
  },
  {
    id: "rules",
    name: "Rules & data",
    tech: "Cloud Firestore · 980 lines of rules",
    summary: "The system of record, and the main authorization boundary.",
    body: "Every collection lives under a company, so tenancy is part of the data's shape rather than a filter someone has to remember. The security rules decide what each member may read or change.",
  },
];

/** "Follow a question": what happens when someone asks what's running low. */
export const questionPath: QuestionStep[] = [
  {
    id: "ask",
    label: "Ask",
    layer: "client",
    body: "Someone asks the Nova assistant “What's running low?”. The app sends the question over HTTPS with their Firebase ID token.",
  },
  {
    id: "verify",
    label: "Verify",
    layer: "assistant",
    body: "The assistant confirms the caller is a member of this company and resolves their permissions the same way the security rules do.",
  },
  {
    id: "facts",
    label: "Read facts",
    layer: "rules",
    body: "It loads a snapshot of this company's products, the last 90 days of stock movements and its vendors — and fingerprints the result.",
  },
  {
    id: "cache",
    label: "Check cache",
    layer: "assistant",
    body: "The answer cache is keyed on that fingerprint. Any stock change produces a new key, so a stale answer can't be served.",
  },
  {
    id: "route",
    label: "Route",
    layer: "assistant",
    body: "Pattern rules classify the question at no token cost. Only genuinely ambiguous phrasing is sent to a small, inexpensive model.",
  },
  {
    id: "answer",
    label: "Answer",
    layer: "assistant",
    body: "Low stock is a database question, so a deterministic answer bank computes it straight from the snapshot. No language model is involved.",
  },
  {
    id: "return",
    label: "Return",
    layer: "client",
    body: "The answer comes back to the app. A request to change stock would pause here for a preview and an explicit confirm.",
  },
];
