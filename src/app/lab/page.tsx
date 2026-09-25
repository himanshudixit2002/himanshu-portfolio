import type { Metadata } from "next";
import Link from "next/link";
import { SurfaceSystem } from "@/components/home/SurfaceSystem";
import { ArrowRight } from "@/components/ui/icons";
import { LazyVisual, type InteractiveId } from "@/components/visuals/LazyVisual";

export const metadata: Metadata = {
  title: "Lab",
  description: "Interactive simulations of systems Himanshu Dixit has built — a sharded key-value store, a self-healing cache, a URL shortener's safety checks and more.",
  alternates: { canonical: "/lab" },
};

const LABS: { id: InteractiveId; slug: string; title: string; body: string }[] = [
  {
    id: "kv-explorer",
    slug: "kvstore",
    title: "A key-value store, command by command",
    body: "Send commands to a model of KVStore and watch keys hash onto shards, fall out of LRU order, expire lazily and queue for the write-ahead log.",
  },
  {
    id: "cluster-lab",
    slug: "self-healing-cache",
    title: "A cache that heals itself",
    body: "Take nodes down and bring them back. Quorum keeps reads and writes working; hints and anti-entropy put the data back.",
  },
  {
    id: "shortener-lab",
    slug: "url-shortener",
    title: "Short codes and unsafe URLs",
    body: "Turn row ids into Base62 codes, then try to sneak a private address past the SSRF rules.",
  },
  {
    id: "fraud-graph",
    slug: "fraud-ring-engine",
    title: "Rings in a transaction graph",
    body: "Pick an account and follow its two-hop neighbourhood through shared devices and cards.",
  },
  {
    id: "gateway-anomaly",
    slug: "ai-api-gateway",
    title: "An Isolation Forest, in your browser",
    body: "Move the threshold and see which synthetic requests a real isolation forest finds easy to separate.",
  },
  {
    id: "two-sum",
    slug: "padhna-tho-padega",
    title: "Two Sum, stepped through",
    body: "The one-pass hash-map solution, one decision at a time.",
  },
];

export default function LabPage() {
  return (
    <>
      <section className="container-page pt-[calc(var(--nav-h)+clamp(3rem,8vw,6rem))]">
        <p className="text-eyebrow text-accent-bright">Lab</p>
        <h1 className="mt-4 max-w-4xl text-display text-[clamp(2.5rem,7vw,5.5rem)] text-balance">Poke at the ideas.</h1>
        <p className="text-lede mt-6 max-w-2xl text-muted-inverse">
          Small, honest simulations of the systems behind my projects. They run entirely in your browser on sample data — each one says exactly what it models and what it leaves out.
        </p>
      </section>

      <SurfaceSystem />

      <div className="container-page grid gap-(--section-y) pb-(--section-y)">
        {LABS.map((lab) => (
          <section key={lab.id} aria-labelledby={`lab-${lab.id}`}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 id={`lab-${lab.id}`} className="text-title text-[clamp(1.75rem,3.4vw,2.75rem)]">
                  {lab.title}
                </h2>
                <p className="mt-3 text-muted-inverse">{lab.body}</p>
              </div>
              <Link href={`/work/${lab.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-accent-bright hover:underline">
                Read the case study <ArrowRight className="size-4" />
              </Link>
            </div>
            <LazyVisual id={lab.id} />
          </section>
        ))}
      </div>
    </>
  );
}
