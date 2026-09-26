"use client";

import { useCallback } from "react";
import { rxFrame, rxScene } from "@/lib/scenes/rxforce";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { RxVisual } from "../visuals/RxVisual";

export default function RxScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <RxVisual frame={rxFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={rxScene} label="No signal: a rep's day through RxForce's sync queue" accent={accent} draw={draw} />;
}
