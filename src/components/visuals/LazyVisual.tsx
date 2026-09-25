"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useNearViewport } from "./useNearViewport";

export type InteractiveId =
  | "kv-explorer"
  | "kv-explorer-compact"
  | "cluster-lab"
  | "cafe-night"
  | "elepeia-teardown"
  | "shortener-lab"
  | "fraud-graph"
  | "gateway-anomaly"
  | "rx-sync"
  | "two-sum"
  | "ssk-agent"
  | "hex-map"
  | "fan-out";

const placeholder = (height: string) =>
  function Placeholder() {
    return <div className={`${height} animate-pulse rounded-[1.75rem] bg-ink-2 ring-1 ring-white/8`} />;
  };

/** Reserved heights keep the page from shifting when a visual arrives. */
const HEIGHT: Record<InteractiveId, string> = {
  "kv-explorer": "min-h-[40rem] lg:min-h-[34rem]",
  "kv-explorer-compact": "min-h-[40rem]",
  "cluster-lab": "min-h-[44rem] lg:min-h-[36rem]",
  "cafe-night": "min-h-[48rem] lg:min-h-[38rem]",
  "elepeia-teardown": "min-h-[34rem] lg:min-h-[28rem]",
  "shortener-lab": "min-h-[48rem] lg:min-h-[30rem]",
  "fraud-graph": "min-h-[34rem]",
  "gateway-anomaly": "min-h-[34rem]",
  "rx-sync": "min-h-[34rem] lg:min-h-[28rem]",
  "two-sum": "min-h-[26rem]",
  "ssk-agent": "min-h-[58rem] lg:min-h-[32rem]",
  "hex-map": "min-h-[40rem] lg:min-h-[30rem]",
  "fan-out": "min-h-[28rem]",
};

const load = (id: InteractiveId, loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>) =>
  dynamic(loader, { ssr: false, loading: placeholder(HEIGHT[id]) });

const COMPONENTS: Record<InteractiveId, ComponentType<Record<string, unknown>>> = {
  "kv-explorer": load("kv-explorer", () => import("./KvExplorer")),
  "kv-explorer-compact": load("kv-explorer-compact", () => import("./KvExplorer")),
  "cluster-lab": load("cluster-lab", () => import("./ClusterLab")),
  "cafe-night": load("cafe-night", () => import("./ClubNight")),
  "elepeia-teardown": load("elepeia-teardown", () => import("./ElepeiaTeardown")),
  "shortener-lab": load("shortener-lab", () => import("./ShortenerLab")),
  "fraud-graph": load("fraud-graph", () => import("./FraudGraph")),
  "gateway-anomaly": load("gateway-anomaly", () => import("./AnomalyScatter")),
  "rx-sync": load("rx-sync", () => import("./SyncQueue")),
  "two-sum": load("two-sum", () => import("./TwoSumStepper")),
  "ssk-agent": load("ssk-agent", () => import("./SskAgentChecks")),
  "hex-map": load("hex-map", () => import("./HexPriceMap")),
  "fan-out": load("fan-out", () => import("./FanOut")),
};

/**
 * Loads an interactive visual's code only as it approaches the viewport.
 * Until then — and without JavaScript — a same-sized placeholder holds its
 * place, and the surrounding page text carries the content.
 */
export function LazyVisual({ id }: { id: InteractiveId }) {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const Component = COMPONENTS[id];
  return (
    <div ref={ref} className={near ? undefined : HEIGHT[id]}>
      {near ? <Component compact={id === "kv-explorer-compact"} /> : <div className={`${HEIGHT[id]} rounded-[1.75rem] bg-ink-2 ring-1 ring-white/8`} />}
    </div>
  );
}
