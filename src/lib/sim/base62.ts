/**
 * Base62 as the URL shortener uses it: digits, then lowercase, then uppercase.
 * (Its README notes the alias "abc" equals encode(39134), which fixes this order.)
 */
export const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function encode(id: number): string {
  if (!Number.isSafeInteger(id) || id < 0) throw new RangeError("id must be a non-negative safe integer");
  if (id === 0) return "0";
  let out = "";
  for (let n = id; n > 0; n = Math.floor(n / 62)) out = ALPHABET[n % 62] + out;
  return out;
}

export function decode(code: string): number {
  if (!/^[0-9a-zA-Z]+$/.test(code)) throw new RangeError("codes use only 0-9, a-z and A-Z");
  let n = 0;
  for (const ch of code) {
    n = n * 62 + ALPHABET.indexOf(ch);
    if (!Number.isSafeInteger(n)) throw new RangeError("code too long");
  }
  return n;
}

/** Positional breakdown for display: each digit, its value and its place. */
export function breakdown(id: number): { char: string; digit: number; place: number }[] {
  const code = encode(id);
  return [...code].map((char, i) => ({ char, digit: ALPHABET.indexOf(char), place: 62 ** (code.length - 1 - i) }));
}
