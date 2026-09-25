import type { Project } from "../types";

export const selfHealingCache: Project = {
  slug: "self-healing-cache",
  title: "Self-Healing Cache",
  tagline: "Keeps answering when nodes don't.",
  summary:
    "A distributed in-memory cache in Go that keeps serving through node failures, then repairs itself: consistent hashing, gossip membership, quorum replication and automatic healing.",
  categories: ["Systems"],
  tier: "selected",
  period: { start: "2026-05", end: "2026-07" },
  status: "Open source",
  platform: "Go · 3-node Docker Compose cluster",
  role: "Personal project — sole author",
  problem:
    "Nodes fail and come back. A cache cluster should keep serving reads and writes through that, then put every key back where it belongs without an operator.",
  contribution:
    "Built the hash ring, gossip membership, quorum replication and the healer loops, with Prometheus metrics and a live stream of healing events.",
  stack: ["Go", "HashiCorp memberlist", "Prometheus", "Docker Compose", "GitHub Actions"],
  highlights: [
    {
      title: "Consistent hashing with virtual nodes",
      body: "150 virtual nodes per member keep keys evenly spread, so a node leaving moves only its own share.",
    },
    {
      title: "Quorum, not unanimity",
      body: "Each key lives on three replicas; reads and writes succeed once two answer, so one node can be down without anyone noticing.",
    },
    {
      title: "Healing you can watch",
      body: "Health probes, hinted handoff, anti-entropy sync and key re-homing, each reported as a server-sent event.",
    },
  ],
  metrics: [
    { value: "3", label: "replicas per key" },
    { value: "2 of 3", label: "replicas needed for a read or write" },
    { value: "150", label: "virtual nodes per member" },
  ],
  decisions: [
    {
      title: "Hints for short outages, anti-entropy for everything else",
      body: "Writes meant for a down replica are kept locally and replayed when it returns; a periodic snapshot diff catches anything hints missed.",
    },
    {
      title: "Healing is observable",
      body: "Every heal event is published on /v1/healing/events, so recovery can be watched instead of inferred from logs.",
    },
  ],
  evidence: ["CI runs go test, go vet and a build on every push and pull request.", "A Docker Compose file brings up a 3-node cluster for local experiments."],
  limitations: ["No published results yet from partition or chaos testing."],
  media: [],
  links: [{ kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/self-healing-distributed-cache" }],
  visual: "cluster-lab",
  accent: "#38bdf8",
};

export const vitals: Project = {
  slug: "vitals",
  title: "Vitals",
  tagline: "System vitals in a sliver of glass.",
  summary:
    "A floating glass HUD for macOS with live CPU and memory, your next event and a music visualiser — tuned until it barely registers on the machine it measures.",
  categories: ["Product", "Tools"],
  tier: "selected",
  period: { start: "2026-09", end: "2026-09" },
  status: "Personal app",
  platform: "macOS 14+ · Apple Silicon",
  role: "Personal project — sole author",
  problem:
    "A monitor that costs noticeable CPU is mostly measuring itself. The HUD has to sit above everything without stealing focus, battery or attention.",
  contribution:
    "Wrote the app in Swift: the samplers, one shared scheduler, the HUD and menu bar, a calendar countdown, and a system-audio visualiser built on Core Audio process taps.",
  stack: ["Swift", "SwiftUI", "AppKit", "EventKit", "Core Audio"],
  highlights: [
    {
      title: "One timer for everything",
      body: "CPU, memory and process sampling share a single scheduler instead of each waking the machine on its own.",
    },
    {
      title: "Never takes focus",
      body: "No Dock icon, no app-switcher entry, and it never steals keyboard focus from whatever you're typing in.",
    },
    {
      title: "Hears what your Mac plays",
      body: "Seven visualisers driven by a Core Audio tap on system output, using macOS Liquid Glass where available.",
    },
  ],
  metrics: [
    { value: "0.135%", label: "of one core at idle, down from 0.227%" },
    { value: "1.0/s", label: "timer wake-ups, down from 2.2" },
    { value: "0.27/s", label: "screen redraws, down from 2.46" },
  ],
  decisions: [
    {
      title: "Measure inside the app",
      body: "A built-in diagnostics pane and a 30-second benchmark mode produced the before-and-after numbers.",
    },
  ],
  evidence: ["Before/after measurements recorded by the app's own benchmark mode."],
  limitations: ["Ad-hoc signed and not distributed.", "No automated tests yet."],
  media: [],
  links: [],
  visual: "vitals-efficiency",
  accent: "#a78bfa",
};

export const scopeForge: Project = {
  slug: "scopeforge",
  title: "ScopeForge",
  tagline: "Security research with the boundaries built in.",
  summary:
    "A local workbench for authorized bug-bounty research: record scope, run bounded HTTP posture checks, review evidence and draft reports.",
  categories: ["Tools", "Systems"],
  tier: "selected",
  period: { start: "2025-10", end: "2026-09" },
  status: "Open source · v0.2",
  platform: "Local web app · FastAPI and React",
  role: "Personal project — sole author",
  problem:
    "Security tools make it easy to send traffic and hard to prove you stayed in bounds. This one starts from written authorization and checks every request against it.",
  contribution:
    "Built the FastAPI service, the SQLite-backed job queue, 52 check rules, the offline research lab and the React dashboard, with backend and Playwright tests in CI.",
  stack: ["Python", "FastAPI", "SQLite (WAL)", "React", "TypeScript", "Playwright", "Docker"],
  highlights: [
    {
      title: "Scope checked on every request",
      body: "Exact origins, excluded paths, authorization expiry and revocation, public-address validation, connection pinning and verified TLS.",
    },
    {
      title: "One request, no surprises",
      body: "A single GET per URL with no redirects, batches of at most 20 URLs, and per-program pacing.",
    },
    {
      title: "An offline research lab",
      body: "Analyse captured HTTP responses or OpenAPI documents with zero requests to the target.",
    },
  ],
  metrics: [
    { value: "52", label: "check rules: 24 header, 13 HTML, 15 OpenAPI" },
    { value: "20", label: "URLs at most per batch" },
  ],
  decisions: [
    {
      title: "Conservative, explicit scope",
      body: "Only exact origins the user entered are ever contacted; queries, credentials and ambiguous encodings are rejected before a request exists.",
    },
    {
      title: "Evolve the database queue before adding a broker",
      body: "A durable SQLite queue serves one operator; the documented team design adds workers and leases only when measured load calls for them.",
    },
  ],
  evidence: ["Backend tests and Playwright end-to-end tests, run in CI.", "Documented architecture, threat model and verification results."],
  limitations: [
    "Built for one trusted local user; team features are designed, not implemented.",
    "An observation is not proof of an exploitable vulnerability.",
  ],
  media: [
    {
      id: "scopeforge-dashboard",
      kind: "screenshot",
      src: "/projects/scopeforge/dashboard.png",
      width: 1440,
      height: 1502,
      alt: "ScopeForge dashboard with synthetic demo data: program, asset, scan and finding counts, recent scans against a training lab, and findings by severity.",
    },
    {
      id: "scopeforge-lab",
      kind: "screenshot",
      src: "/projects/scopeforge/research-lab.png",
      width: 1440,
      height: 1401,
      alt: "ScopeForge offline research lab with a synthetic HTTP capture loaded for analysis without contacting any target.",
    },
    {
      id: "scopeforge-catalog",
      kind: "screenshot",
      src: "/projects/scopeforge/check-catalog.png",
      width: 1440,
      height: 1080,
      alt: "ScopeForge check catalog listing each implemented rule with its inputs and limits.",
    },
  ],
  links: [{ kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/ScopeForge" }],
  visual: "scopeforge-guard",
  accent: "#c4f16b",
};

export const rxForce: Project = {
  slug: "rxforce-sfa",
  title: "RxForce SFA",
  tagline: "Field sales that works without signal.",
  summary:
    "An offline-first sales-force app for pharmaceutical field reps: visit reports, orders, expenses and approvals that sync when the network returns.",
  categories: ["Product", "AI & Data"],
  tier: "selected",
  period: { start: "2026-02", end: "2026-03" },
  status: "Prototype",
  platform: "Flutter · Android, iOS and web",
  role: "Product prototype — sole developer",
  problem:
    "Medical reps spend the day in clinics and on the road, often without a connection. Their reports can't wait for signal, and managers still need approvals and targets on time.",
  contribution:
    "Built the Flutter app with a local database and sync queue, a five-level role hierarchy, and Cloud Functions for approvals, reminders, targets and AI-assisted reporting.",
  stack: ["Flutter", "Riverpod", "Drift (SQLite)", "Cloud Firestore", "Cloud Functions", "Gemini", "ML Kit"],
  highlights: [
    {
      title: "Write locally first",
      body: "Every action lands in a local table and a sync queue, then retries with increasing delays — up to ten times — once the network is back.",
    },
    {
      title: "Five levels of responsibility",
      body: "Super admin, admin, regional manager, area manager and medical rep, each with its own routes and approvals.",
    },
    {
      title: "Reports from voice and paper",
      body: "Gemini turns a spoken visit summary into a structured report, and on-device OCR reads printed documents.",
    },
  ],
  metrics: [
    { value: "22", label: "feature modules" },
    { value: "25", label: "local database tables" },
    { value: "10", label: "sync retries, with growing delays" },
  ],
  decisions: [
    {
      title: "Last write wins",
      body: "Conflicts resolve to the most recent change — simple and predictable for single-owner records like a rep's own visit reports.",
    },
    {
      title: "Scheduled functions for the routine",
      body: "Daily reminders at 17:00 and monthly target calculation run as scheduled Cloud Functions, not on anyone's phone.",
    },
  ],
  evidence: ["A CI workflow analyzes and builds every push, and builds Android releases on tags."],
  limitations: [
    "No meaningful automated tests yet.",
    "Last-write-wins can drop concurrent edits to shared records.",
    "Not currently deployed.",
  ],
  media: [],
  links: [],
  visual: "rx-sync",
  accent: "#60a5fa",
};

export const fraudRing: Project = {
  slug: "fraud-ring-engine",
  title: "Fraud Ring Engine",
  tagline: "Fraud travels in rings. Follow the edges.",
  summary:
    "A streaming pipeline that turns card transactions into a live graph, so a transaction can be judged by the company it keeps.",
  categories: ["AI & Data", "Systems"],
  tier: "selected",
  period: { start: "2026-06", end: "2026-08" },
  status: "Prototype · open source",
  platform: "10 services on Docker Compose",
  role: "Personal project — sole author",
  problem:
    "Fraudsters share devices, cards and merchants. Models that score one row at a time miss those links; a graph of who touched what makes them visible.",
  contribution:
    "Built the ingestion API, the Flink job that writes users, cards and transactions into Memgraph, a scoring service over 2-hop neighbourhoods, and a synthetic fraud-ring traffic generator.",
  stack: ["Spring Boot", "Apache Kafka", "Apache Flink", "Redis", "Memgraph", "FastAPI", "PyTorch Geometric", "Streamlit"],
  highlights: [
    {
      title: "Streaming into a graph",
      body: "Transactions enter through a Spring Boot API onto Kafka; Flink keeps rolling counts in Redis and writes nodes and edges into Memgraph.",
    },
    {
      title: "Judged by the neighbourhood",
      body: "The scoring service pulls a transaction's 2-hop neighbourhood and runs it through a graph attention network.",
    },
    {
      title: "Rings on demand",
      body: "A simulator generates normal traffic and coordinated rings that share devices and cards, so the pipeline can be exercised end to end.",
    },
  ],
  metrics: [{ value: "2-hop", label: "neighbourhood evaluated per transaction" }],
  decisions: [
    {
      title: "A graph store for relationships, Redis for counts",
      body: "Memgraph answers who-is-connected-to-whom; Redis holds the rolling per-card features that change on every event.",
    },
  ],
  evidence: ["The whole stack starts with one Docker Compose command, including the traffic simulator."],
  limitations: [
    "The graph attention model is defined but not trained, and scoring currently runs on placeholder graph inputs — the pipeline is the finished part, not the model.",
    "No automated tests.",
  ],
  media: [],
  links: [{ kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/fraud-ring-engine" }],
  visual: "fraud-graph",
  accent: "#f87171",
};

export const apiGateway: Project = {
  slug: "ai-api-gateway",
  title: "Anomaly Gateway",
  tagline: "A gateway that notices when traffic looks wrong.",
  summary:
    "A Spring Boot API gateway that streams request metadata through Kafka to a Python service, which scores every request with an Isolation Forest.",
  categories: ["AI & Data", "Systems"],
  tier: "selected",
  period: { start: "2026-08", end: "2026-08" },
  status: "Prototype · open source",
  platform: "5 services on Docker Compose",
  role: "Personal project — sole author",
  problem:
    "Scraping, probing and floods look normal one request at a time. Scored as a stream, they stand out.",
  contribution:
    "Built the Spring Boot gateway, the Kafka pipeline, the FastAPI scoring service and the PostgreSQL audit store.",
  stack: ["Java 17", "Spring Boot 3", "Apache Kafka", "FastAPI", "scikit-learn", "PostgreSQL", "Docker"],
  highlights: [
    {
      title: "Scoring off the request path",
      body: "The gateway publishes IP, size, duration, status and URI to Kafka, so scoring never slows the request it describes.",
    },
    {
      title: "Unsupervised on purpose",
      body: "An Isolation Forest needs no labelled attack data — it learns what normal looks like and flags what's easy to isolate.",
    },
  ],
  metrics: [{ value: "5", label: "request features per event" }],
  decisions: [
    {
      title: "Audit first, block later",
      body: "Scores are stored for review in PostgreSQL; automatic IP blocking above a threshold is the next step, not a shipped feature.",
    },
  ],
  evidence: ["Docker Compose brings up the gateway, scorer, Kafka and PostgreSQL together."],
  limitations: ["Scores are logged, not yet acted on.", "No automated tests."],
  media: [],
  links: [{ kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/ai-api-gateway" }],
  visual: "gateway-anomaly",
  accent: "#fb923c",
};

export const skintellect: Project = {
  slug: "skintellect",
  title: "Skintellect",
  tagline: "From a photo to a routine.",
  summary:
    "A skincare web app that finds and classifies skin conditions in a photo, then matches products from a catalogue and adds short, plain-language advice.",
  categories: ["AI & Data"],
  tier: "selected",
  period: { start: "2025-02", end: "2025-02" },
  status: "Archived",
  platform: "Flask web app",
  role: "Personal project — sole author",
  problem:
    "Skincare advice is either generic or expensive. A photo, a short questionnaire and a large product catalogue can make it specific.",
  contribution:
    "Built the Flask app, the image pipeline — hosted YOLOv8 detection plus a Keras classifier — catalogue-based recommendations, Google sign-in and appointment booking.",
  stack: ["Python", "Flask", "OpenCV", "YOLOv8 (Roboflow)", "TensorFlow / Keras", "Gemini", "SQLite"],
  highlights: [
    {
      title: "Detect, then classify",
      body: "A hosted YOLOv8 model finds regions of concern; an EfficientNetV2-based Keras model classifies the condition.",
    },
    {
      title: "Products from a catalogue",
      body: "Detected conditions map to products in a curated skincare dataset.",
    },
    {
      title: "Advice in under 50 words",
      body: "Gemini writes one short, friendly explanation of the result and one or two ingredients to look for.",
    },
  ],
  metrics: [],
  decisions: [],
  evidence: ["Exploration and product-recommendation notebooks are in the repository."],
  limitations: ["An earlier project; the hosted demo is offline.", "Advice is informational, not medical."],
  media: [],
  links: [{ kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/Skintellect" }],
  visual: "skintellect-pipeline",
  accent: "#f472b6",
};

export const urlShortener: Project = {
  slug: "url-shortener",
  title: "URL Shortener",
  tagline: "Short codes that can't collide.",
  summary:
    "A take-home URL shortener with collision-free codes by construction, SSRF-hardened validation, and a test suite that never touches the network.",
  categories: ["Systems"],
  tier: "selected",
  period: { start: "2026-07", end: "2026-07" },
  status: "Take-home exercise · open source",
  platform: "Node.js · Express 5 · SQLite",
  role: "Personal project — sole author",
  problem:
    "Random codes make collisions unlikely, not impossible — and a service that stores arbitrary URLs is an SSRF risk waiting to happen.",
  contribution:
    "Designed the codec, the SSRF validator and a layered Express service, with unit and integration tests that inject a fake DNS resolver.",
  stack: ["TypeScript", "Express 5", "SQLite", "Zod", "Vitest", "Supertest"],
  highlights: [
    {
      title: "Collision-free by construction",
      body: "Every code is the Base62 form of the row's auto-increment id: ids never repeat, and Base62 is a bijection — so codes can't either.",
    },
    {
      title: "Every DNS answer checked",
      body: "Loopback, private, link-local and metadata ranges are blocked, including decimal and hex IP tricks and mixed public/private DNS answers.",
    },
    {
      title: "Aliases can't shadow the future",
      body: "A custom alias that equals a code the generator would emit later bumps the sequence past it in the same transaction.",
    },
  ],
  metrics: [{ value: "51", label: "unit and integration tests" }],
  decisions: [
    {
      title: "Duplicates get new codes on purpose",
      body: "Two campaigns pointing at the same page get separate codes, so their clicks can be attributed separately.",
    },
    {
      title: "301, and when I'd switch",
      body: "Mappings never change, so a permanent redirect lets browsers cache it. If click analytics mattered more, a 302 is a one-line change.",
    },
  ],
  evidence: ["Integration tests run against an in-memory database with a fake DNS resolver — no network, no setup."],
  limitations: [
    "Sequential codes are enumerable; a keyed permutation before encoding would hide creation order.",
    "DNS rebinding is an accepted risk because the service only redirects and never fetches URLs itself.",
  ],
  media: [],
  links: [{ kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/url-shortener" }],
  visual: "shortener-lab",
  accent: "#22d3ee",
};

export const padhnaThoPadega: Project = {
  slug: "padhna-tho-padega",
  title: "PadhnaThoPadega",
  tagline: "Watch the algorithm think.",
  summary: "Step-through visualizations of classic LeetCode problems, with solutions in Java, Python and C++.",
  categories: ["Tools"],
  tier: "selected",
  period: { start: "2026-07", end: "2026-07" },
  status: "Open source",
  platform: "Next.js 16 web app",
  role: "Personal project — sole author",
  problem: "Reading a solution isn't the same as watching it run. Stepping through the data structures makes the idea stick.",
  contribution:
    "Built the step engine and animated visualizations for Two Sum, Valid Parentheses, Binary Tree Level Order Traversal, Merge Intervals and Climbing Stairs.",
  stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Framer Motion"],
  highlights: [
    {
      title: "Every step visible",
      body: "Hash maps, stacks and queues update one step at a time as the solution runs.",
    },
    {
      title: "Three languages",
      body: "Each problem ships with a solution in Java, Python and C++.",
    },
  ],
  metrics: [{ value: "5", label: "problems, each in 3 languages" }],
  decisions: [],
  evidence: [],
  limitations: ["Five problems so far."],
  media: [],
  links: [{ kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/PadhnaThoPadega" }],
  visual: "two-sum",
  accent: "#facc15",
};
