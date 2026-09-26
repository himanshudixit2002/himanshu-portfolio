"use client";

import { useCallback } from "react";
import { padhnaFrame, padhnaScene } from "@/lib/scenes/padhna";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { PadhnaVisual } from "../visuals/PadhnaVisual";

export default function PadhnaScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <PadhnaVisual frame={padhnaFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={padhnaScene} label="Watch it think: Two Sum stepped through in three languages" accent={accent} draw={draw} />;
}
