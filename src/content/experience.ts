import type { Capability, Role } from "./types";

/**
 * The one role all current résumés agree on. Wording is neutral: each
 * achievement appears once, not once per résumé flavour. Employer systems are
 * described generically; the visuals on the site use synthetic data.
 */
export const cleartrip: Role = {
  company: "Cleartrip",
  via: "via Teamlease",
  title: "Product Solution Engineer",
  location: "Bengaluru, India",
  period: { start: "2025-08", end: "2026-08" },
  summary: "Backend and quality work on hotel and flight booking — search that stays fast at peak, and releases that don't break the partners who depend on them.",
  achievements: [
    {
      title: "A price map that stays interactive",
      body: "Served clustered price summaries for the hotel search map from Elasticsearch geospatial queries with H3 hexagon aggregations, replacing per-hotel lookups that did not scale.",
      metric: { value: "< 1 s", label: "clustered price summaries" },
    },
    {
      title: "One call instead of one per fare",
      body: "Designed a bulk benefits API that returns entitlements for every fare on a results page in a single call, removing request fan-out from fare comparison.",
    },
    {
      title: "Prices that stay fresh under load",
      body: "Fronted the pricing service with a Redis cache invalidated from Apache Kafka events, keeping displayed prices in near real-time sync during traffic peaks.",
    },
    {
      title: "Regressions caught before release",
      body: "Automated regression suites across hotel and air booking flows (v1 and v2), protecting backward compatibility for live third-party consumers.",
      metric: { value: "30%", label: "fewer production tickets" },
    },
  ],
  stack: ["Elasticsearch", "H3", "Redis", "Apache Kafka"],
};

export const education = {
  school: "Vellore Institute of Technology (VIT)",
  degree: "B.Tech, Computer Science and Engineering",
  specialization: "Specialization in Data Science",
  location: "Vellore, Tamil Nadu",
  period: { start: "2021", end: "2025" },
};

export const certifications = [
  {
    name: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    year: "2024",
    href: "https://www.credly.com/badges/f3ec9008-7225-47d3-845d-0d105b85f83b/public_url",
  },
  {
    name: "Google Cloud Digital Leader",
    issuer: "Google Cloud",
    year: "2024",
    href: "https://www.credential.net/0b231b1e-56d1-45dc-84b9-a8496e3a4866",
  },
] as const;

export const achievements = ["Solved 600+ data structures and algorithms problems across competitive programming platforms."];

/**
 * Capabilities replace skill lists: each one is only claimed where a project
 * (or the Cleartrip role) demonstrates it.
 */
export const capabilities: Capability[] = [
  {
    id: "interfaces",
    name: "Product interfaces",
    description: "Web and mobile products people use every day — fast, accessible, and calm on a busy day.",
    projects: ["smartshelfkart", "elepeia", "cue-and-coffee", "vitals", "rxforce-sfa", "scopeforge", "padhna-tho-padega"],
    experience: false,
  },
  {
    id: "systems",
    name: "Backend & systems",
    description: "APIs, caches, queues and storage that stay correct under load and failure.",
    projects: ["smartshelfkart", "elepeia", "kvstore", "self-healing-cache", "url-shortener", "scopeforge", "ai-api-gateway"],
    experience: true,
  },
  {
    id: "data-ai",
    name: "Data & AI",
    description: "Agents grounded in real data, evaluation that runs offline, and streaming pipelines for models.",
    projects: ["smartshelfkart", "fraud-ring-engine", "ai-api-gateway", "skintellect", "rxforce-sfa"],
    experience: false,
  },
  {
    id: "reliability",
    name: "Delivery & reliability",
    description: "Tests, CI gates, authorization rules and observability that keep releases boring.",
    projects: ["smartshelfkart", "cue-and-coffee", "self-healing-cache", "scopeforge", "url-shortener", "elepeia"],
    experience: true,
  },
];
