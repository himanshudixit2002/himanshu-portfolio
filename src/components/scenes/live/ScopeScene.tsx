"use client";

import { useCallback } from "react";
import { scopeFrame, scopeScene } from "@/lib/scenes/scopeforge";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { ScopeVisual } from "../visuals/ScopeVisual";

export default function ScopeScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <ScopeVisual frame={scopeFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={scopeScene} label="Inside the fence: requests meeting ScopeForge's scope guards" accent={accent} draw={draw} />;
}
