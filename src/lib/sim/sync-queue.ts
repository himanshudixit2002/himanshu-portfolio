/*
 * An offline-first write queue in the shape RxForce SFA uses: every action is
 * stored locally and queued; the sync worker retries with growing delays, up
 * to ten attempts, and drains the queue when the network returns. Delays here
 * are illustrative (1 s, doubling), not the app's exact schedule.
 */

export const MAX_ATTEMPTS = 10;
const BASE_DELAY = 1000;
const MAX_ITEMS = 8;

export type QueueItem = {
  id: number;
  label: string;
  attempts: number;
  nextAt: number;
  status: "queued" | "synced" | "failed";
};

export type SyncState = { now: number; online: boolean; items: QueueItem[]; seq: number };

export const ACTIONS = ["Visit report", "Order", "Expense", "Attendance"] as const;

export function initialSync(): SyncState {
  return { now: 0, online: false, items: [], seq: 0 };
}

export function record(state: SyncState, label: string): SyncState {
  const seq = state.seq + 1;
  const item: QueueItem = { id: seq, label, attempts: 0, nextAt: state.now, status: "queued" };
  return { ...state, seq, items: [...state.items, item].slice(-MAX_ITEMS) };
}

export function setOnline(state: SyncState, online: boolean): SyncState {
  // Coming back online makes waiting items due immediately.
  return {
    ...state,
    online,
    items: online ? state.items.map((i) => (i.status === "queued" ? { ...i, nextAt: state.now } : i)) : state.items,
  };
}

export function backoff(attempts: number): number {
  return BASE_DELAY * 2 ** Math.max(0, attempts - 1);
}

/** Advance the clock; every due item makes one attempt. */
export function tick(state: SyncState, ms: number): SyncState {
  const now = state.now + ms;
  const items = state.items.map((item) => {
    if (item.status !== "queued" || item.nextAt > now) return item;
    if (state.online) return { ...item, attempts: item.attempts + 1, status: "synced" as const };
    const attempts = item.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) return { ...item, attempts, status: "failed" as const };
    return { ...item, attempts, nextAt: now + backoff(attempts) };
  });
  return { ...state, now, items };
}
