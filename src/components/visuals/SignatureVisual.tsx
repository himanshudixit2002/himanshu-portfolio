import type { VisualId } from "@/content/types";
import { LazyVisual, type InteractiveId } from "./LazyVisual";
import { ScopeForgeGuard, SkintellectPipeline, VitalsEfficiency } from "./StaticVisuals";

const INTERACTIVE: Partial<Record<VisualId, InteractiveId>> = {
  "ssk-system": "ssk-agent",
  "elepeia-teardown": "elepeia-teardown",
  "cafe-night": "cafe-night",
  "kv-explorer": "kv-explorer",
  "cluster-lab": "cluster-lab",
  "rx-sync": "rx-sync",
  "fraud-graph": "fraud-graph",
  "gateway-anomaly": "gateway-anomaly",
  "shortener-lab": "shortener-lab",
  "two-sum": "two-sum",
};

/** A project's signature visual: server-rendered where static, lazy-loaded where interactive. */
export function SignatureVisual({ id }: { id: VisualId }) {
  switch (id) {
    case "vitals-efficiency":
      return <VitalsEfficiency />;
    case "skintellect-pipeline":
      return <SkintellectPipeline />;
    case "scopeforge-guard":
      return <ScopeForgeGuard />;
    default:
      return <LazyVisual id={INTERACTIVE[id]!} />;
  }
}
