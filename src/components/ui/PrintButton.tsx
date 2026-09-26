"use client";

export function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-ripple=""
      className={`print-button group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent pr-5 pl-4 text-[0.9375rem] font-medium text-white transition-colors hover:bg-[#0858bd] ${className}`}
    >
      {/* A printer; its page slides out under the pointer. */}
      <svg viewBox="0 0 24 24" className="size-5 flex-none" aria-hidden="true" focusable="false">
        <path className="print-page" d="M7.5 13.5h9V21h-9z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 9V3.5h10V9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <rect x="3.5" y="9" width="17" height="7.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      Print or save as PDF
    </button>
  );
}
