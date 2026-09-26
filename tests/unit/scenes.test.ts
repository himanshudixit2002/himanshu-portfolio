import { describe, expect, it } from "vitest";
import { questionPath } from "@/content/surface-system";
import { cacheFrame, cacheScene, CACHE_DOWN, CACHE_KEY } from "@/lib/scenes/cache";
import { elepeiaFrame, elepeiaScene, PRELOAD_KB } from "@/lib/scenes/elepeia";
import { KV_CROWD, KV_KEY, kvFrame, kvScene } from "@/lib/scenes/kvstore";
import { sskFrame, sskNoModelMetric, sskScene } from "@/lib/scenes/smartshelfkart";
import type { SceneMeta } from "@/lib/scenes/types";
import { ticks, VITALS_RATES, vitalsFrame, vitalsScene } from "@/lib/scenes/vitals";
import * as kv from "@/lib/sim/kvstore";
import { cafeFrame, cafeScene, clock } from "@/lib/scenes/cafe";
import { attemptTimes, rxFrame, rxScene } from "@/lib/scenes/rxforce";
import { skinFrame, skinScene } from "@/lib/scenes/skintellect";
import { divisions, URL_ALIAS, URL_ID, urlFrame, urlScene } from "@/lib/scenes/url";
import { decode, encode } from "@/lib/sim/base62";
import * as cafe from "@/lib/sim/cafe";
import * as q from "@/lib/sim/sync-queue";

const scenes: [string, SceneMeta, (i: number) => unknown][] = [
  ["smartshelfkart", sskScene, sskFrame],
  ["elepeia", elepeiaScene, elepeiaFrame],
  ["kvstore", kvScene, kvFrame],
  ["cache", cacheScene, cacheFrame],
  ["vitals", vitalsScene, vitalsFrame],
  ["rxforce", rxScene, rxFrame],
  ["url", urlScene, urlFrame],
  ["skintellect", skinScene, skinFrame],
  ["cafe", cafeScene, cafeFrame],
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

  it("RxForce queues offline, backs off, then drains when signal returns", () => {
    expect(rxFrame(0).items.map((i) => i.status)).toEqual(["queued"]);
    const offline = rxFrame(1);
    expect(offline.online).toBe(false);
    expect(offline.items).toHaveLength(3);
    expect(offline.items.every((i) => i.status === "queued" && i.attempts > 0)).toBe(true);
    expect(rxFrame(2).items.every((i) => i.status === "synced")).toBe(true);
    const times = attemptTimes(4);
    for (let k = 2; k < times.length; k++) expect(times[k] - times[k - 1]).toBe(2 * (times[k - 1] - times[k - 2]));
    expect(q.MAX_ATTEMPTS).toBe(10);
  });

  it("URL Shortener: the README's example, a shadowing alias, and two SSRF tricks", () => {
    expect(encode(URL_ID)).toBe("abc");
    expect(divisions(URL_ID).map((d) => d.char).reverse().join("")).toBe("abc");
    for (const d of divisions(URL_ID)) expect(d.quotient * 62 + d.remainder).toBe(d.n);
    expect(decode(URL_ALIAS)).toBe(URL_ID + 1);
    expect(urlFrame(2).alias).toMatchObject({ code: "abd", nextCode: encode(URL_ID + 2) });
    expect(urlFrame(3).check?.verdict.accepted).toBe(false);
    expect(urlFrame(3).check?.verdict.host).toBe("127.0.0.1");
    expect(urlFrame(4).check?.verdict.accepted).toBe(false);
    expect(urlFrame(4).check?.verdict.checks.at(-1)?.label).toBe("DNS");
    // The decimal host has no DNS step; the mixed host shows both answers, one blocked.
    expect(urlFrame(3).check?.answers).toBeNull();
    expect(urlFrame(4).check?.answers).toEqual([
      { ip: "93.184.215.14", blocked: null },
      { ip: "192.168.1.20", blocked: "private (RFC 1918)" },
    ]);
  });

  it("Skintellect reveals the pipeline in order", () => {
    const keys = ["boxes", "classified", "products", "advice"] as const;
    for (let i = 0; i < 5; i++) keys.forEach((k, j) => expect(skinFrame(i)[k]).toBe(i > j));
    expect(skinScene.steps.map((s) => s.title)).toEqual(["Photo", "Detect", "Classify", "Match", "Explain"]);
  });

  it("Cue & Coffee's night follows the club model: timer, order, bill, close", () => {
    expect(clock(0)).toBe("18:00");
    expect(cafeFrame(0).bill?.minutes).toBe(1);
    const ordered = cafeFrame(1);
    const order = cafe.sessionFor(ordered.state, "s1")!.orders[0];
    expect(cafe.orderStatus(order, ordered.state.now)).toBe("Pending");
    const ready = cafeFrame(2);
    expect(cafe.orderStatus(cafe.sessionFor(ready.state, "s1")!.orders[0], ready.state.now)).toBe("Ready");
    const billed = cafeFrame(3).bill!;
    expect(billed.minutes).toBe(70);
    expect(billed.discount).toBe(Math.floor((billed.tableCharge * cafe.DISCOUNT.Silver) / 100));
    expect(billed.total).toBe(billed.tableCharge - billed.discount + 120);
    expect(cafeFrame(4).closed).toBe(true);
    expect(cafe.takings(cafeFrame(4).state)).toBe(billed.total);
  });
});
