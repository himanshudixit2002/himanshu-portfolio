import type { CSSProperties, ReactNode } from "react";
import s from "./art.module.css";

/*
 * Original drawings of SmartShelfKart screens, with sample data for a
 * fictional "Sample Store". Labels mirror the real app (dashboard tiles,
 * quick actions, Nova), but these are illustrations, not captures — every use
 * carries an accessible label that says so.
 */

type ArtProps = { label: string; onLight?: boolean; className?: string };

function BrowserWindow({ label, onLight, className = "", children }: ArtProps & { children: ReactNode }) {
  return (
    <div role="img" aria-label={label} className={`${s.frame} ${onLight ? s.onLight : ""} ${className}`}>
      <div className={s.window}>
        <div className={s.chrome}>
          <span className={s.dot} />
          <span className={s.dot} />
          <span className={s.dot} />
          <span className={s.url}>smartshelfkart.com/app</span>
        </div>
        <div className={s.app}>
          <div className={s.sidebar}>
            <span className={s.logo} />
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className={`${s.navIcon} ${i === 0 ? s.navIconActive : ""}`} />
            ))}
          </div>
          <div className={s.main}>{children}</div>
        </div>
      </div>
    </div>
  );
}

const trend = [62, 58, 61, 55, 57, 52, 60, 66, 63, 70, 68, 74, 71, 78, 76, 83];

function trendPath(values: number[], close: boolean) {
  const max = 100;
  const step = 300 / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(max - v).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;
  return close ? `${line} L300,100 L0,100 Z` : line;
}

const lowStock = [
  { name: "Masking tape 24 mm", qty: 6, reorder: 25 },
  { name: "Blue widget", qty: 12, reorder: 40 },
  { name: "Cable ties 200 mm", qty: 30, reorder: 100 },
  { name: "Wall plug 8 mm", qty: 45, reorder: 120 },
];

export function SskOverviewArt(props: ArtProps) {
  return (
    <BrowserWindow {...props}>
      <div className={s.header}>
        <div>
          <div className={s.h1}>Dashboard</div>
          <div className={s.sub}>Sample Store · Today</div>
        </div>
        <div className={s.search}>Search products, SKUs…</div>
      </div>

      <div className={s.stats}>
        {[
          { label: "Products", value: "1,248", chip: "" },
          { label: "Low stock", value: "23", chip: s.chipAmber },
          { label: "Out of stock", value: "4", chip: s.chipRed },
          { label: "Pending orders", value: "12", chip: s.chipBlue },
        ].map((stat) => (
          <div key={stat.label} className={s.card}>
            <div className={s.statLabel}>
              <span className={`${s.chip} ${stat.chip}`} />
              {stat.label}
            </div>
            <div className={s.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className={s.actions}>
        {[
          ["Stock In", "Add items"],
          ["Stock Out", "Remove"],
          ["Transfer", "Move"],
          ["Damage", "Report"],
        ].map(([title, sub]) => (
          <div key={title} className={s.action}>
            <span className={s.actionIcon} />
            <span>
              {title}
              <span className={s.actionSub}>{sub}</span>
            </span>
          </div>
        ))}
      </div>

      <div className={s.split}>
        <div className={s.card}>
          <div className={s.cardTitle}>
            Stock trend <span className={s.cardMeta}>Last 30 days</span>
          </div>
          <svg className={s.chart} viewBox="0 0 300 100" preserveAspectRatio="none">
            {[25, 50, 75].map((y) => (
              <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#e4e4e7" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={trendPath(trend, true)} fill="#0d9488" fillOpacity="0.12" />
            <path
              d={trendPath(trend, false)}
              fill="none"
              stroke="#0d9488"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className={s.card}>
          <div className={s.cardTitle}>
            Low stock <span className={s.cardMeta}>View all</span>
          </div>
          <div className={s.rows}>
            {lowStock.map((item) => (
              <div key={item.name} className={s.row}>
                <span className={s.rowName}>{item.name}</span>
                <span className={s.rowQty}>
                  {item.qty} / {item.reorder}
                </span>
                <span className={s.bar}>
                  <i style={{ width: `${Math.round((item.qty / item.reorder) * 100)}%` }} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserWindow>
  );
}

const inventory = [
  { name: "Blue widget", sku: "BW-1042", qty: 12, status: "low" },
  { name: "Steel hinge 4 in", sku: "SH-0410", qty: 86, status: "ok" },
  { name: "Masking tape 24 mm", sku: "MT-0024", qty: 6, status: "low" },
  { name: "LED bulb 9 W", sku: "LB-0009", qty: 240, status: "ok" },
  { name: "Wood screws 40 mm", sku: "WS-0040", qty: 0, status: "out" },
  { name: "Cable ties 200 mm", sku: "CT-2000", qty: 30, status: "low" },
  { name: "Paint roller 9 in", sku: "PR-0009", qty: 58, status: "ok" },
  { name: "Wall plug 8 mm", sku: "WP-0008", qty: 45, status: "low" },
] as const;

const statusText = { ok: "In stock", low: "Low", out: "Out" } as const;
const statusClass = { ok: "", low: s.pillLow, out: s.pillOut } as const;

export function SskInventoryArt(props: ArtProps) {
  return (
    <BrowserWindow {...props}>
      <div className={s.header}>
        <div>
          <div className={s.h1}>Inventory</div>
          <div className={s.sub}>1,248 products · 3 locations</div>
        </div>
        <div className={s.search}>Search or scan a barcode…</div>
      </div>
      <div className={s.toolbar}>
        <span className={`${s.filter} ${s.filterOn}`}>All</span>
        <span className={s.filter}>Low stock</span>
        <span className={s.filter}>Out of stock</span>
        <span className={s.filter}>Main warehouse</span>
        <span className={s.primaryBtn}>+ Add item</span>
      </div>
      <div className={`${s.card} ${s.table}`}>
        <div className={`${s.tr} ${s.th}`}>
          <span>Product</span>
          <span>SKU</span>
          <span>On hand</span>
          <span>Status</span>
        </div>
        {inventory.map((item) => (
          <div key={item.sku} className={s.tr}>
            <span className={s.product}>
              <span className={s.thumb} />
              <span className={s.rowName}>{item.name}</span>
            </span>
            <span className={s.mono}>{item.sku}</span>
            <span className={s.num}>{item.qty}</span>
            <span className={`${s.pill} ${statusClass[item.status]}`}>{statusText[item.status]}</span>
          </div>
        ))}
      </div>
    </BrowserWindow>
  );
}

type Conversation = "low-stock" | "confirm-write";
type NovaProps = ArtProps & {
  conversation: Conversation;
  /** Also draw the other sample conversation, hidden until a [data-swap-root] around it is marked data-swapped (Fx). */
  both?: boolean;
};
const bubble = (i: number) => ({ "--i": i }) as CSSProperties;

function Thread({ conversation }: { conversation: Conversation }) {
  return conversation === "low-stock" ? (
    <>
      <div data-bubble className={s.bubbleUser} style={bubble(0)}>
        What&rsquo;s running low?
      </div>
      <div className={s.answer}>
        <div data-bubble className={s.answerText} style={bubble(1)}>
          4 products are below their reorder point.
        </div>
        <div data-bubble className={s.answerRows} style={bubble(2)}>
          {lowStock.map((item) => (
            <div key={item.name} className={s.answerRow}>
              <span>{item.name}</span>
              <b>{item.qty} left</b>
            </div>
          ))}
        </div>
      </div>
    </>
  ) : (
    <>
      {/* data-bubble: a chapter can bring these in one by one (.bubble-seq in motion.css). */}
      <div data-bubble className={s.bubbleUser} style={bubble(0)}>
        Add 50 units of the blue widgets
      </div>
      <div className={s.answer}>
        <div data-bubble className={s.answerText} style={bubble(1)}>
          Here&rsquo;s the change. Nothing is saved until you confirm.
        </div>
        <div data-bubble className={s.preview} style={bubble(2)}>
          <div className={s.previewTag}>Stock in · preview</div>
          <div className={s.previewItem}>Blue widget</div>
          <div className={s.previewDelta}>
            12 → <strong>62</strong> units
          </div>
          <div className={s.previewButtons}>
            <span>Cancel</span>
            <span>Confirm</span>
          </div>
        </div>
      </div>
    </>
  );
}

export function NovaPhoneArt({ label, onLight, className = "", conversation, both = false }: NovaProps) {
  const other: Conversation = conversation === "low-stock" ? "confirm-write" : "low-stock";
  return (
    <div role="img" aria-label={label} className={`${s.frame} ${onLight ? s.onLight : ""} ${className}`}>
      <div className={s.phone}>
        <div className={s.phoneScreen}>
          <span className={s.island} />
          <div className={s.novaHead}>
            <span className={s.novaMark} />
            <div>
              <div className={s.novaTitle}>Nova</div>
              <div className={s.novaSub}>Inventory assistant</div>
            </div>
          </div>
          <div className={s.thread} data-thread={both ? "main" : undefined}>
            <Thread conversation={conversation} />
          </div>
          {both && (
            <div className={s.thread} data-thread="alt">
              <Thread conversation={other} />
            </div>
          )}
          <div className={s.composer}>Ask about your stock…</div>
        </div>
      </div>
    </div>
  );
}
