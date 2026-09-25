/*
 * A small synthetic transaction graph in the shape the Fraud Ring Engine
 * builds: users own cards, cards transact at merchants, users log in from
 * devices. Three accounts share one device and two cards — a ring. Names are
 * invented and the "shared signals" count is illustrative, not a model score.
 */

export type NodeKind = "user" | "card" | "device" | "merchant";
export type GraphNode = { id: string; kind: NodeKind; label: string; x: number; y: number };
export type GraphEdge = { from: string; to: string };

export const nodes: GraphNode[] = [
  // Ordinary customers, left
  { id: "u1", kind: "user", label: "Asha", x: 0.08, y: 0.18 },
  { id: "u2", kind: "user", label: "Ben", x: 0.08, y: 0.5 },
  { id: "u3", kind: "user", label: "Chen", x: 0.08, y: 0.82 },
  { id: "c1", kind: "card", label: "•• 4411", x: 0.28, y: 0.18 },
  { id: "c2", kind: "card", label: "•• 9020", x: 0.28, y: 0.5 },
  { id: "c3", kind: "card", label: "•• 7314", x: 0.28, y: 0.82 },
  { id: "d1", kind: "device", label: "Phone A", x: 0.18, y: 0.34 },
  { id: "d2", kind: "device", label: "Laptop B", x: 0.18, y: 0.68 },
  // Merchants, centre
  { id: "m1", kind: "merchant", label: "Grocer", x: 0.5, y: 0.22 },
  { id: "m2", kind: "merchant", label: "Electronics", x: 0.5, y: 0.52 },
  { id: "m3", kind: "merchant", label: "Gift cards", x: 0.5, y: 0.84 },
  // The ring, right
  { id: "u4", kind: "user", label: "Dev", x: 0.92, y: 0.2 },
  { id: "u5", kind: "user", label: "Eli", x: 0.92, y: 0.52 },
  { id: "u6", kind: "user", label: "Faye", x: 0.92, y: 0.84 },
  { id: "c4", kind: "card", label: "•• 1188", x: 0.72, y: 0.34 },
  { id: "c5", kind: "card", label: "•• 5561", x: 0.72, y: 0.7 },
  { id: "d3", kind: "device", label: "Emulator X", x: 0.82, y: 0.52 },
];

export const edges: GraphEdge[] = [
  { from: "u1", to: "c1" },
  { from: "u2", to: "c2" },
  { from: "u3", to: "c3" },
  { from: "u1", to: "d1" },
  { from: "u2", to: "d2" },
  { from: "u3", to: "d2" },
  { from: "c1", to: "m1" },
  { from: "c2", to: "m1" },
  { from: "c2", to: "m2" },
  { from: "c3", to: "m1" },
  // ring: three users, one device, two shared cards, electronics and gift cards
  { from: "u4", to: "d3" },
  { from: "u5", to: "d3" },
  { from: "u6", to: "d3" },
  { from: "u4", to: "c4" },
  { from: "u5", to: "c4" },
  { from: "u5", to: "c5" },
  { from: "u6", to: "c5" },
  { from: "c4", to: "m2" },
  { from: "c4", to: "m3" },
  { from: "c5", to: "m3" },
];

const adjacency = new Map<string, string[]>();
for (const { from, to } of edges) {
  adjacency.set(from, [...(adjacency.get(from) ?? []), to]);
  adjacency.set(to, [...(adjacency.get(to) ?? []), from]);
}

/** Every node within `hops` edges of `id`, including itself. */
export function neighbourhood(id: string, hops = 2): Set<string> {
  const seen = new Set([id]);
  let frontier = [id];
  for (let h = 0; h < hops; h++) {
    const next: string[] = [];
    for (const n of frontier) {
      for (const m of adjacency.get(n) ?? []) {
        if (!seen.has(m)) {
          seen.add(m);
          next.push(m);
        }
      }
    }
    frontier = next;
  }
  return seen;
}

/**
 * Illustrative signal: how many *other* users share a device or card with
 * this user. Zero for ordinary customers here, two for each ring member.
 */
export function sharedSignals(userId: string): number {
  const users = new Set<string>();
  for (const thing of adjacency.get(userId) ?? []) {
    for (const other of adjacency.get(thing) ?? []) {
      if (other !== userId && other.startsWith("u")) users.add(other);
    }
  }
  return users.size;
}

export const users = nodes.filter((n) => n.kind === "user");
