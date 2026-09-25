import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { MAX_UNITS, vizFor } from "@/lib/metric-viz";

const metric = (slug: string, value: string) => projects.find((p) => p.slug === slug)!.metrics.find((m) => m.value === value)!;

describe("metric figures", () => {
  it("draw the published metrics as the right kind of figure", () => {
    expect(vizFor(metric("smartshelfkart", "76%"))).toEqual({ kind: "meter", pct: 76 });
    expect(vizFor(metric("smartshelfkart", "800+"))).toEqual({ kind: "none" });
    expect(vizFor(metric("self-healing-cache", "2 of 3"))).toEqual({ kind: "part", n: 2, of: 3 });
    expect(vizFor(metric("self-healing-cache", "150"))).toEqual({ kind: "none" });
    expect(vizFor(metric("elepeia", "68×"))).toEqual({ kind: "ratio", factor: 68 });
    expect(vizFor(metric("fraud-ring-engine", "2-hop"))).toEqual({ kind: "rings", n: 2 });
    expect(vizFor(metric("vitals", "0.135%"))).toEqual({ kind: "before-after", before: 0.227, after: 0.135, beforeText: "0.227", afterText: "0.135", unit: "%" });
    // Shown as published: "1.0/s", not "1/s".
    expect(vizFor(metric("vitals", "1.0/s"))).toEqual({ kind: "before-after", before: 2.2, after: 1, beforeText: "2.2", afterText: "1.0", unit: "/s" });
    expect(vizFor(metric("scopeforge", "52"))).toEqual({
      kind: "segments",
      parts: [
        { n: 24, label: "header" },
        { n: 13, label: "HTML" },
        { n: 15, label: "OpenAPI" },
      ],
    });
    expect(vizFor(metric("padhna-tho-padega", "5"))).toEqual({ kind: "grid", cols: 5, rows: 3 });
    expect(vizFor(metric("rxforce-sfa", "10"))).toEqual({ kind: "growing", n: 10 });
    expect(vizFor(metric("kvstore", "16"))).toEqual({ kind: "dots", n: 16 });
  });

  it("never invent a number: every figure is read from its metric", () => {
    for (const p of projects) {
      for (const m of p.metrics) {
        const viz = vizFor(m);
        const text = `${m.value} ${m.label}`;
        const numbers =
          viz.kind === "dots" || viz.kind === "rings" || viz.kind === "growing"
            ? [viz.n]
            : viz.kind === "grid"
              ? [viz.cols, viz.rows]
              : viz.kind === "meter"
                ? [viz.pct]
                : viz.kind === "part"
                  ? [viz.n, viz.of]
                  : viz.kind === "ratio"
                    ? [viz.factor]
                    : viz.kind === "segments"
                      ? viz.parts.map((s) => s.n)
                      : viz.kind === "before-after"
                        ? [viz.before, viz.after]
                        : [];
        for (const n of numbers) expect(text, `${p.slug}: ${text}`).toMatch(new RegExp(`(^|[^\\d.])${String(n).replace(".", "\\.")}(\\.0)?([^\\d]|$)`));
      }
    }
  });

  it("keeps unit charts small enough to count", () => {
    for (const p of projects) {
      for (const m of p.metrics) {
        const viz = vizFor(m);
        if (viz.kind === "dots") expect(viz.n).toBeLessThanOrEqual(MAX_UNITS);
        if (viz.kind === "grid") expect(viz.cols * viz.rows).toBeLessThanOrEqual(MAX_UNITS);
      }
    }
  });

  it("only splits a total into parts that add up to it", () => {
    expect(vizFor({ value: "50", label: "rules: 24 header, 13 HTML, 15 OpenAPI" })).toEqual({ kind: "dots", n: 50 });
  });
});
