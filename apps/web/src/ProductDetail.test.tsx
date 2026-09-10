import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductDetail } from "./pages/ProductDetail";

const product = {
  id: "1",
  slug: "teclado-mecanico-75",
  name: "Teclado mecánico 75%",
  category: "Peripherals",
  slot: "Keyboard",
  styles: ["Minimal", "Dark"],
  uses: ["Work", "Gaming"],
  priceCents: 12900,
  imageUrl: null,
};

function renderDetail(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/producto/teclado-mecanico-75"]}>
        <Routes>
          <Route path="/producto/:slug" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockApi(
  setups: unknown[] = [],
  substitutes: unknown[] = [],
): void {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.endsWith("/setups")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: setups }) });
      }
      if (url.endsWith("/substitutes")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: substitutes }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(product) });
    }),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProductDetail", () => {
  it("shows loading state", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderDetail();
    expect(screen.getByText("Cargando producto…")).toBeInTheDocument();
  });

  it("shows product with back link, setups and linked substitutes", async () => {
    const setup = {
      id: "s1",
      slug: "night-shift",
      name: "Night Shift",
      use: "Gaming",
      style: "Dark",
      items: [],
      totalCents: 66100,
    };
    const alt = { ...product, id: "2", slug: "teclado-rgb-tkl", name: "Teclado RGB TKL" };
    mockApi([setup], [alt]);
    renderDetail();
    expect(await screen.findByText("Teclado mecánico 75%")).toBeInTheDocument();
    expect(screen.getByText("← Volver al catálogo")).toHaveAttribute(
      "href",
      "/catalogo",
    );
    expect(screen.getByText("Night Shift")).toBeInTheDocument();
    expect(screen.getByText("Teclado RGB TKL")).toHaveAttribute(
      "href",
      "/producto/teclado-rgb-tkl",
    );
  });

  it("shows not-found for unknown slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 404 })),
    );
    renderDetail();
    expect(
      await screen.findByText("Este producto no existe."),
    ).toBeInTheDocument();
  });
});
