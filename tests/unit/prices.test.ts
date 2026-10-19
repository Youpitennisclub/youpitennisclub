import { describe, expect, it } from "vitest";
import { sessionPriceCents, maxSessionPriceCents, PARTNER_DISCOUNT, ratesFor } from "../../src/lib/prices";

describe("session prices charged to credits", () => {
  it("BFC before 16:00, 3 players, member = €30", () => {
    expect(sessionPriceCents({ venue: "alemannia", hour: 13, players: 3, nonMember: false, duration: 60 })).toBe(3000);
  });
  it("BFC non-members pay the same base price indoors and outdoors", () => {
    for (const [outdoor, hour, expected] of [[false, 13, [3700, 3000, 2400]], [false, 17, [3900, 3200, 2600]], [true, 13, [2500, 1900, 1700]]] as const) {
      for (const [index, price] of expected.entries()) {
        expect(sessionPriceCents({ venue: "alemannia", hour, players: index + 2, nonMember: true, duration: 60, outdoor })).toBe(price);
      }
      expect(ratesFor("alemannia", hour, outdoor).nonMemberExtra).toBe(0);
    }
  });
  it("keeps the partner discount at €7", () => {
    expect(PARTNER_DISCOUNT).toBe(7);
  });
  it("preserves every TC Longline group price", () => {
    for (const [hour, prices] of [[11, [3900, 3100, 2500]], [17, [4100, 3300, 2700]]] as const) {
      prices.forEach((price, i) => expect(sessionPriceCents({ venue: "longline", hour, players: i + 2, nonMember: true, duration: 60 })).toBe(price));
    }
  });
  it("TC Longline has no non-member extra", () => {
    expect(sessionPriceCents({ venue: "longline", hour: 11, players: 2, nonMember: true, duration: 60 })).toBe(3900);
  });
  it("90 minutes costs 1.5x", () => {
    expect(sessionPriceCents({ venue: "alemannia", hour: 10, players: 4, nonMember: false, duration: 90 })).toBe(3600);
  });
  it("booking check uses the 2-player price", () => {
    expect(maxSessionPriceCents({ venue: "alemannia", hour: 10, nonMember: false, duration: 60 })).toBe(3700);
  });
});

import { isOutdoorSlot } from "../../src/lib/prices";
describe("outdoor BFC slots until 24 Oct use summer prices", () => {
  it("outdoor 2 players = €25", () => {
    expect(sessionPriceCents({ venue: "alemannia", hour: 13, players: 2, nonMember: false, duration: 60, outdoor: true })).toBe(2500);
  });
  it("outdoor 4 players = €17", () => {
    expect(sessionPriceCents({ venue: "alemannia", hour: 17, players: 4, nonMember: false, duration: 60, outdoor: true })).toBe(1700);
  });
  it("Sat 17 Oct BFC is outdoor, 25 Oct is not", () => {
    expect(isOutdoorSlot("alemannia", "2026-10-17", 12)).toBe(true);
    expect(isOutdoorSlot("alemannia", "2026-10-25", 12)).toBe(false);
  });
  it("TC Longline never outdoor", () => {
    expect(isOutdoorSlot("longline", "2026-10-16", 12)).toBe(false);
  });
});
