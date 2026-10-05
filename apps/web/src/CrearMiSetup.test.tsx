import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "./cart/CartContext";
import { CrearMiSetup } from "./pages/CrearMiSetup";

function renderPage(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/crear-mi-setup"]}>
        <CartProvider>
          <Routes>
            <Route path="/crear-mi-setup" element={<CrearMiSetup />} />
          </Routes>
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

describe("CrearMiSetup", () => {
  it("shows recommendation with total and explanation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              setup: {
                id: "ai-x",
                slug: "ai-x",
                name: "Mi setup IA",
                use: "Work",
                style: "Minimal",
                items: [
                  {
                    slot: "Keyboard",
                    product: {
                      id: "k",
                      slug: "teclado-mecanico-75",
                      name: "Teclado mecánico 75%",
                      category: "Peripherals",
                      slot: "Keyboard",
                      styles: ["Minimal"],
                      uses: ["Work"],
                      priceCents: 12900,
                      imageUrl: null,
                    },
                  },
                ],
                totalCents: 12900,
              },
              setupSlug: "ai-x",
              explanation: "Perfecto para trabajar con calma.",
            }),
        }),
      ),
    );
    renderPage();
    fireEvent.click(screen.getByText("Generar mi setup"));
    expect(await screen.findByText("Tu setup recomendado")).toBeInTheDocument();
    expect(
      screen.getByText("Perfecto para trabajar con calma."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("129,00 €")).toHaveLength(2);
  });

  it("adds recommended lines with the ai setup slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              setup: {
                id: "ai-y",
                slug: "ai-y",
                name: "Mi setup IA",
                use: "Work",
                style: "Minimal",
                items: [
                  {
                    slot: "Keyboard",
                    product: {
                      id: "k",
                      slug: "teclado-mecanico-75",
                      name: "Teclado",
                      category: "Peripherals",
                      slot: "Keyboard",
                      styles: ["Minimal"],
                      uses: ["Work"],
                      priceCents: 12900,
                      imageUrl: null,
                    },
                  },
                ],
                totalCents: 12900,
              },
              setupSlug: "ai-y",
              explanation: "",
            }),
        }),
      ),
    );
    renderPage();
    fireEvent.click(screen.getByText("Generar mi setup"));
    await screen.findByText("Tu setup recomendado");
    fireEvent.click(screen.getByText("Añadir setup al carrito"));
    const stored = JSON.parse(
      localStorage.getItem("desklab-cart") ?? "[]",
    ) as Array<{ setupSlug?: string }>;
    expect(stored).toHaveLength(1);
    expect(stored[0].setupSlug).toBe("ai-y");
  });

  it("shows unavailable message on 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 503 })),
    );
    renderPage();
    fireEvent.click(screen.getByText("Generar mi setup"));
    expect(
      await screen.findByText(/la IA no está disponible/i),
    ).toBeInTheDocument();
  });

  it("offers retry and setups escape on 502 and 400", async () => {
    const fetchMock = vi.fn((_url: string) =>
      Promise.resolve({ ok: false, status: 502 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    fireEvent.click(screen.getByText("Generar mi setup"));
    expect(
      await screen.findByText(/no hemos podido generar un setup válido/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("o explora los setups publicados"),
    ).toHaveAttribute("href", "/setups");
    const budget = screen.getByLabelText("Presupuesto en euros");
    fireEvent.click(screen.getByText("Probar de nuevo"));
    await screen.findByText(/no hemos podido generar un setup válido/i);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(budget).toHaveValue(800);
  });

  it("blocks invalid budgets without calling the API", () => {
    const fetchMock = vi.fn((_url: string) =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    const budget = screen.getByLabelText("Presupuesto en euros");
    for (const value of ["", "abc", "-5", "40"]) {
      fireEvent.change(budget, { target: { value } });
      fireEvent.click(screen.getByText("Generar mi setup"));
      expect(
        screen.getByText("Escribe un presupuesto válido (mínimo 50 €)."),
      ).toBeInTheDocument();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("limits the note to 500 characters with a counter", () => {
    renderPage();
    const note = screen.getByLabelText("Preferencia libre");
    expect(note).toHaveAttribute("maxlength", "500");
    fireEvent.change(note, { target: { value: "abc" } });
    expect(screen.getByText("3/500")).toBeInTheDocument();
  });

  it("confirms after adding and ignores double clicks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              setup: {
                id: "ai-z",
                slug: "ai-z",
                name: "Mi setup IA",
                use: "Work",
                style: "Minimal",
                items: [
                  {
                    slot: "Keyboard",
                    product: {
                      id: "k",
                      slug: "teclado-mecanico-75",
                      name: "Teclado",
                      category: "Peripherals",
                      slot: "Keyboard",
                      styles: ["Minimal"],
                      uses: ["Work"],
                      priceCents: 12900,
                      imageUrl: null,
                    },
                  },
                ],
                totalCents: 12900,
              },
              setupSlug: "ai-z",
              explanation: "",
            }),
        }),
      ),
    );
    renderPage();
    fireEvent.click(screen.getByText("Generar mi setup"));
    await screen.findByText("Tu setup recomendado");
    const add = screen.getByText("Añadir setup al carrito");
    fireEvent.click(add);
    fireEvent.click(add);
    expect(screen.getByText("Añadido ✓")).toBeDisabled();
    const stored = JSON.parse(
      localStorage.getItem("desklab-cart") ?? "[]",
    ) as Array<{ quantity: number }>;
    expect(stored).toHaveLength(1);
    expect(stored[0].quantity).toBe(1);
  });
});
