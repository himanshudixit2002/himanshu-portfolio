import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/lab", "/about", "/resume"].map((path) => ({ url: `${siteUrl}${path || "/"}` }));
  const work = projects.map((p) => ({ url: `${siteUrl}/work/${p.slug}` }));
  return [...pages, ...work];
}
