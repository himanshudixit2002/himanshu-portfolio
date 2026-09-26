/*
 * The site's small secrets: things to find by playing with it. Each is
 * recorded in the visitor's own browser the first time (lib/explored's
 * discover), which shows a note saying so; the palette lists them, with a
 * hint for the ones still to find. The hints invite; they never claim.
 */

export type Discovery = {
  id: string;
  name: string;
  /** For one not yet found: where to look. */
  hint: string;
  /** Where choosing it in the palette goes, if anywhere. */
  href?: string;
};

export const DISCOVERIES: Discovery[] = [
  { id: "hello", name: "Hello there", hint: "Tap someone until they run out of things to say.", href: "/#hello" },
  { id: "palette", name: "Command line", hint: "⌘K, Ctrl+K or / opens a shortcut to everything." },
  { id: "xray", name: "X-ray vision", hint: "Press x, or find the switch in the footer." },
  { id: "explorer", name: "Completionist", hint: "Open every project.", href: "/work" },
  { id: "konami", name: "Old school", hint: "A classic cheat code works here." },
];

export const discoveryName = (id: string) => DISCOVERIES.find((d) => d.id === id)?.name ?? id;
