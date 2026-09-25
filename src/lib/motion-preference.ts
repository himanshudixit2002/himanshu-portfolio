export const MOTION_STORAGE_KEY = "hd-motion";
export const MOTION_CHANGE_EVENT = "hd-motion-change";
export const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export type MotionChoice = "reduce" | "full";

/**
 * Runs before first paint (see app/layout.tsx). Marks the document as
 * script-capable and resolves the motion preference — a stored choice from the
 * footer switch wins, otherwise the OS setting — so CSS can pick the right
 * layout without a flash. Kept in sync with resolveMotion() below.
 */
export const motionInitScript = `(function(){var d=document.documentElement;d.setAttribute("data-js","");var s=null;try{s=localStorage.getItem("${MOTION_STORAGE_KEY}")}catch(e){}var r=s==="reduce"||(s!=="full"&&window.matchMedia("${REDUCED_QUERY}").matches);d.setAttribute("data-motion",r?"reduce":"full")})()`;

function readStoredChoice(): MotionChoice | null {
  try {
    const value = localStorage.getItem(MOTION_STORAGE_KEY);
    return value === "reduce" || value === "full" ? value : null;
  } catch {
    return null;
  }
}

/** Recomputes the effective preference and writes it to <html data-motion>. */
export function resolveMotion(): MotionChoice {
  const stored = readStoredChoice();
  const effective: MotionChoice = stored ?? (window.matchMedia(REDUCED_QUERY).matches ? "reduce" : "full");
  document.documentElement.setAttribute("data-motion", effective);
  return effective;
}

export function storeMotionChoice(choice: MotionChoice) {
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, choice);
  } catch {
    // Storage can be unavailable (private mode, blocked site data). The
    // choice still applies for this page view.
  }
  document.documentElement.setAttribute("data-motion", choice);
  window.dispatchEvent(new Event(MOTION_CHANGE_EVENT));
}
