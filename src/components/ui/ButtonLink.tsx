import Link from "next/link";
import type { ReactNode } from "react";
import type { Href } from "@/content/types";
import { ArrowUpRight } from "./icons";

type Variant = "primary" | "secondary" | "text";
type Tone = "dark" | "light";

const base =
  "group inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-[0.9375rem] font-medium tracking-[-0.01em] transition-[background-color,color,box-shadow,scale] duration-200 active:scale-[0.97]";

const styles: Record<Tone, Record<Variant, string>> = {
  dark: {
    primary: "bg-fg-inverse px-5 text-ink hover:bg-white",
    secondary: "px-5 text-fg-inverse ring-1 ring-white/25 ring-inset hover:bg-white/8 hover:ring-white/40",
    text: "text-accent-bright",
  },
  light: {
    primary: "bg-accent px-5 text-white hover:bg-[#0858bd]",
    secondary: "px-5 text-fg ring-1 ring-black/15 ring-inset hover:bg-black/5",
    text: "text-accent",
  },
};

type Props = {
  href: Href;
  children: ReactNode;
  variant?: Variant;
  tone?: Tone;
  /** Opens in a new tab and says so to assistive technology. */
  external?: boolean;
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", tone = "dark", external, className = "" }: Props) {
  const classes = `${base} ${styles[tone][variant]} ${className}`;
  // Pill buttons ripple from the press (Fx); a text link has no pill to ripple in.
  const ripple = variant === "text" ? undefined : "";
  // A text link's underline draws under its words, not the whole target.
  const label = variant === "text" ? <span className="link-draw">{children}</span> : children;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} data-ripple={ripple}>
        {label}
        <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes} data-ripple={ripple}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} data-ripple={ripple}>
      {label}
    </a>
  );
}
