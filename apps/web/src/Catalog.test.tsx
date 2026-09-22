import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Catalog } from "./pages/Catalog";

function renderCatalog(entry = "/catalogo"): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
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
  it("shows loading skeletons", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderCatalog();
    expect(screen.getByLabelText("Cargando")).toBeInTheDocument();
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

  it("removes active filter chips", async () => {
    const fetchMock = vi.fn((_url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ data: [], page: 1, pageSize: 12, total: 0 }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderCatalog("/catalogo?category=Lighting");
    expect(await screen.findByText(/sin resultados/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Quitar filtro Lighting"));
    const firstCall = fetchMock.mock.calls.at(-1)?.[0];
    expect(firstCall).not.toContain("category=");
  });

  it("syncs sort with the URL and the API", async () => {
    const fetchMock = vi.fn((_url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ data: [], page: 1, pageSize: 12, total: 0 }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderCatalog();
    await screen.findByText(/sin resultados/i);
    fireEvent.change(screen.getByLabelText("Ordenar"), {
      target: { value: "price-asc" },
    });
    await screen.findByText(/sin resultados/i);
    const lastCall = fetchMock.mock.calls.at(-1)?.[0];
    expect(lastCall).toContain("sort=price");
    expect(lastCall).toContain("order=asc");
  });
});
