import { describe, expect, it } from "vitest";
import { score, skipped } from "@/lib/fuzzy";

describe("fuzzy matching (palette and 404 suggestions)", () => {
  it("ranks a match in the name over one in the other words, over letters in order", () => {
    const inName = score("KVStore", "", "store");
    const inRest = score("Lab", "a key-value store", "store");
    const inOrder = score("SmartShelfKart", "", "ssk");
    expect(inName).toBeGreaterThan(inRest);
    expect(inRest).toBeGreaterThan(inOrder);
    expect(inOrder).toBeGreaterThan(0);
    expect(score("Lab", "", "xyz")).toBe(0);
  });

  it("counts what a match skipped, so the 404 can keep only close ones", () => {
    expect(skipped(score("kvstore", "", "kvstore"))).toBe(0);
    // A typo drops one letter: close.
    expect(skipped(score("elepeia", "", "elepia"))).toBe(1);
    // Four letters found far apart: not a suggestion for "/nope".
    expect(skipped(score("padhnathopadega", "", "nope"))).toBeGreaterThan(4 / 3);
  });
});
