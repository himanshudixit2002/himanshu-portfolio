/*
 * The URL shortener's SSRF rules, as its README documents them, run in the
 * browser against a simulated DNS table (no real lookups happen here):
 *
 *   1. only http and https
 *   2. no embedded credentials
 *   3. localhost and *.localhost rejected by name
 *   4. literal IPs checked against blocked ranges — after the WHATWG URL
 *      parser has normalised decimal/hex/octal forms like http://2130706433/
 *   5. otherwise every DNS record is checked; one private answer rejects all
 */

export type Check = { label: string; pass: boolean; detail: string };
export type Verdict = { accepted: boolean; checks: Check[]; host?: string };

/** Simulated resolver. Hostnames and addresses are sample values. */
export const SAMPLE_DNS: Record<string, string[]> = {
  "example.com": ["93.184.215.14"],
  "shop.example.com": ["93.184.215.14", "93.184.215.15"],
  "internal.example.com": ["10.0.0.12"],
  "mixed.example.com": ["93.184.215.14", "192.168.1.20"],
};

export const SAMPLE_URLS = [
  "https://example.com/summer-sale",
  "http://localhost:3000/admin",
  "http://2130706433/",
  "http://169.254.169.254/latest/meta-data",
  "https://user:secret@example.com",
  "ftp://example.com/file",
  "https://mixed.example.com/",
  "https://internal.example.com/",
] as const;

const BLOCKED_V4: [string, number, string][] = [
  ["0.0.0.0", 8, "unspecified"],
  ["10.0.0.0", 8, "private (RFC 1918)"],
  ["100.64.0.0", 10, "carrier-grade NAT"],
  ["127.0.0.0", 8, "loopback"],
  ["169.254.0.0", 16, "link-local / cloud metadata"],
  ["172.16.0.0", 12, "private (RFC 1918)"],
  ["192.0.0.0", 24, "IETF protocol assignments"],
  ["192.0.2.0", 24, "documentation"],
  ["192.168.0.0", 16, "private (RFC 1918)"],
  ["198.18.0.0", 15, "benchmarking"],
  ["198.51.100.0", 24, "documentation"],
  ["203.0.113.0", 24, "documentation"],
  ["224.0.0.0", 4, "multicast"],
  ["240.0.0.0", 4, "reserved"],
];

function v4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p) || Number(p) > 255) return null;
    n = n * 256 + Number(p);
  }
  return n;
}

/** Returns the reason an IPv4 address is blocked, or null if it's public. */
export function blockedV4(ip: string): string | null {
  const n = v4ToInt(ip);
  if (n === null) return null;
  for (const [base, bits, reason] of BLOCKED_V4) {
    const size = 2 ** (32 - bits);
    const start = v4ToInt(base)!;
    if (n >= start && n < start + size) return `${reason} (${base}/${bits})`;
  }
  return null;
}

/** Coarse IPv6 checks for the ranges the README lists. */
export function blockedV6(ip: string): string | null {
  const a = ip.replace(/^\[|\]$/g, "").toLowerCase();
  if (a === "::1") return "loopback";
  if (a === "::") return "unspecified";
  if (/^f[cd]/.test(a)) return "unique local (fc00::/7)";
  if (/^fe[89ab]/.test(a)) return "link-local (fe80::/10)";
  if (a.startsWith("::ffff:")) return "IPv4-mapped";
  if (a.startsWith("64:ff9b:")) return "NAT64";
  if (a.startsWith("2001:db8:")) return "documentation";
  return null;
}

export function validate(input: string, dns: Record<string, string[]> = SAMPLE_DNS): Verdict {
  const checks: Check[] = [];
  const done = (accepted: boolean, host?: string): Verdict => ({ accepted, checks, host });

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    checks.push({ label: "Parse", pass: false, detail: "Not a valid absolute URL" });
    return done(false);
  }
  checks.push({ label: "Parse", pass: true, detail: `Host normalises to ${url.hostname}` });

  const schemeOk = url.protocol === "http:" || url.protocol === "https:";
  checks.push({ label: "Scheme", pass: schemeOk, detail: schemeOk ? url.protocol.slice(0, -1) : `${url.protocol} is not allowed` });
  if (!schemeOk) return done(false, url.hostname);

  const noCreds = !url.username && !url.password;
  checks.push({ label: "Credentials", pass: noCreds, detail: noCreds ? "None embedded" : "user:pass@ in the URL" });
  if (!noCreds) return done(false, url.hostname);

  const host = url.hostname;
  const isLocalName = host === "localhost" || host.endsWith(".localhost");
  checks.push({ label: "Hostname", pass: !isLocalName, detail: isLocalName ? "localhost is rejected by name" : host });
  if (isLocalName) return done(false, host);

  const literal = host.startsWith("[") || v4ToInt(host) !== null;
  if (literal) {
    const reason = host.startsWith("[") ? blockedV6(host) : blockedV4(host);
    checks.push({ label: "Literal IP", pass: !reason, detail: reason ? `${host} is ${reason}` : `${host} is public` });
    return done(!reason, host);
  }

  const records = dns[host];
  if (!records) {
    checks.push({ label: "DNS", pass: false, detail: "No records in the simulated resolver" });
    return done(false, host);
  }
  const bad = records.map((r) => [r, blockedV4(r)] as const).filter(([, reason]) => reason);
  checks.push({
    label: "DNS",
    pass: bad.length === 0,
    detail: bad.length
      ? `${bad[0][0]} is ${bad[0][1]}${records.length > bad.length ? " — one private answer rejects them all" : ""}`
      : `${records.length} record${records.length > 1 ? "s" : ""}, all public`,
  });
  return done(bad.length === 0, host);
}
