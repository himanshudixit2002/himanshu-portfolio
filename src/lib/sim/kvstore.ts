import { fnv1a } from "./random";

/*
 * A browser model of KVStore (github.com/himanshudixit2002/kv_store), faithful
 * to its documented behaviour:
 *
 *   - SET key value [PX ms], GET key, DEL key
 *   - shard = hash(key) % 16, each shard an LRU list
 *   - expiry is lazy: an expired key is removed when it is next read
 *   - SET and successful DEL are queued for the write-ahead log; a background
 *     worker writes the queue out in one batch and calls flush() (no fsync)
 *
 * Two deliberate differences, labelled in the UI: the hash is FNV-1a (the real
 * server uses std::hash, which is implementation-defined), and shard capacity
 * is scaled down so eviction is visible.
 */

export const SHARDS = 16;
export const SHARD_CAPACITY = 3;
export const MAX_INPUT = 120;
export const MAX_TOKEN = 40;
export const MAX_HISTORY = 8;
export const MAX_LOG = 10;

export type Entry = { key: string; value: string; expiresAt: number | null };

export type LogRecord = { seq: number; line: string; state: "queued" | "written" };

export type HistoryItem = {
  input: string;
  reply: string;
  ok: boolean;
  shard: number | null;
  note?: string;
};

export type KvState = {
  now: number;
  shards: Entry[][];
  log: LogRecord[];
  seq: number;
  history: HistoryItem[];
  /** Shard touched by the last command, for highlighting. */
  active: number | null;
};

export type Command =
  | { type: "SET"; key: string; value: string; px: number | null }
  | { type: "GET"; key: string }
  | { type: "DEL"; key: string };

export function initialKv(): KvState {
  return {
    now: 0,
    shards: Array.from({ length: SHARDS }, () => []),
    log: [],
    seq: 0,
    history: [],
    active: null,
  };
}

export function shardFor(key: string): number {
  return fnv1a(key) % SHARDS;
}

export function parse(input: string): { ok: true; command: Command } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Type a command, for example SET name Alice" };
  if (trimmed.length > MAX_INPUT) return { ok: false, error: `Commands are limited to ${MAX_INPUT} characters here` };

  const tokens = trimmed.split(/\s+/);
  const verb = tokens[0].toUpperCase();
  const tooLong = tokens.find((t) => t.length > MAX_TOKEN);
  if (tooLong) return { ok: false, error: `Keys and values are limited to ${MAX_TOKEN} characters here` };

  switch (verb) {
    case "SET": {
      if (tokens.length !== 3 && tokens.length !== 5) return { ok: false, error: "Usage: SET key value [PX milliseconds]" };
      let px: number | null = null;
      if (tokens.length === 5) {
        if (tokens[3].toUpperCase() !== "PX") return { ok: false, error: "Only the PX option is supported" };
        px = Number(tokens[4]);
        if (!Number.isInteger(px) || px <= 0 || px > 3_600_000) {
          return { ok: false, error: "PX takes a whole number of milliseconds (up to one hour)" };
        }
      }
      return { ok: true, command: { type: "SET", key: tokens[1], value: tokens[2], px } };
    }
    case "GET":
    case "DEL":
      if (tokens.length !== 2) return { ok: false, error: `Usage: ${verb} key` };
      return { ok: true, command: { type: verb, key: tokens[1] } };
    default:
      return { ok: false, error: `Unknown command "${tokens[0]}". KVStore supports SET, GET and DEL.` };
  }
}

const pushHistory = (history: HistoryItem[], item: HistoryItem) => [item, ...history].slice(0, MAX_HISTORY);

function enqueue(state: KvState, line: string): Pick<KvState, "log" | "seq"> {
  const seq = state.seq + 1;
  return { seq, log: [...state.log, { seq, line, state: "queued" as const }].slice(-MAX_LOG) };
}

export function execute(state: KvState, input: string): KvState {
  const parsed = parse(input);
  if (!parsed.ok) {
    return { ...state, active: null, history: pushHistory(state.history, { input, reply: `-ERR ${parsed.error}`, ok: false, shard: null }) };
  }

  const cmd = parsed.command;
  const index = shardFor(cmd.key);
  const shards = state.shards.map((s) => s.slice());
  const shard = shards[index];
  const at = shard.findIndex((e) => e.key === cmd.key);

  if (cmd.type === "SET") {
    let note: string | undefined;
    if (at >= 0) shard.splice(at, 1);
    else if (shard.length >= SHARD_CAPACITY) {
      const evicted = shard.pop()!;
      note = `Shard full — evicted "${evicted.key}", the least recently used key`;
    }
    shard.unshift({ key: cmd.key, value: cmd.value, expiresAt: cmd.px === null ? null : state.now + cmd.px });
    return {
      ...state,
      shards,
      ...enqueue(state, `SET ${cmd.key} ${cmd.value}`),
      active: index,
      history: pushHistory(state.history, { input, reply: "+OK", ok: true, shard: index, note }),
    };
  }

  if (cmd.type === "GET") {
    if (at < 0) {
      return { ...state, active: index, history: pushHistory(state.history, { input, reply: "$-1", ok: true, shard: index, note: "Not found" }) };
    }
    const entry = shard[at];
    if (entry.expiresAt !== null && state.now > entry.expiresAt) {
      shard.splice(at, 1);
      return {
        ...state,
        shards,
        active: index,
        history: pushHistory(state.history, { input, reply: "$-1", ok: true, shard: index, note: "Expired — removed on this read" }),
      };
    }
    shard.splice(at, 1);
    shard.unshift(entry);
    return {
      ...state,
      shards,
      active: index,
      history: pushHistory(state.history, {
        input,
        reply: `$${entry.value.length} ${entry.value}`,
        ok: true,
        shard: index,
        note: "Moved to the front of its shard",
      }),
    };
  }

  // DEL — only a successful delete is logged, as in the server.
  if (at < 0) {
    return { ...state, active: index, history: pushHistory(state.history, { input, reply: ":0", ok: true, shard: index }) };
  }
  shard.splice(at, 1);
  return {
    ...state,
    shards,
    ...enqueue(state, `DEL ${cmd.key}`),
    active: index,
    history: pushHistory(state.history, { input, reply: ":1", ok: true, shard: index }),
  };
}

/** The background worker: take everything queued and write it in one batch. */
export function flushLog(state: KvState): KvState {
  if (!state.log.some((r) => r.state === "queued")) return state;
  return { ...state, log: state.log.map((r) => ({ ...r, state: "written" as const })) };
}

export function advance(state: KvState, ms: number): KvState {
  return { ...state, now: state.now + ms };
}

export function queuedCount(state: KvState): number {
  return state.log.filter((r) => r.state === "queued").length;
}

/** Remaining lifetime in ms, 0 if expired, null if the key never expires. */
export function ttlOf(entry: Entry, now: number): number | null {
  return entry.expiresAt === null ? null : Math.max(0, entry.expiresAt - now);
}
