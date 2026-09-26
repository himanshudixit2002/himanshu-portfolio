"use client";

import { useCallback } from "react";
import { cafeFrame, cafeScene } from "@/lib/scenes/cafe";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { CafeVisual } from "../visuals/CafeVisual";

export default function CafeScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <CafeVisual frame={cafeFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={cafeScene} label="One night at the club: one table's evening in Cue & Coffee" accent={accent} draw={draw} />;
}
