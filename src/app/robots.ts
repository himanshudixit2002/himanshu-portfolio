import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Preview deployments stay out of search; only production is indexable. */
export default function robots(): MetadataRoute.Robots {
  const production = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";
  return production
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
