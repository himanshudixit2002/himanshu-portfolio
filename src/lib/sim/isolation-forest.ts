import { gaussian, seeded } from "./random";

/*
 * A small, real Isolation Forest (Liu, Ting & Zhou, 2008) running on synthetic
 * request metadata — the same algorithm the Anomaly Gateway's scoring service
 * uses via scikit-learn, reimplemented in a few lines for the browser.
 * Points that are easy to isolate with random splits get scores near 1.
 */

export type Point = { x: number; y: number; kind: "normal" | "scraper" | "flood" | "probe" };

type Tree = { split?: { dim: "x" | "y"; at: number }; left?: Tree; right?: Tree; size: number };

/** Synthetic requests: x = response time (ms), y = response size (KB). */
export function syntheticRequests(seed = 11): Point[] {
  const rand = seeded(seed);
  const points: Point[] = [];
  for (let i = 0; i < 140; i++) {
    points.push({ x: Math.max(20, 180 + gaussian(rand) * 70), y: Math.max(2, 48 + gaussian(rand) * 16), kind: "normal" });
  }
  for (let i = 0; i < 7; i++) points.push({ x: 35 + rand() * 20, y: 180 + rand() * 60, kind: "scraper" });
  for (let i = 0; i < 6; i++) points.push({ x: 8 + rand() * 8, y: 0.4 + rand() * 1.2, kind: "flood" });
  for (let i = 0; i < 5; i++) points.push({ x: 620 + rand() * 180, y: 3 + rand() * 4, kind: "probe" });
  return points;
}

/** Average path length of an unsuccessful BST search — the normaliser c(n). */
function c(n: number): number {
  if (n <= 1) return 0;
  return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
}

function build(points: Point[], depth: number, limit: number, rand: () => number): Tree {
  if (depth >= limit || points.length <= 1) return { size: points.length };
  const dim = rand() < 0.5 ? "x" : "y";
  const values = points.map((p) => p[dim]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return { size: points.length };
  const at = min + rand() * (max - min);
  return {
    size: points.length,
    split: { dim, at },
    left: build(points.filter((p) => p[dim] < at), depth + 1, limit, rand),
    right: build(points.filter((p) => p[dim] >= at), depth + 1, limit, rand),
  };
}

function pathLength(point: Pick<Point, "x" | "y">, tree: Tree, depth = 0): number {
  if (!tree.split) return depth + c(tree.size);
  const next = point[tree.split.dim] < tree.split.at ? tree.left! : tree.right!;
  return pathLength(point, next, depth + 1);
}

export function isolationScores(points: Point[], { trees = 60, sample = 64, seed = 3 } = {}): number[] {
  const rand = seeded(seed);
  const size = Math.min(sample, points.length);
  const limit = Math.ceil(Math.log2(size));
  const forest: Tree[] = [];
  for (let t = 0; t < trees; t++) {
    const subset: Point[] = [];
    for (let i = 0; i < size; i++) subset.push(points[Math.floor(rand() * points.length)]);
    forest.push(build(subset, 0, limit, rand));
  }
  const norm = c(size);
  return points.map((p) => {
    const mean = forest.reduce((sum, tree) => sum + pathLength(p, tree), 0) / forest.length;
    return 2 ** (-mean / norm);
  });
}
