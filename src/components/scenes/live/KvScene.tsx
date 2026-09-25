"use client";

import { useCallback } from "react";
import { kvFrame, kvScene } from "@/lib/scenes/kvstore";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { KvVisual } from "../visuals/KvVisual";

export default function KvScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <KvVisual frame={kvFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={kvScene} label="Where a key lands: one SET through KVStore" accent={accent} draw={draw} />;
}
