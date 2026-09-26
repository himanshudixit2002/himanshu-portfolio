import { urlShortener } from "@/content/projects/selected";
import { ALPHABET, decode, encode } from "@/lib/sim/base62";
import { blockedV4, SAMPLE_DNS, SAMPLE_URLS, validate, type Verdict } from "@/lib/sim/ssrf";
import type { SceneMeta } from "./types";

const [collisionFree, dnsChecked, aliases] = urlShortener.highlights;
const [, redirect] = urlShortener.decisions;

/** The row id the README uses: its Base62 form is "abc". */
export const URL_ID = 39134;
/** A custom alias that is also the code the generator would emit next. */
export const URL_ALIAS = encode(URL_ID + 1);
export const URL_DESTINATION = SAMPLE_URLS[0];
const DECIMAL_TRICK = "http://2130706433/";
const MIXED_DNS = "https://mixed.example.com/";

/** "39134 → abc": how a code is made, and what a destination must survive. */
export const urlScene: SceneMeta = {
  kind: "Simulation",
  note: "The service's Base62 order and SSRF rules, run in your browser against a simulated resolver with sample hostnames — no real lookups happen here.",
  steps: [
    { title: collisionFree.title, body: collisionFree.body },
    { title: redirect.title, body: redirect.body },
    { title: aliases.title, body: `${aliases.body} Here the alias “${URL_ALIAS}” is id ${decode(URL_ALIAS)}, so the next link gets ${URL_ID + 2}: “${encode(URL_ID + 2)}”.` },
    { title: dnsChecked.title, body: `${dnsChecked.body} The decimal host ${DECIMAL_TRICK.slice(7, -1)} is 127.0.0.1 once parsed.` },
    { title: "One private answer rejects them all", body: "A host that resolves to a public and a private address is refused: checking only the first answer would let the second one through." },
  ],
  keyFrames: [0, 2, 3, 4],
};

export type Division = { n: number; quotient: number; remainder: number; char: string };

/** Long division by 62, most significant digit last (the order it's computed). */
export function divisions(id: number): Division[] {
  const out: Division[] = [];
  for (let n = id; n > 0; n = Math.floor(n / 62)) out.push({ n, quotient: Math.floor(n / 62), remainder: n % 62, char: ALPHABET[n % 62] });
  return out;
}

/** The division and code the scene shows at every step. */
export const URL_ROWS = divisions(URL_ID);
export const URL_CODE = encode(URL_ID);

/** One DNS answer and, if it's blocked, which range it falls in (without the CIDR). */
export type Answer = { ip: string; blocked: string | null };
export type UrlCheck = { url: string; verdict: Verdict; answers: Answer[] | null };
export type UrlSequence = { code: string; id: number; nextId: number; nextCode: string };

function check(url: string): UrlCheck {
  const verdict = validate(url);
  const records = verdict.host ? SAMPLE_DNS[verdict.host] : undefined;
  return { url, verdict, answers: records ? records.map((ip) => ({ ip, blocked: blockedV4(ip)?.replace(/ \([^()]*\/\d+\)$/, "") ?? null })) : null };
}

/** The two destinations the scene checks, at steps 3 and 4. Computed once: every frame points at these. */
export const URL_CHECKS: readonly UrlCheck[] = [check(DECIMAL_TRICK), check(MIXED_DNS)];
/** The alias and the code the sequence moves on to, at step 2. */
export const URL_SEQUENCE: UrlSequence = { code: URL_ALIAS, id: decode(URL_ALIAS), nextId: URL_ID + 2, nextCode: encode(URL_ID + 2) };

export type UrlFrame = {
  step: number;
  rows: Division[];
  code: string;
  redirect: boolean;
  alias: UrlSequence | null;
  check: UrlCheck | null;
};

export function urlFrame(step: number): UrlFrame {
  const i = Math.max(0, Math.min(4, step));
  return {
    step: i,
    rows: URL_ROWS,
    code: URL_CODE,
    redirect: i === 1,
    alias: i === 2 ? URL_SEQUENCE : null,
    check: i >= 3 ? URL_CHECKS[i - 3] : null,
  };
}
