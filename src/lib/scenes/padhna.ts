import { padhnaThoPadega } from "@/content/projects/selected";
import { twoSumSteps, type TwoSumStep } from "@/lib/sim/two-sum";
import type { SceneMeta } from "./types";

const [everyStep, languages] = padhnaThoPadega.highlights;

/** The interactive's longest case, so the scene takes a step per element. */
export const TS_NUMS = [1, 5, 3, 8, 4] as const;
export const TS_TARGET = 12;
export const TS_STEPS = twoSumSteps(TS_NUMS, TS_TARGET);

export type Lang = "Java" | "Python" | "C++";
export const LANGS: Lang[] = ["Java", "Python", "C++"];
type Tag = "need" | "check" | "found" | "remember";
export type CodeLine = { text: string; tag?: Tag };

/**
 * The one-pass hash-map solution in each language — written for this scene,
 * not copied from the repository. Tags mark the lines a step lights.
 */
export const CODE: Record<Lang, CodeLine[]> = {
  Java: [
    { text: "int[] twoSum(int[] nums, int target) {" },
    { text: "  Map<Integer, Integer> seen = new HashMap<>();" },
    { text: "  for (int i = 0; i < nums.length; i++) {" },
    { text: "    int need = target - nums[i];", tag: "need" },
    { text: "    if (seen.containsKey(need))", tag: "check" },
    { text: "      return new int[] { seen.get(need), i };", tag: "found" },
    { text: "    seen.put(nums[i], i);", tag: "remember" },
    { text: "  }" },
    { text: "  return new int[0];" },
    { text: "}" },
  ],
  Python: [
    { text: "def two_sum(nums, target):" },
    { text: "    seen = {}" },
    { text: "    for i, x in enumerate(nums):" },
    { text: "        need = target - x", tag: "need" },
    { text: "        if need in seen:", tag: "check" },
    { text: "            return [seen[need], i]", tag: "found" },
    { text: "        seen[x] = i", tag: "remember" },
    { text: "    return []" },
  ],
  "C++": [
    { text: "vector<int> twoSum(vector<int>& nums, int target) {" },
    { text: "  unordered_map<int, int> seen;" },
    { text: "  for (int i = 0; i < nums.size(); i++) {" },
    { text: "    int need = target - nums[i];", tag: "need" },
    { text: "    if (seen.count(need))", tag: "check" },
    { text: "      return {seen[need], i};", tag: "found" },
    { text: "    seen[nums[i]] = i;", tag: "remember" },
    { text: "  }" },
    { text: "  return {};" },
    { text: "}" },
  ],
};

/** The tab each step shows: Java, then Python, then C++ for the answer. */
const LANG_BY_STEP: Lang[] = ["Java", "Java", "Python", "Python", "C++"];
const note = (s: TwoSumStep) => `${s.note}.`;

/** "Watch it think": Two Sum on [1, 5, 3, 8, 4], one element per step. */
export const padhnaScene: SceneMeta = {
  kind: "Simulation",
  note: "The one-pass hash-map solution stepped through in your browser, in the style of PadhnaThoPadega's visualizations; the code shown was written for this scene in the project's three languages.",
  steps: [
    { title: everyStep.title, body: `${everyStep.body} Two Sum on [${TS_NUMS.join(", ")}], target ${TS_TARGET}: ${note(TS_STEPS[0])}` },
    { title: "Remember, then move on", body: note(TS_STEPS[1]) },
    { title: languages.title, body: `${languages.body} ${note(TS_STEPS[2])}` },
    { title: "Still looking", body: note(TS_STEPS[3]) },
    { title: "Found in one pass", body: note(TS_STEPS[4]) },
  ],
  keyFrames: [0, 2, 4],
  mobile: "cards",
};

export type PadhnaFrame = { step: number; lang: Lang; algo: TwoSumStep; lit: Tag[] };

export function padhnaFrame(step: number): PadhnaFrame {
  const i = Math.max(0, Math.min(TS_STEPS.length - 1, step));
  const algo = TS_STEPS[i];
  return { step: i, lang: LANG_BY_STEP[i], algo, lit: algo.found ? ["check", "found"] : ["check", "remember"] };
}
