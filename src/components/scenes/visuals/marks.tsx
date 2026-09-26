export const PASS = "#6ee7b7";
export const FAIL = "#fda4af";

/**
 * A pass/fail mark centred at (x, y): a tinted disc with a drawn tick or
 * cross. Drawn, not typed — ✓ and ✕ aren't in the site's fonts, and a
 * fallback-font lookup mid-scroll costs a frame.
 */
export function Mark({ x, y, ok, r = 8 }: { x: number; y: number; ok: boolean; r?: number }) {
  const k = r / 8;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={ok ? "rgb(52 211 153 / 0.2)" : "rgb(251 113 133 / 0.22)"} />
      <path
        d={ok ? `M${x - 3.5 * k} ${y + 0.2 * k} l${2.4 * k} ${2.4 * k} l${4.6 * k} ${-4.8 * k}` : `M${x - 3 * k} ${y - 3 * k} l${6 * k} ${6 * k} m0 ${-6 * k} l${-6 * k} ${6 * k}`}
        fill="none"
        stroke={ok ? PASS : FAIL}
        strokeWidth={1.8 * k}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** A right-pointing arrow from (x1, y) to (x2, y), drawn (→ isn't in the site's fonts). */
export function Arrow({ x1, x2, y, color = "rgb(255 255 255 / 0.35)" }: { x1: number; x2: number; y: number; color?: string }) {
  return <path d={`M${x1} ${y} H${x2} m-5 -4 l5 4 l-5 4`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />;
}
