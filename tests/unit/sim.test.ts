import { describe, expect, it } from "vitest";
import { breakdown, decode, encode } from "@/lib/sim/base62";
import * as cafe from "@/lib/sim/cafe";
import * as cluster from "@/lib/sim/cluster";
import { neighbourhood, sharedSignals, users } from "@/lib/sim/fraud-graph";
import { aggregate, band, RESOLUTIONS, syntheticHotels } from "@/lib/sim/hexmap";
import { isolationScores, syntheticRequests } from "@/lib/sim/isolation-forest";
import * as kv from "@/lib/sim/kvstore";
import { SAMPLE_URLS, blockedV4, validate } from "@/lib/sim/ssrf";
import * as sync from "@/lib/sim/sync-queue";
import { twoSumSteps } from "@/lib/sim/two-sum";

describe("KVStore model", () => {
  const run = (...commands: string[]) => commands.reduce(kv.execute, kv.initialKv());

  it("SET then GET returns the value in RESP form", () => {
    const s = run("SET name Alice", "GET name");
    expect(s.history[0]).toMatchObject({ reply: "$5 Alice", ok: true, shard: kv.shardFor("name") });
    expect(s.history[1].reply).toBe("+OK");
  });

  it("puts every key on a stable shard in 0–15", () => {
    for (const key of ["a", "name", "session_token", "user:42"]) {
      const shard = kv.shardFor(key);
      expect(shard).toBeGreaterThanOrEqual(0);
      expect(shard).toBeLessThan(kv.SHARDS);
      expect(kv.shardFor(key)).toBe(shard);
    }
  });

  it("evicts the least recently used key when a shard is full, and GET refreshes recency", () => {
    // Find SHARD_CAPACITY + 1 keys that land on the same shard.
    const target = kv.shardFor("k0");
    const keys = ["k0"];
    for (let i = 1; keys.length <= kv.SHARD_CAPACITY; i++) if (kv.shardFor(`k${i}`) === target) keys.push(`k${i}`);
    const [first, second, third, fourth] = keys;

    let s = run(`SET ${first} 1`, `SET ${second} 2`, `SET ${third} 3`, `GET ${first}`, `SET ${fourth} 4`);
    const shard = s.shards[target].map((e) => e.key);
    expect(shard).toEqual([fourth, first, third]);
    expect(s.history[0].note).toContain(`evicted "${second}"`);

    s = kv.execute(s, `GET ${second}`);
    expect(s.history[0].reply).toBe("$-1");
  });

  it("expires lazily: the key stays until it is read after its deadline", () => {
    let s = run("SET session_token abc PX 5000");
    s = kv.advance(s, 4000);
    expect(kv.execute(s, "GET session_token").history[0].reply).toBe("$3 abc");
    s = kv.advance(s, 2000);
    expect(s.shards[kv.shardFor("session_token")]).toHaveLength(1); // still stored
    s = kv.execute(s, "GET session_token");
    expect(s.history[0]).toMatchObject({ reply: "$-1", note: "Expired — removed on this read" });
    expect(s.shards[kv.shardFor("session_token")]).toHaveLength(0);
  });

  it("queues SET and successful DEL for the log, and writes them in one batch", () => {
    let s = run("SET a 1", "DEL a", "DEL missing");
    expect(s.log.map((r) => r.line)).toEqual(["SET a 1", "DEL a"]);
    expect(kv.queuedCount(s)).toBe(2);
    s = kv.flushLog(s);
    expect(kv.queuedCount(s)).toBe(0);
    expect(s.history[0].reply).toBe(":0");
  });

  it("rejects malformed and oversized input with an error reply", () => {
    for (const bad of ["", "PING", "SET onlykey", "SET a b EX 5", "SET a b PX -1", `GET ${"x".repeat(kv.MAX_TOKEN + 1)}`]) {
      expect(kv.parse(bad).ok, bad).toBe(false);
    }
    expect(run("FLUSHALL").history[0]).toMatchObject({ ok: false, shard: null });
  });

  it("keeps history bounded", () => {
    const s = run(...Array.from({ length: 20 }, (_, i) => `SET k${i} v`));
    expect(s.history).toHaveLength(kv.MAX_HISTORY);
    expect(s.log.length).toBeLessThanOrEqual(kv.MAX_LOG);
  });
});

describe("self-healing cluster model", () => {
  it("replicates each key to all three nodes, primary first", () => {
    const list = cluster.preferenceList("user:1");
    expect(new Set(list)).toEqual(new Set(cluster.NODES));
  });

  it("keeps serving with one node down and replays hints when it returns", () => {
    let s = cluster.initialCluster();
    s = cluster.put(s, "user:1", "alice");
    s = cluster.takeDown(s, "B");
    s = cluster.put(s, "user:1", "alicia");
    expect(s.hints).toHaveLength(1);
    expect(s.stores.B["user:1"].value).toBe("alice");

    s = cluster.get(s, "user:1");
    expect(s.lastRead).toEqual({ key: "user:1", value: "alicia", ok: true });

    s = cluster.restore(s, "B");
    expect(s.hints).toHaveLength(0);
    expect(s.stores.B["user:1"].value).toBe("alicia");
    expect(s.events.some((e) => e.kind === "hint-replayed")).toBe(true);
  });

  it("refuses reads and writes when quorum is lost", () => {
    let s = cluster.put(cluster.initialCluster(), "k", "v");
    s = cluster.takeDown(cluster.takeDown(s, "A"), "C");
    s = cluster.put(s, "k", "w");
    expect(s.events[0].kind).toBe("quorum-failed");
    s = cluster.get(s, "k");
    expect(s.lastRead?.ok).toBe(false);
  });

  it("anti-entropy repairs a node that missed writes without a hint", () => {
    let s = cluster.initialCluster();
    s = cluster.takeDown(s, "A");
    s = cluster.put(s, "a", "1");
    s = { ...s, hints: [] }; // hint lost
    s = cluster.restore(s, "A");
    expect(s.stores.A.a?.value).toBe("1");
    expect(s.events.find((e) => e.kind === "anti-entropy")?.text).toContain("pushed 1");
  });
});

describe("club billing", () => {
  it("bills table time per started minute, applies membership, adds café orders, splits evenly", () => {
    let s = cafe.start(cafe.initialCafe(), "s1", 3, "Silver");
    s = cafe.addOrder(s, "s1", "Cold coffee");
    s = cafe.addOrder(s, "s1", "Fries");
    s = cafe.advance(s, 45);
    const b = cafe.bill(s, cafe.sessionFor(s, "s1")!);
    expect(b.tableCharge).toBe(225); // ₹300/h × 45 min
    expect(b.discount).toBe(22); // 10%, floored
    expect(b.cafe).toBe(230);
    expect(b.total).toBe(433);
    expect(b.perPlayer).toBe(145); // rounded up
  });

  it("moves orders through the kitchen and closes into the day's takings", () => {
    let s = cafe.start(cafe.initialCafe(), "p1", 2, "None");
    s = cafe.addOrder(s, "p1", "Masala chai");
    const order = cafe.sessionFor(s, "p1")!.orders[0];
    expect(cafe.orderStatus(order, s.now)).toBe("Pending");
    expect(cafe.orderStatus(order, s.now + 3)).toBe("Preparing");
    expect(cafe.orderStatus(order, s.now + 9)).toBe("Ready");
    s = cafe.close(cafe.advance(s, 30), "p1");
    expect(cafe.takings(s)).toBe(140);
    expect(cafe.sessionFor(s, "p1")).toBeUndefined();
  });

  it("does not start a table twice", () => {
    const s = cafe.start(cafe.initialCafe(), "s1", 2, "None");
    expect(cafe.start(s, "s1", 4, "Gold")).toBe(s);
  });
});

describe("Base62", () => {
  it("matches the shortener's own example: abc = 39134", () => {
    expect(encode(39134)).toBe("abc");
    expect(decode("abc")).toBe(39134);
  });

  it("round-trips and never repeats across a range", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 5000; i++) {
      const code = encode(i);
      expect(decode(code)).toBe(i);
      codes.add(code);
    }
    expect(codes.size).toBe(5000);
  });

  it("breaks a code into positional digits", () => {
    expect(breakdown(125)).toEqual([
      { char: "2", digit: 2, place: 62 },
      { char: "1", digit: 1, place: 1 },
    ]);
  });
});

describe("SSRF validator", () => {
  it("accepts a public URL and rejects every other sample", () => {
    const verdicts = SAMPLE_URLS.map((u) => validate(u).accepted);
    expect(verdicts).toEqual([true, false, false, false, false, false, false, false]);
  });

  it("catches decimal-encoded loopback after URL normalisation", () => {
    const v = validate("http://2130706433/");
    expect(v.host).toBe("127.0.0.1");
    expect(v.checks.at(-1)?.detail).toContain("loopback");
  });

  it("knows the metadata and private ranges", () => {
    expect(blockedV4("169.254.169.254")).toContain("metadata");
    expect(blockedV4("172.31.0.1")).toContain("RFC 1918");
    expect(blockedV4("172.32.0.1")).toBeNull();
    expect(blockedV4("8.8.8.8")).toBeNull();
  });
});

describe("hex price map", () => {
  const hotels = syntheticHotels();

  it("is deterministic and inside the map", () => {
    expect(syntheticHotels()).toEqual(hotels);
    expect(hotels.every((h) => h.x > 0 && h.x < 1 && h.y > 0 && h.y < 1 && h.price > 0)).toBe(true);
  });

  it("keeps every hotel when aggregating, with fewer cells when zoomed out", () => {
    const counts = RESOLUTIONS.map((r) => aggregate(hotels, r.size));
    for (const cells of counts) expect(cells.reduce((n, c) => n + c.count, 0)).toBe(hotels.length);
    expect(counts[0].length).toBeLessThan(counts[1].length);
    expect(counts[1].length).toBeLessThan(counts[2].length);
  });

  it("bands prices into five colours", () => {
    expect(band(1000)).toBe(0);
    expect(band(9000)).toBe(4);
  });
});

describe("fraud graph", () => {
  it("ring members share signals; ordinary customers mostly don't", () => {
    const ring = users.filter((u) => ["Dev", "Eli", "Faye"].includes(u.label));
    for (const u of ring) expect(sharedSignals(u.id)).toBe(2);
    expect(sharedSignals("u1")).toBe(0);
  });

  it("a 2-hop neighbourhood reaches through a shared device", () => {
    const n = neighbourhood("u4");
    expect(n.has("u5")).toBe(true);
    expect(n.has("u6")).toBe(true);
    expect(n.has("u1")).toBe(false);
  });
});

describe("isolation forest", () => {
  it("scores injected anomalies above normal traffic on average", () => {
    const points = syntheticRequests();
    const scores = isolationScores(points);
    const mean = (kind: string) => {
      const s = scores.filter((_, i) => (kind === "normal" ? points[i].kind === "normal" : points[i].kind !== "normal"));
      return s.reduce((a, b) => a + b, 0) / s.length;
    };
    expect(mean("anomaly")).toBeGreaterThan(mean("normal") + 0.1);
    expect(isolationScores(points)).toEqual(scores);
  });
});

describe("offline sync queue", () => {
  it("retries with growing delays while offline, then drains when online", () => {
    let s = sync.record(sync.initialSync(), "Visit report");
    s = sync.tick(s, 0);
    expect(s.items[0]).toMatchObject({ attempts: 1, status: "queued", nextAt: 1000 });
    s = sync.tick(s, 1000);
    expect(s.items[0]).toMatchObject({ attempts: 2, nextAt: 3000 });
    s = sync.tick(sync.setOnline(s, true), 0);
    expect(s.items[0].status).toBe("synced");
  });

  it("gives up after ten attempts", () => {
    let s = sync.record(sync.initialSync(), "Order");
    for (let i = 0; i < 12; i++) s = sync.tick(s, 600_000);
    expect(s.items[0]).toMatchObject({ status: "failed", attempts: sync.MAX_ATTEMPTS });
  });
});

describe("two sum stepper", () => {
  it("finds [0, 1] for 2 + 7 = 9 on the second step", () => {
    const steps = twoSumSteps([2, 7, 11, 15], 9);
    expect(steps).toHaveLength(2);
    expect(steps[1].found).toEqual([0, 1]);
  });

  it("records what has been seen before each step", () => {
    const steps = twoSumSteps([3, 2, 4], 6);
    expect(steps.map((s) => s.seen.length)).toEqual([0, 1, 2]);
    expect(steps.at(-1)?.found).toEqual([1, 2]);
  });
});
