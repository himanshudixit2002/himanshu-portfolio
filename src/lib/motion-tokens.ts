/**
 * Motion values shared by Motion components, matching the CSS tokens in
 * globals.css (--ease-*, --dur-*). Durations are in seconds, as Motion wants.
 */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  emphasized: [0.2, 0, 0, 1],
} as const;

export const dur = {
  micro: 0.16,
  base: 0.32,
  slow: 0.62,
  cinematic: 0.9,
} as const;

export const spring = {
  /** Controls and small pieces: fast, no visible bounce. */
  snappy: { type: "spring", stiffness: 520, damping: 40, mass: 1 },
  /** Larger surfaces settling into place. */
  gentle: { type: "spring", stiffness: 170, damping: 26, mass: 1 },
  /** Things that arrive: a small overshoot. */
  bouncy: { type: "spring", stiffness: 320, damping: 20, mass: 1 },
} as const;
