import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Catalog } from "./pages/Catalog";

function renderCatalog(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/catalogo"]}>
        <Catalog />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Catalog states", () => {
  it("shows loading state", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderCatalog();
    expect(screen.getByText("Cargando productos…")).toBeInTheDocument();
  });

  it("shows error state", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("down"))));
    renderCatalog();
    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(/no hemos podido cargar el catálogo/i);
  });

  it("shows empty state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ data: [], page: 1, pageSize: 12, total: 0 }),
        }),
      ),
    );
    renderCatalog();
    expect(await screen.findByText(/sin resultados/i)).toBeInTheDocument();
  });

  it("shows products and pagination", async () => {
    const product = {
      id: "1",
      slug: "teclado-mecanico-75",
      name: "Teclado mecánico 75%",
      category: "Peripherals",
      slot: "Keyboard",
      styles: ["Minimal"],
      uses: ["Work"],
      priceCents: 12900,
      imageUrl: null,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [product, { ...product, id: "2", slug: "otro", name: "Otro" }],
              page: 1,
              pageSize: 12,
              total: 2,
            }),
        }),
      ),
    );
    renderCatalog();
    expect(await screen.findByText("Teclado mecánico 75%")).toBeInTheDocument();
    expect(screen.getByText("Teclado mecánico 75%")).toHaveAttribute(
      "href",
      "/producto/teclado-mecanico-75",
    );
    expect(screen.getByText("Mostrando 1–2 de 2")).toBeInTheDocument();
  });
});
