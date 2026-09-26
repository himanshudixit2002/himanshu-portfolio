"use client";

import type { MotionValue } from "motion/react";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { sceneLength, type SceneMeta } from "@/lib/scenes/types";
import { ScrollScene, useSceneStep } from "@/components/motion/ScrollScene";
import { SceneFrames, SceneStage, StepCards, type Layout } from "./SceneStage";

type Props = {
  meta: SceneMeta;
  label: string;
  accent: string;
  /** The drawing for a step, in one composition; `still` for the static frames. Called only when the step changes. */
  draw: (step: number, layout: Layout, still?: boolean) => ReactNode;
};

const WIDE = "(min-width: 768px)";
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
/** Which composition fits the screen. Only read on the client: stage and frames never render on the server. */
function useLayout(): Layout {
  return useSyncExternalStore(subscribe, () => (window.matchMedia(WIDE).matches ? "wide" : "tall"), () => "wide");
}

/**
 * A signature scene: a pinned stage that steps through `meta` as you scroll.
 * Its static frames (reduced motion, and step cards on phones when the scene
 * asks for them) are drawn here only when needed; the no-JavaScript copy is
 * the <noscript> in SignatureScene.
 */
export function LiveScene({ meta, label, accent, draw }: Props) {
  const layout = useLayout();
  const cards = meta.mobile === "cards";
  const frames = () =>
    cards && layout === "tall" ? (
      <StepCards meta={meta} label={label} frames={meta.steps.map((_, i) => draw(i, layout, true))} />
    ) : (
      <SceneFrames meta={meta} frames={meta.keyFrames.map((k) => draw(k, layout, true))} />
    );
  return (
    <ScrollScene label={label} mobile={cards ? "frames" : "pin"} length={sceneLength(meta.steps.length)} frames={frames} reserve={{ frames: meta.keyFrames.length, details: meta.keyFrames.length < meta.steps.length }}>
      {(progress) => <Stage progress={progress} meta={meta} accent={accent} draw={draw} layout={layout} />}
    </ScrollScene>
  );
}

function Stage({ progress, meta, accent, draw, layout }: { progress: MotionValue<number>; meta: SceneMeta; accent: string; draw: Props["draw"]; layout: Layout }) {
  const step = useSceneStep(progress, meta.steps.length);
  const drawing = useMemo(() => draw(step, layout), [draw, step, layout]);
  return (
    <SceneStage meta={meta} step={step} accent={accent}>
      {drawing}
    </SceneStage>
  );
}
