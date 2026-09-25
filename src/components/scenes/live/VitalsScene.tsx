"use client";

import { useCallback } from "react";
import { vitalsFrame, vitalsScene } from "@/lib/scenes/vitals";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { VitalsVisual } from "../visuals/VitalsVisual";

export default function VitalsScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <VitalsVisual frame={vitalsFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={vitalsScene} label="Barely there: what the Vitals HUD costs the Mac" accent={accent} draw={draw} />;
}
