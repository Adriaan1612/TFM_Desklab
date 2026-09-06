import { describe, expect, it } from "vitest";
import { hasUniqueSlots, setupTotal } from "./catalog.js";

describe("setupTotal", () => {
  it("sums item prices", () => {
    expect(
      setupTotal([
        { product: { priceCents: 34900 } },
        { product: { priceCents: 12900 } },
      ]),
    ).toBe(47800);
  });

  it("is zero for an empty setup", () => {
    expect(setupTotal([])).toBe(0);
  });
});

describe("hasUniqueSlots", () => {
  it("accepts one product per slot", () => {
    expect(
      hasUniqueSlots([{ slot: "Monitor" }, { slot: "Keyboard" }]),
    ).toBe(true);
  });

  it("rejects duplicated slots", () => {
    expect(
      hasUniqueSlots([{ slot: "Monitor" }, { slot: "Monitor" }]),
    ).toBe(false);
  });
});
