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
- Interactive visuals fetch their code and mount while the page is idle, one per idle period, as interruptible transitions — so the burst of rendering and layout lands while you're reading, not mid-scroll. Scrolled to first, one mounts 1000px before it arrives. Their reserved heights in `LazyVisual.tsx` are measured per breakpoint so nothing shifts when they arrive — re-measure after changing a visual's layout.
- **Motion caveat:** Motion 13 hands scroll-linked `opacity` to a native `ViewTimeline`. If a `useTransform` input range does not start at 0 and end at 1, the browser fills the missing keyframes from the element's base style and values drift outside the intended range. Always anchor ranges: `[0, 0.36, 0.46, 1] → [0, 0, 1, 1]`.

### Motion primitives

- **Tokens.** `--ease-out`, `--ease-emphasized`, `--ease-spring` and `--dur-micro/base/slow/cinematic` in `globals.css`; the same values for Motion in `src/lib/motion-tokens.ts`. Hover and press use micro, content changes base, a scene's steps slow or cinematic.
- **Scroll-driven CSS** (`src/app/motion.css`). `sd-rise`, `sd-scale-in`, `sd-tilt-flat`, `sd-mask-up`, `sd-parallax` (depth via `--sd-shift`), `sd-dim-out` and `sd-progress` tie an effect to an element's own place in the viewport with native scroll timelines — compositor-only, no JavaScript per frame. They apply only where scroll timelines are supported and motion is on; add `data-reveal` alongside for RevealObserver's fade-up in other browsers.
- **Text.** `<WordReveal>` splits text into real words: `entrance` blurs them up on load, `scrub` lights them as the text crosses the screen. `<Eyebrow>` is the "Label —— Title" line with a rule that draws in.
- **Scenes.** `<ScrollScene>` pins a stage and hands it scroll progress; its `frames` tell the same story statically for no-JS, reduced motion and phones (unless `mobile="pin"`). CSS picks which shows before any script runs, and the track reserves its height, so nothing shifts. `useSceneStep` turns progress into a step that changes only at boundaries; `SceneDots` and `SceneCaptions` follow it.
- **`<SnapGallery>`.** Apple-style card row: snaps, peeks, dot pager and paddles, still swipeable without JavaScript; `stackFrom="md"` makes it a plain stack on wider screens.
- **Device frames** (`src/components/frames`). `MacBookFrame`, `PhoneFrame`, `BrowserFrame`, `DesktopFrame`, sized like the art so they scale as one piece. Their glare follows `--mx`, set by `usePointerLight` on fine pointers.
- **Homepage touches.** The hero's layers lift at different speeds and the composition recedes as it scrolls away (`hero-scroll` / `hero-depth` / `hero-recede`, on the hero's own exit, so nothing moves at rest); its glow drifts (`drift`). A chat can play out as it crosses the screen (`bubble-seq` with `data-bubble`). `<Magnetic>` gives a call to action a few pixels of pull on fine pointers. Small drawn details — the café's ticking seconds (a registered integer shown through a CSS counter), Elepeia's size chip and bag press — are CSS on the art's own scroll timeline. The KV explorer types two commands the first time it's well in view, and stops the moment you touch it.
- **Project cards.** Each card's signature (`MiniVisual`) is still until its card is active — hovered, focused, or on touch screens crossing the middle fifth of the screen — and then plays its idea as a short CSS loop (`mini.module.css`: layers part, a bar shrinks, a key hops between shards, a node drops out, rings close in). Every loop starts and ends on the still, so leaving a card never freezes it mid-move. Any element holding a signature can opt in with `data-loops` (the next-project door does). `useCardFocus` / `CardGrid` sets `data-active` from one observer on touch screens, and on fine pointers moves the card's accent light (`data-card-light`) with a transform — one listener for the grid, no React state. The card lifts 2px, its hairline takes the accent, and a press settles it (`card.module.css`). The `/work` filter's chosen fill is one pill, clipped to the chosen chip, that slides as a `clip-path` transition; until it has measured, and without JavaScript, the chip fills itself.
- **Site details.** The header marks the current section with a pill that slides between pages (the same clip-path technique as the filter), its menu button's two bars cross into an X, and the open phone menu dims the page, locks its scroll and closes on a tap outside. Text links draw their underline in from the left (`link-draw`); the focus ring opens out; body copy uses `text-wrap: pretty` and short headings `balance`. Press states replace the tap flash. Content keeps to the safe area on notched phones (`viewport-fit=cover`, with `container-page` and the footer padding for it). Note for Tailwind v4: `scale-*` and `translate-*` set the `scale` / `translate` properties, so a transition list must name those, not `transform`.
- **Link previews.** `opengraph-image.tsx` at the root and per project draw the page's own title, line and figures in its accent (`src/lib/og.tsx`), with Inter subset from Google Fonts at build time and next/og's font if that fails.
- **Print.** Animations stop, chrome and pinned scenes are dropped, dark sections print as ink on paper, and outbound links show their address; the résumé keeps its own print layout.
- **Hydrate only what shows.** `usePinShown` (from `ScrollScene`) says whether a pinned track is displayed; render the stage's contents only then, as `InterfaceToImpact` does, so phones don't hydrate a scene they never see. Static fallbacks use plain elements, not animated ones.

### Case studies

`/work/[slug]` reads like a product page (`src/components/case`): `CaseHero` puts the project on its device (`HeroDevice`: a MacBook, browser or desktop around its drawing or real screenshots, or its signature mark where it has neither) under a drifting glow in its accent; `LocalNav` is the sticky sub-nav that appears once the hero has passed, marks the section being read and draws reading progress; `Metrics` gives each figure a small exact picture of itself (`lib/metric-viz.ts` reads every number from the metric's own value and label, and draws nothing where no honest picture exists); decisions sit in a `SnapGallery`; the story section rises as a rounded sheet (`sd-sheet`); evidence and limits tick in; `NextProject` is the door onward.

### Signature scenes

Before its interactive ("Now try it"), a case study tells one short story by scrolling — SmartShelfKart's question travelling the layers, Elepeia's page losing its weight, a key landing in KVStore, a cache losing a node and healing, what Vitals costs the Mac, RxForce's queue riding out a dead zone, 39134 becoming `abc` and a destination failing the SSRF checks, Skintellect's pipeline in order, one night at the snooker club, requests meeting ScopeForge's scope guards, a fraud ring surfacing two hops out, an Isolation Forest's random cuts, and Two Sum stepped through in three languages. Each scene is:

- `src/lib/scenes/<name>.ts` — its steps (captions restating the project's own content; a scene adds pictures, not claims), a note on what is real, and a pure `frameAt(step)` built on the same simulation engines as the interactives. Tested in `tests/unit/scenes.test.ts`.
- `src/components/scenes/visuals/*Visual.tsx` — the drawing for a frame, in SVG so it scales to whatever the pinned stage leaves it, in two compositions: `wide` from 768px and `tall` for phones (portrait, type sized to read, not a shrunk copy). Moves are transitions keyed to the step; nothing animates per scroll frame. Groups that hold text fade rather than slide: moving an SVG group re-lays out every line of text in it on each frame. Keep text in the site's fonts — ticks, crosses and arrows are drawn (`visuals/marks.tsx`), because a fallback-font lookup mid-scroll costs a frame.
- `src/components/scenes/live/*Scene.tsx` — the client scene (`LiveScene`), each in its own chunk loaded by `SceneLoader`, so a case page fetches only its own.

The stage draws only the composition for the screen it's on. Reduced motion gets static frames drawn on demand; without JavaScript, the `<noscript>` in `SignatureScene` lists the steps as text. Neither is in anyone else's HTML. The step indicator is a row of fixed segments that only change colour, and the stage is `contain: strict`, so a step change is laid out inside the stage and not across the page.

Scenes too dense for a 390px stage set `mobile: "cards"` in their meta (Cue & Coffee, ScopeForge, the fraud ring, the gateway, PadhnaThoPadega): phones get every step as a card in a swipeable row (`StepCards`, on `SnapGallery`) instead of a pin. Until frames are drawn, `motion.css` holds about their height from `--frames-n` and `--frames-details`, which the scene sets.

Drawing is scheduled so it doesn't land mid-scroll (`src/lib/idle.ts`): interactives mount in idle time first; static frames (`IdleDraw`) and step cards (`CardDraw`: on load only the card in view and the one peeking in; the rest as the row is swiped) come after, and only once scrolling has settled. A live drawing's panels for later steps can go in `Later`, which draws them in idle time or when their step arrives, so the stage's first render is only what step 0 shows.

### Checking performance

`npm run perf -- <scroll|load|heights|shots>` runs Playwright against a running build (`--base`, default `http://localhost:3000`). `scroll` reports frame gaps, layout shift and long tasks per route; `load` median FCP and blocking time, with `--compare <url>` for an A/B against another build; `heights` checks each lazy visual's reserved height; `shots` saves screenshots, with `--scenes` at three points through every pinned scene and `--reduced` / `--nojs` variants. Budgets: CLS 0 on every route, no frame over 50ms while scrolling, and blocking time within 10% of the previous build — or, where a page gains new content above the fold, the growth measured and stated. At `--throttle 4` a long frame should be one the previous build also had.

The drawings are the expensive part of any page: each is a container sized in `cqw`, and laying one out costs more than its node count suggests (roughly 50–100ms per drawing at 4× CPU). Add them where they carry the story, not as decoration; below the fold on phones, `content-visibility: auto` with a height estimate defers one (see `CaseHero`).

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
