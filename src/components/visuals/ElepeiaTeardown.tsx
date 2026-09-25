"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Control, Stage } from "./Stage";

const TABS = ["Rendering", "Images", "Checkout"] as const;
type Tab = (typeof TABS)[number];

export default function ElepeiaTeardown() {
  const [tab, setTab] = useState<Tab>("Rendering");
  const id = useId();

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.indexOf(tab);
    const next = event.key === "ArrowRight" ? (i + 1) % TABS.length : event.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : null;
    if (next === null) return;
    event.preventDefault();
    setTab(TABS[next]);
    document.getElementById(`${id}-tab-${TABS[next]}`)?.focus();
  };

  return (
    <Stage
      title="Three fixes, before and after"
      kind="Diagram"
      caption="Figures from the project's README: ~5 MB originals versus ~73 KB optimized images, a 30-second cached maintenance flag, and the purchase pipeline as implemented. Product names and prices are sample data."
    >
      <div role="tablist" aria-label="Fix" className="inline-flex rounded-full bg-white/6 p-1 ring-1 ring-white/10 ring-inset">
        {TABS.map((t) => (
          <button
            key={t}
            id={`${id}-tab-${t}`}
            role="tab"
            type="button"
            aria-selected={tab === t}
            aria-controls={`${id}-panel`}
            tabIndex={tab === t ? 0 : -1}
            onKeyDown={onKey}
            onClick={() => setTab(t)}
            className={`min-h-10 rounded-full px-4 text-sm font-medium transition-colors ${tab === t ? "bg-fg-inverse text-ink" : "text-muted-inverse hover:text-fg-inverse"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`} className="mt-6">
        {tab === "Rendering" && <Rendering />}
        {tab === "Images" && <Images />}
        {tab === "Checkout" && <Checkout />}
      </div>
    </Stage>
  );
}

function BeforeAfter({ after, setAfter }: { after: boolean; setAfter: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      <Control active={!after} onClick={() => setAfter(false)}>
        Before
      </Control>
      <Control active={after} onClick={() => setAfter(true)}>
        After
      </Control>
    </div>
  );
}

function Rendering() {
  const [after, setAfter] = useState(true);
  const steps = after
    ? ["Edge middleware checks the store flag (cached 30 s)", "Server renders the catalogue", "HTML arrives with products in it"]
    : ["Server sends the page", "JavaScript downloads and hydrates", "A client-side hook checks maintenance mode", "Only then do products render"];

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="text-lg font-semibold tracking-[-0.015em]">
          {after ? "Real HTML, for shoppers and crawlers." : "Every route shipped a spinner."}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-inverse">
          {after
            ? "The maintenance check moved into edge middleware, in front of rendering. The common case — store open — costs a cached boolean."
            : "A maintenance-mode guard lived in the React tree, so server-rendered pages waited for JavaScript before showing anything."}
        </p>
        <ol className="mt-4 grid gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm">
              <span className={`grid size-6 flex-none place-items-center rounded-full font-mono text-xs ${after ? "bg-emerald-300/15 text-emerald-200" : "bg-rose-300/15 text-rose-200"}`}>
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <BeforeAfter after={after} setAfter={setAfter} />
        </div>
      </div>
      <div className="rounded-2xl bg-ink p-4 font-mono text-xs leading-relaxed ring-1 ring-white/8" aria-label={after ? "HTML with product markup" : "HTML containing only a spinner"}>
        <p className="text-dim-inverse">GET / → view-source</p>
        {after ? (
          <pre className="mt-2 whitespace-pre-wrap text-emerald-100">{`<main>
  <section aria-label="New arrivals">
    <article>
      <img src="/_next/image?url=…&w=640" …>
      <h3>Linen overshirt</h3>
      <p>₹4,490</p>
    </article>
    <article>…</article>
    <article>…</article>
  </section>
</main>`}</pre>
        ) : (
          <pre className="mt-2 whitespace-pre-wrap text-rose-100">{`<main>
  <div class="spinner"
       aria-busy="true"></div>
</main>

<!-- 0 products in the HTML -->`}</pre>
        )}
      </div>
    </div>
  );
}

function Images() {
  const [after, setAfter] = useState(true);
  const layers = [
    'Native loading="lazy"',
    "IntersectionObserver in the card",
    "IntersectionObserver in the image",
    "useMobileLazyLoading hook",
    "opacity-0 until a JS onLoad",
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="text-lg font-semibold tracking-[-0.015em]">Preload what the page will actually use.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-inverse">
          Preloads pointed at the raw camera originals while the page rendered optimized images — 68 times the bytes, at high priority, for a file that was then thrown away.
        </p>
        <div className="mt-5 grid gap-3" role="img" aria-label={after ? "Preload is about 73 kilobytes" : "Preload is about 5 megabytes, 68 times larger"}>
          {[
            { label: "Preloaded", kb: after ? 73 : 5000, tone: after ? "bg-emerald-300" : "bg-rose-300" },
            { label: "Rendered", kb: 73, tone: "bg-emerald-300" },
          ].map((b) => (
            <div key={b.label}>
              <p className="flex justify-between text-xs text-muted-inverse">
                <span>{b.label}</span>
                <span className="font-mono">{b.kb >= 1000 ? `≈${(b.kb / 1000).toFixed(0)} MB` : `≈${b.kb} KB`}</span>
              </p>
              <div className="mt-1 h-3 rounded-full bg-white/6">
                <div className={`h-full rounded-full transition-[width] duration-700 ${b.tone}`} style={{ width: `${Math.max(1.5, (b.kb / 5000) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <BeforeAfter after={after} setAfter={setAfter} />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">Lazy-loading layers on the main image</p>
        <ol className="mt-3 grid gap-2">
          {layers.map((l) => (
            <li
              key={l}
              className={`rounded-xl px-3 py-2 text-sm ring-1 transition-colors ${after ? "text-dim-inverse line-through ring-white/6" : "bg-rose-300/10 text-rose-100 ring-rose-300/40"}`}
            >
              {l}
            </li>
          ))}
          <li className={`rounded-xl px-3 py-2 text-sm ring-1 ${after ? "bg-emerald-300/10 text-emerald-100 ring-emerald-300/50" : "text-dim-inverse ring-white/6"}`}>
            next/image with priority on the one image that matters
          </li>
        </ol>
      </div>
    </div>
  );
}

const SCENARIOS = {
  "Tab stays open": { browser: true, webhook: true, note: "Both arrive. The first commits the order and decrements stock in one transaction; the second finds it and does nothing." },
  "Tab closes after paying": { browser: false, webhook: true, note: "The customer is gone, but Razorpay's payment.captured webhook commits the order from the saved order intent." },
} as const;

function Checkout() {
  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>("Tab closes after paying");
  const s = SCENARIOS[scenario];
  const steps = [
    { who: "Server", text: "Re-prices every cart line from Firestore — client totals are compared, never trusted" },
    { who: "Server", text: "Creates the Razorpay order and saves an order intent for this exact amount" },
    { who: "Customer", text: "Pays with Razorpay" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SCENARIOS) as (keyof typeof SCENARIOS)[]).map((k) => (
          <Control key={k} active={scenario === k} onClick={() => setScenario(k)}>
            {k}
          </Control>
        ))}
      </div>
      <ol className="mt-5 grid gap-2">
        {steps.map((step, i) => (
          <li key={step.text} className="flex gap-3 rounded-xl bg-white/4 px-3 py-2.5 text-sm">
            <span className="font-mono text-xs text-dim-inverse">{i + 1}</span>
            <span>
              <span className="font-semibold">{step.who}.</span> {step.text}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {[
          { label: "Browser → /api/orders/create", on: s.browser },
          { label: "Webhook → payment.captured", on: s.webhook },
        ].map((path) => (
          <div
            key={path.label}
            className={`rounded-xl px-3 py-2.5 font-mono text-xs ring-1 transition-colors ${path.on ? "bg-sky-300/10 text-sky-100 ring-sky-300/50" : "text-dim-inverse line-through ring-white/8"}`}
          >
            4 · {path.label}
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-xl bg-emerald-300/10 px-3 py-2.5 text-sm ring-1 ring-emerald-300/50">
        <span className="font-mono text-xs text-emerald-200">5 · commitOrderWithStockDecrement</span>
        <p className="mt-1 text-emerald-50" aria-live="polite">
          {s.note}
        </p>
      </div>
    </div>
  );
}
