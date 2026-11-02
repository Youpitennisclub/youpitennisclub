/** Winter season price grid — 1 hour, per person. */
export type PriceVenue = "alemannia" | "longline";

/** Partner benefit available at both clubs for eligible members (Wellhub, Urban Sports Club, Epassi). */
export const PARTNER_DISCOUNT = 7;

export type PriceTier = {
  /** Hour from which the evening rates apply — BFC Alemannia 15:00, TC Longline 16:00. */
  boundaryHour: number;
  /** Rates before the boundary hour: index 0 = 2 players, 1 = 3 players, 2 = 4 players. */
  before: number[];
  /** Rates from the boundary hour on. */
  after: number[];
  nonMemberExtra: number;
};

export const PRICE_GRID: Record<PriceVenue, PriceTier> = {
  alemannia: { boundaryHour: 15, before: [37, 30, 24], after: [39, 32, 26], nonMemberExtra: 0 },
  longline: { boundaryHour: 16, before: [39, 31, 25], after: [41, 33, 27], nonMemberExtra: 0 },
};

/** Summer-season grid (outdoor, no court fee) — 1 hour, per person, index 0 = 2 players. */
export const SUMMER_GRID = [25, 19, 17];
/** Until this day (inclusive) BFC Alemannia is played outdoor and charged at summer prices. */
export const OUTDOOR_UNTIL = "2026-10-24";

/** 15 -> "15:00" */
const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

/** True when a BFC Alemannia slot is outdoor (summer prices). `ymd` = Berlin date YYYY-MM-DD. */
export function isOutdoorSlot(venue: PriceVenue, ymd: string, hour: number) {
  if (venue !== "alemannia" || ymd > OUTDOOR_UNTIL) return false;
  if (ymd === "2026-10-08") return false; // evening-only indoor day
  if (ymd === "2026-10-07" && hour >= 21) return false; // indoor evening slot
  if (["2026-10-20", "2026-10-21"].includes(ymd) && hour >= 18) return false;
  return true;
}

export function ratesFor(venue: PriceVenue, hour: number, outdoor = false) {
  const g = PRICE_GRID[venue];
  const earlier = hour < g.boundaryHour;
  const list = outdoor ? SUMMER_GRID : earlier ? g.before : g.after;
  return {
    period: outdoor
      ? "Outdoor · summer prices"
      : `${earlier ? "Before" : "From"} ${hourLabel(g.boundaryHour)}`,
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
  outdoor?: boolean;
}) {
  const g = PRICE_GRID[opts.venue];
  const list = opts.outdoor ? SUMMER_GRID : opts.hour < g.boundaryHour ? g.before : g.after;
  const idx = Math.min(Math.max(opts.players, 2), 4) - 2;
  // Membership never adds a surcharge. Keep the input for existing server callers.
  const perHour = list[idx] ?? list[0] ?? 0;
  return Math.round(perHour * 100 * (opts.duration / 60));
}

/** Highest possible price (2-player group) — used to check the balance at booking time. */
export function maxSessionPriceCents(opts: Omit<Parameters<typeof sessionPriceCents>[0], "players">) {
  return sessionPriceCents({ ...opts, players: 2 });
}
