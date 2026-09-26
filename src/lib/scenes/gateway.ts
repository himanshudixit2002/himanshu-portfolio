import { apiGateway } from "@/content/projects/selected";
import { isolationPath, isolationScores, syntheticRequests, type Cut } from "@/lib/sim/isolation-forest";
import type { SceneMeta } from "./types";

const [offPath, unsupervised] = apiGateway.highlights;
const [audit] = apiGateway.decisions;

/** The interactive's synthetic requests and scores (x: response time ms, y: response size KB). */
export const GW_POINTS = syntheticRequests();
export const GW_SCORES = isolationScores(GW_POINTS);
/** The interactive's default threshold. */
export const GW_THRESHOLD = 0.6;

/** The probe that scores highest — the scene's outlier. */
export const GW_OUTLIER = GW_SCORES.reduce((best, s, i) => (GW_POINTS[i].kind === "probe" && s > GW_SCORES[best] ? i : best), GW_POINTS.findIndex((p) => p.kind === "probe"));
/** The normal request nearest the middle of the crowd (distance in standard deviations). */
export const GW_NORMAL = (() => {
  const normal = GW_POINTS.filter((p) => p.kind === "normal");
  const cx = normal.reduce((a, p) => a + p.x, 0) / normal.length;
  const cy = normal.reduce((a, p) => a + p.y, 0) / normal.length;
  let best = 0;
  let bestD = Infinity;
  GW_POINTS.forEach((p, i) => {
    const d = Math.hypot((p.x - cx) / 70, (p.y - cy) / 16);
    if (p.kind === "normal" && d < bestD) [best, bestD] = [i, d];
  });
  return best;
})();

/**
 * The one tree the scene draws. Seed 3 is chosen because in it both points
 * take the number of cuts they take on average over 300 random trees (see
 * the unit test) — typical paths, not flattering ones.
 */
export const GW_SEED = 3;
export const OUTLIER_CUTS = isolationPath(GW_POINTS, GW_OUTLIER, GW_SEED);
export const NORMAL_CUTS = isolationPath(GW_POINTS, GW_NORMAL, GW_SEED);

const features = offPath.body.match(/publishes (.+?) to Kafka/)?.[1] ?? "";

/** "Easy to isolate": requests become points, random cuts, and why an outlier scores high. */
export const gatewayScene: SceneMeta = {
  kind: "Simulation",
  note: "The same synthetic requests and small Isolation Forest as the interactive below, run in your browser. The scrapers, floods and probes are invented; the tree drawn is one of many random ones.",
  steps: [
    { title: offPath.title, body: offPath.body },
    { title: unsupervised.title, body: `${unsupervised.body} Each request is a point: how long it took, and how big the response was.` },
    { title: "An outlier falls out fast", body: `Cut the space at random — one axis, one value — and keep the side the request is on. This probe is alone after ${OUTLIER_CUTS.length} cuts.` },
    {
      title: "A request in the crowd takes longer",
      body: `A typical request took ${NORMAL_CUTS.length} cuts in the same tree. Averaged over many random trees, fewer cuts means a higher score: ${GW_SCORES[GW_OUTLIER].toFixed(2)} for the probe, ${GW_SCORES[GW_NORMAL].toFixed(2)} for the typical one.`,
    },
    { title: audit.title, body: audit.body },
  ],
  keyFrames: [1, 2, 3, 4],
  mobile: "cards",
};

export type GatewayFrame = { step: number; target: number | null; cuts: Cut[]; flagged: boolean; pipeline: boolean };

export function gatewayFrame(step: number): GatewayFrame {
  const i = Math.max(0, Math.min(4, step));
  const target = i === 2 ? GW_OUTLIER : i === 3 ? GW_NORMAL : null;
  return { step: i, target, cuts: i === 2 ? OUTLIER_CUTS : i === 3 ? NORMAL_CUTS : [], flagged: i === 4, pipeline: i === 0 };
}

/** The request fields the gateway publishes, as its highlight lists them. */
export const GW_FEATURES = features.replace(" and ", ", ").split(", ").map((f) => f.trim());
