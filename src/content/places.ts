import { projects } from "./projects";

/** A project or a place to go, for the command palette and the 404 page's suggestions. Slim, since every page carries the list. */
export type Place = {
  id: string;
  group: "Projects" | "Go to";
  label: string;
  hint: string;
  href: string;
  /** Extra words to match: a project's categories. */
  keywords?: string;
  accent?: string;
  slug?: string;
};

export const places: Place[] = [
  ...projects.map((p) => ({
    id: `p-${p.slug}`,
    group: "Projects" as const,
    label: p.title,
    hint: p.tagline,
    href: `/work/${p.slug}`,
    keywords: p.categories.join(" "),
    accent: p.accent,
    slug: p.slug,
  })),
  ...(
    [
      ["home", "Home", "The start", "/"],
      ["hello", "At a glance", "Who Himanshu is, on one screen", "/#hello"],
      ["experience", "Experience", "The Cleartrip role", "/#experience"],
      ["projects", "Projects", "Three flagships, then everything else", "/#work"],
      ["skills", "Skills", "The tools, and the work that shows them", "/#skills"],
      ["work", "All work", "Every project, with a filter", "/work"],
      ["lab", "Lab", "Interactive simulations of systems he has built", "/lab"],
      ["about", "About", "Experience, education and capabilities", "/about"],
      ["resume", "Résumé", "Ready to print", "/resume"],
      ["contact", "Contact", "Say hello", "/#contact"],
    ] as const
  ).map(([id, label, hint, href]) => ({ id: `g-${id}`, group: "Go to" as const, label, hint, href })),
];
