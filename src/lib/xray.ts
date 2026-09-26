/*
 * X-ray mode: outlines the page's building blocks and labels each with how
 * it is built (the [data-xray] attributes; styles in globals.css). The state
 * is <html data-xray>, so CSS reads it directly; it lasts for the visit, not
 * across reloads.
 */

const EVENT = "hd-xray-change";

export const isXray = () => document.documentElement.hasAttribute("data-xray");

export function setXray(on: boolean) {
  document.documentElement.toggleAttribute("data-xray", on);
  window.dispatchEvent(new Event(EVENT));
}

export const toggleXray = () => setXray(!isXray());

export function subscribeXray(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** Whether a key press is someone typing, which shortcuts must leave alone. */
export function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.matches("input, textarea, select");
}
