import { rxForce } from "@/content/projects/selected";
import * as q from "@/lib/sim/sync-queue";
import type { SceneMeta } from "./types";

const [local] = rxForce.highlights;
const [lastWrite] = rxForce.decisions;

/** "No signal": a rep's morning, offline, and the queue that carries it. */
export const rxScene: SceneMeta = {
  kind: "Simulation",
  note: "The same browser model of the sync queue as the one below, with sample actions. Retry delays here double from one second; the app's exact schedule differs.",
  steps: [
    { title: local.title, body: local.body },
    { title: "Waiting gets longer", body: `While there's no signal, each failed attempt waits twice as long as the last before trying again — at most ${q.MAX_ATTEMPTS} tries — and the action stays in the local table the whole time.` },
    { title: "Signal returns", body: "Everything waiting becomes due at once, and the queue drains." },
    { title: lastWrite.title, body: lastWrite.body },
  ],
  keyFrames: [0, 1, 2, 3],
};

/** Offline ticks for step 1: the first action has been retried this many times. */
const OFFLINE_TICKS = [0, 1000, 2000, 4000];

/** When each attempt happens, in ms from the first, for `attempts` attempts. */
export function attemptTimes(attempts: number): number[] {
  const times = [0];
  for (let k = 1; k < attempts; k++) times.push(times[k - 1] + q.backoff(k));
  return times;
}

export type RxFrame = {
  step: number;
  online: boolean;
  items: q.QueueItem[];
  showConflict: boolean;
};

export function rxFrame(step: number): RxFrame {
  const i = Math.max(0, Math.min(3, step));
  let s = q.record(q.initialSync(), "Visit report");
  if (i >= 1) {
    s = q.record(q.record(s, "Order"), "Expense");
    s = OFFLINE_TICKS.reduce((acc, ms) => q.tick(acc, ms), s);
  }
  if (i >= 2) s = q.tick(q.setOnline(s, true), 100);
  return { step: i, online: i >= 2, items: s.items, showConflict: i === 3 };
}
