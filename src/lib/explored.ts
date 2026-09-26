/*
 * What this visitor has looked at, kept in their own browser: the case
 * studies they've opened, whether they've seen the all-explored thank-you,
 * which "try me" hints they've acted on, and which of the site's small
 * secrets (lib/discoveries) they've found. Nothing leaves the device and
 * nothing is rendered from it on the server; every reader subscribes after
 * mount. Storage can be unavailable (private mode, blocked site data), so
 * reads and writes fall back to memory for the rest of the page's life.
 */

const EXPLORED = "hd-explored";
const CELEBRATED = "hd-explored-done";
const HINTS = "hd-hints";
const FOUND = "hd-found";
const EVENT = "hd-explored-change";
/** Fired with the discovery's id as `detail` the first time it's found. */
export const DISCOVERY_EVENT = "hd-discovery";

const memory = new Map<string, string>();

function read(key: string) {
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? "";
  } catch {
    return memory.get(key) ?? "";
  }
}

function write(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Kept in memory instead.
  }
  window.dispatchEvent(new Event(EVENT));
}

const list = (raw: string) => (raw ? raw.split(",").filter(Boolean) : []);

/** For useSyncExternalStore: changes here, and in other tabs. */
export function subscribeExplored(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The raw stored list, a string so it compares equal while unchanged. */
export const exploredSnapshot = () => read(EXPLORED);
export const hintsSnapshot = () => read(HINTS);
export const foundSnapshot = () => read(FOUND);
export const parseList = list;

/** Records a case study as seen. Returns the updated list. */
export function markExplored(slug: string) {
  const seen = list(read(EXPLORED));
  if (!seen.includes(slug)) write(EXPLORED, [...seen, slug].join(","));
  return seen.includes(slug) ? seen : [...seen, slug];
}

export const hasCelebrated = () => read(CELEBRATED) === "1";
export const markCelebrated = () => write(CELEBRATED, "1");

export function dismissHint(id: string) {
  const done = list(read(HINTS));
  if (!done.includes(id)) write(HINTS, [...done, id].join(","));
}

/** Records a discovery; the first time, announces it (see DISCOVERY_EVENT). */
export function discover(id: string) {
  const found = list(read(FOUND));
  if (found.includes(id)) return false;
  write(FOUND, [...found, id].join(","));
  window.dispatchEvent(new CustomEvent(DISCOVERY_EVENT, { detail: id }));
  return true;
}
