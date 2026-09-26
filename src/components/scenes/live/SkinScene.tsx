"use client";

import { useCallback } from "react";
import { skinFrame, skinScene } from "@/lib/scenes/skintellect";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { SkinVisual } from "../visuals/SkinVisual";

export default function SkinScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <SkinVisual frame={skinFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={skinScene} label="Photo to routine: Skintellect's pipeline in order" accent={accent} draw={draw} />;
}
