import { fnv1a, mix32 } from "./random";

/*
 * A browser model of the self-healing cache's documented behaviour
 * (github.com/himanshudixit2002/self-healing-distributed-cache):
 *
 *   - consistent hashing with virtual nodes decides each key's primary
 *   - replication factor 3, read quorum 2, write quorum 2
 *   - a write meant for a down replica is kept as a hint and replayed when
 *     that replica returns (hinted handoff)
 *   - anti-entropy compares versions and pushes whatever is still missing
 *
 * Simplified for teaching: three nodes, 8 virtual nodes each (the real
 * default is 150), and a failed quorum writes nothing.
 */

export const NODES = ["A", "B", "C"] as const;
export type NodeId = (typeof NODES)[number];
export const REPLICATION = 3;
export const READ_QUORUM = 2;
export const WRITE_QUORUM = 2;
export const VNODES = 8;
const MAX_EVENTS = 14;
const MAX_KEYS = 6;

type Versioned = { value: string; version: number };

export type ClusterEvent = {
  id: number;
  kind: "write" | "read" | "quorum-failed" | "down" | "up" | "hint-stored" | "hint-replayed" | "anti-entropy" | "re-home";
  text: string;
};

export type ClusterState = {
  up: Record<NodeId, boolean>;
  stores: Record<NodeId, Record<string, Versioned>>;
  hints: { target: NodeId; heldBy: NodeId; key: string; entry: Versioned }[];
  version: number;
  events: ClusterEvent[];
  eventSeq: number;
  lastRead: { key: string; value: string | null; ok: boolean } | null;
};

/** Ring positions (0–1) of every virtual node, for drawing and lookup. */
export const ring: { node: NodeId; position: number }[] = NODES.flatMap((node) =>
  Array.from({ length: VNODES }, (_, v) => ({ node, position: mix32(fnv1a(`${node}#${v}`)) / 2 ** 32 })),
).sort((a, b) => a.position - b.position);

export function keyPosition(key: string): number {
  return mix32(fnv1a(key)) / 2 ** 32;
}

/** Nodes responsible for a key, primary first: walk the ring clockwise. */
export function preferenceList(key: string): NodeId[] {
  const pos = keyPosition(key);
  const start = ring.findIndex((v) => v.position >= pos);
  const order: NodeId[] = [];
  for (let i = 0; order.length < REPLICATION && i < ring.length; i++) {
    const { node } = ring[(Math.max(start, 0) + i) % ring.length];
    if (!order.includes(node)) order.push(node);
  }
  return order;
}

export function initialCluster(): ClusterState {
  return {
    up: { A: true, B: true, C: true },
    stores: { A: {}, B: {}, C: {} },
    hints: [],
    version: 0,
    events: [],
    eventSeq: 0,
    lastRead: null,
  };
}

function log(state: ClusterState, ...events: Omit<ClusterEvent, "id">[]): Pick<ClusterState, "events" | "eventSeq"> {
  let seq = state.eventSeq;
  const next = events.map((e) => ({ ...e, id: ++seq }));
  return { events: [...next.reverse(), ...state.events].slice(0, MAX_EVENTS), eventSeq: seq };
}

export function upCount(state: ClusterState): number {
  return NODES.filter((n) => state.up[n]).length;
}

export function keysIn(state: ClusterState): string[] {
  const keys = new Set<string>();
  for (const n of NODES) Object.keys(state.stores[n]).forEach((k) => keys.add(k));
  return [...keys].sort();
}

export function put(state: ClusterState, key: string, value: string): ClusterState {
  const replicas = preferenceList(key);
  const alive = replicas.filter((n) => state.up[n]);
  if (alive.length < WRITE_QUORUM) {
    return {
      ...state,
      ...log(state, {
        kind: "quorum-failed",
        text: `PUT ${key} refused — only ${alive.length} of ${REPLICATION} replicas reachable, ${WRITE_QUORUM} needed`,
      }),
    };
  }
  if (!state.stores[alive[0]][key] && keysIn(state).length >= MAX_KEYS) {
    return { ...state, ...log(state, { kind: "quorum-failed", text: `This demo holds at most ${MAX_KEYS} keys — reset to add more` }) };
  }

  const version = state.version + 1;
  const entry = { value, version };
  const stores = { ...state.stores };
  for (const n of alive) stores[n] = { ...stores[n], [key]: entry };

  const coordinator = alive[0];
  const missing = replicas.filter((n) => !state.up[n]);
  const hints = [...state.hints, ...missing.map((target) => ({ target, heldBy: coordinator, key, entry }))];

  return {
    ...state,
    stores,
    hints,
    version,
    ...log(
      state,
      { kind: "write", text: `PUT ${key}=${value} acknowledged by ${alive.join(", ")} (${alive.length}/${REPLICATION})` },
      ...missing.map((target) => ({
        kind: "hint-stored" as const,
        text: `${coordinator} keeps a hint for ${target}, which is down`,
      })),
    ),
  };
}

export function get(state: ClusterState, key: string): ClusterState {
  const replicas = preferenceList(key);
  const alive = replicas.filter((n) => state.up[n]);
  if (alive.length < READ_QUORUM) {
    return {
      ...state,
      lastRead: { key, value: null, ok: false },
      ...log(state, { kind: "quorum-failed", text: `GET ${key} failed — ${alive.length} of ${READ_QUORUM} required replicas answered` }),
    };
  }
  const answers = alive.map((n) => state.stores[n][key]).filter(Boolean) as Versioned[];
  const newest = answers.sort((a, b) => b.version - a.version)[0];
  return {
    ...state,
    lastRead: { key, value: newest?.value ?? null, ok: true },
    ...log(state, {
      kind: "read",
      text: `GET ${key} → ${newest ? newest.value : "not found"} (quorum from ${alive.slice(0, READ_QUORUM).join(", ")})`,
    }),
  };
}

export function takeDown(state: ClusterState, node: NodeId): ClusterState {
  if (!state.up[node]) return state;
  const up = { ...state.up, [node]: false };
  const rehomed = keysIn(state).filter((k) => preferenceList(k)[0] === node);
  const newPrimary = (k: string) => preferenceList(k).find((n) => up[n]);
  return {
    ...state,
    up,
    ...log(
      state,
      { kind: "down", text: `Health probe: ${node} unreachable — marked down` },
      ...rehomed.map((k) => ({ kind: "re-home" as const, text: `${k} re-homed to ${newPrimary(k) ?? "nobody"} while ${node} is away` })),
    ),
  };
}

/** Bring a node back, replay its hints, then run one anti-entropy pass. */
export function restore(state: ClusterState, node: NodeId): ClusterState {
  if (state.up[node]) return state;
  const up = { ...state.up, [node]: true };
  const stores = { ...state.stores, [node]: { ...state.stores[node] } };
  const events: Omit<ClusterEvent, "id">[] = [{ kind: "up", text: `${node} is reachable again` }];

  const mine = state.hints.filter((h) => h.target === node);
  for (const h of mine) {
    const current = stores[node][h.key];
    if (!current || current.version < h.entry.version) stores[node][h.key] = h.entry;
    events.push({ kind: "hint-replayed", text: `${h.heldBy} replays hint: ${h.key}=${h.entry.value} → ${node}` });
  }

  // Anti-entropy: pull the newest version of every key this node should hold.
  let repaired = 0;
  for (const key of keysIn({ ...state, stores })) {
    if (!preferenceList(key).includes(node)) continue;
    const newest = NODES.filter((n) => up[n])
      .map((n) => stores[n][key])
      .filter(Boolean)
      .sort((a, b) => b.version - a.version)[0];
    const current = stores[node][key];
    if (newest && (!current || current.version < newest.version)) {
      stores[node][key] = newest;
      repaired++;
    }
  }
  events.push({
    kind: "anti-entropy",
    text: repaired ? `Anti-entropy pushed ${repaired} newer version${repaired > 1 ? "s" : ""} to ${node}` : `Anti-entropy: ${node} is in sync`,
  });

  return {
    ...state,
    up,
    stores,
    hints: state.hints.filter((h) => h.target !== node),
    ...log(state, ...events),
  };
}
