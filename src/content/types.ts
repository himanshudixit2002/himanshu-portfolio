export type Href = `https://${string}` | `mailto:${string}` | `/${string}` | `#${string}`;

export type LinkItem = {
  label: string;
  href: Href;
};

export type NavItem = LinkItem & {
  /** Planned routes stay in the model but are not rendered until they exist. */
  status: "live" | "planned";
};

export type Profile = {
  name: string;
  role: string;
  location: string;
  headline: [string, string];
  intro: string;
  bio: string[];
  email: string;
  links: {
    github: LinkItem;
    linkedin: LinkItem;
  };
};

export type ProjectCategory = "Product" | "Systems" | "AI & Data" | "Tools";

/** Flagship projects get a homepage chapter; selected ones live on /work. */
export type ProjectTier = "flagship" | "selected";

/**
 * `illustration` means an original drawing of the interface with sample data.
 * It must be labelled as such wherever it appears, and is replaced by a
 * `screenshot` once real captures from a sample tenant exist.
 */
export type MediaKind = "illustration" | "screenshot";

export type ProjectMedia = {
  id: string;
  kind: MediaKind;
  alt: string;
  /** Path under /public for screenshots. Illustrations are components. */
  src?: `/${string}`;
  width?: number;
  height?: number;
};

export type ProjectLink = LinkItem & {
  kind: "live" | "store" | "source" | "docs";
};

/** Signature visual for each project. Mapped to components in components/visuals. */
export type VisualId =
  | "ssk-system"
  | "elepeia-teardown"
  | "cafe-night"
  | "kv-explorer"
  | "cluster-lab"
  | "vitals-efficiency"
  | "scopeforge-guard"
  | "rx-sync"
  | "fraud-graph"
  | "gateway-anomaly"
  | "skintellect-pipeline"
  | "shortener-lab"
  | "two-sum";

/** A figure shown on the page. Every one needs a matching note in editorial/sources.ts. */
export type Metric = {
  value: string;
  label: string;
};

export type Decision = {
  title: string;
  body: string;
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  categories: ProjectCategory[];
  tier: ProjectTier;
  /** Year-month strings, e.g. "2025-06". `end` omitted means ongoing. */
  period: { start: string; end?: string };
  status: string;
  platform: string;
  role: string;
  problem: string;
  contribution: string;
  stack: string[];
  highlights: { title: string; body: string }[];
  metrics: Metric[];
  decisions: Decision[];
  /** How a reader can check the work: tests, docs, CI. */
  evidence: string[];
  limitations: string[];
  media: ProjectMedia[];
  links: ProjectLink[];
  visual: VisualId;
  /** Hex colour taken from the project's own brand or theme. */
  accent: string;
};

export type LayerId = "client" | "rules" | "assistant" | "reporting";

export type SystemLayer = {
  id: LayerId;
  name: string;
  tech: string;
  summary: string;
  body: string;
};

export type QuestionStep = {
  id: string;
  label: string;
  layer: LayerId;
  body: string;
};

export type Role = {
  company: string;
  via?: string;
  title: string;
  location: string;
  period: { start: string; end?: string };
  summary: string;
  achievements: { title: string; body: string; metric?: Metric }[];
  stack: string[];
};

export type Capability = {
  id: string;
  name: string;
  description: string;
  /** Project slugs that demonstrate this capability. */
  projects: string[];
  /** The Cleartrip role demonstrates it too. */
  experience: boolean;
};
