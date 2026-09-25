import type { Capability, Project, QuestionStep, SystemLayer } from "@/content/types";

const HREF = /^(https:\/\/[^\s]+|mailto:[^\s@]+@[^\s@]+\.[^\s@]+|\/[^\s]*|#[\w-]+)$/;
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const HEX = /^#[0-9a-f]{6}$/i;

/** Returns a list of problems; an empty list means the content is publishable. */
export function validateProjects(projects: readonly Project[]): string[] {
  const problems: string[] = [];
  const slugs = new Set<string>();
  const visuals = new Set<string>();

  for (const p of projects) {
    const at = `project "${p.slug}"`;
    if (!/^[a-z0-9-]+$/.test(p.slug)) problems.push(`${at}: slug must be lowercase kebab-case`);
    if (slugs.has(p.slug)) problems.push(`${at}: duplicate slug`);
    slugs.add(p.slug);
    if (visuals.has(p.visual)) problems.push(`${at}: visual "${p.visual}" is already used by another project`);
    visuals.add(p.visual);

    for (const field of ["title", "tagline", "summary", "role", "problem", "contribution", "status", "platform"] as const) {
      if (!p[field].trim()) problems.push(`${at}: ${field} is empty`);
    }
    if (p.stack.length === 0) problems.push(`${at}: stack is empty`);
    if (p.categories.length === 0) problems.push(`${at}: needs at least one category`);
    if (p.highlights.length < 2) problems.push(`${at}: needs at least two highlights`);
    if (!HEX.test(p.accent)) problems.push(`${at}: accent must be a #rrggbb colour`);

    if (!YEAR_MONTH.test(p.period.start)) problems.push(`${at}: period.start must be YYYY-MM`);
    if (p.period.end !== undefined) {
      if (!YEAR_MONTH.test(p.period.end)) problems.push(`${at}: period.end must be YYYY-MM`);
      else if (p.period.end < p.period.start) problems.push(`${at}: period ends before it starts`);
    }

    for (const m of p.metrics) {
      if (!m.value.trim() || !m.label.trim()) problems.push(`${at}: metric with an empty value or label`);
    }

    const mediaIds = new Set<string>();
    for (const m of p.media) {
      if (mediaIds.has(m.id)) problems.push(`${at}: duplicate media id "${m.id}"`);
      mediaIds.add(m.id);
      if (m.alt.trim().length < 20) problems.push(`${at}: media "${m.id}" needs descriptive alt text`);
      if (m.kind === "illustration" && !/illustration/i.test(m.alt)) {
        problems.push(`${at}: media "${m.id}" is an illustration but its alt text does not say so`);
      }
      if (m.kind === "screenshot" && (!m.src || !m.width || !m.height)) {
        problems.push(`${at}: screenshot "${m.id}" needs src, width and height`);
      }
    }

    for (const l of p.links) {
      if (!HREF.test(l.href)) problems.push(`${at}: malformed link "${l.href}"`);
    }
  }

  return problems;
}

export function validateSystem(layers: readonly SystemLayer[], steps: readonly QuestionStep[]): string[] {
  const problems: string[] = [];
  const ids = new Set(layers.map((l) => l.id));
  if (ids.size !== layers.length) problems.push("system: duplicate layer id");

  const stepIds = new Set<string>();
  for (const s of steps) {
    if (stepIds.has(s.id)) problems.push(`system: duplicate step id "${s.id}"`);
    stepIds.add(s.id);
    if (!ids.has(s.layer)) problems.push(`system: step "${s.id}" points at unknown layer "${s.layer}"`);
  }
  return problems;
}

/** Every capability must point at real projects — no skill without evidence. */
export function validateCapabilities(capabilities: readonly Capability[], projects: readonly Project[]): string[] {
  const slugs = new Set(projects.map((p) => p.slug));
  const problems: string[] = [];
  for (const c of capabilities) {
    if (c.projects.length === 0 && !c.experience) problems.push(`capability "${c.id}": no evidence`);
    for (const slug of c.projects) {
      if (!slugs.has(slug)) problems.push(`capability "${c.id}": unknown project "${slug}"`);
    }
  }
  return problems;
}

export function isValidHref(href: string): boolean {
  return HREF.test(href);
}
