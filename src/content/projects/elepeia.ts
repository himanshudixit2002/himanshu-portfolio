import type { Project } from "../types";

export const elepeia: Project = {
  slug: "elepeia",
  title: "Elepeia",
  tagline: "Commerce, considered.",
  summary:
    "A production storefront for a luxury menswear label, and the admin console that runs it — fast on a phone, and built so a paid order is never lost.",
  categories: ["Product"],
  tier: "flagship",
  period: { start: "2025-06" },
  status: "Live at elepeia.com",
  platform: "Web · Next.js on Vercel",
  role: "Freelance — design and full-stack development",
  problem:
    "A small label needs a storefront that feels premium and loads fast on mobile, a checkout that never loses an order, and an admin console its team can run day to day.",
  contribution:
    "Built the storefront, the admin console and the API between them: catalogue, server-priced checkout with Razorpay, GST invoicing, returns, promotions and affiliates.",
  stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Cloud Firestore", "Razorpay", "Vercel"],
  highlights: [
    {
      title: "Server-rendered again",
      body: "A client-side maintenance check had turned every route into a spinner. Moved to edge middleware with a 30-second cached flag, pages ship as real HTML to shoppers and crawlers.",
    },
    {
      title: "68× fewer image bytes",
      body: "Preloads were fetching ~5 MB camera originals while the page rendered ~73 KB images. Preloading the exact optimized URL — and replacing five lazy-loading layers with one — let the main image paint before hydration.",
    },
    {
      title: "A payment always becomes an order",
      body: "The server prices the cart, records an order intent before payment, and lets the browser and Razorpay's webhook race to one idempotent commit that decrements stock in the same transaction.",
    },
  ],
  metrics: [
    { value: "27", label: "storefront routes" },
    { value: "18", label: "admin console screens" },
    { value: "29", label: "API routes between them" },
    { value: "68×", label: "less image data on product pages" },
  ],
  decisions: [
    {
      title: "Let the browser and the webhook race",
      body: "Either can commit the order. The commit is idempotent on the payment id, so whoever arrives second observes the order that already exists — and a closed tab can no longer strand a captured payment.",
    },
    {
      title: "Never gate content on client state",
      body: "The maintenance guard is the canonical lesson: a check that needed JavaScript made every server-rendered page ship a spinner. It now runs at the edge, before rendering.",
    },
    {
      title: "Three cache layers, trusted in order",
      body: "Tagged data caches first, then ISR windows (60 s for the home page, 300 s for products), then best-effort in-memory maps. An admin change refreshes exactly the tagged data and paths it touched.",
    },
    {
      title: "Filters that returned nothing",
      body: "Catalogue filtering silently returned zero results: an impossible type guard made the fallback unreachable, categories compared ids with slugs, and colours compared strings with objects. Each was a type mismatch, not a logic error.",
    },
  ],
  evidence: [
    "265 lines of Firestore security rules and 51 composite indexes, deployed from the repository.",
    "Vitest suite covering server-side order quotes, stock restoration, return eligibility and order numbering.",
    "A README that documents the purchase pipeline, caching, performance lessons and known limitations.",
  ],
  limitations: [
    "Search scores at most 50 products in memory; a larger catalogue needs a real search index.",
    "No component or end-to-end tests yet — the checkout journey is covered by pure-logic tests only.",
    "Uploads are stored as 5 MB originals, so the first request for a new size still transcodes a large file.",
  ],
  media: [
    {
      id: "elepeia-storefront",
      kind: "illustration",
      alt: "Illustration of an Elepeia-style product page with sample data: an abstract garment image, size selector, price with GST and an add-to-bag button.",
    },
  ],
  links: [{ kind: "live", label: "Visit elepeia.com", href: "https://www.elepeia.com" }],
  visual: "elepeia-teardown",
  accent: "#c8a97e",
};
