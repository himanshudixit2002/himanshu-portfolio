import { gaussian, seeded } from "./random";

/*
 * Synthetic hotels over an abstract city, aggregated into hexagons the way a
 * geospatial price map clusters results (H3-style: coarser cells when zoomed
 * out, finer when zoomed in). Every hotel, price and area here is invented —
 * this illustrates the technique, not any real inventory.
 */

export type Hotel = { x: number; y: number; price: number };
export type Hex = { q: number; r: number; cx: number; cy: number; count: number; median: number };

/** Hex radius (in the 0–1 map space) per resolution, coarse to fine. */
export const RESOLUTIONS = [
  { label: "City", size: 0.12 },
  { label: "District", size: 0.07 },
  { label: "Street", size: 0.04 },
] as const;

const AREAS = [
  { x: 0.34, y: 0.42, spread: 0.1, base: 5200, n: 110 }, // centre: dense, pricier
  { x: 0.72, y: 0.3, spread: 0.08, base: 7600, n: 45 }, // waterfront: premium
  { x: 0.64, y: 0.74, spread: 0.12, base: 2400, n: 70 }, // airport side: budget
  { x: 0.18, y: 0.78, spread: 0.07, base: 3300, n: 30 }, // old town
];

export function syntheticHotels(seed = 7): Hotel[] {
  const rand = seeded(seed);
  const hotels: Hotel[] = [];
  for (const area of AREAS) {
    for (let i = 0; i < area.n; i++) {
      const x = area.x + gaussian(rand) * area.spread;
      const y = area.y + gaussian(rand) * area.spread;
      if (x < 0.03 || x > 0.97 || y < 0.03 || y > 0.97) continue;
      const price = Math.round((area.base * (0.7 + rand() * 0.8)) / 50) * 50;
      hotels.push({ x, y, price });
    }
  }
  return hotels;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

/** Pointy-top axial hex rounding (redblobgames.com/grids/hexagons). */
function toAxial(x: number, y: number, size: number): [number, number] {
  const qf = ((Math.sqrt(3) / 3) * x - y / 3) / size;
  const rf = ((2 / 3) * y) / size;
  const sf = -qf - rf;
  let q = Math.round(qf);
  let r = Math.round(rf);
  const s = Math.round(sf);
  const dq = Math.abs(q - qf);
  const dr = Math.abs(r - rf);
  const ds = Math.abs(s - sf);
  if (dq > dr && dq > ds) q = -r - s;
  else if (dr > ds) r = -q - s;
  return [q, r];
}

export function hexCenter(q: number, r: number, size: number): [number, number] {
  return [size * Math.sqrt(3) * (q + r / 2), size * 1.5 * r];
}

/** SVG points for a pointy-top hexagon. */
export function hexPoints(cx: number, cy: number, size: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${(cx + size * Math.cos(a)).toFixed(4)},${(cy + size * Math.sin(a)).toFixed(4)}`;
  }).join(" ");
}

export function aggregate(hotels: readonly Hotel[], size: number): Hex[] {
  const cells = new Map<string, { q: number; r: number; prices: number[] }>();
  for (const h of hotels) {
    const [q, r] = toAxial(h.x, h.y, size);
    const id = `${q},${r}`;
    const cell = cells.get(id) ?? { q, r, prices: [] };
    cell.prices.push(h.price);
    cells.set(id, cell);
  }
  return [...cells.values()].map(({ q, r, prices }) => {
    const [cx, cy] = hexCenter(q, r, size);
    return { q, r, cx, cy, count: prices.length, median: median(prices) };
  });
}

/** Which price band (0–4) a median falls into, for colouring. */
export function band(price: number, bounds: readonly number[] = [2500, 3800, 5000, 6500]): number {
  return bounds.filter((b) => price >= b).length;
}
