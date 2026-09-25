import s from "./chapters.module.css";

/* Drawings with sample data. No client photos, logos or real records. */

export function ElepeiaArt({ label, onDark }: { label: string; onDark?: boolean }) {
  return (
    <div role="img" aria-label={label} className={`${s.frame} ${onDark ? s.onDark : ""}`}>
      <div className={s.shop}>
        <div className={s.bar}>
          <span className={s.dot} />
          <span className={s.dot} />
          <span className={s.dot} />
          <span className={s.url}>elepeia.com/products/…</span>
        </div>
        <div className={s.nav}>
          <span>New</span>
          <span>Shirts</span>
          <span>Trousers</span>
          <span>Knitwear</span>
        </div>
        <div className={s.pdp}>
          <div className={s.gallery}>
            <div className={s.thumbs}>
              <span className={s.thumb} />
              <span className={s.thumb} />
              <span className={s.thumb} />
            </div>
            <div className={s.hero}>
              <svg viewBox="0 0 100 110" className={s.garment}>
                <path
                  d="M35 8 L50 16 L65 8 L88 20 L96 46 L80 50 L78 104 L22 104 L20 50 L4 46 L12 20 Z"
                  fill="#f7f2ea"
                  stroke="#c9b79c"
                  strokeWidth="0.8"
                />
                <path d="M50 16 L50 104" stroke="#d8cbb6" strokeWidth="0.6" />
                {[30, 44, 58, 72, 86].map((y) => (
                  <circle key={y} cx="52.5" cy={y} r="1.1" fill="#b8a283" />
                ))}
              </svg>
            </div>
          </div>
          <div className={s.info}>
            <span className={s.crumb}>Shirts · Summer edit</span>
            <span className={s.name}>Linen overshirt</span>
            <span className={s.price}>
              ₹4,490<span className={s.tax}>incl. GST</span>
            </span>
            <div className={s.sizes}>
              {["S", "M", "L", "XL"].map((z) => (
                <span key={z} className={`${s.size} ${z === "M" ? s.sizeOn : ""}`}>
                  {z}
                </span>
              ))}
            </div>
            <span className={s.bag}>Add to bag</span>
            <span className={s.note}>Price and stock confirmed by the server at checkout.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const FLOOR = [
  { name: "Snooker 1", state: "running", meta: "00:42 · ₹210" },
  { name: "Snooker 2", state: "billing", meta: "Bill ₹640" },
  { name: "Pool 1", state: "running", meta: "01:05 · ₹217" },
  { name: "Carrom", state: "free", meta: "Free" },
  { name: "Darts", state: "free", meta: "Free" },
  { name: "PS5", state: "running", meta: "00:18 · ₹45" },
] as const;

export function CafeFloorArt({ label }: { label: string }) {
  return (
    <div role="img" aria-label={label} className={s.frame}>
      <div className={s.tablet}>
        <div className={s.screen}>
          <div className={s.floorHead}>
            <span className={s.floorTitle}>Tables</span>
            <span className={s.floorClock}>19:42</span>
          </div>
          <div className={s.tables}>
            {FLOOR.map((t) => (
              <div key={t.name} className={`${s.tableCard} ${t.state === "running" ? s.running : t.state === "billing" ? s.billing : ""}`}>
                <span className={s.tableName}>{t.name}</span>
                <span className={t.state === "free" ? s.tableFree : s.tableMeta}>{t.meta}</span>
              </div>
            ))}
          </div>
          <div className={s.kitchen}>
            <span className={s.kitchenTitle}>Kitchen</span>
            <span className={s.ticket}>
              Cold coffee <span className={`${s.status} ${s.preparing}`}>Preparing</span>
            </span>
            <span className={s.ticket}>
              Fries <span className={`${s.status} ${s.ready}`}>Ready</span>
            </span>
            <span className={s.ticket}>
              Masala chai <span className={`${s.status} ${s.pending}`}>Pending</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
