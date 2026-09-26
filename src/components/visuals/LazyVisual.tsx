"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useState, type ComponentType } from "react";
import { whenIdle } from "@/lib/idle";
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

type Loader = () => Promise<{ default: ComponentType<Record<string, unknown>> }>;

const LOADERS: Record<InteractiveId, Loader> = {
  "kv-explorer": () => import("./KvExplorer"),
  "kv-explorer-compact": () => import("./KvExplorer"),
  "cluster-lab": () => import("./ClusterLab"),
  "cafe-night": () => import("./ClubNight"),
  "elepeia-teardown": () => import("./ElepeiaTeardown"),
  "shortener-lab": () => import("./ShortenerLab"),
  "fraud-graph": () => import("./FraudGraph"),
  "gateway-anomaly": () => import("./AnomalyScatter"),
  "rx-sync": () => import("./SyncQueue"),
  "two-sum": () => import("./TwoSumStepper"),
  "ssk-agent": () => import("./SskAgentChecks"),
  "hex-map": () => import("./HexPriceMap"),
  "fan-out": () => import("./FanOut"),
};

/**
 * Reserved heights keep the page from shifting when a visual arrives. Each is
 * the visual's rendered height at a typical width inside that breakpoint
 * (390, 700, 900, 1152 and 1440px), to the nearest rem. Visuals span the
 * container except the fan-out, which sits in a half column on /about from lg.
 * The compact explorer isn't placed on any page yet, so it has not been
 * measured. Re-measure after changing a visual's layout.
 */
const HEIGHT: Record<InteractiveId, string> = {
  "kv-explorer": "min-h-[79rem] sm:min-h-[54rem] lg:min-h-[37rem]",
  "kv-explorer-compact": "min-h-[40rem]",
  "cluster-lab": "min-h-[73rem] sm:min-h-[62rem] lg:min-h-[37rem]",
  "cafe-night": "min-h-[75rem] sm:min-h-[69rem] md:min-h-[60rem] lg:min-h-[47rem] xl:min-h-[46rem]",
  "elepeia-teardown": "min-h-[57rem] sm:min-h-[51rem] md:min-h-[35rem] lg:min-h-[33rem]",
  "shortener-lab": "min-h-[78rem] sm:min-h-[59rem] md:min-h-[57rem] lg:min-h-[37rem] xl:min-h-[35rem]",
  "fraud-graph": "min-h-[43rem] sm:min-h-[44rem] md:min-h-[48rem] lg:min-h-[58rem] xl:min-h-[66rem]",
  "gateway-anomaly": "min-h-[37rem] sm:min-h-[44rem] md:min-h-[48rem] lg:min-h-[58rem] xl:min-h-[67rem]",
  "rx-sync": "min-h-[50rem] sm:min-h-[44rem] md:min-h-[43rem] lg:min-h-[27rem] xl:min-h-[26rem]",
  "two-sum": "min-h-[37rem] sm:min-h-[35rem] md:min-h-[28rem]",
  "ssk-agent": "min-h-[66rem] sm:min-h-[65rem] md:min-h-[68rem] lg:min-h-[37rem] xl:min-h-[38rem]",
  "hex-map": "min-h-[58rem] sm:min-h-[71rem] md:min-h-[78rem] lg:min-h-[48rem] xl:min-h-[56rem]",
  "fan-out": "min-h-[39rem] sm:min-h-[43rem] md:min-h-[49rem] lg:min-h-[40rem] xl:min-h-[44rem]",
};

const placeholder = (height: string) =>
  function Placeholder() {
    return <div className={`${height} animate-pulse rounded-[1.75rem] bg-ink-2 ring-1 ring-white/8`} />;
  };

const COMPONENTS = Object.fromEntries(
  (Object.keys(LOADERS) as InteractiveId[]).map((id) => [
    id,
    dynamic(LOADERS[id], { ssr: false, loading: placeholder(HEIGHT[id]) }),
  ]),
) as Record<InteractiveId, ComponentType<Record<string, unknown>>>;

/**
 * Fetches the visual's code in one idle period and mounts it in a later one,
 * as an interruptible transition. Returns whether it has been mounted.
 */
function useIdleMount(id: InteractiveId) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let cancelled = false;
    whenIdle(() => {
      if (cancelled) return;
      LOADERS[id]().then(
        () => whenIdle(() => !cancelled && startTransition(() => setMounted(true))),
        () => {},
      );
    });
    return () => {
      cancelled = true;
    };
  }, [id]);
  return mounted;
}

/**
 * An interactive visual, mounted while the page is idle — or, if it is
 * scrolled to first, as it approaches. Until then, and without JavaScript, a
 * same-sized placeholder holds its place and the surrounding text carries
 * the content.
 */
export function LazyVisual({ id }: { id: InteractiveId }) {
  const [ref, near] = useNearViewport<HTMLDivElement>("1000px");
  const mounted = useIdleMount(id);
  const show = near || mounted;
  const Component = COMPONENTS[id];
  return (
    <div ref={ref} data-visual={id} className={show ? undefined : HEIGHT[id]}>
      {show ? <Component compact={id === "kv-explorer-compact"} /> : <div className={`${HEIGHT[id]} rounded-[1.75rem] bg-ink-2 ring-1 ring-white/8`} />}
    </div>
  );
}
