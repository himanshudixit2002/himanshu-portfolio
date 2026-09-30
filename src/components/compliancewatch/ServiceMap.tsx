import type { CSSProperties } from "react";
import { SERVICES, type ServiceId } from "@/content/compliancewatch/system";
import s from "./deep.module.css";

type NodeId = ServiceId | "regulators" | "owner";
type Edge = { from: NodeId; to: NodeId; kind: "event" | "http" | "outside"; label?: string; path?: string; lx?: number; ly?: number };

/** Where each box sits in the drawing (centre x, centre y), in flow order: left to right, then the helpers below. */
const POS: Record<NodeId, [number, number]> = {
  regulators: [50, 78],
  pipeline: [190, 78],
  rulebook: [350, 78],
  "applicability-engine": [510, 78],
  obligation: [670, 78],
  notification: [830, 78],
  owner: [1000, 78],
  "llm-gateway": [190, 250],
  qa: [350, 250],
  profile: [510, 250],
  web: [670, 250],
  identity: [830, 250],
  "whatsapp-bot": [1000, 250],
  eval: [190, 376],
};

const W = 128;
const H = 50;

/** The system's wiring: events through the outbox (solid), HTTP calls (dashed), and the world outside. */
const EDGES: Edge[] = [
  { from: "regulators", to: "pipeline", kind: "outside" },
  { from: "pipeline", to: "rulebook", kind: "http", label: "documents" },
  { from: "rulebook", to: "applicability-engine", kind: "event", label: "rule.published" },
  {
    from: "rulebook",
    to: "obligation",
    kind: "event",
    label: "rule.deadline_changed",
    path: `M350 ${78 - H / 2} C 350 4, 670 4, 670 ${78 - H / 2}`,
    lx: 510,
    ly: 22,
  },
  { from: "applicability-engine", to: "obligation", kind: "event", label: "applicability.decided" },
  { from: "profile", to: "applicability-engine", kind: "event", label: "profile.updated" },
  { from: "obligation", to: "notification", kind: "event", label: "obligation.*" },
  { from: "notification", to: "owner", kind: "outside" },
  { from: "owner", to: "whatsapp-bot", kind: "outside", label: "replies" },
  { from: "whatsapp-bot", to: "notification", kind: "http" },
  { from: "whatsapp-bot", to: "identity", kind: "http" },
  { from: "pipeline", to: "llm-gateway", kind: "http" },
  { from: "qa", to: "llm-gateway", kind: "http" },
  { from: "qa", to: "rulebook", kind: "http" },
  { from: "qa", to: "profile", kind: "http" },
  { from: "eval", to: "llm-gateway", kind: "http" },
  { from: "web", to: "profile", kind: "http" },
  { from: "web", to: "obligation", kind: "http" },
  { from: "web", to: "identity", kind: "http" },
];

/** A straight line from one box's edge to the other's, along the axis they differ on most. */
function line(from: NodeId, to: NodeId) {
  const [x1, y1] = POS[from];
  const [x2, y2] = POS[to];
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dy) < 1) {
    const sx = x1 + Math.sign(dx) * (from === "regulators" || from === "owner" ? 40 : W / 2);
    const ex = x2 - Math.sign(dx) * (to === "owner" || to === "regulators" ? 40 : W / 2);
    // The gap between neighbours is too short to write on: the topic sits under it.
    return { d: `M${sx} ${y1} H${ex}`, mx: (sx + ex) / 2, my: y1 + H / 2 + 17 };
  }
  if (Math.abs(dx) < 1) {
    const sy = y1 + Math.sign(dy) * H / 2;
    const ey = y2 - Math.sign(dy) * H / 2;
    return { d: `M${x1} ${sy} V${ey}`, mx: x1 + 8, my: (sy + ey) / 2 + 4 };
  }
  const sy = y1 - H / 2;
  const ey = y2 + H / 2;
  return { d: `M${x1 - 30} ${sy} L${x2 + 30} ${ey}`, mx: (x1 + x2) / 2, my: (sy + ey) / 2 };
}

const neighbours = (id: NodeId) => [id, ...EDGES.filter((e) => e.from === id || e.to === id).map((e) => (e.from === id ? e.to : e.from))];

/**
 * Pointing at a service (in the drawing or its card) lights its wires and its
 * neighbours and dims the rest: generated rules on :has(), no script. The
 * drawing is one labelled image; the cards say everything in it as text.
 */
const HIGHLIGHT = (Object.keys(POS) as NodeId[])
  .map((id) => {
    const on = `[data-cw-map]:has([data-node="${id}"]:hover)`;
    return `${on} [data-ends]:not([data-ends~="${id}"]) { opacity: 0.1; }
${on} [data-ends~="${id}"] { opacity: 1; }
${on} [data-links]:not([data-links~="${id}"]) { opacity: 0.3; }`;
  })
  .join("\n");

const byId = new Map(SERVICES.map((svc) => [svc.id, svc]));

/**
 * ComplianceWatch's ten services and two apps, as the wiring between them:
 * the event backbone left to right, the services it leans on below; the
 * cards underneath say the same in words (and are all a phone shows).
 */
export function ServiceMap({ accent }: { accent: string }) {
  return (
    <div data-cw-map="" className={s.map} style={{ "--accent": accent } as CSSProperties}>
      <style>{HIGHLIGHT}</style>
      <figure className={s.diagram} data-xray-wide="" data-xray="Server-rendered SVG · pointing at a service lights its wires via generated :has() rules — no script">
        <svg viewBox="0 0 1080 412" className="block w-full" role="img" aria-label="ComplianceWatch's services and how they connect: regulators feed the pipeline, which registers documents in the rulebook; the rulebook's events reach the applicability engine and the obligation service, which feeds notification, which reaches the owner on WhatsApp. Below: the llm-gateway every model call goes through, question answering, profile, the web app, identity, the WhatsApp bot and the eval service.">
          <defs>
            <marker id="cw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="context-stroke" />
            </marker>
          </defs>
          {EDGES.map((e) => {
            const geo = e.path ? { d: e.path, mx: e.lx!, my: e.ly! } : line(e.from, e.to);
            return (
              <g key={`${e.from}-${e.to}`} data-ends={`${e.from} ${e.to}`} className={s.edge}>
                <path
                  d={geo.d}
                  fill="none"
                  stroke={e.kind === "event" ? accent : "rgb(255 255 255 / 0.35)"}
                  strokeWidth={e.kind === "event" ? 2 : 1.4}
                  strokeDasharray={e.kind === "http" ? "5 5" : undefined}
                  markerEnd="url(#cw-arrow)"
                />
                {e.label && (
                  <text x={geo.mx} y={geo.my} fontSize="10.5" textAnchor={Math.abs(POS[e.from][0] - POS[e.to][0]) < 1 ? "start" : "middle"} className={s.edgeLabel} fill={e.kind === "event" ? accent : "#a1a1a6"}>
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
          {(Object.keys(POS) as NodeId[]).map((id) => {
            const [cx, cy] = POS[id];
            const svc = byId.get(id as ServiceId);
            const outside = !svc;
            const w = outside ? 80 : W;
            return (
              <g key={id} data-node={id} data-links={neighbours(id).join(" ")} className={s.node}>
                <rect x={cx - w / 2} y={cy - H / 2} width={w} height={H} rx={outside ? H / 2 : 12} className={outside ? s.outside : svc!.kind === "app" ? s.app : s.box} />
                <text x={cx} y={cy - 2} fontSize="11.5" fontWeight="650" textAnchor="middle" fill="#f5f5f7" className={outside ? undefined : s.mono}>
                  {outside ? (id === "owner" ? "The owner" : "Regulators") : svc!.name}
                </text>
                <text x={cx} y={cy + 14} fontSize="10" textAnchor="middle" fill="#86868b">
                  {outside ? (id === "owner" ? "phone or inbox" : "5 feeds") : svc!.kind === "app" ? "app" : `:${svc!.port} · ${svc!.schema}`}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-dim-inverse">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-0.5 w-6 rounded-full" style={{ background: accent }} /> Event, through the outbox and Kafka
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="w-6 border-t border-dashed border-white/40" /> HTTP call
          </span>
          <span>Point at a service to light its wires.</span>
        </figcaption>
      </figure>

      <ul className={s.cards}>
        {SERVICES.map((svc) => (
          <li key={svc.id} data-node={svc.id} className={s.card}>
            <p className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-fg-inverse">{svc.name}</span>
              <span className="font-mono text-[0.6875rem] text-dim-inverse">{svc.kind === "app" ? "app" : `:${svc.port} · schema ${svc.schema}`}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-inverse text-pretty">{svc.owns}</p>
            {(svc.emits.length > 0 || svc.consumes.length > 0) && (
              <div className="mt-3 grid gap-1.5">
                {svc.emits.length > 0 && <Topics label="Emits" topics={svc.emits} accent={accent} />}
                {svc.consumes.length > 0 && <Topics label="Consumes" topics={svc.consumes} />}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Topics({ label, topics, accent }: { label: string; topics: string[]; accent?: string }) {
  return (
    <p className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[0.6875rem] font-semibold tracking-[0.04em] text-dim-inverse uppercase">{label}</span>
      {topics.map((t) => (
        <span key={t} className="rounded-full px-2 py-0.5 font-mono text-[0.6875rem]" style={accent ? { color: accent, boxShadow: `inset 0 0 0 1px ${accent}55` } : { color: "#a1a1a6", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.12)" }}>
          {t}
        </span>
      ))}
    </p>
  );
}
