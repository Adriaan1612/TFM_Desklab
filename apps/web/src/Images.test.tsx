import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductImage, SetupImage } from "./design-system";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("image fallback", () => {
  it("shows lazy image with alt when file exists", () => {
    render(
      <ProductImage
        slug="teclado-mecanico-75"
        name="Teclado mecánico 75%"
        imageUrl="/img/products/teclado-mecanico-75.webp"
      />,
    );
    const img = screen.getByAltText("Teclado mecánico 75%");
    expect(img).toHaveAttribute(
      "src",
      "/img/products/teclado-mecanico-75.webp",
    );
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("falls back to initial when product image fails", () => {
    render(
      <ProductImage
        slug="teclado-mecanico-75"
        name="Teclado mecánico 75%"
        imageUrl="/img/products/teclado-mecanico-75.webp"
      />,
    );
    fireEvent.error(screen.getByAltText("Teclado mecánico 75%"));
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("falls back to initial when setup image fails", () => {
    render(<SetupImage slug="night-shift" name="Night Shift" />);
    fireEvent.error(screen.getByAltText("Night Shift"));
    expect(screen.getByText("N")).toBeInTheDocument();
  });
});
