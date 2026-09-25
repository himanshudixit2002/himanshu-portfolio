"use client";

import { useId, useState } from "react";
import { breakdown, encode } from "@/lib/sim/base62";
import { SAMPLE_URLS, validate } from "@/lib/sim/ssrf";
import { Control, Stage } from "./Stage";

export default function ShortenerLab() {
  const [id, setId] = useState(39134);
  const [url, setUrl] = useState<string>(SAMPLE_URLS[2]);
  const idField = useId();
  const urlField = useId();
  const verdict = validate(url);
  const digits = breakdown(id);

  return (
    <Stage
      title="Codes that can't collide, URLs that can't reach inside"
      kind="Simulation"
      caption="Runs the shortener's Base62 codec and SSRF rules in your browser. DNS is simulated with sample records; no lookups or requests are made."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby={`${idField}-h`}>
          <h3 id={`${idField}-h`} className="text-lg font-semibold tracking-[-0.015em]">
            Row id → short code
          </h3>
          <p className="mt-1 text-sm text-muted-inverse">
            Each new row gets the next auto-increment id. Its Base62 form is the code — ids never repeat, so neither can codes.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label htmlFor={idField} className="grid gap-1 text-xs text-dim-inverse">
              Row id
              <input
                id={idField}
                type="number"
                min={0}
                max={999_999_999}
                value={id}
                onChange={(e) => setId(Math.min(999_999_999, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
                className="min-h-11 w-40 rounded-full bg-ink px-4 font-mono text-sm text-fg-inverse ring-1 ring-white/15"
              />
            </label>
            <Control onClick={() => setId((n) => n + 1)}>Next row</Control>
            <Control onClick={() => setId(125)}>125</Control>
            <Control onClick={() => setId(39134)}>39134</Control>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="font-mono text-sm text-dim-inverse">sho.rt/</span>
            <span className="font-mono text-4xl font-semibold tracking-tight text-cyan-200" aria-live="polite">
              {encode(id)}
            </span>
          </div>
          <ol className="mt-4 flex flex-wrap gap-2" aria-label="Positional breakdown">
            {digits.map((d, i) => (
              <li key={i} className="rounded-xl bg-white/5 px-3 py-2 text-center ring-1 ring-white/8">
                <span className="block font-mono text-lg text-cyan-100">{d.char}</span>
                <span className="block font-mono text-[0.6875rem] text-dim-inverse">
                  {d.digit} × 62<sup>{Math.round(Math.log(d.place) / Math.log(62))}</sup>
                </span>
              </li>
            ))}
          </ol>
          {id === 39134 && (
            <p className="mt-3 text-xs text-amber-200">
              An alias of &ldquo;abc&rdquo; would collide with this future code — so the service bumps the sequence past 39134 when that alias is taken.
            </p>
          )}
        </section>

        <section aria-labelledby={`${urlField}-h`}>
          <h3 id={`${urlField}-h`} className="text-lg font-semibold tracking-[-0.015em]">
            Is this URL safe to store?
          </h3>
          <label htmlFor={urlField} className="sr-only">
            URL to check
          </label>
          <input
            id={urlField}
            value={url}
            maxLength={200}
            onChange={(e) => setUrl(e.target.value)}
            spellCheck={false}
            className="mt-3 min-h-11 w-full rounded-full bg-ink px-4 font-mono text-sm text-fg-inverse ring-1 ring-white/15"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SAMPLE_URLS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUrl(u)}
                className="min-h-8 max-w-full truncate rounded-full bg-white/6 px-2.5 font-mono text-[0.6875rem] text-muted-inverse hover:bg-white/12 hover:text-fg-inverse"
              >
                {u.replace(/^https?:\/\//, "")}
              </button>
            ))}
          </div>
          <ol className="mt-4 grid gap-1.5">
            {verdict.checks.map((c) => (
              <li key={c.label} className="flex gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-5 flex-none place-items-center rounded-full text-[0.6875rem] font-bold ${c.pass ? "bg-emerald-300/20 text-emerald-200" : "bg-rose-300/20 text-rose-200"}`}
                >
                  {c.pass ? "✓" : "✕"}
                </span>
                <span>
                  <span className="font-medium">{c.label}</span> <span className="text-muted-inverse">— {c.detail}</span>
                  <span className="sr-only">{c.pass ? " (passed)" : " (failed)"}</span>
                </span>
              </li>
            ))}
          </ol>
          <p
            aria-live="polite"
            className={`mt-4 rounded-xl px-3 py-2 text-sm font-semibold ${verdict.accepted ? "bg-emerald-300/10 text-emerald-100" : "bg-rose-300/10 text-rose-100"}`}
          >
            {verdict.accepted ? "201 Created — stored and shortened" : "422 — rejected by the SSRF policy"}
          </p>
        </section>
      </div>
    </Stage>
  );
}
