import type { Project } from "@/content/types";
import { cacheScene } from "@/lib/scenes/cache";
import { cafeScene } from "@/lib/scenes/cafe";
import { elepeiaScene } from "@/lib/scenes/elepeia";
import { kvScene } from "@/lib/scenes/kvstore";
import { rxScene } from "@/lib/scenes/rxforce";
import { skinScene } from "@/lib/scenes/skintellect";
import { sskScene } from "@/lib/scenes/smartshelfkart";
import type { SceneMeta } from "@/lib/scenes/types";
import { urlScene } from "@/lib/scenes/url";
import { vitalsScene } from "@/lib/scenes/vitals";
import { SceneSteps } from "./SceneStage";
import { SceneLoader } from "./SceneLoader";

const SCENES: Record<string, SceneMeta> = {
  smartshelfkart: sskScene,
  elepeia: elepeiaScene,
  kvstore: kvScene,
  "self-healing-cache": cacheScene,
  vitals: vitalsScene,
  "rxforce-sfa": rxScene,
  "url-shortener": urlScene,
  skintellect: skinScene,
  "cue-and-coffee": cafeScene,
};

export const hasScene = (slug: string) => slug in SCENES;

/**
 * A project's signature scene: the pinned, scroll-told story (drawn on the
 * client, in its own chunk), its steps as text for no JavaScript, and the
 * note on what is real.
 */
export function SignatureScene({ project }: { project: Project }) {
  const meta = SCENES[project.slug];
  if (!meta) return null;
  return (
    <figure className="mt-2">
      <SceneLoader slug={project.slug} accent={project.accent} shape={{ steps: meta.steps.length, frames: meta.keyFrames.length, mobile: meta.mobile }} />
      {/* Without JavaScript, the story's steps as text. Scripted browsers
          never parse this; with reduced motion the scene draws its frames. */}
      <noscript>
        <SceneSteps meta={meta} />
      </noscript>
      <figcaption className="container-page mt-6 text-xs leading-relaxed text-dim-inverse">
        <span className="font-semibold tracking-[0.04em] uppercase">{meta.kind}</span> · {meta.note}
      </figcaption>
    </figure>
  );
}
