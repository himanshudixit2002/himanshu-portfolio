/** Where `query` appears in `text` as a substring, ranked: earlier and at a word start is better. */
function substring(text: string, q: string) {
  const at = text.indexOf(q);
  if (at < 0) return 0;
  return 500 - Math.min(at, 400) + (at === 0 || text[at - 1] === " " ? 100 : 0);
}

/**
 * How well a query matches something with a name and some other words, 0
 * for not at all: the name first, then the other words, then the query's
 * letters in order within the name ("ssk" finds SmartShelfKart). Shared by
 * the command palette and the 404 page's suggestions.
 */
export function score(name: string, rest: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const label = name.toLowerCase();
  const inLabel = substring(label, q);
  if (inLabel) return 2000 + inLabel;
  const inRest = substring(rest.toLowerCase(), q);
  if (inRest) return 1000 + inRest;
  let i = 0;
  let gaps = 0;
  for (const ch of label) {
    if (ch === q[i]) i++;
    else if (i > 0) gaps++;
    if (i === q.length) return Math.max(1, 500 - gaps);
  }
  return 0;
}

/**
 * How many letters a match skipped: 0 for a substring, the gaps for letters
 * found in order. The palette takes loose matches; the 404's suggestions
 * only close ones, so "/nope" doesn't suggest n…o…p…e in PadhnaThoPadega.
 */
export const skipped = (rank: number) => (rank >= 1000 ? 0 : 500 - rank);
