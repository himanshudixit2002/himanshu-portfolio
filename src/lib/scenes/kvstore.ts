import { kvStore } from "@/content/projects";
import * as kv from "@/lib/sim/kvstore";
import { fnv1a } from "@/lib/sim/random";
import type { SceneMeta } from "./types";

const [shards, disk] = kvStore.highlights;
const [striping] = kvStore.decisions;

/** "Where a key lands": one SET, from the socket to its shard and the log. */
export const kvScene: SceneMeta = {
  kind: "Simulation",
  note: "The browser model behind the explorer below, not the C++ server: keys hash with FNV-1a here (the server uses std::hash), and a shard holds 3 keys instead of about 62 so eviction is visible.",
  steps: [
    { title: "A command arrives", body: `SET city Pune — one of three commands: ${kvStore.metrics[1].label.replace(/^commands: /, "")}.` },
    { title: striping.title, body: striping.body },
    { title: shards.title, body: shards.body },
    { title: "The least recently used key goes", body: "A full shard evicts the key used longest ago. In this model three more keys on the same shard push the first one out." },
    { title: disk.title, body: disk.body },
  ],
  keyFrames: [0, 2, 3, 4],
};

export const KV_KEY = "city";
export const KV_COMMAND = `SET ${KV_KEY} Pune`;

/** Keys already stored when the scene opens, none on the city's shard. */
const SEED = ["SET name Alice", "SET session abc", "SET cart 3", "SET theme dark"].filter((c) => kv.shardFor(c.split(" ")[1]) !== kv.shardFor(KV_KEY));

/** Three further keys that land on the city's shard, to show eviction. */
export const KV_CROWD = (() => {
  const target = kv.shardFor(KV_KEY);
  const keys: string[] = [];
  for (let i = 1; keys.length < kv.SHARD_CAPACITY; i++) if (kv.shardFor(`user:${i}`) === target) keys.push(`user:${i}`);
  return keys.map((k, i) => `SET ${k} v${i + 1}`);
})();

export type KvFrame = {
  step: number;
  typed: string;
  hash: number;
  shard: number;
  /** Whether the key has reached its shard. */
  landed: boolean;
  state: kv.KvState;
  evicted: string | null;
  flushed: boolean;
};

const seeded = () => kv.flushLog(SEED.reduce(kv.execute, kv.initialKv()));

export function kvFrame(step: number): KvFrame {
  const i = Math.max(0, Math.min(4, step));
  const hash = fnv1a(KV_KEY);
  let state = seeded();
  if (i >= 2) state = kv.execute(state, KV_COMMAND);
  let evicted: string | null = null;
  if (i >= 3) {
    state = KV_CROWD.reduce(kv.execute, state);
    evicted = state.history.find((h) => h.note?.startsWith("Shard full"))?.note?.match(/"(.+)"/)?.[1] ?? null;
  }
  if (i >= 4) state = kv.flushLog(state);
  return { step: i, typed: i >= 3 ? KV_CROWD.at(-1)! : KV_COMMAND, hash, shard: kv.shardFor(KV_KEY), landed: i >= 2, state, evicted, flushed: i >= 4 };
}
