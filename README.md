# Himanshu Dixit — portfolio

Source for Himanshu Dixit's portfolio site. Built with Next.js App Router, React, Tailwind CSS 4 and Motion for React, and deployable to Vercel as a static site.

The plan behind it lives in `~/Desktop/PORTFOLIO_MASTER_PLAN.md`. The site presents one **neutral** identity — "software engineer" — reconciled from three role-targeted résumés (full-stack, frontend, data science); see `src/content/editorial/sources.ts` for every decision.

| Route | What it is |
| --- | --- |
| `/` | Hero · From interface to impact · SmartShelfKart + Surface/System · Elepeia · Cue & Coffee · Experience (Cleartrip) · Explore the engineering (KVStore) · About · Contact |
| `/work` | All 13 projects, filterable (Product / Systems / AI & Data / Tools) |
| `/work/[slug]` | Case study per project, each opening with its signature visual |
| `/lab` | Every interactive simulation in one place |
| `/about` | Bio, Cleartrip experience visuals, timeline, capability evidence map, education |
| `/resume` | One neutral résumé, printable to PDF |

Every project has a **signature visual** (`src/components/visuals/`): interactive simulations for KVStore, the self-healing cache, Cue & Coffee, Elepeia, the URL shortener, the fraud graph, the anomaly gateway, RxForce and Two Sum; server-rendered diagrams for Vitals, Skintellect and ScopeForge. Each is labelled Simulation, Illustration, Diagram, Measured or Screenshots, and says what is sample data.

## Scripts

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # production build (all routes prerender statically)
npm start           # serve the production build
npm run check       # typecheck + lint + unit tests
```

Node 22.12 or newer (`.nvmrc` pins 24, matching a current Vercel runtime).

## Where things live

```text
src/app/                 routes: home, work, work/[slug], lab, about, resume, 404, sitemap, robots
src/components/art/      interface illustrations — sized in em against 1cqw so each scales as one piece
src/components/home/     homepage scenes (also reused by case studies and /about)
src/components/visuals/  signature visuals, the Stage frame, and LazyVisual (loads interactives near the viewport)
src/components/work/     project cards and the /work filter
src/components/layout/   header, footer, monogram
src/components/motion/   motion preference provider + switch, reveal observer, page transition, inline script helper
src/components/ui/       link buttons, icons, print button
src/content/             typed public content: profile, experience, projects/, Surface/System
src/content/editorial/   build-time only: sources for every claim, and open questions
src/lib/sim/             pure, deterministic simulation engines (KVStore, cluster, café, Base62, SSRF, hex map, graph, isolation forest, sync queue, Two Sum)
src/lib/                 explorer state machine, content validation, formatting, motion helpers
public/projects/         real screenshots (ScopeForge, synthetic demo data)
tests/unit/              Vitest: content rules, explorer state, every simulation engine
```

## Editing content

Public copy lives in `src/content/*.ts`, not in components. When you change a claim, update its entry in `src/content/editorial/sources.ts` — that file records where each fact came from and how it was checked, and it is never imported by anything that ships (a test enforces this).

`npm test` validates the content: unique slugs, descriptive alt text, well-formed links, that illustrations say they are illustrations, and that no project links to a case study before `caseStudyReady` is true.

### Illustrations vs screenshots

Only ScopeForge has real screenshots (its repository's synthetic demo workspace). SmartShelfKart, Elepeia and Cue & Coffee are original HTML/CSS drawings with sample data — no client photos, logos or records — labelled as such on the page and in their accessible names. To swap in captures, add images under `public/projects/`, change the media entry's `kind` to `"screenshot"` with `src`, `width` and `height`, and render them with `next/image` as `ScopeForgeGuard` does. Client screenshots need the client's OK first.

## Motion system

- One preference, two consumers. `<html data-motion="reduce|full">` is set by an inline script **before first paint** from the footer switch (stored in `localStorage`) or the OS setting. CSS reads the attribute; React reads it via `MotionPreferences`, which also drives `MotionConfig`.
- Content never depends on JavaScript. The hero entrance is a CSS animation toward the visible state; section reveals only hide content once `RevealObserver` is running; Scene 02 falls back to the stacked layout without JS.
- Scroll-linked values never set React state per frame. Scene 02 changes state three times across the whole scene.
- In-page links (`#work`, back to top) scroll smoothly; route changes still land instantly because `<html data-scroll-behavior="smooth">` tells Next.js to suspend it while navigating. Reduced motion turns it off.
- Client-side navigations fade the new page up (`app/template.tsx`, `app/work/template.tsx` → `PageTransition`). It is a Web Animations fade, not a view transition: snapshotting the 15,000px homepage froze a frame for about 250ms.
- The mobile menu and the Surface / System layers open with `.disclosure` (a 0fr→1fr grid row). Closed panels are `inert` and hidden once they finish closing.
- The `/work` filter morphs cards with a view transition where `view-transition-name: match-element` is supported; cards are named only while it runs. Elsewhere it filters instantly.
- Interactive visuals fetch their code when the page goes idle and mount 1000px before they scroll into view. Their reserved heights in `LazyVisual.tsx` are measured per breakpoint so nothing shifts when they arrive — re-measure after changing a visual's layout.
- **Motion caveat:** Motion 13 hands scroll-linked `opacity` to a native `ViewTimeline`. If a `useTransform` input range does not start at 0 and end at 1, the browser fills the missing keyframes from the element's base style and values drift outside the intended range. Always anchor ranges: `[0, 0.36, 0.46, 1] → [0, 0, 1, 1]`.

## Palette

Checked against WCAG 2.x contrast:

| Pair | Ratio |
| --- | --- |
| `#f5f5f7` on `#08090b` | 18.3 |
| `#a1a1a6` on `#08090b` | 7.7 |
| `#86868b` on `#08090b` (secondary labels) | 5.5 |
| `#6e6e73` on `#f5f5f7` | 4.7 |
| `#0a66d8` on `#f5f5f7` / white on `#0a66d8` | 4.9 / 5.4 |
| `#5ca4ff` on `#08090b` | 7.8 |

## Deploying to Vercel

1. Push this directory to its own Git repository and import it in Vercel. The framework preset is Next.js and the root directory is the repository root.
2. No environment variables are required. Once a custom domain exists, set `NEXT_PUBLIC_SITE_URL` (for example `https://your-domain.com`) so canonical URLs and Open Graph URLs use it. Until then `VERCEL_PROJECT_PRODUCTION_URL` is used, so preview URLs never become canonical.
3. Check a preview deployment: deep links (`/#work`, `/#system`), the 404 page, mobile menu, the reduce-motion switch, and email copy.

## Before launch

See `openQuestions` in `src/content/editorial/sources.ts`: capture real screenshots, decide on the held-back projects (coldPitch, the GPB Group site, Registeryourcafe), and open the LinkedIn URL by hand — it blocks automated checks.
