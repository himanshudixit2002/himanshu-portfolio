# Himanshu Dixit — portfolio

Source for Himanshu Dixit's portfolio site. Built with Next.js App Router, React, Tailwind CSS 4 and Motion for React, and deployable to Vercel as a static site.

The plan behind it lives in `~/Desktop/PORTFOLIO_MASTER_PLAN.md`. The site presents one **neutral** identity — "software engineer" — reconciled from three role-targeted résumés (full-stack, frontend, data science); see `src/content/editorial/sources.ts` for every decision.

| Route | What it is |
| --- | --- |
| `/` | Direct, one idea per screen: Hero · At a glance · Experience (Cleartrip) · Work (three flagships as stacking cards, then every other project with its stack) · Skills (tied to the projects that use them) · Contact |
| `/work` | All 13 projects, filterable (Product / Systems / AI & Data / Tools) |
| `/work/[slug]` | Case study per project, each opening with its signature visual |
| `/lab` | Every interactive simulation in one place |
| `/about` | The background, told by the pinned "From interface to impact" scene, then the Cleartrip walkthroughs, work over time and capabilities |
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
- Content never depends on JavaScript. The hero entrance is a CSS animation toward the visible state; section reveals only hide content once `RevealObserver` is running (in browsers without scroll timelines; elsewhere they are CSS tied to scroll); Scene 02 falls back to the stacked layout without JS.
- Scroll-linked values never set React state per frame. Scene 02 changes state three times across the whole scene.
- In-page links (`#work`, back to top) scroll smoothly; route changes still land instantly because `<html data-scroll-behavior="smooth">` tells Next.js to suspend it while navigating. Reduced motion turns it off.
- Client-side navigations fade the new page up in 320ms (`app/template.tsx`, `app/work/template.tsx` → `PageTransition`). It is a Web Animations fade, not a view transition: snapshotting the 15,000px homepage froze a frame for about 250ms. A shared-element morph from a project card into its case study (React `<ViewTransition>` naming only the card's drawing and the hero device) was measured and dropped as well. The snapshot added 60–110ms to the navigation's longest frame on a 4× throttled phone (226–283ms vs 164–176ms). The new page's hydration, 100–150ms tasks, then lands mid-morph, and the group's size change runs on the main thread, so the morph stutters. Even unthrottled on desktop, frames of 50ms landed mid-morph.
- The mobile menu and the Surface / System layers open with `.disclosure` (a 0fr→1fr grid row). Closed panels are `inert` and hidden once they finish closing.
- The `/work` filter morphs cards with a view transition where `view-transition-name: match-element` is supported; cards are named only while it runs. Elsewhere it filters instantly.
- Interactive visuals fetch their code and mount while the page is idle, one per idle period, as interruptible transitions — so the burst of rendering and layout lands while you're reading, not mid-scroll. Scrolled to first, one mounts 1000px before it arrives. Their reserved heights in `LazyVisual.tsx` are measured per breakpoint so nothing shifts when they arrive — re-measure after changing a visual's layout.
- **Motion caveat:** Motion 13 hands scroll-linked `opacity` to a native `ViewTimeline`. If a `useTransform` input range does not start at 0 and end at 1, the browser fills the missing keyframes from the element's base style and values drift outside the intended range. Always anchor ranges: `[0, 0.36, 0.46, 1] → [0, 0, 1, 1]`.

### Motion primitives

- **Tokens.** `--ease-out`, `--ease-emphasized`, `--ease-spring` and `--dur-micro/base/slow/cinematic` in `globals.css`; the same values for Motion in `src/lib/motion-tokens.ts`. Hover and press use micro, content changes base, a scene's steps slow or cinematic.
- **Scroll-driven CSS** (`src/app/motion.css`). `sd-rise`, `sd-scale-in`, `sd-tilt-flat`, `sd-mask-up`, `sd-parallax` (depth via `--sd-shift`), `sd-dim-out` and `sd-progress` tie an effect to an element's own place in the viewport with native scroll timelines — compositor-only, no JavaScript per frame. They apply only where scroll timelines are supported and motion is on; add `data-reveal` alongside for RevealObserver's fade-up in other browsers. **Entrances finish at the bottom edge of the screen**, never in the band people read (about 15–85% of the viewport): `sd-rise` is done by 14vh into its pass, `sd-scale-in` by 22vh, and `data-reveal` is the same scroll-linked rise (stagger with `--reveal-i` / `--sd-i`). Timed fades and long ranges left content faded mid-screen after a quick flick, which reads as a page still loading; `npm run perf -- feel` measures it.
- **Text.** `<WordReveal>` splits text into real words: `entrance` blurs them up on load, `scrub` lights them as the text crosses the screen. `<Eyebrow>` is the "Label —— Title" line with a rule that draws in.
- **Scenes.** `<ScrollScene>` pins a stage and hands it scroll progress; its `frames` tell the same story statically for no-JS, reduced motion and phones (unless `mobile="pin"`). CSS picks which shows before any script runs, and the track reserves its height, so nothing shifts. `useSceneStep` turns progress into a step that changes only at boundaries; `SceneDots` and `SceneCaptions` follow it.
- **`<SnapGallery>`.** Apple-style card row: snaps, peeks, dot pager and paddles, still swipeable without JavaScript; `stackFrom="md"` makes it a plain stack on wider screens.
- **Device frames** (`src/components/frames`). `MacBookFrame`, `PhoneFrame`, `BrowserFrame`, `DesktopFrame`, sized like the art so they scale as one piece. Their glare follows `--mx`, set by `usePointerLight` on fine pointers.
- **Homepage touches.** The hero's layers lift at different speeds and the composition recedes as it scrolls away (`hero-scroll` / `hero-depth` / `hero-recede`, on the hero's own exit, so nothing moves at rest); its glow drifts (`drift`). A chat can play out as it crosses the screen (`bubble-seq` with `data-bubble`). `<Magnetic>` gives a call to action a few pixels of pull on fine pointers. Small drawn details — the café's ticking seconds (a registered integer shown through a CSS counter), Elepeia's size chip and bag press — are CSS on the art's own scroll timeline. The KV explorer types two commands the first time it's well in view, and stops the moment you touch it.
- **A direct homepage.** One idea per screen, so a visitor gets it at a glance; the depth lives on the case studies, `/about` and `/lab`.
  - **Hero play:** the headline's full stop is a ball that bounces when poked (`data-bounce`). Tapping the Nova phone swaps its two sample chats: both are server-rendered, and `data-swap` flips which shows, so no art hydrates.
  - **At a glance:** Practice is just its figure on phones; its 600 dots appear from 768px, and a tap sends a ripple through them (`DotRipple`: a canvas drawn for a second, only after a tap).
  - **Experience:** the achievements are a swipeable row on phones (`SnapGallery`, `stackFrom="md"`). The hex map and the other walkthroughs are on `/about`.
  - **Work** (`Projects`):
    - **Flagships** (`Featured`): the three are sticky cards that pile up as you scroll. Each settles back and dims on the next card's named view timeline, scoped to the list with `timeline-scope`. Every card shows the idea, its own figures, its stack and the way in.
    - **The rest:** every other project follows in the gallery, and every project card lists its stack.
  - **Skills** (`Skills`, `content/skills.ts`): the résumé's skill groups, each matched to the projects whose own stack names it, or the Cleartrip role's. Pointing at or tapping a skill lights those projects; on phones they ride in a bar pinned to the bottom of the screen. Skills with nothing to show them are listed plainly. The résumé reads the same list.
  - **Grid gotcha:** a grid track grows to its widest content. A swipe row or a pill row inside one needs `min-width: 0` (or `minmax(0, 1fr)`), or it pushes the page wider than a phone.
- **Project cards.** Each card's signature (`MiniVisual`) is still until its card is active — hovered, focused, or on touch screens crossing the middle fifth of the screen — and then plays its idea as a short CSS loop (`mini.module.css`: layers part, a bar shrinks, a key hops between shards, a node drops out, rings close in). Every loop starts and ends on the still, so leaving a card never freezes it mid-move. Any element holding a signature can opt in with `data-loops` (the next-project door does). `useCardFocus` / `CardGrid` sets `data-active` from one observer on touch screens, and on fine pointers moves the card's accent light (`data-card-light`) with a transform — one listener for the grid, no React state. The card lifts 2px, its hairline takes the accent, and a press settles it (`card.module.css`). The `/work` filter's chosen fill is one pill, clipped to the chosen chip, that slides as a `clip-path` transition; until it has measured, and without JavaScript, the chip fills itself.
- **Site details.** The header marks the current section with a pill that slides between pages (the same clip-path technique as the filter), its menu button's two bars cross into an X, and the open phone menu dims the page, locks its scroll and closes on a tap outside. Text links draw their underline in from the left (`link-draw`); the focus ring opens out; body copy uses `text-wrap: pretty` and short headings `balance`. Press states replace the tap flash. Content keeps to the safe area on notched phones (`viewport-fit=cover`, with `container-page` and the footer padding for it). Note for Tailwind v4: `scale-*` and `translate-*` set the `scale` / `translate` properties, so a transition list must name those, not `transform`.
- **Link previews.** `opengraph-image.tsx` at the root and per project draw the page's own title, line and figures in its accent (`src/lib/og.tsx`), with Inter subset from Google Fonts at build time and next/og's font if that fails.
- **Print.** Animations stop, chrome and pinned scenes are dropped, dark sections print as ink on paper, and outbound links show their address; the résumé keeps its own print layout.
- **Introducing Himanshu** (homepage). The hero's availability badge (`profile.availability`, sourced in `sources.ts`) links to contact, with a `live-dot`. `AtAGlance` follows the hero as a light sheet: a bento of facts already in the content — the HD monogram writing itself stroke by stroke (`pathLength="1"` strokes on a view timeline), the Cleartrip role, VIT, the certifications, and the practice figure beside that many dots with a band of light crossing them (two counter-moving transforms under a mask). Two SVG gotchas met on the way: Chrome makes no view timeline for an `<svg>` element (hang it on an HTML wrapper), and a gradient in bounding-box units doesn't paint a perfectly straight stroke (use `userSpaceOnUse`).
- **Portrait** (`src/components/identity`). Himanshu's photo is `profile.photo`: his GitHub picture, cut out from its plain background (`src/content/media/himanshu.png`). Replacing that one file updates everything below.
  - **The intro:** `<Portrait>` stands him in a glowing disc, shoulders inside the circle and head rising out of it, with a ring and glow set back at their own depths in one 3D stage.
    - As it arrives, the disc opens, he rises into it and a black-and-white copy fades to colour.
    - It tilts toward a fine pointer (`usePointerLight`) or gently with scroll on touch screens, and floats at rest.
  - **Elsewhere:** the header's `<Avatar>` is the same photo in a small disc with the availability dot, and the link previews use it too.
- **Scroll timelines and `overflow`.** `overflow: hidden` makes an element a scroll container, and a `view()` timeline inside it measures against that box instead of the page, so its animation never moves. The old homepage chapters' entrances and the case-study device's tilt sat frozen like this until they moved to `overflow-clip`, which clips the same way without being a scroll container. Use `overflow-clip` around anything scroll-linked.
- **Tap targets.** Small controls keep their look and get a 44px hit area from `.hit` (`globals.css`): an invisible `::after` centred on the element, `--hit` tall (lower it where rows sit closer, as the About timeline does at 26px). Range inputs get the same height from padding that a negative margin cancels. Anything painted outside its box, like the practice dots' light band, needs `overflow: clip` on its box, or the page scrolls sideways at tablet widths.
- **CSS layer order.** A CSS module that uses `@layer components` can load before `globals.css`, and whichever file names a layer first fixes the order, so components would land under base and the reset would win. Each layered module starts with `@layer theme, base, components, utilities;` so the order is the same whichever file arrives first.
- **Things to find** (`src/components/explore`, `src/lib/explored.ts`). Everything here is per visitor, kept in their own browser (falling back to memory when storage is blocked) and read only after mount, so the server's HTML never depends on it.
  - **Explored.** Opening a case study records it (`MarkExplored`). Cards then wear a "Seen" mark, and `/work`, the homepage gallery and the next-project door say how many of the projects have been opened. The pill is laid out from the first paint and shown once the count is known, so nothing moves. Opening the last one plays a thank-you once: a note with a dot per project bursting out in its accent (`Celebration`, loaded only then).
  - **Surprise me** opens a random project not yet seen. It picks on hover, focus or touch and prefetches that page, and the die rolls while it loads. Without JavaScript it is a link to the first project.
  - **The portrait says hi.** Tap it and he hops, the ring whirls and a speech bubble gives the next line, also announced to screen readers. The lines are invitations, never claims, and point at the shortcuts the device has (⌘K and x with a keyboard, the search button and footer switch on touch).
  - **Hints.** `<Hint>` is a hand-written note (Caveat, not preloaded) with an arrow that draws itself in once the note is fully in view. Its parent is what it points at, and the first touch, keypress or input there retires it for good. `touch` hints ("swipe", on `SnapGallery`'s `swipeHint`) show only where there's no hover and retire on the first scroll.
  - **Spotlight** (homepage hero, fine pointers). A lens follows the pointer and the dot grid inside it moves the other way, so the dots stay fixed while the light passes over them: the practice dots' counter-moving technique. Its layers are promoted only while it's lit.
  - **Site-wide touches** (`src/components/fx/Fx.tsx`, one client component in the layout, one listener per job):
    - **Accent wipe:** a link to a case study sends a circle in that project's accent from the click to cover the screen, then it lifts away. It's a 160px circle scaled up, compositor only. The palette and Surprise me start it with `wipeTo`. While `html[data-wiping]` is set, `PageTransition` holds the incoming page until the circle has covered the screen, so the new page rises as it lifts. Off under reduced motion.
    - **Press ripple:** elements marked `[data-ripple]` (pill `ButtonLink`s, Surprise me, Copy email) ripple from where they're pressed. The listener sets `--rx` / `--ry` and alternates two identical keyframes; the ripple is the element's `::after`, under its label.
    - **Small ones:**
      - "Back to top" (`[data-launch]`) launches its arrow first.
      - The footer's HD turns over under the pointer.
      - A hidden tab's title asks you to come back.
      - Developers get a hello in the console.
  - **Work and case studies:**
    - **Tilt:** project cards tilt a few degrees toward a fine pointer, set by `useCardFocus`'s single listener alongside the light. A case study's device leans the same way (`HeroTilt`) once it's on screen.
    - **Figures that draw again** (`[data-replay-on]`, `Fx`). A metric's picture draws when it first comes well into view, then again under the pointer or a tap. It uses two alternating keyframe sets in `case.module.css`. The arrival pass is for fine pointers only: redrawing many small SVG shapes is main-thread work, and on a phone it landed mid-scroll (0 to 5 frames over 50ms on KVStore). Phones keep the figures drawn and replay on a tap.
    - **Small ones:** decision numbers turn over, and "Try it" wiggles once when its interactive arrives.
    - **Pull to the next project** (`PullNext`, wheel only). At the very bottom, with the door fully in view, more scrolling fills a ring on the door, and a full ring opens the next project. Upward scroll or a pause lets go.
  - **Discoveries** (`src/lib/discoveries.ts`). Small secrets, recorded per visitor by `discover(id)` in `lib/explored`. The first find shows a note under the header, and the palette lists them all, with a hint for those still to find. Add one by listing it there and calling `discover` where it happens. Current ones:
    - hearing all the portrait's lines
    - opening the palette
    - x-ray mode
    - bouncing the hero's full stop
    - rippling the practice dots
    - exploring every project
    - pulling through to the next project
    - the Konami code, which bursts sparks in every project's accent
  - **Command palette** (`src/components/palette`). ⌘K / Ctrl+K, "/" or the header's search button.
    - **Contents:** every project (with a "Seen" mark once opened), the places to go, and actions: Surprise me, copy the email address, x-ray mode, reduce motion.
    - **Search and keys:** it filters as you type (substring first, then letters in order, so "ssk" finds SmartShelfKart). ↑ ↓ choose and Enter runs.
    - **Mechanics:** it's a native modal `<dialog>`, so focus stays inside and Escape closes it. Focus returns to whatever opened it.
    - **Loading:** pages carry only the listener (`PaletteHost`) and a slim list built in the root layout; the palette's own code loads on first open.
  - **X-ray mode** (`x` anywhere but a text field, the palette, or the footer switch). It outlines the page's building blocks and labels each with how it's built, from its `data-xray` attribute.
    - **Accuracy:** a label must stay true of the code; change it when the code changes.
    - **Mechanics:** every tagged element is already positioned, so turning it on moves nothing. Blocks under the fixed header set `--xray-top`. `data-xray-wide` hides a label on phones where what it describes isn't shown.
    - **Lifetime:** it lasts for the visit (`<html data-xray>`), with a corner note to leave it.
  - **Section rail** (homepage, 1280px and up). One dot per section: an observer on a line across the middle of the screen grows the current dot, and it steps aside over the hero. Without JavaScript it's a plain list of links.
- **Hydrate only what shows.** `usePinShown` (from `ScrollScene`) says whether a pinned track is displayed; render the stage's contents only then, so phones don't hydrate a scene they never see. Static fallbacks use plain elements, not animated ones.
- **A pinned scene in CSS alone** (`InterfaceToImpact`, on `/about`). "From interface to impact" is a server component. Its track has a view timeline, and every piece's keyframes run on it, with `animation-range` set inline for the pieces that arrive in turn. Only the three phase buttons are script (`PhaseJump`).
  - **Why:** it used Motion's `useScroll`, mounted after hydration. The mount was about 270ms at 4× CPU and landed when a reader starts scrolling. It was the worst frame on the desktop homepage (about 300ms), and is now gone; the worst is about 150ms.
  - **Cost:** the drawing is now laid out with the page, so desktop blocking time at 4× is about 12% higher (+25ms) and first paint about +50ms. Phones don't lay it out.
  - **Fallback:** browsers without scroll timelines get the three still frames.
  - **No backdrop blur over moving art:** the scrim over the drawing is now a plain dark layer. Its 2px blur had to be redone on every frame the drawing scaled, which was most of this scene's other slow frames (11 down to 4 over four runs).

### Case studies

`/work/[slug]` reads like a product page (`src/components/case`): `CaseHero` puts the project on its device (`HeroDevice`: a MacBook, browser or desktop around its drawing or real screenshots, or its signature mark where it has neither) under a drifting glow in its accent; `LocalNav` is the sticky sub-nav that appears once the hero has passed, marks the section being read and draws reading progress; `Metrics` gives each figure a small exact picture of itself (`lib/metric-viz.ts` reads every number from the metric's own value and label, and draws nothing where no honest picture exists); decisions sit in a `SnapGallery`; the story section rises as a rounded sheet (`sd-sheet`); evidence and limits tick in; `NextProject` is the door onward.

### Signature scenes

Before its interactive ("Now try it"), a case study tells one short story by scrolling — SmartShelfKart's question travelling the layers, Elepeia's page losing its weight, a key landing in KVStore, a cache losing a node and healing, what Vitals costs the Mac, RxForce's queue riding out a dead zone, 39134 becoming `abc` and a destination failing the SSRF checks, Skintellect's pipeline in order, one night at the snooker club, requests meeting ScopeForge's scope guards, a fraud ring surfacing two hops out, an Isolation Forest's random cuts, and Two Sum stepped through in three languages. Each scene is:

- `src/lib/scenes/<name>.ts` — its steps (captions restating the project's own content; a scene adds pictures, not claims), a note on what is real, and a pure `frameAt(step)` built on the same simulation engines as the interactives. Tested in `tests/unit/scenes.test.ts`.
- `src/components/scenes/visuals/*Visual.tsx` — the drawing for a frame, in SVG so it scales to whatever the pinned stage leaves it, in two compositions: `wide` from 768px and `tall` for phones (portrait, type sized to read, not a shrunk copy). Moves are transitions keyed to the step; nothing animates per scroll frame. Groups that hold text fade rather than slide: moving an SVG group re-lays out every line of text in it on each frame. Keep text in the site's fonts — ticks, crosses and arrows are drawn (`visuals/marks.tsx`), because a fallback-font lookup mid-scroll costs a frame.
- `src/components/scenes/live/*Scene.tsx` — the client scene (`LiveScene`), each in its own chunk loaded by `SceneLoader`, so a case page fetches only its own.

The stage draws only the composition for the screen it's on. Reduced motion gets static frames drawn on demand; without JavaScript, the `<noscript>` in `SignatureScene` lists the steps as text. Neither is in anyone else's HTML. The step indicator is a row of fixed segments that only change colour, and the stage is `contain: strict`, so a step change is laid out inside the stage and not across the page.

Scenes too dense for a 390px stage set `mobile: "cards"` in their meta (Cue & Coffee, ScopeForge, the fraud ring, the gateway, PadhnaThoPadega): phones get every step as a card in a swipeable row (`StepCards`, on `SnapGallery`) instead of a pin. Until frames are drawn, `motion.css` holds about their height from `--frames-n` and `--frames-details`, which the scene sets.

Drawing is scheduled so it doesn't land mid-scroll (`src/lib/idle.ts`): interactives mount in idle time first; static frames (`IdleDraw`) and step cards (`CardDraw`: on load only the card in view and the one peeking in; the rest as the row is swiped) come after, and only once scrolling has settled — except the first frame and the first two cards (`eager`), which draw at "high" priority: an idle callback of their own with a 400ms deadline, since a slow phone that keeps scrolling has no idle time and a blank card looks broken. A live drawing's panels for later steps can go in `Later`, which draws them in idle time or when their step arrives, so the stage's first render is only what step 0 shows.

### Checking performance

**Where the homepage's start-up time went** (before the direct homepage, which dropped the chapters and Surface / System). On a 4× throttled phone the first long task (about 0.6–1s) is almost all layout, and most of that is the scalable drawings: each sets `font-size: 1cqw` in a size container, so its text is laid out against the container's width. Measured per section at 4×:

| Section | Layout cost |
|---|---|
| SmartShelfKart chapter | 160–205ms |
| Surface / System | 45–216ms |
| Elepeia chapter | 68–116ms |
| Cue & Coffee chapter | 78–112ms |
| Every other section | 5–63ms |

Deferring off-screen sections with `content-visibility: auto` was measured and dropped. It only moves that work, and every variant put more long frames into a quick early scroll on the 4× phone:

- **Every section, laid out in idle time after load:** first paint about a quarter faster and blocking time about 30% lower, but 9–11 frames over 50ms vs 2–4.
- **Only the cheap sections:** blocking time 16–26% lower, but 6–8 frames vs 2–4.

The lever that doesn't trade one for the other is cheaper drawing layout: sizing the art without container queries.

`npm run perf -- <scroll|load|heights|shots|feel>` runs Playwright against a running build (`--base`, default `http://localhost:3000`). `scroll` reports frame gaps, layout shift and long tasks per route; `load` median FCP and blocking time, with `--compare <url>` for an A/B against another build; `heights` checks each lazy visual's reserved height; `shots` saves screenshots, with `--scenes` at three points through every pinned scene and `--reduced` / `--nojs` variants; `feel` scrolls at a brisk 1400px/s (phones emulated with touch, `--net 4g` for a mobile connection) and totals, per section, how long content in the reading band was still faded, undrawn, a placeholder or an image loading — aim for under 150ms each. Budgets: CLS 0 on every route, no frame over 50ms while scrolling, and blocking time within 10% of the previous build — or, where a page gains new content above the fold, the growth measured and stated. At `--throttle 4` a long frame should be one the previous build also had.

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
