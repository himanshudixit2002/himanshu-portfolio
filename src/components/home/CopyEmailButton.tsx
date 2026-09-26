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
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    timer.current = window.setTimeout(() => setStatus("idle"), 2400);
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[0.9375rem] font-medium text-fg ring-1 ring-black/15 transition-[background-color,transform] duration-200 ring-inset hover:bg-black/5 active:scale-[0.97]"
      >
        {/* On copy, the tick draws itself and the label slides in. */}
        {status === "copied" ? <Check className="draw-check size-4 text-accent" /> : <Copy className="size-4" />}
        <span key={status === "copied" ? "copied" : "idle"} className={status === "copied" ? "swap-in" : undefined}>
          {status === "copied" ? "Copied" : "Copy email"}
        </span>
      </button>
      <span role="status" className={status === "failed" ? "basis-full text-sm text-muted" : "sr-only"}>
        {messages[status]}
      </span>
    </>
  );
}
