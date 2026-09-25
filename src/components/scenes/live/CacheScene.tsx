"use client";

import { useCallback } from "react";
import { cacheFrame, cacheScene } from "@/lib/scenes/cache";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { CacheVisual } from "../visuals/CacheVisual";

export default function CacheScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <CacheVisual frame={cacheFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={cacheScene} label="Lose a node: one key through an outage and back" accent={accent} draw={draw} />;
}
