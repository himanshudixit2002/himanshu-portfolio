const monthName = (ym: string) =>
  new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1, 1)).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

/** "Jun 2025 – present", "Aug 2026", "Feb 2026 – Mar 2026". */
export function formatPeriod(period: { start: string; end?: string }): string {
  if (!period.end) return `${monthName(period.start)} – present`;
  if (period.end === period.start) return monthName(period.start);
  return `${monthName(period.start)} – ${monthName(period.end)}`;
}
