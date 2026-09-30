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
    description: "Teclado mecánico compacto al 75% con tacto preciso.",
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

function fillStep1(): void {
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
  fireEvent.click(screen.getByText("Continuar al pago"));
}

function fillCard(number = "4242 4242 4242 4242"): void {
  fireEvent.change(screen.getByLabelText("Número de tarjeta"), {
    target: { value: number },
  });
  fireEvent.change(screen.getByLabelText("Mes de caducidad"), {
    target: { value: "12" },
  });
  fireEvent.change(screen.getByLabelText("Año de caducidad"), {
    target: { value: "30" },
  });
  fireEvent.change(screen.getByLabelText("CVC"), {
    target: { value: "123" },
  });
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

  it("goes through both steps and confirms with masked card", async () => {
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
              items: [
                {
                  productId: "p1",
                  name: "Teclado mecánico 75%",
                  priceCents: 12900,
                  quantity: 1,
                  setupSlug: null,
                },
              ],
            }),
        }),
      ),
    );
    renderCheckout();
    fillStep1();
    expect(
      await screen.findByText("Paso 2 de 2: pago simulado"),
    ).toBeInTheDocument();
    fillCard();
    fireEvent.click(screen.getByText("Pagar ahora"));
    expect(
      await screen.findByRole("heading", { name: "Pedido #42" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Teclado mecánico 75%/)).toBeInTheDocument();
    expect(screen.getByText(/•••• 4242/)).toBeInTheDocument();
    expect(screen.queryByText(/pagado \(simulado\)/i)).not.toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("desklab-cart") ?? "[]"),
    ).toHaveLength(0);
  });

  it("keeps the cart on declined card", async () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 402 })),
    );
    renderCheckout();
    fillStep1();
    await screen.findByText("Paso 2 de 2: pago simulado");
    fillCard("4000 0000 0000 0002");
    fireEvent.click(screen.getByText("Pagar ahora"));
    expect(
      await screen.findByText("Tarjeta rechazada (simulación). Prueba con otra tarjeta."),
    ).toBeInTheDocument();
    const stored = JSON.parse(
      localStorage.getItem("desklab-cart") ?? "[]",
    ) as Array<{ product: { slug: string }; quantity: number }>;
    expect(stored).toHaveLength(1);
    expect(stored[0].product.slug).toBe("teclado-mecanico-75");
  });

  it("blocks pay with invalid card data", async () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderCheckout();
    fillStep1();
    await screen.findByText("Paso 2 de 2: pago simulado");
    fillCard("4242 4242 4242 4241");
    expect(screen.getByText("Pagar ahora")).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stays on step 1 with inline errors for blank name and bad postal code", () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderCheckout();
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "   " },
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
      target: { value: "280" },
    });
    fireEvent.click(screen.getByText("Continuar al pago"));
    expect(screen.getByText("Escribe tu nombre.")).toBeInTheDocument();
    expect(
      screen.getByText("El código postal debe tener 5 dígitos (p. ej. 28004)."),
    ).toBeInTheDocument();
    expect(screen.getByText("Paso 1 de 2: tus datos")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nombre")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("trims the email before paying", async () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    const fetchMock = vi.fn((_url: string, _init?: { body?: string }) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "o1",
            orderNumber: 7,
            email: "test@desklab.es",
            name: "Test User",
            totalCents: 12900,
            createdAt: new Date().toISOString(),
            items: [
              {
                productId: "p1",
                name: "Teclado mecánico 75%",
                priceCents: 12900,
                quantity: 1,
                setupSlug: null,
              },
            ],
          }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderCheckout();
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "  test@desklab.es  " },
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
    fireEvent.click(screen.getByText("Continuar al pago"));
    await screen.findByText("Paso 2 de 2: pago simulado");
    fillCard();
    fireEvent.click(screen.getByText("Pagar ahora"));
    await screen.findByRole("heading", { name: "Pedido #7" });
    const sentBody = JSON.parse(
      (fetchMock.mock.calls[0]?.[1] as { body?: string })?.body ?? "{}",
    ) as { email?: string };
    expect(sentBody.email).toBe("test@desklab.es");
  });

  it("returns to step 1 with per-field errors on a 400 with detail", async () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              error: {
                code: "BAD_REQUEST",
                message: "postalCode: postal code must be 5 digits",
              },
            }),
        }),
      ),
    );
    renderCheckout();
    fillStep1();
    await screen.findByText("Paso 2 de 2: pago simulado");
    fillCard();
    fireEvent.click(screen.getByText("Pagar ahora"));
    expect(
      await screen.findByText(
        "El código postal debe tener 5 dígitos (p. ej. 28004).",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Paso 1 de 2: tus datos")).toBeInTheDocument();
    const stored = JSON.parse(
      localStorage.getItem("desklab-cart") ?? "[]",
    ) as Array<unknown>;
    expect(stored).toHaveLength(1);
  });

  it("mirrors backend length caps with maxLength", () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    renderCheckout();
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("maxlength", "120");
    expect(screen.getByLabelText("Dirección")).toHaveAttribute(
      "maxlength",
      "200",
    );
    expect(screen.getByLabelText("Ciudad")).toHaveAttribute("maxlength", "120");
    expect(screen.getByLabelText("Código postal")).toHaveAttribute(
      "maxlength",
      "5",
    );
  });

  function fillStep1WithEmail(email: string): void {
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: email },
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
    fireEvent.click(screen.getByText("Continuar al pago"));
  }

  it("suggests a correction for a likely email typo without blocking", async () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    renderCheckout();
    fillStep1WithEmail("usuario@gmail.co");
    expect(
      await screen.findByText(/¿Quisiste decir/i),
    ).toBeInTheDocument();
    expect(screen.getByText("usuario@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Paso 1 de 2: tus datos")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Usar esta dirección"));
    expect(
      await screen.findByText("Paso 2 de 2: pago simulado"),
    ).toBeInTheDocument();
  });

  it("lets the user keep the original email despite the suggestion", async () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    renderCheckout();
    fillStep1WithEmail("usuario@gmail.co");
    await screen.findByText(/¿Quisiste decir/i);
    fireEvent.click(screen.getByText("Continuar igualmente"));
    expect(
      await screen.findByText("Paso 2 de 2: pago simulado"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Volver"));
    expect(screen.getByLabelText("Email")).toHaveValue("usuario@gmail.co");
  });

  it("shows no suggestion for unknown or correct domains", () => {
    localStorage.setItem("desklab-cart", JSON.stringify([line]));
    renderCheckout();
    fillStep1WithEmail("usuario@empresa.co");
    expect(screen.queryByText(/¿Quisiste decir/i)).not.toBeInTheDocument();
  });
});
