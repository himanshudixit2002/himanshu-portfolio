/** The HD mark — a small identity detail, never a hero element. */
export function Monogram({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid size-7 place-items-center rounded-[0.55rem] bg-linear-to-br from-white/16 to-white/4 text-[0.6875rem] font-bold tracking-[-0.04em] text-fg-inverse ring-1 ring-white/18 ring-inset ${className}`}
    >
      HD
    </span>
  );
}
