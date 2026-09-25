"use client";

import { lazy, Suspense, type ComponentType, type CSSProperties } from "react";
import { sceneLength } from "@/lib/scenes/types";

type SceneProps = { accent: string };

/*
 * Each scene's code is its own chunk, fetched only on the page that shows it.
 * (A server component can't split client code, so the imports live here.)
 * A full load renders the scene on the server; on a client-side navigation,
 * while its chunk loads, an empty track of the same height holds its place.
 */
const SCENES: Record<string, ComponentType<SceneProps>> = {
  smartshelfkart: lazy(() => import("./live/SskScene")),
  elepeia: lazy(() => import("./live/ElepeiaScene")),
  kvstore: lazy(() => import("./live/KvScene")),
  "self-healing-cache": lazy(() => import("./live/CacheScene")),
  vitals: lazy(() => import("./live/VitalsScene")),
};

export function SceneLoader({ slug, accent, steps }: { slug: string; accent: string; steps: number }) {
  const Scene = SCENES[slug];
  if (!Scene) return null;
  const { base, md } = sceneLength(steps);
  const reserve = (
    <div className="scene" data-mobile="pin">
      <div className="scene-pin scene-track" style={{ "--len": base, "--len-md": md } as CSSProperties} />
    </div>
  );
  return (
    <Suspense fallback={reserve}>
      <Scene accent={accent} />
    </Suspense>
  );
}
