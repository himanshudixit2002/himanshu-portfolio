/**
 * A signature scene is a short story told by scrolling. Its steps pair a
 * caption with a frame computed purely from the step index, so the same
 * frame can be scrubbed live, drawn statically, and tested.
 *
 * Captions restate what the project's own content already says; a scene
 * adds pictures, not claims.
 */
export type SceneStep = { title: string; body: string };

export type SceneKind = "Simulation" | "Illustration" | "Diagram" | "Measured";

export type SceneMeta = {
  kind: SceneKind;
  /** What is real and what is sample data, shown under the scene. */
  note: string;
  steps: SceneStep[];
  /** Steps shown as static frames (reduced motion, from 768px). */
  keyFrames: number[];
  /**
   * What phones get: a short pin (default), or — for scenes too dense for a
   * 390px stage — every step as a swipeable card.
   */
  mobile?: "pin" | "cards";
};

/** Scroll length of a scene's pinned track: shorter per step on phones, where each step is a quicker read. */
export const sceneLength = (steps: number) => ({ base: `${40 + steps * 32}lvh`, md: `${60 + steps * 52}lvh` });
