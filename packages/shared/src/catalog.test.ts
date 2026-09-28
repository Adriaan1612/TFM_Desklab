import { describe, expect, it } from "vitest";
import {
  hasUniqueSlots,
  setupTotal,
  swapItem,
  type ProductDTO,
  type SetupItemDTO,
} from "./catalog.js";

function product(overrides: Partial<ProductDTO> = {}): ProductDTO {
  return {
    id: "p1",
    slug: "teclado-mecanico-75",
    name: "Teclado mecánico 75%",
    description: "Teclado mecánico compacto al 75% con tacto preciso.",
    category: "Peripherals",
    slot: "Keyboard",
    styles: ["Minimal"],
    uses: ["Work"],
    priceCents: 12900,
    imageUrl: null,
    ...overrides,
  };
}

function items(): SetupItemDTO[] {
  return [
    { slot: "Monitor", product: product({ id: "m", slug: "monitor-27-4k", slot: "Monitor", priceCents: 34900 }) },
    { slot: "Keyboard", product: product() },
  ];
}

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

describe("swapItem", () => {
  it("replaces the product of the slot", () => {
    const next = product({ id: "p2", slug: "teclado-rgb-tkl", priceCents: 8900 });
    const result = swapItem(items(), "Keyboard", next);
    expect(result.find((i) => i.slot === "Keyboard")?.product.slug).toBe(
      "teclado-rgb-tkl",
    );
    expect(result.find((i) => i.slot === "Monitor")?.product.slug).toBe(
      "monitor-27-4k",
    );
  });

  it("does not mutate the original items", () => {
    const before = items();
    swapItem(before, "Keyboard", product({ id: "p2", slug: "x" }));
    expect(before.find((i) => i.slot === "Keyboard")?.product.slug).toBe(
      "teclado-mecanico-75",
    );
  });

  it("rejects a product from another slot", () => {
    expect(() =>
      swapItem(items(), "Keyboard", product({ slot: "Mouse", slug: "raton-x" })),
    ).toThrow(/does not belong to slot 'Keyboard'/);
  });
});
