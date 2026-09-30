import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartDrawer } from "./cart/CartDrawer";
import { CartProvider, useCart } from "./cart/CartContext";
import type { CartLine } from "@desklab/shared";

const line: CartLine = {
  product: {
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
  },
  quantity: 2,
};

function OpenDrawer(): JSX.Element {
  const { openCart } = useCart();
  useEffect(() => {
    openCart();
  }, [openCart]);
  return <></>;
}

function renderDrawer(): void {
  render(
    <MemoryRouter>
      <CartProvider>
        <OpenDrawer />
        <CartDrawer />
      </CartProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("CartDrawer", () => {
  it("shows lines with total and setup origin", () => {
    localStorage.setItem(
      "desklab-cart",
      JSON.stringify([{ ...line, setupSlug: "night-shift" }]),
    );
    renderDrawer();
    expect(screen.getByText("Teclado mecánico 75%")).toBeInTheDocument();
    expect(screen.getByText("Del setup night-shift")).toBeInTheDocument();
    expect(screen.getAllByText("258,00 €")).toHaveLength(2);
  });

  it("updates quantity and removes lines", () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    renderDrawer();
    fireEvent.click(screen.getByLabelText("Añadir uno de Teclado mecánico 75%"));
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("3");
    fireEvent.click(screen.getByText("Quitar"));
    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
  });

  it("caps quantity at 99 with a notice and disabled increment", () => {
    localStorage.setItem(
      "desklab-cart",
      JSON.stringify([{ ...line, quantity: 99 }]),
    );
    renderDrawer();
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("99");
    expect(
      screen.getByLabelText("Añadir uno de Teclado mecánico 75%"),
    ).toBeDisabled();
    expect(
      screen.getByText("Máximo 99 unidades por línea."),
    ).toBeInTheDocument();
  });
});
