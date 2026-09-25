import { smartShelfKart } from "@/content/projects";
import { questionPath, systemLayers } from "@/content/surface-system";
import type { LayerId } from "@/content/types";
import type { SceneMeta } from "./types";

/** "Ask Nova": one question followed from the phone, through the layers, and back. */
export const sskScene: SceneMeta = {
  kind: "Illustration",
  note: "An illustration of the path documented in the project, with sample stock data. Nothing here calls the real service.",
  steps: questionPath.map((s) => ({ title: s.label, body: s.body })),
  keyFrames: [0, 2, 5, 6],
};

export const SSK_QUESTION = "What's running low?";
export const SSK_ANSWER = {
  text: "4 products are below their reorder point.",
  items: [
    { name: "Masking tape 24 mm", left: 6 },
    { name: "Blue widget", left: 12 },
    { name: "Cable ties 200 mm", left: 30 },
    { name: "Wall plug 8 mm", left: 45 },
  ],
};

/** The published metric the scene ends on, read from the project rather than restated. */
export const sskNoModelMetric = smartShelfKart.metrics.find((m) => m.value.endsWith("%"))!;

/** Pipeline stages drawn inside the assistant layer, in order. */
export const SSK_PIPELINE = ["verify", "cache", "route", "answer"] as const;

export type SskFrame = {
  step: number;
  stepId: string;
  layer: LayerId;
  /** Layer order, top to bottom, as drawn. */
  layers: LayerId[];
  /** The phone shows the question from the start, a typing indicator while it travels, then the answer. */
  phone: "question" | "thinking" | "answer";
  /** Stages of the assistant pipeline already passed. */
  done: string[];
  showMetric: boolean;
};

export function sskFrame(step: number): SskFrame {
  const i = Math.max(0, Math.min(questionPath.length - 1, step));
  const current = questionPath[i];
  const ids = questionPath.map((s) => s.id);
  return {
    step: i,
    stepId: current.id,
    layer: current.layer,
    layers: systemLayers.map((l) => l.id),
    phone: i === 0 ? "question" : current.id === "return" ? "answer" : "thinking",
    done: SSK_PIPELINE.filter((id) => ids.indexOf(id) < i),
    showMetric: current.id === "return",
  };
}
