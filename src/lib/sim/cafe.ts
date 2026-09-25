/*
 * A night at a snooker club, modelled after Cue & Coffee's features: timed
 * tables, café orders that land on the running bill, membership discounts and
 * a loser-pays mode. Rates, menu and discounts are sample values for the demo,
 * not the club's real prices. Money is integer rupees — never floats.
 */

export type TableKind = "Snooker" | "Pool" | "PS5";

export type Table = {
  id: string;
  name: string;
  kind: TableKind;
  ratePerHour: number;
};

export type Membership = "None" | "Bronze" | "Silver" | "Gold";

export type OrderStatus = "Pending" | "Preparing" | "Ready";

export type Order = { id: number; item: string; price: number; placedAt: number };

export type Session = {
  tableId: string;
  startedAt: number;
  players: number;
  membership: Membership;
  orders: Order[];
};

export type CafeState = {
  now: number; // minutes since opening
  sessions: Session[];
  orderSeq: number;
  closed: { tableId: string; total: number }[];
};

export const TABLES: Table[] = [
  { id: "s1", name: "Snooker 1", kind: "Snooker", ratePerHour: 300 },
  { id: "s2", name: "Snooker 2", kind: "Snooker", ratePerHour: 300 },
  { id: "p1", name: "Pool 1", kind: "Pool", ratePerHour: 200 },
  { id: "ps", name: "PS5", kind: "PS5", ratePerHour: 150 },
];

export const MENU = [
  { item: "Cold coffee", price: 120 },
  { item: "Masala chai", price: 40 },
  { item: "Club sandwich", price: 150 },
  { item: "Fries", price: 110 },
] as const;

export const DISCOUNT: Record<Membership, number> = { None: 0, Bronze: 5, Silver: 10, Gold: 15 };

/** Kitchen timing for the demo: 2 minutes pending, ready after 8. */
export function orderStatus(order: Order, now: number): OrderStatus {
  const age = now - order.placedAt;
  if (age < 2) return "Pending";
  if (age < 8) return "Preparing";
  return "Ready";
}

export function initialCafe(): CafeState {
  return { now: 0, sessions: [], orderSeq: 0, closed: [] };
}

export function sessionFor(state: CafeState, tableId: string): Session | undefined {
  return state.sessions.find((s) => s.tableId === tableId);
}

export function start(state: CafeState, tableId: string, players: number, membership: Membership): CafeState {
  if (sessionFor(state, tableId)) return state;
  const count = Math.min(6, Math.max(1, Math.round(players)));
  return { ...state, sessions: [...state.sessions, { tableId, startedAt: state.now, players: count, membership, orders: [] }] };
}

export function addOrder(state: CafeState, tableId: string, item: (typeof MENU)[number]["item"]): CafeState {
  const menuItem = MENU.find((m) => m.item === item);
  const session = sessionFor(state, tableId);
  if (!menuItem || !session || session.orders.length >= 8) return state;
  const order: Order = { id: state.orderSeq + 1, item: menuItem.item, price: menuItem.price, placedAt: state.now };
  return {
    ...state,
    orderSeq: order.id,
    sessions: state.sessions.map((s) => (s.tableId === tableId ? { ...s, orders: [...s.orders, order] } : s)),
  };
}

export function advance(state: CafeState, minutes: number): CafeState {
  return { ...state, now: Math.min(state.now + minutes, 24 * 60) };
}

export type Bill = {
  minutes: number;
  tableCharge: number;
  discount: number;
  cafe: number;
  total: number;
  /** Even split, rounded up to the rupee so the club is never short. */
  perPlayer: number;
};

export function bill(state: CafeState, session: Session): Bill {
  const table = TABLES.find((t) => t.id === session.tableId)!;
  // Billed per started minute, with a one-minute minimum.
  const minutes = Math.max(1, state.now - session.startedAt);
  const tableCharge = Math.ceil((table.ratePerHour * minutes) / 60);
  const discount = Math.floor((tableCharge * DISCOUNT[session.membership]) / 100);
  const cafe = session.orders.reduce((sum, o) => sum + o.price, 0);
  const total = tableCharge - discount + cafe;
  return { minutes, tableCharge, discount, cafe, total, perPlayer: Math.ceil(total / session.players) };
}

export function close(state: CafeState, tableId: string): CafeState {
  const session = sessionFor(state, tableId);
  if (!session) return state;
  return {
    ...state,
    sessions: state.sessions.filter((s) => s.tableId !== tableId),
    closed: [...state.closed, { tableId, total: bill(state, session).total }],
  };
}

export function takings(state: CafeState): number {
  return state.closed.reduce((sum, c) => sum + c.total, 0);
}

export function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
