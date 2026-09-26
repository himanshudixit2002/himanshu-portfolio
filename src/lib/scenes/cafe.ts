import { cueAndCoffee } from "@/content/projects";
import * as cafe from "@/lib/sim/cafe";
import type { SceneMeta } from "./types";

const [glance, orders, credit] = cueAndCoffee.highlights;
const [, services] = cueAndCoffee.decisions;

/** "One night at the club": one table's evening, from the first break to the till. */
export const cafeScene: SceneMeta = {
  kind: "Simulation",
  note: "The browser model behind the night below: sample rates, menu and membership discounts, not the club's real prices. Billing per started minute and the even split rounded up are illustrative.",
  steps: [
    { title: glance.title, body: `${glance.body} At six, Snooker 1 starts for two Silver members.` },
    { title: orders.title, body: `${orders.body} A cold coffee goes to the kitchen at 18:25.` },
    { title: "Ready, and already on the bill", body: "Ten minutes later the kitchen marks it ready. Nobody re-types it at the till: it has been on the table's bill since it was ordered." },
    { title: credit.title, body: `${credit.body} Here: ten percent off the table for Silver, split two ways — or all on the loser.` },
    { title: services.title, body: services.body },
  ],
  keyFrames: [0, 1, 3, 4],
  mobile: "cards",
};

/** Minutes after 18:00 at each step. */
const TIMES = [0, 25, 35, 70, 70];

export type CafeFrame = {
  step: number;
  state: cafe.CafeState;
  /** The table the scene follows. */
  focus: string;
  /** The followed table's session as billed — kept once the table closes. */
  session: cafe.Session | null;
  bill: cafe.Bill | null;
  closed: boolean;
};

export const clock = (minutes: number) => {
  const total = 18 * 60 + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export function cafeFrame(step: number): CafeFrame {
  const i = Math.max(0, Math.min(4, step));
  let s = cafe.start(cafe.initialCafe(), "s1", 2, "Silver");
  s = cafe.advance(s, Math.min(TIMES[i], 25));
  if (i >= 1) {
    s = cafe.addOrder(s, "s1", "Cold coffee");
    s = cafe.start(s, "ps", 3, "None");
  }
  if (TIMES[i] > 25) s = cafe.advance(s, TIMES[i] - 25);
  const session = cafe.sessionFor(s, "s1") ?? null;
  const bill = session ? cafe.bill(s, session) : null;
  if (i === 4) s = cafe.close(s, "s1");
  return { step: i, state: s, focus: "s1", session, bill, closed: i === 4 };
}
