"use client";

import { useCallback } from "react";
import { fraudFrame, fraudScene } from "@/lib/scenes/fraud";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { FraudVisual } from "../visuals/FraudVisual";

export default function FraudScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <FraudVisual frame={fraudFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={fraudScene} label="Follow the edges: a transaction graph filling, and one account's neighbourhood" accent={accent} draw={draw} />;
}
