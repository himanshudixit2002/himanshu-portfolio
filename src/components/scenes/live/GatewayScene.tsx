"use client";

import { useCallback } from "react";
import { gatewayFrame, gatewayScene } from "@/lib/scenes/gateway";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { GatewayVisual } from "../visuals/GatewayVisual";

export default function GatewayScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <GatewayVisual frame={gatewayFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={gatewayScene} label="Easy to isolate: why an Isolation Forest flags outliers" accent={accent} draw={draw} />;
}
