"use client";

import { useCallback } from "react";
import { elepeiaFrame, elepeiaScene } from "@/lib/scenes/elepeia";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { ElepeiaVisual } from "../visuals/ElepeiaVisual";

export default function ElepeiaScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <ElepeiaVisual frame={elepeiaFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={elepeiaScene} label="The weight of a page: three fixes on one product page" accent={accent} draw={draw} />;
}
