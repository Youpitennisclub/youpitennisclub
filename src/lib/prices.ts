/** Winter season price grid — 1 hour, per person. */
export type PriceVenue = "alemannia" | "longline";

/** Partner benefit available at both clubs for eligible Wellhub and Urban Sports Club members. */
export const PARTNER_DISCOUNT = 7;

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

/** Price in cents charged to one student for one session.
 *  `players` is the group size (2–4 priced; more than 4 uses the 4-player price). */
export function sessionPriceCents(opts: {
  venue: PriceVenue;
  hour: number;
  players: number;
  nonMember: boolean;
  duration: number;
}) {
  const g = PRICE_GRID[opts.venue];
  const list = opts.hour < 16 ? g.before16 : g.after16;
  const idx = Math.min(Math.max(opts.players, 2), 4) - 2;
  const perHour = list[idx]! + (opts.nonMember ? g.nonMemberExtra : 0);
  return Math.round(perHour * 100 * (opts.duration / 60));
}

/** Highest possible price (2-player group) — used to check the balance at booking time. */
export function maxSessionPriceCents(opts: Omit<Parameters<typeof sessionPriceCents>[0], "players">) {
  return sessionPriceCents({ ...opts, players: 2 });
}
