import { expect, it } from "vitest";
import { playerLabel } from "../../src/lib/player-label";
it("shows first name and exactly two surname letters in title case", () => {
  expect(playerLabel("Kristin", "BURNER")).toBe("Kristin Bu");
  expect(playerLabel("Anna", "K")).toBe("Anna K");
  expect(playerLabel("Olesia", "")).toBe("Olesia");
});