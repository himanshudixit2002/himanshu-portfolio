import { Fragment, type CSSProperties, type ReactNode } from "react";
import { EXTENSION, N01_2026 } from "@/content/compliancewatch/documents";
import { REPLIES, type Lang } from "@/content/compliancewatch/messages";
import { ACME, BAND_LABELS, SEED_RULES } from "@/content/compliancewatch/rules";
import { formatDate, materialise, render } from "@/lib/sim/compliance";
import { MacBookFrame, PhoneFrame } from "@/components/frames/DeviceFrame";
import s from "./cw.module.css";

/*
 * Drawings of ComplianceWatch: the web app's screens in the product's own
 * tokens and copy, and a reminder on WhatsApp. Sample data for the demo
 * tenant (Acme Traders Private Limited), on 21 April 2026, the day
 * notification 01/2026-Central Tax moved the March GSTR-3B. Illustrations,
 * not captures: every use carries a label that says so.
 */

type ArtProps = { label: string; className?: string };
const cols = (template: string) => ({ "--cols": template }) as CSSProperties;

/** The web app: browser chrome, the product's header (its name in text, the nav, a user menu), and a page. */
function Window({ label, className = "", path, nav = "Your business", children }: ArtProps & { path: string; nav?: string; children: ReactNode }) {
  return (
    <div role="img" aria-label={label} className={`${s.frame} ${className}`}>
      <div className={s.window}>
        <div className={s.chrome}>
          <span className={s.dot} />
          <span className={s.dot} />
          <span className={s.dot} />
          <span className={s.url}>{path}</span>
        </div>
        <div className={s.shell}>
          <span className={s.brand}>ComplianceWatch</span>
          <span className={s.nav}>
            {["Your business", "Clients", "Settings", "Account"].map((item) => (
              <span key={item} className={item === nav ? s.navOn : undefined}>
                {item}
              </span>
            ))}
          </span>
          <span className={s.avatar}>AT</span>
        </div>
        <div className={s.page}>{children}</div>
      </div>
    </div>
  );
}

const TODAY = "2026-04-21";
const MARCH_3B = "File GSTR-3B for the month (2026-03)";

/** What's due next for the demo business on the day: the extended March return, then its next two returns as the engine materialises them. */
const dueNext = () => [
  { form: "GSTR-3B", title: MARCH_3B, due: EXTENSION.newDue, was: EXTENSION.previousDue },
  ...materialise(SEED_RULES, ACME.profile, TODAY)
    .filter((o) => o.period !== null)
    .slice(0, 2)
    .map((o) => ({ form: o.form, title: o.title, due: o.due, was: null })),
];

/**
 * The business home: what changed and why — the clause quoted and verified —
 * and what's due next, down the wide column; the profile's progress beside
 * it, where the phone may lean over it in the pair.
 */
export function CwHomeArt({ label, className }: ArtProps) {
  return (
    <Window label={label} className={className} path="/b/acme-traders">
      <div className={s.head}>
        <div>
          <div className={s.h1}>{ACME.entity}</div>
          <div className={s.sub}>
            PAN ABCDE1234F · GSTIN {ACME.gstin} ({ACME.name})
          </div>
        </div>
        <span className={`${s.btn} ${s.btnGhost}`}>Add another business</span>
      </div>
      <div className={s.tabs}>
        {["Overview", "Obligations", "Profile", "Attributes", "Snapshot", "Review tasks"].map((t, i) => (
          <span key={t} className={i === 0 ? s.tabOn : undefined}>
            {t}
          </span>
        ))}
      </div>
      <div className={`${s.grid} ${s.gridWide}`}>
        <div className={s.stack}>
          <div className={s.card}>
            <div className={s.banner}>
              <div className={s.bannerTitle}>
                Due date extended <span className={`${s.chip} ${s.info}`}>New</span>
              </div>
              <p className={s.bannerBody}>
                {MARCH_3B} was due on {formatDate(EXTENSION.previousDue)} and is now due on {formatDate(EXTENSION.newDue)}.
              </p>
            </div>
            <div className={s.citation}>
              <div className={s.citeHead}>
                <span className={s.mono}>
                  {N01_2026.ref} · {EXTENSION.clause.ref}
                </span>
                <span className={`${s.chip} ${s.success}`}>Verified</span>
              </div>
              <p className={s.quote}>&ldquo;hereby extends the due date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the twenty -first day of April, 2026&rdquo;</p>
            </div>
          </div>
          <div className={s.card}>
            <div className={s.cardTitle}>
              Due next <span className={s.cardMeta}>{formatDate(TODAY)}</span>
            </div>
            <div className={s.rows}>
              {dueNext().map((o) => (
                <div key={o.title} className={s.row}>
                  <span className={s.form}>{o.form}</span>
                  <span className={s.rowTitle}>
                    {o.title}
                    {o.was && <span className={s.rowSub}>Extended by 01/2026-Central Tax</span>}
                  </span>
                  <span className={s.due}>
                    {formatDate(o.due)}
                    {o.was && <span className={s.was}>{formatDate(o.was)}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Profile</div>
          <div className={s.profile}>
            <div className={s.stat}>
              <strong>Onboarding</strong>
              13 of 13 answered
              <div className={s.meter}>
                <i style={{ width: "100%" }} />
              </div>
            </div>
            <div className={s.stat}>
              <strong>Review tasks</strong>
              <span className={`${s.chip} ${s.warning}`}>1 open</span>
            </div>
            <div className={s.stat}>
              <strong>Registrations</strong>
              <span className={s.mono}>{ACME.gstin}</span>
            </div>
          </div>
          <p className={s.fine}>This is not legal or tax advice. Check the cited source before you act.</p>
        </div>
      </div>
    </Window>
  );
}

/** A WhatsApp chat: the change as the notification service words it, then the owner's reply and the bot's answer, in one language. */
export function CwChatArt({ lang = "hi", sequence = false }: { lang?: Lang; sequence?: boolean }) {
  const title = MARCH_3B;
  const change = render("deadline_extended", lang, {
    business_name: ACME.name,
    title,
    previous_due_date: formatDate(EXTENSION.previousDue, lang),
    new_due_date: formatDate(EXTENSION.newDue, lang),
    source_ref: N01_2026.ref,
  });
  const ask = lang === "hi" ? "मदद" : "HELP";
  const bubble = (i: number) => (sequence ? { "data-bubble": "", style: { "--i": i } as CSSProperties } : {});
  return (
    <div className={s.wa}>
      <div className={s.waHead}>
        <span className={s.waIcon} />
        <span className={s.waName}>
          ComplianceWatch
          <span className={s.waSub}>Business account</span>
        </span>
      </div>
      <div className={`${s.waWall} ${sequence ? "bubble-seq" : ""}`}>
        <span className={s.waDay}>Today</span>
        <div className={`${s.bubble} ${s.bubbleIn}`} {...bubble(0)}>
          <p>{change}</p>
          <time>08:00</time>
        </div>
        <div className={`${s.bubble} ${s.bubbleOut}`} {...bubble(1)}>
          <p>{ask}</p>
          <time>
            08:03
            <span className={s.ticks} />
          </time>
        </div>
        <div className={`${s.bubble} ${s.bubbleIn}`} {...bubble(2)}>
          <p>{REPLIES.help[lang]}</p>
          <time>08:03</time>
        </div>
      </div>
      <div className={s.waInput}>
        <span className={s.waField}>Message</span>
        <span className={s.waMic} />
      </div>
    </div>
  );
}

/** The phone with the chat on it. */
export function CwPhoneArt({ label, lang = "hi", sequence = false, className = "" }: ArtProps & { lang?: Lang; sequence?: boolean }) {
  return (
    <div role="img" aria-label={label} className={className}>
      <PhoneFrame screen="#efeae2" ink="#111b21">
        <CwChatArt lang={lang} sequence={sequence} />
      </PhoneFrame>
    </div>
  );
}

/**
 * The product as a pair: the web app on a laptop, and the phone the owner
 * actually reads it on, leaning in front.
 */
export function CwDuoArt({ home, phone, accent, laptop = true }: { home: string; phone: string; accent: string; laptop?: boolean }) {
  const screen = <CwHomeArt label={home} />;
  return (
    <div className={s.duo}>
      {laptop ? <MacBookFrame wall={[`${accent}66`, "rgb(45 212 191 / 0.2)"]}>{screen}</MacBookFrame> : screen}
      <CwPhoneArt label={phone} sequence className={s.duoPhone} />
    </div>
  );
}

/* ── The screens, for the gallery ──────────────────────────────────────── */

/** One-question onboarding: the ontology's own question, the bands as its labels, and the three answers. */
export function CwOnboardingArt({ label }: ArtProps) {
  const bands = ["75_lakh_to_1_5_crore", "1_5_crore_to_2_crore", "2_crore_to_5_crore", "5_crore_to_10_crore", "10_crore_to_20_crore", "20_crore_to_50_crore"] as const;
  return (
    <Window label={label} path="/onboarding/acme-traders/questions">
      <div className={s.stepper}>
        {["Consents", "Business", "Questions", "Done"].map((step, i) => (
          <Fragment key={step}>
            {i > 0 && <span className={s.stepLine} />}
            <span className={`${s.step} ${i < 2 ? s.stepDone : i === 2 ? s.stepOn : ""}`}>
              <b>{i + 1}</b>
              {step}
            </span>
          </Fragment>
        ))}
        <span className={s.dim} style={{ marginLeft: "auto" }}>
          9 of 13 answered
        </span>
      </div>
      <div>
        <div className={s.question}>What was the aggregate turnover of this business in the previous financial year?</div>
        <div className={s.sub}>About {ACME.entity} (PAN ABCDE1234F). The answer is for the financial year 2025-26.</div>
      </div>
      <div className={s.options}>
        {bands.map((b) => (
          <span key={b} className={`${s.option} ${b === "2_crore_to_5_crore" ? s.optionOn : ""}`}>
            {BAND_LABELS[b]}
          </span>
        ))}
      </div>
      <div className={s.actions}>
        <span className={s.btn}>Save</span>
        <span className={`${s.btn} ${s.btnGhost}`}>Not sure</span>
        <span className={`${s.btn} ${s.btnGhost}`}>Does not apply</span>
        <span className={s.hint}>Does not apply opens a review task an analyst will look at.</span>
      </div>
    </Window>
  );
}

const attributeRows: [attribute: string, answer: string, state: "Known" | "Not sure", source: string][] = [
  ["Registration type", "Regular", "Known", "GSTIN lookup"],
  ["State", "Karnataka", "Known", "Worked out by the service"],
  ["Filing scheme", "Regular, filing monthly", "Known", "Your answer"],
  ["Turnover band", "2 crore to 5 crore", "Known", "Your answer"],
  ["Generates e-way bills", "Yes", "Known", "Your answer"],
  ["Makes zero-rated supplies", "Not answered", "Not sure", "Your answer"],
];

/** Attributes per node and financial year, with where each answer came from. */
export function CwAttributesArt({ label }: ArtProps) {
  return (
    <Window label={label} path="/b/acme-traders/attributes">
      <div className={s.head}>
        <div className={s.nodes}>
          <span className={s.node}>
            {ACME.entity}
            <small>Business (PAN): ABCDE1234F</small>
          </span>
          <span className={`${s.node} ${s.nodeOn}`}>
            {ACME.name}
            <small>Registration (GSTIN): {ACME.gstin}</small>
          </span>
        </div>
        <span className={s.actions}>
          <span className={s.input}>2026-27</span>
          <span className={`${s.btn} ${s.btnGhost}`}>Show</span>
        </span>
      </div>
      <div className={`${s.card} ${s.table}`} style={{ padding: 0, overflow: "hidden" }}>
        <div className={`${s.tr} ${s.th}`} style={cols("1.3fr 1.3fr 0.8fr 0.9fr 1.2fr")}>
          <span>Attribute</span>
          <span>Answer</span>
          <span>State</span>
          <span>Financial year</span>
          <span>Source</span>
        </div>
        {attributeRows.map(([attribute, answer, state, source]) => (
          <div key={attribute} className={s.tr} style={cols("1.3fr 1.3fr 0.8fr 0.9fr 1.2fr")}>
            <span className={s.strong}>{attribute}</span>
            <span>{answer}</span>
            <span>
              <span className={`${s.chip} ${state === "Known" ? s.success : s.warning}`}>{state}</span>
            </span>
            <span className={s.dim}>2026-27</span>
            <span className={s.dim}>{source}</span>
          </div>
        ))}
      </div>
    </Window>
  );
}

/** What the engine evaluates: the node's own values and those it inherits, the nearest winning. */
export function CwSnapshotArt({ label }: ArtProps) {
  const rows: [string, string, string][] = [
    ["registration_type", "regular", "Stored on this node"],
    ["filing_scheme", "regular_monthly", "Stored on this node"],
    ["generates_eway_bills", "true", "Stored on this node"],
    ["state_codes", "29", "Worked out by the service"],
    ["turnover_band", "2_crore_to_5_crore", `Inherited from ${ACME.entity}`],
    ["peak_turnover_band", "2_crore_to_5_crore", `Inherited from ${ACME.entity}`],
  ];
  return (
    <Window label={label} path="/b/acme-traders/snapshot">
      <div>
        <div className={s.h1}>Snapshot for 2026-27</div>
        <div className={s.sub}>This is what the applicability engine evaluates for this node and year: its own values and those it inherits, the nearest node winning.</div>
      </div>
      <div className={`${s.card} ${s.table}`} style={{ padding: 0, overflow: "hidden" }}>
        <div className={`${s.tr} ${s.th}`} style={cols("1.2fr 1.1fr 1.5fr")}>
          <span>Attribute</span>
          <span>Value</span>
          <span>Comes from</span>
        </div>
        {rows.map(([attribute, value, from]) => (
          <div key={attribute} className={s.tr} style={cols("1.2fr 1.1fr 1.5fr")}>
            <span className={s.mono}>{attribute}</span>
            <span className={`${s.mono} ${s.strong}`}>{value}</span>
            <span className={s.dim}>{from}</span>
          </div>
        ))}
      </div>
    </Window>
  );
}

/** Review tasks: the answers a person has to confirm, and why each is open. */
export function CwReviewArt({ label }: ArtProps) {
  const rows: [string, string, string, "Open" | "Closed"][] = [
    ["ITC-04: job work", "needs judgement: The business sends inputs or capital goods to a job worker under section 143.", "2026-27", "Open"],
    ["Makes zero-rated supplies", "You said this does not apply; an analyst will confirm", "2026-27", "Open"],
    ["Turnover band", "Confirm this value for the new financial year", "2026-27", "Closed"],
    ["GSTIN status", "GSTIN details not verified by a lookup provider", "2026-27", "Closed"],
  ];
  return (
    <Window label={label} path="/b/acme-traders/review-tasks">
      <div>
        <div className={s.h1}>Review tasks</div>
        <div className={s.sub}>2 open of 4.</div>
      </div>
      <div className={`${s.card} ${s.table}`} style={{ padding: 0, overflow: "hidden" }}>
        <div className={`${s.tr} ${s.th}`} style={cols("1.2fr 2.2fr 0.8fr 0.7fr")}>
          <span>Attribute</span>
          <span>Why it is open</span>
          <span>Financial year</span>
          <span>Status</span>
        </div>
        {rows.map(([attribute, why, fy, status]) => (
          <div key={attribute} className={s.tr} style={cols("1.2fr 2.2fr 0.8fr 0.7fr")}>
            <span className={s.strong}>{attribute}</span>
            <span className={s.dim}>{why}</span>
            <span className={s.dim}>{fy}</span>
            <span>
              <span className={`${s.chip} ${status === "Open" ? s.warning : ""}`}>{status}</span>
            </span>
          </div>
        ))}
      </div>
    </Window>
  );
}

/** Notification settings: consent on file, the language, and the quiet hours. */
export function CwSettingsArt({ label }: ArtProps) {
  return (
    <Window label={label} path="/settings/notifications" nav="Settings">
      <div className={s.h1}>Notifications</div>
      <div className={s.grid}>
        <div className={s.card}>
          <div className={s.cardTitle}>
            WhatsApp <span className={`${s.chip} ${s.success}`}>Opted in</span>
          </div>
          <dl className={s.kv}>
            <dt>Consent</dt>
            <dd>Your consent to WhatsApp reminders is on file.</dd>
            <dt>Number</dt>
            <dd className={s.mono}>+91 98••• ••210</dd>
            <dt>Language</dt>
            <dd>हिन्दी (Hindi)</dd>
            <dt>Quiet hours</dt>
            <dd>21:00 to 08:00 IST</dd>
            <dt>Set through</dt>
            <dd>WhatsApp keyword</dd>
          </dl>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Set the preference</div>
          <div className={s.kv} style={{ gridTemplateColumns: "1fr" }}>
            <span className={`${s.radio} ${s.radioOn}`}>Send reminders</span>
            <span className={s.radio}>Do not send reminders</span>
            <label className={s.field}>
              <span>Language</span>
              <span className={s.input}>हिन्दी</span>
            </label>
            <span className={s.actions}>
              <label className={s.field} style={{ flex: 1 }}>
                <span>Quiet hours (IST) from</span>
                <span className={s.input}>21:00</span>
              </label>
              <label className={s.field} style={{ flex: 1 }}>
                <span>Until</span>
                <span className={s.input}>08:00</span>
              </label>
            </span>
            <span className={s.btn} style={{ justifySelf: "start" }}>
              Save the preference
            </span>
          </div>
        </div>
      </div>
    </Window>
  );
}

/** A CA firm's view: its clients, searchable by name, PAN or GSTIN. */
export function CwClientsArt({ label }: ArtProps) {
  const rows: [string, string, string, string][] = [
    [ACME.entity, "ABCDE1234F", "29ABCDE1234F1Z5", "21 Apr 2026, 8:04 am IST"],
    ["Kaveri Spices LLP", "AAKFK4821L", "29AAKFK4821L1Z3", "20 Apr 2026, 6:12 pm IST"],
    ["Marine Drive Textiles", "AAECM7310Q", "27AAECM7310Q1ZP", "19 Apr 2026, 11:40 am IST"],
    ["Northgate Distributors", "AAHFN2266R", "07AAHFN2266R1ZX", "16 Apr 2026, 3:25 pm IST"],
    ["Sahyadri Agro Foods", "ABJPS9087K", "27ABJPS9087K1ZC", "11 Apr 2026, 9:58 am IST"],
  ];
  return (
    <Window label={label} path="/businesses" nav="Clients">
      <div className={s.head}>
        <div>
          <div className={s.h1}>Clients</div>
          <div className={s.sub}>Your firm&rsquo;s client businesses, by name.</div>
        </div>
        <span className={s.btn}>Add a client</span>
      </div>
      <label className={s.field}>
        <span>Search</span>
        <span className={s.input} style={{ color: "var(--muted)" }}>
          A name, a PAN or a GSTIN, or part of one; any case.
        </span>
      </label>
      <div className={`${s.card} ${s.table}`} style={{ padding: 0, overflow: "hidden" }}>
        <div className={`${s.tr} ${s.th}`} style={cols("1.6fr 1fr 1.3fr 1.5fr")}>
          <span>Name</span>
          <span>PAN</span>
          <span>Registrations</span>
          <span>Last changed</span>
        </div>
        {rows.map(([name, pan, gstin, changed]) => (
          <div key={name} className={s.tr} style={cols("1.6fr 1fr 1.3fr 1.5fr")}>
            <span className={s.strong}>{name}</span>
            <span className={s.mono}>{pan}</span>
            <span className={s.mono}>{gstin}</span>
            <span className={s.dim}>{changed}</span>
          </div>
        ))}
      </div>
    </Window>
  );
}

/** The analyst's side: a draft rule version, its citation checked against the clause, and the approvals it still needs. */
export function CwRuleReviewArt({ label }: ArtProps) {
  return (
    <Window label={label} path="/admin/review/gstr3b_monthly" nav="">
      <div className={s.head}>
        <div>
          <div className={s.h1}>Extend GSTR-3B for March 2026</div>
          <div className={s.sub}>
            Relation <span className={s.mono}>extends_deadline</span> → rule <span className={s.mono}>gstr3b_monthly</span>, period 2026-03, new due date 21 Apr 2026
          </div>
        </div>
        <span className={`${s.chip} ${s.warning}`}>In review</span>
      </div>
      <div className={s.grid}>
        <div className={s.card}>
          <div className={s.cardTitle}>
            Citation <span className={`${s.chip} ${s.success}`}>Match 1.00</span>
          </div>
          <div className={s.citation}>
            <div className={s.citeHead}>
              <span className={s.mono}>{N01_2026.ref} · en.p3</span>
              <span className={`${s.chip} ${s.success}`}>Verified</span>
            </div>
            <p className={s.quote}>&ldquo;hereby extends the due date for furnishing the return in FORM GSTR-3B for the month of March, 2026 till the twenty -first day of April, 2026&rdquo;</p>
          </div>
          <p className={s.fine}>Every fact token of the quote is in the clause: GSTR-3B, March, 2026, April.</p>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>Approvals</div>
          <dl className={s.kv}>
            <dt>Impact</dt>
            <dd>High: changes a due date</dd>
            <dt>Needs</dt>
            <dd>Two different approvers</dd>
            <dt>Approved by</dt>
            <dd>1 of 2</dd>
            <dt>On publish</dt>
            <dd className={s.mono}>rule.deadline_changed</dd>
          </dl>
          <div className={s.actions} style={{ marginTop: "1.4em" }}>
            <span className={s.btn}>Approve</span>
            <span className={`${s.btn} ${s.btnGhost}`}>Return to draft</span>
          </div>
        </div>
      </div>
    </Window>
  );
}
