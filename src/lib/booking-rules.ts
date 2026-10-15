export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;
export const BOOKING_CUTOFF_MS = 3 * 60 * 60 * 1000;
export const FREE_CANCELLATION_MS = 48 * 60 * 60 * 1000;
export const LONE_PLAYER_CUTOFF_MS = 24 * 60 * 60 * 1000;

export const BOOKING_NOTICE = "Booking received. Your session takes place as soon as 2 players of your level have joined, and you will get a confirmation email. Up to 2 more players can still join, and the price per person drops with each new player. Cancellation is free up to 48 hours before the session. Bookings made less than 48 hours before are binding immediately.";

export function compatibleLevels(a: string, b: string) {
  return a === b || (["intermediate", "advanced"].includes(a) && ["intermediate", "advanced"].includes(b));
}

export function canJoin(startsAt: number, count: number, now = Date.now()) {
  return startsAt - now >= BOOKING_CUTOFF_MS && count < MAX_PLAYERS;
}

export function canCancelFree(startsAt: number, groupLostConfirmation = false, now = Date.now()) {
  return startsAt > now && (groupLostConfirmation || startsAt - now >= FREE_CANCELLATION_MS);
}

export function shouldExpire(startsAt: number, count: number, now = Date.now()) {
  return count === 1 && startsAt - now <= LONE_PLAYER_CUTOFF_MS;
}