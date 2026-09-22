import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "./cart/CartContext";
import { SetupDetail } from "./pages/SetupDetail";

const monitor = {
  id: "m",
  slug: "monitor-27-4k",
  name: "Monitor 27 4K",
  category: "Monitors",
  slot: "Monitor",
  styles: ["Minimal"],
  uses: ["Work"],
  priceCents: 34900,
  imageUrl: null,
};
const keyboard = {
  id: "k",
  slug: "teclado-mecanico-75",
  name: "Teclado mecánico 75%",
  category: "Peripherals",
  slot: "Keyboard",
  styles: ["Minimal"],
  uses: ["Work"],
  priceCents: 12900,
  imageUrl: null,
};
const altKeyboard = {
  ...keyboard,
  id: "k2",
  slug: "teclado-rgb-tkl",
  name: "Teclado RGB TKL",
  priceCents: 8900,
};
const setup = {
  id: "s1",
  slug: "night-shift",
  name: "Night Shift",
  use: "Gaming",
  style: "Dark",
  items: [
    { slot: "Monitor", product: monitor },
    { slot: "Keyboard", product: keyboard },
  ],
  totalCents: 47800,
};

function renderDetail(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/setup/night-shift"]}>
        <CartProvider>
          <Routes>
            <Route path="/setup/:slug" element={<SetupDetail />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockSetupApi(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.includes("/substitutes")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [altKeyboard] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(setup),
      });
    }),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SetupDetail", () => {
  it("shows loading state", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderDetail();
    expect(screen.getByText("Cargando setup…")).toBeInTheDocument();
  });

  it("shows not-found for unknown slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 404 })),
    );
    renderDetail();
    expect(await screen.findByText("Este setup no existe.")).toBeInTheDocument();
  });

  it("shows generic error when loading fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 500 })),
    );
    renderDetail();
    expect(
      await screen.findByText(
        "No hemos podido cargar el setup. Inténtalo de nuevo más tarde.",
      ),
    ).toBeInTheDocument();
  });

  it("shows slots with live total and adds setup lines to cart", async () => {
    mockSetupApi();
    renderDetail();
    expect(
      await screen.findByRole("heading", { name: "Night Shift" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Monitor 27 4K")).toBeInTheDocument();
    expect(screen.getByText("478,00 €")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Añadir setup al carrito"));
    const stored = JSON.parse(
      localStorage.getItem("desklab-cart") ?? "[]",
    ) as Array<{ product: { slug: string }; setupSlug?: string }>;
    expect(stored).toHaveLength(2);
    expect(
      stored.every((l) => l.setupSlug === "night-shift"),
    ).toBe(true);
  });

  it("swapping a slot updates the total", async () => {
    mockSetupApi();
    renderDetail();
    await screen.findByRole("heading", { name: "Night Shift" });
    fireEvent.click(screen.getAllByText("Cambiar")[1]);
    expect(await screen.findByText("Teclado RGB TKL")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Elegir"));
    expect(await screen.findByText("438,00 €")).toBeInTheDocument();
    expect(screen.getByText("1 cambios")).toBeInTheDocument();
  });
});
