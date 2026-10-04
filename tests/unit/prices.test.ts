import { describe, expect, it } from "vitest";
import { sessionPriceCents, maxSessionPriceCents } from "../../src/lib/prices";

describe("session prices charged to credits", () => {
  it("BFC before 16:00, 3 players, member = €30", () => {
    expect(sessionPriceCents({ venue: "alemannia", hour: 13, players: 3, nonMember: false, duration: 60 })).toBe(3000);
  });
  it("BFC non-member pays +€2", () => {
    expect(sessionPriceCents({ venue: "alemannia", hour: 17, players: 4, nonMember: true, duration: 60 })).toBe(2800);
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
