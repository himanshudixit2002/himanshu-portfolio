"use client";

export function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-[0.9375rem] font-medium text-white transition-colors hover:bg-[#0858bd] ${className}`}
    >
      Print or save as PDF
    </button>
  );
}
