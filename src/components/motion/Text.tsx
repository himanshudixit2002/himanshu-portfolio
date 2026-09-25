import type { CSSProperties, ReactNode } from "react";

type WordRevealProps = {
  text: string;
  /**
   * `entrance`: words blur up in turn on first paint (for titles near the top).
   * `scrub`: words light up as the text crosses the screen, Apple-style.
   */
  mode?: "entrance" | "scrub";
  /** Entrance only: wait this long before the first word. */
  delay?: number;
  className?: string;
};

/**
 * Text split into words for per-word motion. Each word is a real text node
 * separated by real spaces, so it reads, copies and wraps exactly like the
 * plain string; the motion lives in motion.css and needs no JavaScript.
 */
export function WordReveal({ text, mode = "entrance", delay = 0, className = "" }: WordRevealProps) {
  const words = text.split(/\s+/).filter(Boolean);
  const n = words.length;
  return (
    <span
      className={`${mode === "entrance" ? "wr-in" : "wr-scrub"} ${className}`}
      style={mode === "entrance" ? ({ "--wr-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {words.map((word, i) => {
        // Scrub: words start between 18% and 52% of the text's pass across
        // the screen, each taking about 14% to reach full strength.
        const a = 18 + (n > 1 ? (i / (n - 1)) * 34 : 0);
        const vars: Record<string, string | number> = mode === "entrance" ? { "--w": i } : { "--a": a.toFixed(1), "--b": (a + 14).toFixed(1) };
        const style = vars as CSSProperties;
        return (
          <span key={i}>
            <span className="wr-w" style={style}>
              {word}
            </span>
            {i < n - 1 ? " " : null}
          </span>
        );
      })}
    </span>
  );
}

/** The "Label —— Title" line that opens a chapter; its rule draws in. */
export function Eyebrow({ lead, title, tone = "dark", accent, className = "" }: { lead: ReactNode; title?: ReactNode; tone?: "dark" | "light"; accent?: string; className?: string }) {
  const light = tone === "light";
  return (
    <p className={`text-eyebrow flex items-center gap-3 ${light ? "text-muted" : "text-dim-inverse"} ${className}`}>
      <span>{lead}</span>
      {title && (
        <>
          <span aria-hidden="true" className={`eyebrow-rule h-px w-8 ${light ? "bg-black/20" : "bg-white/20"}`} />
          <span style={{ color: accent }} className={accent ? "" : light ? "text-fg" : "text-fg-inverse"}>
            {title}
          </span>
        </>
      )}
    </p>
  );
}
