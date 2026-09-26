import { fraudRing } from "@/content/projects/selected";
import * as g from "@/lib/sim/fraud-graph";
import type { SceneMeta } from "./types";

const [streaming, judged, rings] = fraudRing.highlights;
const [hopsMetric] = fraudRing.metrics;
const [untrained] = fraudRing.limitations;

/** The account the scene follows, as in the interactive below it. */
export const FRAUD_FOCUS = "u5";
/** Edges arrive in the order the graph lists them: ordinary customers first, then the ring. */
export const ORDINARY_EDGES = g.edges.findIndex((e) => e.from === "u4");

const label = (id: string) => g.nodes.find((n) => n.id === id)!.label;
const focusName = label(FRAUD_FOCUS);
const near = (id: string) => [...g.neighbourhood(id, 1)].filter((n) => n !== id);
/** Devices and cards the focus shares with other accounts, and those accounts. */
const shared = near(FRAUD_FOCUS).filter((thing) => near(thing).some((other) => other !== FRAUD_FOCUS && other.startsWith("u")));
const partners = [...new Set(shared.flatMap((thing) => near(thing).filter((u) => u !== FRAUD_FOCUS && u.startsWith("u"))))];
const sharedDevices = shared.filter((id) => id.startsWith("d")).length;
const sharedCards = shared.filter((id) => id.startsWith("c")).length;
const ownDevices = near(FRAUD_FOCUS).filter((id) => id.startsWith("d")).length;
const ownCards = near(FRAUD_FOCUS).filter((id) => id.startsWith("c")).length;
const count = (n: number, one: string) => `${n === 1 ? "one" : n === 2 ? "two" : n} ${one}${n === 1 ? "" : "s"}`;

/** "Follow the edges": the graph fills from a stream, then one account's neighbourhood lights. */
export const fraudScene: SceneMeta = {
  kind: "Simulation",
  note: "The same synthetic graph as the interactive below: invented accounts, cards, devices and merchants. Lighting a neighbourhood isn't a model score — the engine's graph network isn't trained yet.",
  steps: [
    { title: streaming.title, body: streaming.body },
    { title: rings.title, body: rings.body },
    { title: judged.title, body: `${judged.body} One hop out from ${focusName}: ${count(ownDevices, "device")} and ${count(ownCards, "card")}.` },
    {
      title: "Two hops out",
      body: `Every transaction is judged with its ${hopsMetric.value} neighbourhood. From ${focusName}, two hops reach ${partners.map(label).join(" and ")} — through ${count(sharedDevices, "shared device")} and ${count(sharedCards, "shared card")}.`,
    },
    { title: "The pipeline is the finished part", body: untrained },
  ],
  keyFrames: [0, 1, 3, 4],
  mobile: "cards",
};

export type FraudFrame = {
  step: number;
  /** How many of `edges`, in order, have arrived. */
  shown: number;
  focus: string | null;
  /** Nodes lit around the focus. */
  hood: string[];
  hops: 0 | 1 | 2;
  /** The last two transactions (card at merchant) to arrive. */
  stream: string[];
  pipeline: boolean;
};

export function fraudFrame(step: number): FraudFrame {
  const i = Math.max(0, Math.min(4, step));
  const shown = i === 0 ? ORDINARY_EDGES : g.edges.length;
  const hops = i === 2 ? 1 : i === 3 ? 2 : 0;
  const focus = hops ? FRAUD_FOCUS : null;
  const stream = g.edges
    .slice(0, shown)
    .filter((e) => e.from.startsWith("c") && e.to.startsWith("m"))
    .slice(-2)
    .map((e) => `${label(e.from)} · ${label(e.to)}`);
  return { step: i, shown, focus, hood: focus ? [...g.neighbourhood(focus, hops)] : [], hops, stream, pipeline: i === 4 };
}

export const FRAUD_PARTNERS = partners;
