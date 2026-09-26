"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  MOTION_CHANGE_EVENT,
  REDUCED_QUERY,
  resolveMotion,
  storeMotionChoice,
} from "@/lib/motion-preference";

type MotionPreference = {
  reduced: boolean;
  setReduced: (reduced: boolean) => void;
};

const MotionPreferenceContext = createContext<MotionPreference>({
  reduced: false,
  setReduced: () => {},
});

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_QUERY);
  const sync = () => {
    resolveMotion();
    onChange();
  };
  query.addEventListener("change", sync);
  window.addEventListener("storage", sync);
  window.addEventListener(MOTION_CHANGE_EVENT, onChange);
  return () => {
    query.removeEventListener("change", sync);
    window.removeEventListener("storage", sync);
    window.removeEventListener(MOTION_CHANGE_EVENT, onChange);
  };
}

const getSnapshot = () => document.documentElement.getAttribute("data-motion") === "reduce";
const getServerSnapshot = () => false;

/**
 * One source of truth for reduced effects: the OS setting, overridden by the
 * footer switch. Motion components follow it through MotionConfig; CSS follows
 * the same value through <html data-motion>.
 */
export function MotionPreferences({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setReduced = useCallback((next: boolean) => storeMotionChoice(next ? "reduce" : "full"), []);
  const value = useMemo(() => ({ reduced, setReduced }), [reduced, setReduced]);

  return (
    <MotionPreferenceContext.Provider value={value}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference() {
  return useContext(MotionPreferenceContext);
}

export function MotionToggle({ className = "" }: { className?: string }) {
  const { reduced, setReduced } = useMotionPreference();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduced}
      onClick={() => setReduced(!reduced)}
      className={`needs-js group inline-flex min-h-11 items-center gap-3 rounded-full py-2 text-sm text-muted-inverse transition-colors hover:text-fg-inverse ${className}`}
    >
      <span
        aria-hidden="true"
        className="relative h-6 w-10 rounded-full bg-ink-3 ring-1 ring-white/15 transition-colors group-aria-checked:bg-accent-bright"
      >
        <span className="absolute top-1 left-1 size-4 rounded-full bg-fg-inverse transition-transform duration-200 group-aria-checked:translate-x-4 group-aria-checked:bg-ink" />
      </span>
      Reduce motion
    </button>
  );
}
