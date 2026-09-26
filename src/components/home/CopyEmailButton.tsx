"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@/components/ui/icons";

type Status = "idle" | "copied" | "failed";

const messages: Record<Status, string> = {
  idle: "",
  copied: "Email address copied to the clipboard.",
  failed: "Couldn't copy — select the address to copy it by hand.",
};

export function CopyEmailButton({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>("idle");
  // Each copy sends a paper plane off the button (a fresh one per copy).
  const [flights, setFlights] = useState(0);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
      setFlights((n) => n + 1);
    } catch {
      setStatus("failed");
    }
    timer.current = window.setTimeout(() => setStatus("idle"), 2400);
  };

  return (
    <>
      <span className="needs-js relative inline-flex">
        <button
          type="button"
          onClick={copy}
          data-ripple=""
          className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[0.9375rem] font-medium text-fg ring-1 ring-black/15 transition-[background-color,scale] duration-200 ring-inset hover:bg-black/5 active:scale-[0.97]"
        >
          {/* On copy, the tick draws itself and the label slides in. */}
          {status === "copied" ? <Check className="draw-check size-4 text-accent" /> : <Copy className="size-4" />}
          <span key={status === "copied" ? "copied" : "idle"} className={status === "copied" ? "swap-in" : undefined}>
            {status === "copied" ? "Copied" : "Copy email"}
          </span>
        </button>
        {flights > 0 && (
          <svg key={flights} viewBox="0 0 24 24" className="paper-plane" aria-hidden="true" focusable="false">
            <path d="M3 11.5 21 3l-6.5 18-3.2-7.3L3 11.5Z" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="m11.3 13.7 4.2-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span role="status" className={status === "failed" ? "basis-full text-sm text-muted" : "sr-only"}>
        {messages[status]}
      </span>
    </>
  );
}
