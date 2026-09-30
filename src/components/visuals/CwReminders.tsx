"use client";

import { Fragment, useId, useMemo, useState, type ReactNode } from "react";
import { EXTENSION, N01_2026 } from "@/content/compliancewatch/documents";
import { DELIVERY, REPLIES, type Lang } from "@/content/compliancewatch/messages";
import { ACME } from "@/content/compliancewatch/rules";
import { discover } from "@/lib/explored";
import { clockTime, detectIntent, detectLanguage, formatDate, planDelivery, render, type Attempt, type DeliveryPlan } from "@/lib/sim/compliance";
import { Control, Stage } from "./Stage";

const ACCENT = "#8ab4ff";
const HOUR = 60;
const DAY = 24 * HOUR;
const LABEL = "text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase";
const CHIP = "min-h-9 px-3 text-xs";
const BUBBLE_SHADOW = "shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]";

/** The change every preview carries: 01/2026-Central Tax moving the demo business's March GSTR-3B. */
const values = (lang: Lang) => ({
  business_name: ACME.name,
  title: "File GSTR-3B for the month (2026-03)",
  previous_due_date: formatDate(EXTENSION.previousDue, lang),
  new_due_date: formatDate(EXTENSION.newDue, lang),
  source_ref: N01_2026.ref,
});

/** The notification service's email for the same change. It only exists in English. */
const EMAIL_TEMPLATE = {
  subject: "Due date extended: {title} is now due on {new_due_date}",
  body: "Due date extended for {business_name}: {title} was due on {previous_due_date} and is now due on {new_due_date}.\n\nSource: {source_ref}\n\nYou receive this because you enabled email reminders in ComplianceWatch.",
};
const fill = (template: string, v: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, name: string) => v[name] ?? `{${name}}`);
const EMAIL = { subject: fill(EMAIL_TEMPLATE.subject, values("en")), body: fill(EMAIL_TEMPLATE.body, values("en")).split("\n\n") };

type Option<T> = { label: string; value: T; lang?: Lang };

const LAST_WROTE: Option<number | null>[] = [
  { label: "10 minutes ago", value: 1 / 6 },
  { label: "3 hours ago", value: 3 },
  { label: "2 days ago", value: 48 },
  { label: "Never", value: null },
];
const HEAR_BY: Option<boolean>[] = [
  { label: "Each change", value: false },
  { label: "Daily digest", value: true },
];
const APPROVED: Option<boolean>[] = [
  { label: "Yes", value: true },
  { label: "Not yet", value: false },
];
const DOWN: Option<boolean>[] = [
  { label: "No", value: false },
  { label: "Yes", value: true },
];
const LANGUAGES: Option<Lang>[] = [
  { label: "English", value: "en" },
  { label: "हिन्दी", value: "hi", lang: "hi" },
];

/** Keywords the bot knows, as an owner might type them: English, Hindi and Hinglish. */
const REPLY_CHIPS = ["STOP", "बंद करो", "Band karo", "START", "हाँ", "HELP", "मदद"];

type Settings = { at: number; lastWrote: number | null; digest: boolean; approved: boolean; down: boolean };

/**
 * The service's plan, with the owner's last message aged to the first send:
 * the 24-hour window is counted when a message goes out, and a digest can
 * wait most of a day.
 */
function planFor({ at, lastWrote, digest, approved, down }: Settings) {
  const opts = { at, digest, templateApproved: approved, whatsappDown: down };
  // When it first goes out doesn't depend on the window, so one pass finds it.
  const firstSend = planDelivery({ ...opts, hoursSinceInbound: null }).attempts[0].at;
  const hoursAtSend = lastWrote === null ? null : lastWrote + (firstSend - at) / HOUR;
  return { plan: planDelivery({ ...opts, hoursSinceInbound: hoursAtSend }), hoursAtSend };
}

/** "26 h 5 min", or "26 hours" on the hour. */
function duration(hours: number) {
  const minutes = Math.round(hours * HOUR);
  const [h, m] = [Math.floor(minutes / HOUR), minutes % HOUR];
  return m ? `${h} h ${m} min` : `${h} hours`;
}

/** When a WhatsApp retry fell due by the backoff alone; null if the attempt isn't a retry. */
function retryDue(attempts: Attempt[], i: number) {
  if (i === 0) return null;
  const prev = attempts[i - 1];
  return prev.channel === "whatsapp" && attempts[i].channel === "whatsapp" ? prev.at + DELIVERY.backoffSeconds[i - 1] / 60 : null;
}

type Mark = "point" | "wait" | "hold" | "ok" | "fail";
type Step = { at: number | null; text: string; mark: Mark; hint?: string };

const CHANNEL = { whatsapp: "WhatsApp", email: "Email" } as const;

/** The plan in plain words, one step per line. */
function stepsOf(p: DeliveryPlan, digest: boolean, hint: string | null): Step[] {
  const steps: Step[] = [
    { at: p.queuedAt, text: "Published", mark: "point" },
    digest
      ? { at: null, text: `Waits for the ${clockTime(DELIVERY.digestAt)} digest`, mark: "wait" }
      : { at: p.readyAt, text: "Gathered for five minutes", mark: "point" },
  ];
  if (p.heldUntil !== null) steps.push({ at: null, text: `Quiet hours: held until ${clockTime(p.heldUntil)}`, mark: "hold" });
  p.attempts.forEach((a, i) => {
    const due = retryDue(p.attempts, i);
    if (due !== null && due !== a.at) steps.push({ at: null, text: `Quiet hours: retry held until ${clockTime(a.at)}`, mark: "hold" });
    steps.push({ at: a.at, text: `${CHANNEL[a.channel]} · ${a.note}`, mark: a.ok ? "ok" : "fail", hint: i === 0 && hint ? hint : undefined });
  });
  return steps;
}

/** The strip's span: from 18:00, or the hour of publication if earlier, for at least 18 hours and past the last send. */
function spanOf(p: DeliveryPlan) {
  const start = Math.floor(Math.min(p.queuedAt, 18 * HOUR) / HOUR) * HOUR;
  const last = Math.max(p.readyAt, ...p.attempts.map((a) => a.at));
  return { start, end: Math.max(start + 18 * HOUR, Math.ceil((last + HOUR) / HOUR) * HOUR) };
}

/**
 * When, and how, one rule change reaches a business owner: ComplianceWatch's
 * notification rules (planDelivery) batch it, hold it through quiet hours and
 * send it on WhatsApp as free text or an approved template, retrying and
 * falling back to email once. The plan is drawn on a clock and previewed on
 * the owner's phone, where the WhatsApp bot's keywords answer and opt the
 * owner out or back in.
 */
export default function CwReminders() {
  const slider = useId();
  const keywords = useId();
  const [at, setAt] = useState(22 * HOUR + 40);
  const [lastWrote, setLastWrote] = useState<number | null>(3);
  const [digest, setDigest] = useState(false);
  const [approved, setApproved] = useState(true);
  const [down, setDown] = useState(false);
  const [lang, setLang] = useState<Lang>("hi");
  const [optedIn, setOptedIn] = useState(true);
  const [exchange, setExchange] = useState<{ id: number; text: string } | null>(null);

  const { plan, hoursAtSend } = useMemo(() => planFor({ at, lastWrote, digest, approved, down }), [at, lastWrote, digest, approved, down]);
  const span = spanOf(plan);
  // Worth saying only when the wait itself closed the window.
  const closedByWait = lastWrote !== null && hoursAtSend !== null && lastWrote < DELIVERY.sessionHours && hoursAtSend >= DELIVERY.sessionHours;
  const steps = stepsOf(plan, digest, closedByWait ? `By then the owner last wrote ${duration(hoursAtSend)} ago` : null);
  const delivered = plan.attempts[plan.attempts.length - 1];

  const send = (text: string) => {
    const intent = detectIntent(text);
    if (intent === "opt_out") setOptedIn(false);
    if (intent === "opt_in") setOptedIn(true);
    // Answering the bot in Hindi is one of the site's discoveries.
    if (detectLanguage(text) === "hi") discover("namaste");
    setExchange((e) => ({ id: (e?.id ?? 0) + 1, text }));
  };

  let reminder: ReactNode;
  if (!optedIn) reminder = <Notice key="opted-out">Opted out: no reminder goes out until the owner sends START</Notice>;
  else if (plan.outcome === "whatsapp")
    reminder = (
      <Bubble key={`whatsapp-${lang}`} lang={lang} time={clockTime(delivered.at)}>
        {render("deadline_extended", lang, values(lang))}
      </Bubble>
    );
  else
    reminder = (
      <div key="email" className="flex flex-col gap-2">
        <Notice>WhatsApp couldn’t deliver it, so email did</Notice>
        <EmailCard time={clockTime(delivered.at)} englishOnly={lang !== "en"} />
      </div>
    );

  const replyLang = exchange ? detectLanguage(exchange.text) : "en";
  const intent = exchange ? detectIntent(exchange.text) : "message";
  const reply = REPLIES[intent === "message" ? "not_connected" : intent][replyLang];

  return (
    <Stage
      title="When, and how, a reminder goes out"
      kind="Simulation"
      xray="Client island · ComplianceWatch's batching, quiet hours, WhatsApp window, retries and fallback, and its bot's keywords, ported and tested (lib/sim/compliance)"
      caption="ComplianceWatch's delivery rules and its WhatsApp bot's keywords, running in your browser: five minutes to gather, quiet hours from 21:00 to 08:00 IST, Meta's 24-hour window, retries after one and five minutes, one fallback. The business and the times are samples; the Hindi is the project's own draft."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="min-w-0">
          <div>
            <label htmlFor={slider} className={`block ${LABEL}`}>
              The change is published at
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                id={slider}
                type="range"
                min={0}
                max={1435}
                step={5}
                value={at}
                onChange={(e) => setAt(Number(e.target.value))}
                aria-valuetext={`${clockTime(at)} IST`}
                className="h-6 min-w-0 flex-1 cursor-pointer rounded-full accent-[#8ab4ff] outline-none focus-visible:ring-2 focus-visible:ring-accent-bright"
              />
              <span aria-hidden="true" className="flex-none font-mono text-lg tabular-nums" style={{ color: ACCENT }}>
                {clockTime(at)}
                <span className="ml-1 text-xs text-dim-inverse">IST</span>
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-4">
            <Choice legend="The owner last wrote to us" options={LAST_WROTE} value={lastWrote} onChange={setLastWrote} />
            <Choice legend="Hear it by" options={HEAR_BY} value={digest} onChange={setDigest} />
            <Choice legend="Meta approved the template" options={APPROVED} value={approved} onChange={setApproved} />
            <Choice legend="WhatsApp is down" options={DOWN} value={down} onChange={setDown} />
            <Choice legend="Language" options={LANGUAGES} value={lang} onChange={setLang} />
          </div>

          <div className="mt-5 rounded-2xl bg-ink px-4 pt-3 pb-4 ring-1 ring-white/8">
            <p className={`flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 ${LABEL}`}>
              <span>The change, hour by hour</span>
              <span className="font-mono tracking-normal normal-case">
                {clockTime(span.start)} → {clockTime(span.end)}
                {span.end > DAY ? " next day" : ""} · IST
              </span>
            </p>
            <Strip plan={plan} digest={digest} start={span.start} end={span.end} />
            <div aria-hidden="true" className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] text-dim-inverse">
              <span className="inline-flex items-center gap-1.5">
                <AttemptDot ok channel="whatsapp" /> delivered on WhatsApp
              </span>
              <span className="inline-flex items-center gap-1.5">
                <AttemptDot ok={false} channel="whatsapp" /> failed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <AttemptDot ok channel="email" /> delivered by email
              </span>
            </div>
            <div className="mt-2.5 border-t border-white/8 pt-2.5">
              {/* Room for the longest plan (three failures and the fallback), so toggling doesn't move the page. */}
              <ol aria-label="The plan, step by step" className="grid min-h-[11.25rem] content-start gap-0.5 sm:min-h-[9.5rem]">
                {steps.map((s, i) => (
                  <li key={i} className="grid grid-cols-[2.75rem_0.875rem_minmax(0,1fr)] gap-x-2 text-[0.8125rem] leading-5">
                    <span className="font-mono text-xs leading-5 text-muted-inverse tabular-nums">{s.at === null ? "" : clockTime(s.at)}</span>
                    <span className="flex h-5 items-center justify-center">
                      <StepMark mark={s.mark} />
                    </span>
                    <span className={`min-w-0 break-words ${s.mark === "ok" || s.mark === "fail" ? "text-fg-inverse" : "text-muted-inverse"}`}>
                      {s.text}
                      {s.hint && <span className="block text-xs leading-4 text-amber-200">{s.hint}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[20rem] min-w-0">
          <div className="rounded-[2.5rem] bg-[linear-gradient(160deg,#3d3e44,#121316_40%,#0b0c0e)] p-1.5 shadow-[inset_0_0_0_0.25rem_#1c1d21,0_0_0_1px_rgb(255_255_255/0.06)]">
            <div className="overflow-hidden rounded-[2.125rem] bg-[#efeae2] text-[#111b21]">
              <div className="flex items-center gap-2.5 border-b border-[#e2e5e8] bg-[#f0f2f5] px-4 pt-3 pb-2">
                <span aria-hidden="true" className="size-8 flex-none rounded-[0.625rem] bg-[#171717]" />
                <p className="text-sm font-semibold tracking-[-0.01em]">ComplianceWatch</p>
              </div>
              <div
                role="log"
                aria-live="polite"
                aria-label="The owner’s WhatsApp chat with ComplianceWatch"
                className="flex min-h-[24rem] flex-col justify-end gap-2 px-2.5 py-2"
              >
                {reminder}
                {exchange && (
                  <div key={exchange.id} className="flex flex-col gap-2">
                    <Bubble out lang={replyLang} time={clockTime(delivered.at)}>
                      {exchange.text}
                    </Bubble>
                    <Bubble late lang={replyLang} time={clockTime(delivered.at)}>
                      {reply}
                    </Bubble>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p id={keywords} className={`mt-3.5 ${LABEL}`}>
            Reply keywords <span className="font-normal tracking-normal normal-case">· tap one to send it as the owner</span>
          </p>
          <div role="group" aria-labelledby={keywords} className="mt-1.5 flex flex-wrap gap-1.5">
            {REPLY_CHIPS.map((k) => (
              <Control key={k} onClick={() => send(k)} className={CHIP}>
                <span lang={detectLanguage(k)}>{k}</span>
              </Control>
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
}

function Choice<T>({ legend, options, value, onChange }: { legend: string; options: Option<T>[]; value: T; onChange: (value: T) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className={LABEL}>{legend}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <Control key={o.label} active={o.value === value} onClick={() => onChange(o.value)} className={CHIP}>
            <span lang={o.lang}>{o.label}</span>
          </Control>
        ))}
      </div>
    </fieldset>
  );
}

/** Zones of the strip, in rem from its top: three rows of labels, the line the change travels, then the clock. */
const ROW = 0.875;
const AXIS = 3.25;
const BAND = 4.75;

/** The plan on a clock: quiet hours shaded, the change's waits along a line, each send a dot. */
function Strip({ plan: p, digest, start, end }: { plan: DeliveryPlan; digest: boolean; start: number; end: number }) {
  const x = (t: number) => ((Math.min(Math.max(t, start), end) - start) / (end - start)) * 100;
  const between = (a: number, b: number) => ({ left: `${x(a)}%`, width: `${x(b) - x(a)}%`, top: `${AXIS}rem` });

  const firstTick = Math.ceil(start / (3 * HOUR)) * 3 * HOUR;
  const ticks = Array.from({ length: Math.floor((end - firstTick) / (3 * HOUR)) + 1 }, (_, i) => firstTick + i * 3 * HOUR);
  const bands = Array.from({ length: Math.floor(end / DAY) - Math.floor(start / DAY) + 2 }, (_, i) => {
    const day = (Math.floor(start / DAY) - 1 + i) * DAY;
    return [Math.max(start, day + DELIVERY.quietStart), Math.min(end, day + DAY + DELIVERY.quietEnd)] as const;
  }).filter(([a, b]) => b > a);

  const marks = [
    { at: p.queuedAt, label: "Published" },
    { at: p.readyAt, label: digest ? "Digest" : "Gathered" },
    ...(p.heldUntil === null ? [] : [{ at: p.heldUntil, label: "Held until" }]),
  ];
  const holds = [
    ...(p.heldUntil === null ? [] : [[p.readyAt, p.heldUntil] as const]),
    ...p.attempts.flatMap((a, i) => {
      const due = retryDue(p.attempts, i);
      return due !== null && due !== a.at ? [[p.attempts[i - 1].at, a.at] as const] : [];
    }),
  ];
  // Sends minutes apart share a spot; the only other gaps are whole nights.
  const clusters = p.attempts.reduce<Attempt[][]>((groups, a) => {
    const last = groups[groups.length - 1];
    return last && a.at - last[last.length - 1].at <= 30 ? [...groups.slice(0, -1), [...last, a]] : [...groups, [a]];
  }, []);

  return (
    <div aria-hidden="true" className="relative mt-2.5 h-[5.75rem]">
      {bands.map(([a, b]) => (
        <div key={a} className="absolute top-0 bg-white/[0.05]" style={{ left: `${x(a)}%`, width: `${x(b) - x(a)}%`, height: `${BAND}rem` }}>
          <span className="absolute top-[3.95rem] right-1 left-1.5 truncate text-[0.625rem] leading-none text-dim-inverse">Quiet hours</span>
        </div>
      ))}
      <div className="absolute inset-x-0 h-px bg-white/15" style={{ top: `${AXIS}rem` }} />
      <div className="absolute h-[3px] -translate-y-1/2 rounded-full" style={{ ...between(p.queuedAt, p.readyAt), background: ACCENT }} />
      {holds.map(([a, b]) => (
        <div key={a} className="absolute h-0 -translate-y-1/2 border-t-2 border-dashed" style={{ ...between(a, b), borderColor: ACCENT }} />
      ))}

      {marks.map((m, row) => {
        const left = x(m.at);
        return (
          <Fragment key={m.label}>
            <span className="absolute w-px bg-white/25" style={{ left: `${left}%`, top: `${row * ROW}rem`, height: `${AXIS - row * ROW}rem` }} />
            <span className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${left}%`, top: `${AXIS}rem`, background: ACCENT }} />
            <span
              className={`absolute text-[0.625rem] leading-[0.875rem] whitespace-nowrap ${left > 60 ? "-translate-x-full pr-1" : "pl-1"}`}
              style={{ left: `${left}%`, top: `${row * ROW}rem` }}
            >
              <span className="text-muted-inverse">{m.label}</span> <span className="font-mono text-fg-inverse">{clockTime(m.at)}</span>
            </span>
          </Fragment>
        );
      })}

      {ticks.map((t) => {
        const left = x(t);
        return (
          <Fragment key={t}>
            <span className="absolute h-1 w-px bg-white/25" style={{ left: `${left}%`, top: `${BAND}rem` }} />
            <span
              className={`absolute top-[5.1rem] font-mono text-[0.5625rem] leading-none text-dim-inverse ${left < 4 ? "" : left > 96 ? "-translate-x-full" : "-translate-x-1/2"}`}
              style={{ left: `${left}%` }}
            >
              {clockTime(t)}
            </span>
          </Fragment>
        );
      })}

      {clusters.map((c, i) => {
        const mid = (x(c[0].at) + x(c[c.length - 1].at)) / 2;
        const width = c.length + (c.length - 1) * 0.125;
        return (
          <span
            key={i}
            className="absolute flex gap-0.5"
            style={{ top: `${AXIS - 0.5}rem`, left: `clamp(0rem, calc(${mid}% - ${width / 2}rem), calc(100% - ${width}rem))` }}
          >
            {c.map((a, j) => (
              <AttemptDot key={j} ok={a.ok} channel={a.channel} />
            ))}
          </span>
        );
      })}
    </div>
  );
}

/** A send: W for WhatsApp, E for email; filled if it got through, a ring if it failed. */
function AttemptDot({ ok, channel }: Pick<Attempt, "ok" | "channel">) {
  return (
    <span
      className={`flex size-4 flex-none items-center justify-center rounded-full font-mono text-[0.5625rem] leading-none font-bold transition-colors duration-(--dur-base) ${
        ok ? "bg-emerald-300 text-ink" : "bg-ink text-rose-200 ring-[1.5px] ring-rose-300 ring-inset"
      }`}
    >
      {channel === "whatsapp" ? "W" : "E"}
    </span>
  );
}

function StepMark({ mark }: { mark: Mark }) {
  switch (mark) {
    case "ok":
      return (
        <svg role="img" aria-label="delivered" viewBox="0 0 14 14" className="size-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2.75 7.5 2.75 2.75 5.75-6" />
        </svg>
      );
    case "fail":
      return (
        <svg role="img" aria-label="not delivered" viewBox="0 0 14 14" className="size-3.5 text-rose-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m4 4 6 6m0-6-6 6" />
        </svg>
      );
    case "hold":
    case "wait":
      // As the strip draws them: dashed while quiet hours hold it, solid while it gathers.
      return (
        <svg aria-hidden="true" viewBox="0 0 14 4" className="w-3.5" stroke={ACCENT} strokeWidth="2" strokeDasharray={mark === "hold" ? "2.5 2" : undefined}>
          <path d="M0 2h14" />
        </svg>
      );
    case "point":
      return <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: ACCENT }} />;
  }
}

/** A chat bubble: the bot's on the left in white, the owner's on the right in green, each with its time. New ones rise in. */
function Bubble({ out = false, late = false, lang, time, children }: { out?: boolean; late?: boolean; lang: Lang; time: string; children: ReactNode }) {
  return (
    <div
      lang={lang}
      className={`relative max-w-[88%] rounded-lg px-2.5 pt-1.5 pb-1.5 ${BUBBLE_SHADOW} transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out) starting:translate-y-1 starting:opacity-0 ${
        late ? "delay-(--dur-micro)" : ""
      } ${out ? "self-end rounded-tr-[0.1875rem] bg-[#d9fdd3]" : "self-start rounded-tl-[0.1875rem] bg-white"}`}
    >
      <p className="text-[0.78125rem] leading-[1.45] break-words">
        {children}
        {/* Room for the time at the end of the last line, as WhatsApp leaves it. */}
        <span aria-hidden="true" className={`inline-block ${out ? "w-13" : "w-9"}`} />
      </p>
      <span className="absolute right-2 bottom-1 flex items-center gap-0.5 text-[0.625rem] leading-none text-[#667781]">
        <time>{time}</time>
        {out && (
          <svg aria-hidden="true" viewBox="0 0 16 10" className="h-2.5 w-4 text-[#53bdeb]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m1.5 5.5 2.5 2.5 5.5-6.5M7 7.5l.5.5 6-6.5" />
          </svg>
        )}
      </span>
    </div>
  );
}

/** A note from the app itself, centred on the chat wall. */
function Notice({ children }: { children: ReactNode }) {
  return (
    <p className={`max-w-[92%] self-center rounded-lg bg-white/90 px-3 py-1 text-center text-[0.6875rem] leading-snug text-[#54656f] ${BUBBLE_SHADOW} transition-opacity duration-(--dur-base) starting:opacity-0`}>
      {children}
    </p>
  );
}

/** The email fallback, as the service writes it. It has no Hindi version, which the tag says when Hindi was asked for. */
function EmailCard({ time, englishOnly }: { time: string; englishOnly: boolean }) {
  return (
    <article className={`rounded-lg bg-white px-3 py-2.5 text-[0.71875rem] leading-[1.4] ${BUBBLE_SHADOW}`}>
      <p className="flex items-center gap-1.5 text-[0.6875rem] text-[#54656f]">
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 flex-none" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
          <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
          <path d="m2.75 4.75 5.25 4 5.25-4" />
        </svg>
        <span className="min-w-0 truncate">From ComplianceWatch</span>
        {englishOnly && (
          <span className="flex-none rounded-sm bg-[#f0f2f5] px-1 py-px text-[0.5625rem] font-semibold tracking-[0.04em] uppercase">In English</span>
        )}
        <time className="ml-auto flex-none">{time}</time>
      </p>
      <p className="mt-1 text-xs leading-snug font-semibold">{EMAIL.subject}</p>
      <div className="mt-1 grid gap-1.5 text-[#3b4a54]">
        {EMAIL.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
