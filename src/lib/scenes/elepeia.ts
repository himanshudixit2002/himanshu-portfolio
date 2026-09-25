import { elepeia } from "@/content/projects";
import type { SceneMeta } from "./types";

const [rendering, images, payment] = elepeia.highlights;

/** "The weight of a page": the three fixes, told on one product page. */
export const elepeiaScene: SceneMeta = {
  kind: "Illustration",
  note: "A sample product page, not the client's. Sizes are the README's figures: ~5 MB camera originals against ~73 KB optimized images.",
  steps: [
    { title: "Every route shipped a spinner.", body: "A maintenance-mode guard lived in the React tree, so server-rendered pages waited for JavaScript before showing anything." },
    { title: rendering.title, body: rendering.body },
    { title: images.title, body: images.body },
    { title: payment.title, body: payment.body },
  ],
  keyFrames: [0, 1, 2, 3],
};

/** Preloaded bytes before and after, in KB — the README's approximate figures. */
export const PRELOAD_KB = { before: 5000, after: 73 } as const;

export type ElepeiaFrame = {
  step: number;
  /** What the HTML carries: only a spinner, or the product. */
  html: "spinner" | "product";
  /** The preload: the camera original or the image actually rendered. */
  preloadKb: number;
  /** The main image is sharp once the right file is preloaded. */
  sharp: boolean;
  checkout: boolean;
};

export function elepeiaFrame(step: number): ElepeiaFrame {
  const i = Math.max(0, Math.min(3, step));
  return {
    step: i,
    html: i === 0 ? "spinner" : "product",
    preloadKb: i >= 2 ? PRELOAD_KB.after : PRELOAD_KB.before,
    sharp: i >= 2,
    checkout: i === 3,
  };
}
