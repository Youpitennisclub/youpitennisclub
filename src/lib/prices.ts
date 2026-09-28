/** Winter season price grid — 1 hour, per person. */
export type PriceVenue = "alemannia" | "longline";

export const PRICE_GRID: Record<PriceVenue, { before16: number[]; after16: number[]; nonMemberExtra: number }> = {
  // index 0 = 2 players, 1 = 3 players, 2 = 4 players
  alemannia: { before16: [37, 30, 24], after16: [39, 32, 26], nonMemberExtra: 2 },
  longline: { before16: [39, 31, 25], after16: [41, 33, 27], nonMemberExtra: 0 },
};

export function ratesFor(venue: PriceVenue, hour: number) {
  const g = PRICE_GRID[venue];
  const list = hour < 16 ? g.before16 : g.after16;
  return {
    period: hour < 16 ? "Before 16:00" : "From 16:00",
    nonMemberExtra: g.nonMemberExtra,
    rates: list.map((p, i) => ({ n: `${i + 2} players`, p: `€${p}` })),
  };
}
