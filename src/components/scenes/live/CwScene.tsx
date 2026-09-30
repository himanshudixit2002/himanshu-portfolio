"use client";

import { useCallback } from "react";
import { cwFrame, cwScene } from "@/lib/scenes/compliancewatch";
import { LiveScene } from "../LiveScene";
import type { Layout } from "../SceneStage";
import { CwVisual } from "../visuals/CwVisual";

export default function CwScene({ accent }: { accent: string }) {
  const draw = useCallback((step: number, layout: Layout, still?: boolean) => <CwVisual frame={cwFrame(step)} accent={accent} still={still} layout={layout} />, [accent]);
  return <LiveScene meta={cwScene} label="One notification, all the way to one phone: CBIC's 01/2026 followed through ComplianceWatch" accent={accent} draw={draw} />;
}
