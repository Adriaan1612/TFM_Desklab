import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
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
        <Routes>
          <Route path="/setup/:slug" element={<SetupDetail />} />
        </Routes>
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

  it("shows slots with live total and disabled cart", async () => {
    mockSetupApi();
    renderDetail();
    expect(await screen.findByText("Night Shift")).toBeInTheDocument();
    expect(screen.getByText("Monitor 27 4K")).toBeInTheDocument();
    expect(screen.getByText("478,00 €")).toBeInTheDocument();
    const cart = screen.getByText("Añadir al carrito (próximamente)");
    expect(cart).toBeDisabled();
  });

  it("swapping a slot updates the total", async () => {
    mockSetupApi();
    renderDetail();
    await screen.findByText("Night Shift");
    fireEvent.click(screen.getAllByText("Cambiar")[1]);
    expect(await screen.findByText("Teclado RGB TKL")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Elegir"));
    expect(await screen.findByText("438,00 €")).toBeInTheDocument();
    expect(screen.getByText("1 cambios")).toBeInTheDocument();
  });
});
