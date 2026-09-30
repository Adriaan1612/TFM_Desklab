import { describe, expect, it } from "vitest";
import {
  addLine,
  cartCount,
  cartTotal,
  removeLine,
  setQty,
  type CartLine,
} from "./cart.js";
import type { ProductDTO } from "./catalog.js";

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

describe("cart helpers", () => {
  it("adds a new line and merges same product", () => {
    const p = product();
    let lines: CartLine[] = [];
    lines = addLine(lines, p);
    lines = addLine(lines, p);
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(2);
  });

  it("keeps setup lines separate from loose lines", () => {
    const p = product();
    const lines = addLine(addLine([], p), p, "night-shift");
    expect(lines).toHaveLength(2);
  });

  it("removes and updates quantities", () => {
    const p = product();
    let lines = addLine([], p);
    lines = setQty(lines, p.id, 3);
    expect(lines[0].quantity).toBe(3);
    expect(cartCount(lines)).toBe(3);
    expect(cartTotal(lines)).toBe(12900 * 3);
    lines = setQty(lines, p.id, 0);
    expect(lines).toHaveLength(0);
    lines = removeLine(addLine([], p), p.id);
    expect(lines).toHaveLength(0);
  });

  it("caps quantities at 99 per line", () => {
    const p = product();
    let lines = setQty(addLine([], p), p.id, 500);
    expect(lines[0].quantity).toBe(99);
    lines = setQty(lines, p.id, 99);
    lines = addLine(lines, p);
    expect(lines[0].quantity).toBe(99);
  });
});
