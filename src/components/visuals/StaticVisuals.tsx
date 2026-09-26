import Image from "next/image";
import { scopeForge } from "@/content/projects/selected";
import { SKIN_STEPS } from "@/content/skintellect-pipeline";
import { Stage } from "./Stage";

/* ── Vitals ──────────────────────────────────────────────────────────────── */

const VITALS = [
  { label: "CPU, share of one core", before: 0.227, after: 0.135, unit: "%" },
  { label: "Timer wake-ups", before: 2.2, after: 1.0, unit: "/s" },
  { label: "Screen redraws", before: 2.46, after: 0.27, unit: "/s" },
];

export function VitalsEfficiency() {
  return (
    <Stage
      title="A monitor that barely registers"
      kind="Measured"
      caption="Before-and-after figures recorded by the app's own 30-second benchmark mode, as published in its README. The HUD beside them is a drawing."
    >
      <div className="grid items-center gap-8 md:grid-cols-[1fr_0.8fr]">
        <ul className="grid gap-5">
          {VITALS.map((v) => {
            const cut = Math.round((1 - v.after / v.before) * 100);
            return (
              <li key={v.label}>
                <p className="flex justify-between text-sm">
                  <span>{v.label}</span>
                  <span className="font-mono text-violet-200">−{cut}%</span>
                </p>
                <div className="mt-2 grid gap-1" role="img" aria-label={`${v.label}: ${v.before}${v.unit} before, ${v.after}${v.unit} after`}>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 rounded-full bg-white/20" style={{ width: "100%" }} />
                    <span className="w-16 flex-none text-right font-mono text-xs text-dim-inverse">
                      {v.before}
                      {v.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 rounded-full bg-violet-400" style={{ width: `${(v.after / v.before) * 100}%` }} />
                    <span className="ml-auto w-16 flex-none text-right font-mono text-xs text-violet-100">
                      {v.after}
                      {v.unit}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <VitalsHud />
      </div>
    </Stage>
  );
}

/**
 * `glass`: blur what's behind it, as the real HUD does. Off where the HUD
 * sits on a plain wallpaper that moves with scroll — the blur would repaint
 * every frame and show nothing a tinted fill doesn't.
 */
export function VitalsHud({ glass = true }: { glass?: boolean }) {
  return (
    <div
      role="img"
      aria-label="Illustration of the Vitals HUD: a translucent card with CPU and memory rings, a next-event countdown and a small spectrum."
      className={`relative mx-auto w-full max-w-[17rem] rounded-[1.75rem] p-5 ring-1 ring-white/15 ${glass ? "bg-white/8 backdrop-blur-xl" : "bg-[#1b1830]/80"}`}
      style={{ boxShadow: "0 0 0 1px rgb(167 139 250 / 0.25), 0 0 40px -8px rgb(167 139 250 / 0.45)" }}
    >
      <div className="flex justify-around">
        {[
          { label: "CPU", pct: 12, color: "#a78bfa" },
          { label: "MEM", pct: 58, color: "#38bdf8" },
        ].map((g) => (
          <svg key={g.label} viewBox="0 0 44 44" className="w-20" aria-hidden="true">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="4" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke={g.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(g.pct / 100) * 113} 113`}
              transform="rotate(-90 22 22)"
            />
            <text x="22" y="21" fontSize="8" fill="#f5f5f7" textAnchor="middle" fontWeight="600">
              {g.pct}%
            </text>
            <text x="22" y="30" fontSize="5" fill="#a1a1a6" textAnchor="middle">
              {g.label}
            </text>
          </svg>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-inverse">Next · Design review</p>
      <p className="font-mono text-lg">in 24 min</p>
      <div className="mt-3 flex h-8 items-end gap-0.5" aria-hidden="true">
        {[3, 6, 9, 14, 10, 7, 12, 18, 13, 8, 5, 9, 15, 11, 6, 4].map((h, i) => (
          <span key={i} className="flex-1 rounded-sm bg-linear-to-t from-violet-500/60 to-sky-300/80" style={{ height: `${h * 5}%` }} />
        ))}
      </div>
    </div>
  );
}

/* ── Skintellect ─────────────────────────────────────────────────────────── */


export function SkintellectPipeline() {
  return (
    <Stage
      title="From a photo to a routine"
      kind="Diagram"
      caption="The pipeline as built in the repository's app.py. The abstract face is a drawing; no photos of people are shown."
    >
      <div className="grid items-center gap-6 md:grid-cols-[0.5fr_1.5fr]">
        <svg viewBox="0 0 120 140" className="mx-auto w-36" role="img" aria-label="Abstract face outline with two detection boxes">
          <ellipse cx="60" cy="70" rx="42" ry="55" fill="rgb(244 114 182 / 0.08)" stroke="rgb(244 114 182 / 0.6)" strokeWidth="1.2" />
          <rect x="30" y="72" width="22" height="16" rx="3" fill="none" stroke="#f472b6" strokeWidth="1.4" strokeDasharray="3 2" />
          <rect x="70" y="42" width="18" height="14" rx="3" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="3 2" />
          <text x="41" y="96" fontSize="6" fill="#f9a8d4" textAnchor="middle">
            0.91
          </text>
          <text x="79" y="63" fontSize="6" fill="#fcd34d" textAnchor="middle">
            0.84
          </text>
        </svg>
        <ol className="grid gap-2 sm:grid-cols-5">
          {SKIN_STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <span className="font-mono text-[0.6875rem] text-pink-300">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-1 text-sm font-semibold">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-inverse">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Stage>
  );
}

/* ── ScopeForge ──────────────────────────────────────────────────────────── */

const GUARDS = [
  "Is the origin exactly one the program authorized?",
  "Is the path outside every excluded prefix?",
  "Is the authorization still valid — not expired or revoked?",
  "Does the host resolve to a public address? Pin that connection.",
  "Verified TLS, one GET, no redirects.",
];

const FAMILIES = [
  { label: "Response headers", n: 24, color: "#c4f16b" },
  { label: "Static HTML", n: 13, color: "#86efac" },
  { label: "OpenAPI design", n: 15, color: "#5eead4" },
];

export function ScopeForgeGuard() {
  const shots = scopeForge.media.filter((m) => m.kind === "screenshot");
  const total = FAMILIES.reduce((s, f) => s + f.n, 0);

  return (
    <div className="grid gap-6">
      <Stage
        title="Every request passes the scope guard"
        kind="Diagram"
        caption="The checks ScopeForge applies before a request exists, and the 52 check rules it can run, from its README."
      >
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <ol className="grid gap-2">
            {GUARDS.map((g, i) => (
              <li key={g} className="flex gap-3 rounded-xl bg-white/4 px-3 py-2.5 text-sm ring-1 ring-white/8">
                <span className="font-mono text-xs text-lime-300">{i + 1}</span>
                {g}
              </li>
            ))}
          </ol>
          <div>
            <p className="text-sm font-semibold">{total} check rules</p>
            <div className="mt-3 flex h-4 overflow-hidden rounded-full" role="img" aria-label={FAMILIES.map((f) => `${f.n} ${f.label}`).join(", ")}>
              {FAMILIES.map((f) => (
                <span key={f.label} style={{ width: `${(f.n / total) * 100}%`, background: f.color }} />
              ))}
            </div>
            <ul className="mt-3 grid gap-1.5 text-sm">
              {FAMILIES.map((f) => (
                <li key={f.label} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: f.color }} />
                  <span className="flex-1 text-muted-inverse">{f.label}</span>
                  <span className="font-mono">{f.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Stage>

      <Stage title="The workbench" kind="Screenshots" caption="Screenshots from the project's repository, showing its synthetic demo workspace — every finding is labelled synthetic.">
        <div className="grid gap-4 md:grid-cols-2">
          {shots.map((m, i) => (
            <Image
              key={m.id}
              src={m.src!}
              alt={m.alt}
              width={m.width}
              height={m.height}
              sizes="(min-width: 768px) 40vw, 90vw"
              className={`h-auto w-full rounded-xl ring-1 ring-white/10 ${i === 0 ? "md:col-span-2" : ""}`}
            />
          ))}
        </div>
      </Stage>
    </div>
  );
}
