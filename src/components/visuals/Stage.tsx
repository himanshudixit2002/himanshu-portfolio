import type { ButtonHTMLAttributes, ReactNode } from "react";

export type StageKind = "Simulation" | "Illustration" | "Measured" | "Screenshots" | "Diagram";

type StageProps = {
  title: string;
  kind: StageKind;
  /** One line under the stage saying what's real and what's sample data. */
  caption: string;
  children: ReactNode;
  className?: string;
  id?: string;
  /** How it's built, for x-ray mode. */
  xray?: string;
};

/**
 * The frame every signature visual sits in. Dark in both light and dark
 * sections so visuals read as one family, and always labelled with what kind
 * of thing the viewer is looking at.
 */
export function Stage({ title, kind, caption, children, className = "", id, xray }: StageProps) {
  // overflow-clip, not hidden, so scroll timelines inside still see the page.
  // Unlike hidden it doesn't zero a grid item's minimum width, hence min-w-0:
  // without it a wide table inside stretches the page sideways.
  return (
    <figure
      id={id}
      data-xray={xray}
      className={`relative min-w-0 overflow-clip rounded-[1.75rem] bg-ink-2 p-5 text-fg-inverse ring-1 ring-white/8 sm:p-7 ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-[-0.01em]">{title}</p>
        <span className="rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase ring-1 ring-white/12">
          {kind}
        </span>
      </div>
      {children}
      <figcaption className="mt-5 border-t border-white/8 pt-4 text-xs leading-relaxed text-dim-inverse">{caption}</figcaption>
    </figure>
  );
}

type ControlProps = ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; primary?: boolean };

/** Compact control for simulations: pressed state, 44px touch target, visible focus. */
export function Control({ active, primary, className = "", children, ...props }: ControlProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
        primary || active
          ? "bg-fg-inverse text-ink enabled:hover:bg-white"
          : "text-fg-inverse ring-1 ring-white/18 ring-inset enabled:hover:bg-white/8"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** A labelled figure inside a stage — a number with a caption. */
export function Readout({ label, value, tone }: { label: string; value: ReactNode; tone?: "good" | "bad" | "accent" }) {
  const color = tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : tone === "accent" ? "text-accent-bright" : "text-fg-inverse";
  return (
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">{label}</p>
      <p className={`mt-1 truncate font-mono text-lg ${color}`}>{value}</p>
    </div>
  );
}
