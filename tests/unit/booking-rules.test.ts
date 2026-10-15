import { describe, expect, it } from "vitest";
import { canJoin, canCancelFree, compatibleLevels, shouldExpire, MIN_PLAYERS } from "../../src/lib/booking-rules";

const hour = 3600000;
const now = Date.parse("2026-10-15T12:00:00Z");
describe("session booking rules", () => {
  it("confirms at 2 on every day", () => expect(MIN_PLAYERS).toBe(2));
  it("accepts a fourth player but never a fifth", () => {
    expect(canJoin(now + 72 * hour, 3, now)).toBe(true);
    expect(canJoin(now + 72 * hour, 4, now)).toBe(false);
  });
  it("closes booking 3 hours before", () => {
    expect(canJoin(now + 3 * hour, 0, now)).toBe(true);
    expect(canJoin(now + 3 * hour - 1, 0, now)).toBe(false);
  });
  it("cancellation is free at 48h but binding inside 48h", () => {
    expect(canCancelFree(now + 48 * hour, false, now)).toBe(true);
    expect(canCancelFree(now + 48 * hour - 1, false, now)).toBe(false);
  });
  it("remaining player can cancel free after losing confirmation", () => {
    expect(canCancelFree(now + 30 * hour, true, now)).toBe(true);
  });
  it("cancels a lone player at 24h, not a confirmed group", () => {
    expect(shouldExpire(now + 24 * hour, 1, now)).toBe(true);
    expect(shouldExpire(now + 24 * hour + 1, 1, now)).toBe(false);
    expect(shouldExpire(now + 24 * hour, 2, now)).toBe(false);
  });
  it("intermediate and advanced are compatible, other levels stay separate", () => {
    expect(compatibleLevels("intermediate", "advanced")).toBe(true);
    expect(compatibleLevels("beginner", "total_beginner")).toBe(false);
  });
});