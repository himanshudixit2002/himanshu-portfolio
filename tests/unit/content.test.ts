import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { capabilities, certifications, cleartrip } from "@/content/experience";
import { navigation, profile, resume } from "@/content/profile";
import { projects } from "@/content/projects";
import { questionPath, systemLayers } from "@/content/surface-system";
import type { Project } from "@/content/types";
import { isValidHref, validateCapabilities, validateProjects, validateSystem } from "@/lib/validate-content";

const project = (overrides: Partial<Project>): Project => ({ ...projects[0], ...overrides });

describe("published content", () => {
  it("projects pass validation", () => {
    expect(validateProjects(projects)).toEqual([]);
  });

  it("every screenshot exists in public/", () => {
    for (const m of projects.flatMap((p) => p.media)) {
      if (m.src) expect(existsSync(join(process.cwd(), "public", m.src)), m.src).toBe(true);
    }
  });

  it("the system explorer is internally consistent", () => {
    expect(validateSystem(systemLayers, questionPath)).toEqual([]);
  });

  it("every capability is backed by real projects", () => {
    expect(validateCapabilities(capabilities, projects)).toEqual([]);
  });

  it("profile, navigation, experience and credential links are well formed", () => {
    const hrefs = [
      `mailto:${profile.email}`,
      profile.links.github.href,
      profile.links.linkedin.href,
      ...navigation.map((n) => n.href),
      resume.href,
      ...certifications.map((c) => c.href),
    ];
    for (const href of hrefs) expect(isValidHref(href), href).toBe(true);
  });

  it("every live route in the navigation exists", () => {
    const sources = readSources(join(process.cwd(), "src")).join("\n");
    for (const item of [...navigation, resume].filter((n) => n.status === "live")) {
      if (item.href.startsWith("/#")) {
        expect(sources, item.href).toContain(`id="${item.href.slice(2)}"`);
      } else {
        expect(existsSync(join(process.cwd(), "src/app", item.href, "page.tsx")), item.href).toBe(true);
      }
    }
  });

  it("the Cleartrip role ended in August 2026", () => {
    expect(cleartrip.period).toEqual({ start: "2025-08", end: "2026-08" });
  });
});

describe("content validation catches problems", () => {
  it("duplicate slugs", () => {
    expect(validateProjects([projects[0], projects[0]])).toContain('project "smartshelfkart": duplicate slug');
  });

  it("thin alt text and unlabelled illustrations", () => {
    const problems = validateProjects([
      project({ media: [{ id: "a", kind: "illustration", alt: "Dashboard" }] }),
      project({
        slug: "b",
        visual: "two-sum",
        media: [{ id: "b", kind: "illustration", alt: "The SmartShelfKart dashboard with sample data" }],
      }),
    ]);
    expect(problems.some((p) => p.includes("descriptive alt text"))).toBe(true);
    expect(problems.some((p) => p.includes("does not say so"))).toBe(true);
  });

  it("screenshots without dimensions", () => {
    const problems = validateProjects([
      project({ media: [{ id: "s", kind: "screenshot", alt: "A screenshot of the dashboard with demo data" }] }),
    ]);
    expect(problems.some((p) => p.includes("needs src, width and height"))).toBe(true);
  });

  it("malformed links, periods and accents", () => {
    const problems = validateProjects([
      project({
        links: [{ kind: "live", label: "x", href: "https://" as never }],
        period: { start: "2026-09", end: "2026-02" },
        accent: "teal",
      }),
    ]);
    expect(problems.some((p) => p.includes("malformed link"))).toBe(true);
    expect(problems.some((p) => p.includes("ends before it starts"))).toBe(true);
    expect(problems.some((p) => p.includes("accent"))).toBe(true);
  });

  it("capabilities pointing at unknown projects", () => {
    const problems = validateCapabilities([{ ...capabilities[0], projects: ["nope"] }], projects);
    expect(problems).toContain('capability "interfaces": unknown project "nope"');
  });

  it("steps pointing at unknown layers", () => {
    const problems = validateSystem(systemLayers, [{ ...questionPath[0], layer: "nope" as never }]);
    expect(problems).toContain('system: step "ask" points at unknown layer "nope"');
  });
});

describe("editorial boundary", () => {
  it("nothing outside src/content/editorial imports the editorial record", () => {
    const offenders = readSources(join(process.cwd(), "src"))
      .filter((file) => !file.startsWith("// " + join(process.cwd(), "src/content/editorial")))
      .filter((file) => /from\s+["'][^"']*editorial/.test(file));
    expect(offenders).toEqual([]);
  });
});

/** Every .ts/.tsx file under dir, each prefixed with a `// path` line. */
function readSources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return readSources(path);
    return /\.(ts|tsx)$/.test(name) ? [`// ${path}\n${readFileSync(path, "utf8")}`] : [];
  });
}
