import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "./cart/CartContext";
import { Checkout } from "./pages/Checkout";
import type { CartLine } from "@desklab/shared";

const line: CartLine = {
  product: {
    id: "p1",
    slug: "teclado-mecanico-75",
    name: "Teclado mecánico 75%",
    category: "Peripherals",
    slot: "Keyboard",
    styles: ["Minimal"],
    uses: ["Work"],
    priceCents: 12900,
    imageUrl: null,
  },
  quantity: 1,
};

function renderCheckout(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/checkout"]}>
        <CartProvider>
          <Checkout />
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>,
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

describe("Checkout", () => {
  it("shows empty state", () => {
    renderCheckout();
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
  });

  it("confirms an order and clears the cart", async () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "o1",
              orderNumber: 42,
              email: "test@desklab.es",
              name: "Test User",
              totalCents: 12900,
              createdAt: new Date().toISOString(),
              items: [],
            }),
        }),
      ),
    );
    renderCheckout();
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@desklab.es" },
    });
    fireEvent.change(screen.getByLabelText("Dirección"), {
      target: { value: "Calle Mayor 1" },
    });
    fireEvent.change(screen.getByLabelText("Ciudad"), {
      target: { value: "Madrid" },
    });
    fireEvent.change(screen.getByLabelText("Código postal"), {
      target: { value: "28001" },
    });
    fireEvent.click(screen.getByText(/confirmar pedido/i));
    expect(await screen.findByText("Pedido #42")).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("desklab-cart") ?? "[]"),
    ).toHaveLength(0);
  });

  it("shows form error on bad request", async () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 400 })),
    );
    renderCheckout();
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@desklab.es" },
    });
    fireEvent.change(screen.getByLabelText("Dirección"), {
      target: { value: "Calle Mayor 1" },
    });
    fireEvent.change(screen.getByLabelText("Ciudad"), {
      target: { value: "Madrid" },
    });
    fireEvent.change(screen.getByLabelText("Código postal"), {
      target: { value: "28001" },
    });
    fireEvent.click(screen.getByText(/confirmar pedido/i));
    expect(
      await screen.findByText("Revisa los datos del formulario."),
    ).toBeInTheDocument();
    // El carrito no se vacía tras un error: la línea sigue en localStorage.
    const stored = JSON.parse(
      localStorage.getItem("desklab-cart") ?? "[]",
    ) as Array<{ product: { slug: string }; quantity: number }>;
    expect(stored).toHaveLength(1);
    expect(stored[0].product.slug).toBe("teclado-mecanico-75");
    expect(stored[0].quantity).toBe(1);
    expect(screen.getByText(/Teclado mecánico 75%/)).toBeInTheDocument();
  });
});
