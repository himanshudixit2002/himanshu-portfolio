import s from "./system.module.css";

/*
 * Decorative drawings of SmartShelfKart's back-end layers. Names come from
 * the repository: pipeline stages from rag_backend, endpoints from
 * reporting_service, collection names from firestore.rules. The Surface /
 * System panel carries the same information as text.
 */

export type PipelineStage = "verify" | "facts" | "cache" | "router" | "bank" | "agent";

const pipeline: { id: PipelineStage; name: string; sub: string }[] = [
  { id: "verify", name: "Verify", sub: "member + grants" },
  { id: "facts", name: "Facts", sub: "tenant snapshot" },
  { id: "cache", name: "Cache", sub: "fingerprint key" },
  { id: "router", name: "Router", sub: "regex tiers" },
  { id: "bank", name: "Answer bank", sub: "0 tokens" },
  { id: "agent", name: "Agent", sub: "tool calls" },
];

export function AssistantPlaneArt({ active }: { active?: PipelineStage | null }) {
  return (
    <div className={s.frame} aria-hidden="true">
      <div className={`${s.plane} ${s.assistant}`}>
        <div className={s.head}>
          <span className={s.title}>Assistant service</span>
          <span className={s.meta}>rag_backend/</span>
        </div>
        <div className={s.pipeline}>
          {pipeline.map((stage) => (
            <div key={stage.id} className={`${s.stage} ${active === stage.id ? s.active : ""}`}>
              <span className={s.stageName}>{stage.name}</span>
              <span className={s.stageSub}>{stage.sub}</span>
            </div>
          ))}
        </div>
        <div className={s.foot}>
          <span className={s.tag}>FastAPI</span>
          <span className={s.tag}>LangGraph</span>
          <span className={s.tag}>Admin SDK</span>
          <span className={s.tag}>preview → confirm</span>
        </div>
      </div>
    </div>
  );
}

const endpoints = ["tax-summary", "aging", "profit-and-loss", "customer-balances"];
const bars = [46, 62, 54, 78, 70, 88];

export function ReportingPlaneArt() {
  return (
    <div className={s.frame} aria-hidden="true">
      <div className={`${s.plane} ${s.reporting}`}>
        <div className={s.head}>
          <span className={s.title}>Reporting service</span>
          <span className={s.meta}>PostgreSQL read model</span>
        </div>
        <div className={s.reportBody}>
          <div className={s.endpoints}>
            {endpoints.map((e) => (
              <span key={e} className={s.endpoint}>
                <b>GET</b>/api/reports/{e}
              </span>
            ))}
          </div>
          <div className={s.bars}>
            {bars.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className={s.foot}>
          <span className={s.tag}>Spring Boot 3</span>
          <span className={s.tag}>Flyway</span>
          <span className={s.tag}>full rebuild</span>
          <span className={s.tag}>BIGINT minor units</span>
        </div>
      </div>
    </div>
  );
}

const collections = [
  "products",
  "transactions",
  "vendors",
  "invoices",
  "customers",
  "purchaseOrders",
  "salesOrders",
  "shipments",
  "serials",
  "batches",
  "members",
  "roles",
];
const factSources = new Set(["products", "transactions", "vendors"]);

export function RulesPlaneArt({ reading }: { reading?: boolean }) {
  return (
    <div className={s.frame} aria-hidden="true">
      <div className={`${s.plane} ${s.rules}`}>
        <div className={s.head}>
          <span className={s.title}>Cloud Firestore</span>
          <span className={s.meta}>firestore.rules</span>
        </div>
        <span className={s.path}>companies/{"{companyId}"}/…</span>
        <div className={s.collections}>
          {collections.map((c) => (
            <span key={c} className={`${s.collection} ${reading && factSources.has(c) ? s.active : ""}`}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
