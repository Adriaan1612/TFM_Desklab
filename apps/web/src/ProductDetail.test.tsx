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

function renderDetail(state?: { catalogSearch?: string }): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/producto/teclado-mecanico-75",
            state: state ?? null,
          },
        ]}
      >
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

  it("shows setups error state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.endsWith("/setups")) {
          return Promise.reject(new Error("down"));
        }
        if (url.endsWith("/substitutes")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(product),
        });
      }),
    );
    renderDetail();
    expect(
      await screen.findByText("No hemos podido cargar los setups de este producto."),
    ).toBeInTheDocument();
  });

  it("shows substitutes error state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.endsWith("/substitutes")) {
          return Promise.reject(new Error("down"));
        }
        if (url.endsWith("/setups")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(product),
        });
      }),
    );
    renderDetail();
    expect(
      await screen.findByText(
        "No hemos podido cargar las alternativas de este producto.",
      ),
    ).toBeInTheDocument();
  });

  it("shows substitute price and setup items with total", async () => {
    const setup = {
      id: "s1",
      slug: "night-shift",
      name: "Night Shift",
      use: "Gaming",
      style: "Dark",
      items: [
        { slot: "Keyboard", product },
        { ...product, id: "3", slug: "raton-inalambrico", name: "Ratón inalámbrico", priceCents: 5900 },
      ],
      totalCents: 18800,
    };
    const alt = {
      ...product,
      id: "2",
      slug: "teclado-rgb-tkl",
      name: "Teclado RGB TKL",
      priceCents: 8900,
    };
    mockApi([setup], [alt]);
    renderDetail();
    expect(await screen.findByText("Night Shift")).toBeInTheDocument();
    expect(screen.getByText(/2 productos/)).toBeInTheDocument();
    expect(screen.getByText("188,00 €")).toBeInTheDocument();
    expect(screen.getByText("89,00 €")).toBeInTheDocument();
  });

  it("preserves catalog query params on back links", async () => {
    mockApi([], []);
    renderDetail({ catalogSearch: "?category=Lighting&page=2" });
    expect(await screen.findByText("Teclado mecánico 75%")).toBeInTheDocument();
    expect(screen.getByText("← Volver al catálogo")).toHaveAttribute(
      "href",
      "/catalogo?category=Lighting&page=2",
    );
    expect(screen.getByText("Seguir explorando")).toHaveAttribute(
      "href",
      "/catalogo?category=Lighting&page=2",
    );
  });
});
