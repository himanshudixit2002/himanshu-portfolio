import Link from "next/link";
import { capabilities, cleartrip } from "@/content/experience";
import { projects } from "@/content/projects";
import { formatPeriod } from "@/lib/format";
import { Stage } from "./Stage";

/* ── Timeline ────────────────────────────────────────────────────────────── */

const AXIS_START = "2025-01";
const AXIS_END = "2026-10";
const NOW = "2026-09";

const monthIndex = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
};
const SPAN = monthIndex(AXIS_END) - monthIndex(AXIS_START);
const pct = (ym: string) => ((monthIndex(ym) - monthIndex(AXIS_START)) / SPAN) * 100;

const TICKS = ["2025-01", "2025-04", "2025-07", "2025-10", "2026-01", "2026-04", "2026-07", "2026-10"];

export function Timeline() {
  const rows = [
    { key: "cleartrip", label: `${cleartrip.company} · ${cleartrip.title}`, href: "/about#experience", period: cleartrip.period, color: "#5ca4ff", role: true },
    ...[...projects]
      .sort((a, b) => a.period.start.localeCompare(b.period.start))
      .map((p) => ({ key: p.slug, label: p.title, href: `/work/${p.slug}`, period: p.period, color: p.accent, role: false })),
  ];

  return (
    <Stage
      title="Work over time"
      kind="Diagram"
      caption="Project spans come from each repository's first and last commits (or file dates where there is no repository). Open-ended bars are still active."
      xray="Server-rendered · each bar grows from its start date on a CSS view timeline · its period shows on hover or focus"
    >
      <div className="relative">
        <ol className="tl-list grid gap-1.5">
          {rows.map((r) => {
            const left = pct(r.period.start);
            const right = pct(r.period.end ?? NOW) + 100 / SPAN;
            return (
              <li key={r.key} className="tl-row grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[11rem_1fr]">
                <Link href={r.href} className={`hit block min-w-0 text-xs [--hit:1.625rem] hover:text-fg-inverse sm:text-sm ${r.role ? "font-semibold text-fg-inverse" : "text-muted-inverse"}`}>
                  <span className="block truncate">{r.label}</span>
                </Link>
                <div className="relative h-5 rounded-full bg-white/3">
                  <span
                    className="tl-bar absolute inset-y-0.5 rounded-full"
                    style={{ left: `${left}%`, width: `${Math.max(right - left, 2.5)}%`, background: r.color, opacity: r.role ? 0.9 : 0.75 }}
                  />
                  {/* Read out always; shown beside the bar under a pointer or focus. */}
                  <span className="tl-period" style={{ left: `${Math.min(left, 62)}%` }}>
                    {formatPeriod(r.period)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 grid grid-cols-[7.5rem_1fr] gap-3 sm:grid-cols-[11rem_1fr]" aria-hidden="true">
          <span />
          <div className="relative h-4 font-mono text-[0.625rem] text-dim-inverse">
            {TICKS.map((t) => (
              <span key={t} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${pct(t)}%` }}>
                {t.endsWith("-01") ? t.slice(0, 4) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ── Capability evidence map ─────────────────────────────────────────────── */

export function CapabilityMap() {
  const cols = projects;
  return (
    <Stage
      title="Capabilities, with the evidence"
      kind="Diagram"
      caption="No skill bars or percentages — each capability is claimed only where a project, or the Cleartrip role, demonstrates it. Select a project to read the case study."
      xray="Server-rendered from the content · on wider screens a table whose row and column light under the pointer (CSS :has, no script)"
    >
      {/* Phones: chips per capability */}
      <ul className="grid gap-5 md:hidden">
        {capabilities.map((c) => (
          <li key={c.id}>
            <p className="font-semibold">{c.name}</p>
            <p className="mt-1 text-sm text-muted-inverse">{c.description}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {c.experience && <li className="rounded-full bg-accent-bright/15 px-2.5 py-1 text-xs text-accent-bright">Cleartrip</li>}
              {c.projects.map((slug) => {
                const p = projects.find((x) => x.slug === slug)!;
                return (
                  <li key={slug}>
                    <Link href={`/work/${slug}`} className="hit inline-flex min-h-8 items-center rounded-full bg-white/6 px-2.5 text-xs [--hit:2.5rem] hover:bg-white/12">
                      {p.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      {/* Wider screens: a dot matrix */}
      <div className="hidden overflow-x-auto md:block">
        <table className="cap-map w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Which projects demonstrate each capability</caption>
          <thead>
            <tr>
              <th scope="col" className="w-56" />
              <th scope="col" className="h-36 w-10 align-bottom">
                <span className="block origin-bottom-left translate-x-5 -rotate-60 text-left text-xs font-semibold whitespace-nowrap text-accent-bright">Cleartrip</span>
              </th>
              {cols.map((p) => (
                <th key={p.slug} scope="col" className="h-36 w-10 align-bottom">
                  <Link href={`/work/${p.slug}`} className="block origin-bottom-left translate-x-5 -rotate-60 text-left text-xs font-normal whitespace-nowrap text-muted-inverse hover:text-fg-inverse">
                    {p.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capabilities.map((c) => (
              <tr key={c.id}>
                <th scope="row" className="min-w-[16rem] border-t border-white/8 py-3 pr-6 text-left align-top font-normal">
                  <span className="block font-semibold">{c.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-inverse">{c.description}</span>
                </th>
                <td className="border-t border-white/8 text-center">
                  {c.experience ? <Dot color="#5ca4ff" label={`${c.name}: Cleartrip`} /> : <Empty />}
                </td>
                {cols.map((p) => (
                  <td key={p.slug} className="border-t border-white/8 text-center">
                    {c.projects.includes(p.slug) ? <Dot color={p.accent} label={`${c.name}: ${p.title}`} /> : <Empty />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Stage>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-block size-3 rounded-full" style={{ background: color }}>
      <span className="sr-only">{label}</span>
    </span>
  );
}

function Empty() {
  return <span aria-hidden="true" className="inline-block size-1 rounded-full bg-white/15" />;
}

/* ── Price freshness (Cleartrip) ─────────────────────────────────────────── */

const FRESH = [
  { title: "A price changes", body: "The pricing system publishes an event." },
  { title: "Kafka carries it", body: "Consumers see the change within moments." },
  { title: "Redis key dropped", body: "The cached price for that stay is invalidated." },
  { title: "Next read refills", body: "One request goes to pricing; the rest hit cache again." },
];

export function PriceFreshness() {
  return (
    <Stage
      title="Cached, but never stale for long"
      kind="Diagram"
      caption="The pattern, drawn generically — cache reads by default, invalidate on change events. Not a map of Cleartrip's systems."
    >
      <ol className="grid gap-2 sm:grid-cols-4">
        {FRESH.map((s, i) => (
          <li key={s.title} className="relative rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <span className="font-mono text-[0.6875rem] text-accent-bright">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-1 text-sm font-semibold">{s.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-inverse">{s.body}</p>
          </li>
        ))}
      </ol>
    </Stage>
  );
}
