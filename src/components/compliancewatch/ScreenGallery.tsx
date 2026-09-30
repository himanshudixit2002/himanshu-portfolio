import type { CSSProperties, ReactNode } from "react";
import {
  CwAttributesArt,
  CwClientsArt,
  CwHomeArt,
  CwOnboardingArt,
  CwReviewArt,
  CwRuleReviewArt,
  CwSettingsArt,
  CwSnapshotArt,
} from "@/components/art/ComplianceWatchArt";
import { SnapGallery } from "@/components/motion/SnapGallery";
import { CardDraw } from "@/components/scenes/IdleDraw";
import s from "./deep.module.css";

type Screen = { title: string; who: string; body: string; art: (label: string) => ReactNode; label: string };

/** The web app, screen by screen: who uses each, and what it's for. Drawn in the product's own tokens and copy. */
const SCREENS: Screen[] = [
  {
    title: "Business home",
    who: "Owner",
    body: "What's due next, what changed and why — the clause quoted and verified — and how far the profile has got.",
    art: (label) => <CwHomeArt label={label} />,
    label: "Illustration of ComplianceWatch's business home with sample data: due dates for Acme Traders and a verified citation for a due-date extension.",
  },
  {
    title: "One question at a time",
    who: "Owner",
    body: "Onboarding asks the next attribute the engine needs, in the ontology's own words. “Not sure” is an answer; “does not apply” opens a review task.",
    art: (label) => <CwOnboardingArt label={label} />,
    label: "Illustration of ComplianceWatch's onboarding with sample data: the question about the previous year's turnover, with its bands and the Save, Not sure and Does not apply buttons.",
  },
  {
    title: "Attributes, with their source",
    who: "Owner and CA",
    body: "Every answer per node and financial year: from the GSTIN lookup, from the owner, or worked out by the service.",
    art: (label) => <CwAttributesArt label={label} />,
    label: "Illustration of ComplianceWatch's attributes page with sample data: registration, state, filing scheme and turnover, each with its state and source.",
  },
  {
    title: "The snapshot the engine reads",
    who: "Owner and CA",
    body: "A node's own values and those it inherits, the nearest winning — exactly what the applicability engine evaluates.",
    art: (label) => <CwSnapshotArt label={label} />,
    label: "Illustration of ComplianceWatch's snapshot page with sample data: attribute keys and values for 2026-27, and where each comes from.",
  },
  {
    title: "Review tasks",
    who: "Analyst",
    body: "Whatever the engine can't decide lands here with its reason, for a person to settle.",
    art: (label) => <CwReviewArt label={label} />,
    label: "Illustration of ComplianceWatch's review tasks with sample data: a job-work condition needing judgement and answers awaiting an analyst.",
  },
  {
    title: "A rule, reviewed",
    who: "Analyst",
    body: "The extension with its citation checked against the clause, and the second approval a due-date change needs before it publishes.",
    art: (label) => <CwRuleReviewArt label={label} />,
    label: "Illustration of ComplianceWatch's rule review with sample data: the GSTR-3B extension, its verified citation and one of two approvals.",
  },
  {
    title: "When to hear, and how",
    who: "Owner",
    body: "Consent on file, the language, and the quiet hours every reminder waits for.",
    art: (label) => <CwSettingsArt label={label} />,
    label: "Illustration of ComplianceWatch's notification settings with sample data: WhatsApp opted in, Hindi, quiet hours from 21:00 to 08:00.",
  },
  {
    title: "A CA firm's clients",
    who: "CA firm",
    body: "Every client business, searchable by name, PAN or GSTIN, for firms that look after many.",
    art: (label) => <CwClientsArt label={label} />,
    label: "Illustration of ComplianceWatch's client list for a CA firm with sample data: five businesses with their PAN, GSTIN and last change.",
  },
];

/** The screens as a gallery: swipe on a phone, paddles and dots on wider screens. Without script, the captions carry it. */
export function ScreenGallery({ accent }: { accent: string }) {
  const items = SCREENS.map((screen, i) => (
    <figure key={screen.title} className={s.shot} style={{ "--accent": accent } as CSSProperties}>
      {/* Eight drawings are costly to lay out: each is drawn as the row nears it (the first two after load), in a box already its size. */}
      <div className={s.shotArt}>
        <div className="aspect-[16/10]">
          <CardDraw eager={i < 2}>{screen.art(screen.label)}</CardDraw>
        </div>
      </div>
      <figcaption className="mt-auto px-2">
        <p className="text-[0.6875rem] font-semibold tracking-[0.04em] uppercase" style={{ color: accent }}>
          {screen.who}
        </p>
        <p className="mt-1 text-lg font-semibold tracking-[-0.015em] text-fg-inverse">{screen.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-inverse text-pretty">{screen.body}</p>
      </figcaption>
    </figure>
  ));
  return <SnapGallery label="ComplianceWatch's screens" items={items} itemWidth="min(44rem, 86vw)" dim="phone" swipeHint />;
}
