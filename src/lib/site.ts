/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL once the custom domain exists;
 * until then Vercel's production URL is used, so preview deployments never
 * become canonical.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
