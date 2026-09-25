import { describe, expect, it } from "vitest";
import { questionPath } from "@/content/surface-system";
import { cacheFrame, cacheScene, CACHE_DOWN, CACHE_KEY } from "@/lib/scenes/cache";
import { elepeiaFrame, elepeiaScene, PRELOAD_KB } from "@/lib/scenes/elepeia";
import { KV_CROWD, KV_KEY, kvFrame, kvScene } from "@/lib/scenes/kvstore";
import { sskFrame, sskNoModelMetric, sskScene } from "@/lib/scenes/smartshelfkart";
import type { SceneMeta } from "@/lib/scenes/types";
import { ticks, VITALS_RATES, vitalsFrame, vitalsScene } from "@/lib/scenes/vitals";
import * as kv from "@/lib/sim/kvstore";

const scenes: [string, SceneMeta, (i: number) => unknown][] = [
  ["smartshelfkart", sskScene, sskFrame],
  ["elepeia", elepeiaScene, elepeiaFrame],
  ["kvstore", kvScene, kvFrame],
  ["cache", cacheScene, cacheFrame],
  ["vitals", vitalsScene, vitalsFrame],
];

describe("signature scenes", () => {
  it.each(scenes)("%s: frames are deterministic, clamped and cover every step", (_, meta, frameAt) => {
    for (let i = 0; i < meta.steps.length; i++) expect(frameAt(i)).toEqual(frameAt(i));
    expect(frameAt(-3)).toEqual(frameAt(0));
    expect(frameAt(99)).toEqual(frameAt(meta.steps.length - 1));
    for (const k of meta.keyFrames) expect(k).toBeLessThan(meta.steps.length);
    for (const s of meta.steps) {
      expect(s.title.length).toBeGreaterThan(2);
      expect(s.body.length).toBeGreaterThan(20);
    }
    expect(meta.note.length).toBeGreaterThan(40);
  });

  it("SmartShelfKart follows the documented question path and ends on the published figure", () => {
    expect(sskScene.steps.map((s) => s.title)).toEqual(questionPath.map((q) => q.label));
    expect(sskFrame(0).phone).toBe("question");
    expect(sskFrame(questionPath.length - 1)).toMatchObject({ phone: "answer", showMetric: true });
    expect(sskNoModelMetric.value).toBe("76%");
    // Pipeline stages only accumulate.
    for (let i = 1; i < questionPath.length; i++) expect(sskFrame(i).done.length).toBeGreaterThanOrEqual(sskFrame(i - 1).done.length);
  });

  it("Elepeia shows a spinner first, then the product, then the right-sized preload", () => {
    expect(elepeiaFrame(0)).toMatchObject({ html: "spinner", preloadKb: PRELOAD_KB.before });
    expect(elepeiaFrame(2)).toMatchObject({ html: "product", preloadKb: PRELOAD_KB.after, sharp: true });
    expect(Math.round(PRELOAD_KB.before / PRELOAD_KB.after)).toBe(68);
  });

  it("KVStore lands the key on its shard, then evicts it, then writes the log", () => {
    const shard = kv.shardFor(KV_KEY);
    expect(kvFrame(1).landed).toBe(false);
    expect(kvFrame(2).state.shards[shard].map((e) => e.key)).toContain(KV_KEY);
    expect(KV_CROWD).toHaveLength(kv.SHARD_CAPACITY);
    expect(kvFrame(3).evicted).toBe(KV_KEY);
    expect(kvFrame(3).state.shards[shard].map((e) => e.key)).not.toContain(KV_KEY);
    expect(kv.queuedCount(kvFrame(3).state)).toBeGreaterThan(0);
    expect(kv.queuedCount(kvFrame(4).state)).toBe(0);
  });

  it("the cache keeps the write through an outage and heals the replica", () => {
    expect(cacheFrame(1).state.up[CACHE_DOWN]).toBe(false);
    expect(cacheFrame(2).hints).toBe(1);
    expect(cacheFrame(2).state.stores[CACHE_DOWN][CACHE_KEY].value).toBe("alice");
    const healed = cacheFrame(3).state;
    expect(healed.up[CACHE_DOWN]).toBe(true);
    expect(healed.stores[CACHE_DOWN][CACHE_KEY].value).toBe("alicia");
    expect(healed.hints).toHaveLength(0);
  });

  it("Vitals draws exactly the measured rates", () => {
    expect(VITALS_RATES.wakeups).toMatchObject({ before: 2.2, after: 1 });
    expect(VITALS_RATES.redraws).toMatchObject({ before: 2.46, after: 0.27 });
    expect(ticks(2.2)).toHaveLength(22);
    expect(ticks(1)).toHaveLength(10);
    expect(ticks(2.46)).toHaveLength(25);
    expect(ticks(0.27)).toHaveLength(3);
    for (const t of ticks(2.46)) expect(t).toBeLessThan(1);
  });
});
