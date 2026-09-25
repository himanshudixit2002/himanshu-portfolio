"use client";

import { useCallback } from "react";
import { sskFrame, sskScene } from "@/lib/scenes/smartshelfkart";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { SskVisual } from "../visuals/SskVisual";

export default function SskScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <SskVisual frame={sskFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={sskScene} label="Ask Nova: one question, followed through SmartShelfKart" accent={accent} draw={draw} />;
}
