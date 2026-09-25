import type { Metric } from "@/content/types";

/**
 * A small figure drawn beside a metric. Every number in it is read from the
 * metric's own value and label — nothing is added — and a metric with no
 * honest picture gets none.
 */
export type MetricViz =
  | { kind: "dots"; n: number }
  | { kind: "grid"; cols: number; rows: number }
  | { kind: "meter"; pct: number }
  | { kind: "part"; n: number; of: number }
  | { kind: "ratio"; factor: number }
  | { kind: "rings"; n: number }
  | { kind: "segments"; parts: { n: number; label: string }[] }
  | { kind: "growing"; n: number }
  /** `beforeText`/`afterText` are the figures exactly as published ("1.0", not 1). */
  | { kind: "before-after"; before: number; after: number; beforeText: string; afterText: string; unit: string }
  | { kind: "none" };

const int = (s: string) => (/^\d+$/.test(s) ? Number(s) : null);

/** The largest unit chart drawn; bigger counts stay as plain numbers. */
export const MAX_UNITS = 60;

export function vizFor({ value, label }: Metric): MetricViz {
  // "0.135%", "of one core at idle, down from 0.227%"
  const down = label.match(/down from ([\d.]+)/);
  const measured = value.match(/^([\d.]+)(.*)$/);
  if (down && measured) {
    return { kind: "before-after", before: Number(down[1]), after: Number(measured[1]), beforeText: down[1], afterText: measured[1], unit: measured[2] };
  }

  const pct = value.match(/^(\d+(?:\.\d+)?)%$/);
  if (pct) return { kind: "meter", pct: Number(pct[1]) };

  const part = value.match(/^(\d+) of (\d+)$/);
  if (part) return { kind: "part", n: Number(part[1]), of: Number(part[2]) };

  const ratio = value.match(/^(\d+(?:\.\d+)?)×$/);
  if (ratio) return { kind: "ratio", factor: Number(ratio[1]) };

  const hops = value.match(/^(\d+)-hop$/);
  if (hops) return { kind: "rings", n: Number(hops[1]) };

  const n = int(value);
  if (n === null) return { kind: "none" };

  // "check rules: 24 header, 13 HTML, 15 OpenAPI" — only if the parts add up.
  const list = label.match(/:\s*(\d+ [^,]+(?:,\s*\d+ [^,]+)+)$/);
  if (list) {
    const parts = list[1].split(/,\s*/).map((p) => {
      const [, count, name] = p.match(/^(\d+) (.+)$/)!;
      return { n: Number(count), label: name };
    });
    if (parts.reduce((sum, p) => sum + p.n, 0) === n) return { kind: "segments", parts };
  }

  // "problems, each in 3 languages"
  const each = label.match(/each in (\d+)/);
  if (each && n * Number(each[1]) <= MAX_UNITS) return { kind: "grid", cols: n, rows: Number(each[1]) };

  if (/growing delays/.test(label) && n <= 20) return { kind: "growing", n };

  if (n >= 2 && n <= MAX_UNITS) return { kind: "dots", n };
  return { kind: "none" };
}
