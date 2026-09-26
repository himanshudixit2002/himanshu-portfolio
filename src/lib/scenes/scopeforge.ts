import { scopeForge } from "@/content/projects/selected";
import { SCOPE_GUARDS } from "@/content/scopeforge-guards";
import type { SceneMeta } from "./types";

const [everyRequest, oneRequest] = scopeForge.highlights;
const [explicit] = scopeForge.decisions;
/** URLs at most per batch, from the project's metrics. */
export const SCOPE_BATCH = Number(scopeForge.metrics.find((m) => m.label.includes("per batch"))?.value ?? 0);

/** A sample program: one authorized origin, one excluded prefix, an end date. */
export const PROGRAM = { origin: "https://app.example.com", excluded: "/admin", until: "2026-09-30", untilLabel: "30 Sep" };
/** A stand-in resolver: the sample hosts and whether they resolve to a public address. */
const PUBLIC: Record<string, boolean> = { "app.example.com": true, "api.example.com": true };

export type Request = { url: string; on: string; onLabel: string };
export type Verdict = { passed: number; stop: number | null; reason: string | null };

/**
 * The guards in order, stopping at the first that fails — a model of the
 * README's rules over the sample program, not ScopeForge's code.
 */
export function checkScope(req: Request): Verdict {
  const url = new URL(req.url);
  const excluded = url.pathname === PROGRAM.excluded || url.pathname.startsWith(`${PROGRAM.excluded}/`);
  const checks: [boolean, string][] = [
    [url.origin === PROGRAM.origin, `${url.host} isn't an authorized origin`],
    [!excluded, `${url.pathname} is under excluded ${PROGRAM.excluded}`],
    [req.on <= PROGRAM.until, `Authorization ended ${PROGRAM.untilLabel}`],
    [PUBLIC[url.hostname] === true, `${url.hostname} doesn't resolve to a public address`],
    [url.protocol === "https:", "Not verified TLS"],
  ];
  const stop = checks.findIndex(([ok]) => !ok);
  return stop < 0 ? { passed: checks.length, stop: null, reason: null } : { passed: stop, stop, reason: checks[stop][1] };
}

/** The request each step follows; the last step is a batch instead. */
export const SCOPE_REQUESTS: Request[] = [
  { url: "https://app.example.com/login", on: "2026-09-12", onLabel: "12 Sep" },
  { url: "https://api.example.com/v1/users", on: "2026-09-12", onLabel: "12 Sep" },
  { url: "https://app.example.com/admin/users", on: "2026-09-12", onLabel: "12 Sep" },
  { url: "https://app.example.com/account", on: "2026-10-02", onLabel: "2 Oct" },
];

/** "Inside the fence": four requests meet the scope guards, then a batch goes out. */
export const scopeScene: SceneMeta = {
  kind: "Diagram",
  note: `The guards and limits are ScopeForge's, from its README; the program, URLs, dates and resolver are generic examples, and nothing here sends a request.`,
  steps: [
    { title: everyRequest.title, body: everyRequest.body },
    { title: "Only the origins you entered", body: explicit.body },
    { title: "Excluded paths stay excluded", body: `Even on an authorized origin, a path under an excluded prefix is refused before a request exists.` },
    { title: "Authorization runs out", body: "Once the program's authorization has expired or been revoked, nothing more is sent." },
    { title: oneRequest.title, body: oneRequest.body },
  ],
  keyFrames: [0, 2, 3, 4],
  mobile: "cards",
};

export type ScopeFrame = { step: number; request: Request | null; verdict: Verdict | null; batch: boolean };

export function scopeFrame(step: number): ScopeFrame {
  const i = Math.max(0, Math.min(4, step));
  const request = SCOPE_REQUESTS[i] ?? null;
  return { step: i, request, verdict: request ? checkScope(request) : null, batch: i === 4 };
}

export { SCOPE_GUARDS };
