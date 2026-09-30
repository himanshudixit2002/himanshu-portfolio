import type { Project } from "../types";
import { complianceWatch } from "./compliancewatch";
import { cueAndCoffee } from "./cue-and-coffee";
import { elepeia } from "./elepeia";
import { kvStore } from "./kvstore";
import {
  apiGateway,
  fraudRing,
  padhnaThoPadega,
  rxForce,
  scopeForge,
  selfHealingCache,
  skintellect,
  urlShortener,
  vitals,
} from "./selected";
import { smartShelfKart } from "./smartshelfkart";

export { complianceWatch, cueAndCoffee, elepeia, kvStore, smartShelfKart };

/**
 * Public projects in display order: the main project, then the flagships,
 * then the rest roughly by how much they show. Every claim is traceable to
 * editorial/sources.ts.
 */
export const projects: Project[] = [
  complianceWatch,
  smartShelfKart,
  elepeia,
  cueAndCoffee,
  kvStore,
  selfHealingCache,
  scopeForge,
  vitals,
  rxForce,
  fraudRing,
  apiGateway,
  urlShortener,
  skintellect,
  padhnaThoPadega,
];

/** The main project: the homepage's spotlight, and first everywhere projects are listed. */
export const MAIN_PROJECT = complianceWatch.slug;

/** Every project's slug, in display order: the list the explorer features count against. */
export const projectSlugs = projects.map((p) => p.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The project after this one, wrapping round, for "next project" links. */
export function nextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
