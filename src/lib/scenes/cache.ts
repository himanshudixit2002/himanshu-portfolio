import { selfHealingCache } from "@/content/projects/selected";
import * as c from "@/lib/sim/cluster";
import type { SceneMeta } from "./types";

const [hashing, quorum, healing] = selfHealingCache.highlights;
const [hints, observable] = selfHealingCache.decisions;

/** "Lose a node": one key through an outage and back. */
export const cacheScene: SceneMeta = {
  kind: "Simulation",
  note: "The same browser model as the lab below: three nodes with 8 virtual nodes each (the real default is 150) and one key.",
  steps: [
    { title: hashing.title, body: `${hashing.body} Each key is kept on three members.` },
    { title: "A node stops answering", body: healing.body },
    { title: quorum.title, body: quorum.body },
    { title: "It comes back", body: hints.body },
    { title: observable.title, body: observable.body },
  ],
  keyFrames: [0, 2, 3, 4],
};

export const CACHE_KEY = "user:1";
/** The replica that goes down: the key's second replica, so the primary keeps coordinating. */
export const CACHE_DOWN = c.preferenceList(CACHE_KEY)[1];

export type CacheFrame = {
  step: number;
  state: c.ClusterState;
  replicas: c.NodeId[];
  down: c.NodeId | null;
  /** A write is in flight on this step. */
  writing: boolean;
  /** Hints held right now. */
  hints: number;
  replayed: boolean;
  sweep: boolean;
};

export function cacheFrame(step: number): CacheFrame {
  const i = Math.max(0, Math.min(4, step));
  let state = c.put(c.initialCluster(), CACHE_KEY, "alice");
  if (i >= 1) state = c.takeDown(state, CACHE_DOWN);
  if (i >= 2) state = c.put(state, CACHE_KEY, "alicia");
  if (i >= 3) state = c.restore(state, CACHE_DOWN);
  return {
    step: i,
    state,
    replicas: c.preferenceList(CACHE_KEY),
    down: i === 1 || i === 2 ? CACHE_DOWN : null,
    writing: i === 0 || i === 2,
    hints: state.hints.length,
    replayed: i >= 3,
    sweep: i === 4,
  };
}
