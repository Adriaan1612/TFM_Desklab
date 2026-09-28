import { describe, expect, it } from "vitest";
import { productImageUrl, setupImageUrl } from "./images.js";

describe("image convention", () => {
  it("resolves product path from slug when imageUrl is missing", () => {
    expect(productImageUrl(null, "teclado-mecanico-75")).toBe(
      "/img/products/teclado-mecanico-75.webp",
    );
  });

  it("prefers stored imageUrl", () => {
    expect(
      productImageUrl("/img/products/teclado-mecanico-75.webp", "teclado-mecanico-75"),
    ).toBe("/img/products/teclado-mecanico-75.webp");
  });

  it("resolves setup path from slug", () => {
    expect(setupImageUrl("night-shift")).toBe("/img/setups/night-shift.webp");
  });
});
