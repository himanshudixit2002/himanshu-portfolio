import { skintellect } from "@/content/projects/selected";
import { SKIN_STEPS } from "@/content/skintellect-pipeline";
import type { SceneMeta } from "./types";

const [detectClassify, catalogue, advice] = skintellect.highlights;

/** "Photo to routine": the pipeline in order, on an abstract face. */
export const skinScene: SceneMeta = {
  kind: "Illustration",
  note: "An abstract face, not a photo of anyone, and placeholder output: the drawing shows the pipeline's order, not a real result or diagnosis.",
  steps: [
    { title: SKIN_STEPS[0].title, body: `${SKIN_STEPS[0].body}, the photo is ready for the models.` },
    { title: SKIN_STEPS[1].title, body: detectClassify.body.split(";")[0] + "." },
    { title: SKIN_STEPS[2].title, body: `${detectClassify.body.split("; ")[1].replace(/^a/, "A")}` },
    { title: SKIN_STEPS[3].title, body: catalogue.body },
    { title: SKIN_STEPS[4].title, body: advice.body },
  ],
  keyFrames: [1, 3, 4],
};

export type SkinFrame = { step: number; boxes: boolean; classified: boolean; products: boolean; advice: boolean };

export function skinFrame(step: number): SkinFrame {
  const i = Math.max(0, Math.min(4, step));
  return { step: i, boxes: i >= 1, classified: i >= 2, products: i >= 3, advice: i >= 4 };
}
