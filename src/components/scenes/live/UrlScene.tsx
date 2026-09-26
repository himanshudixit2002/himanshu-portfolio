"use client";

import { useCallback } from "react";
import { urlFrame, urlScene } from "@/lib/scenes/url";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { UrlVisual } from "../visuals/UrlVisual";

export default function UrlScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <UrlVisual frame={urlFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={urlScene} label="39134 to abc: how a short link is made and checked" accent={accent} draw={draw} />;
}
