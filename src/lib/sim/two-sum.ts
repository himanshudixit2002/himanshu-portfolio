/** Steps of the one-pass hash-map solution to Two Sum, for a step-through view. */
export type TwoSumStep = {
  index: number;
  value: number;
  need: number;
  /** value → index, as it stands before this step writes to it. */
  seen: [number, number][];
  found: [number, number] | null;
  note: string;
};

export function twoSumSteps(nums: readonly number[], target: number): TwoSumStep[] {
  const seen = new Map<number, number>();
  const steps: TwoSumStep[] = [];
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    const hit = seen.get(need);
    const snapshot = [...seen.entries()];
    if (hit !== undefined) {
      steps.push({
        index: i,
        value: nums[i],
        need,
        seen: snapshot,
        found: [hit, i],
        note: `${need} was seen at index ${hit} — answer [${hit}, ${i}]`,
      });
      return steps;
    }
    steps.push({
      index: i,
      value: nums[i],
      need,
      seen: snapshot,
      found: null,
      note: `Need ${need}; not seen yet, so remember ${nums[i]} → ${i}`,
    });
    seen.set(nums[i], i);
  }
  return steps;
}
