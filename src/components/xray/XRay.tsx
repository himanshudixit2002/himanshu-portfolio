"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isTyping, isXray, setXray, subscribeXray, toggleXray } from "@/lib/xray";

export function useXray() {
  return useSyncExternalStore(subscribeXray, isXray, () => false);
}

/**
 * The "x" shortcut (never while typing, or with a modifier) and, while x-ray
 * mode is on, the corner note saying so, with a way out for touch screens.
 */
export function XRayHost() {
  const on = useXray();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "x" || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (isTyping(event.target) || document.querySelector("dialog[open]")) return;
      toggleXray();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!on) return null;
  return (
    <div role="status" className="xray-hud">
      <span aria-hidden="true" className="xray-hud-dot" />
      <span>
        X-ray: each outline says how that part is built.
        <span className="max-md:hidden"> Press x to leave.</span>
      </span>
      <button type="button" onClick={() => setXray(false)} className="xray-hud-exit">
        Leave
      </button>
    </div>
  );
}

/** The footer's switch for x-ray mode, beside Reduce motion. */
export function XRayToggle() {
  const on = useXray();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggleXray}
      className="xray-toggle group inline-flex min-h-11 items-center gap-3 rounded-full py-2 text-sm text-muted-inverse transition-colors hover:text-fg-inverse"
    >
      <span
        aria-hidden="true"
        className="relative h-6 w-10 rounded-full bg-ink-3 ring-1 ring-white/15 transition-colors group-aria-checked:bg-accent-bright"
      >
        <span className="absolute top-1 left-1 size-4 rounded-full bg-fg-inverse transition-transform duration-200 group-aria-checked:translate-x-4 group-aria-checked:bg-ink" />
      </span>
      X-ray
    </button>
  );
}
