import type { Project } from "../types";

export const kvStore: Project = {
  slug: "kvstore",
  title: "KVStore",
  tagline: "A closer look at what makes fast possible.",
  summary:
    "A Redis-style in-memory key-value store written from scratch in C++20: a sharded LRU cache, a write-ahead log and a thread-pooled TCP server.",
  categories: ["Systems"],
  tier: "flagship",
  period: { start: "2026-08", end: "2026-08" },
  status: "Open source",
  platform: "C++20 · POSIX sockets",
  role: "Personal project — sole author",
  problem:
    "One global lock turns a multithreaded cache into a single-file queue. How far can lock striping, batched logging and lean parsing take a small server?",
  contribution:
    "Designed and wrote the TCP server, command parser, sharded cache, write-ahead log and thread pool, with unit tests for the parser and the cache.",
  stack: ["C++20", "POSIX sockets", "std::thread", "CMake"],
  highlights: [
    {
      title: "16 independent shards",
      body: "Each key hashes to one of 16 LRU shards with its own lock, so keys on different shards never wait on each other.",
    },
    {
      title: "Disk off the hot path",
      body: "Writes are queued, and a background thread swaps the whole queue out and appends it to the log in one batch.",
    },
    {
      title: "Parsing by slicing",
      body: "The parser walks the network buffer with std::string_view and copies only the final key and value into the command.",
    },
  ],
  metrics: [
    { value: "16", label: "lock-striped LRU shards" },
    { value: "3", label: "commands: SET (with PX expiry), GET, DEL" },
  ],
  decisions: [
    {
      title: "Lock striping over one global lock",
      body: "A shard is chosen by hashing the key modulo 16. Contention only happens when two requests land on the same shard at the same moment.",
    },
    {
      title: "Batch the log",
      body: "The log worker holds the lock just long enough to swap the queue for an empty one, then writes the batch without it — the network threads never wait on disk.",
    },
    {
      title: "Expire lazily",
      body: "An expired key is removed when it is next read, not by a sweeper thread. Cheap, but memory is reclaimed only on access or by LRU eviction.",
    },
  ],
  evidence: ["Unit tests for the command parser and the LRU cache, built with CMake.", "The README documents the architecture and a netcat session you can reproduce."],
  limitations: [
    "The log is flushed to the operating system but not fsynced, so a power loss can drop the latest writes.",
    "The log is written but not yet replayed on start-up.",
    "The queue uses a mutex and condition variable; it is not lock-free.",
    "No published benchmarks yet — throughput claims wait for a reproducible harness.",
  ],
  media: [],
  links: [{ kind: "source", label: "Source", href: "https://github.com/himanshudixit2002/kv_store" }],
  visual: "kv-explorer",
  accent: "#fbbf24",
};
