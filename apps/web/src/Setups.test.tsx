import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Setups } from "./pages/Setups";

const setup = {
  id: "s1",
  slug: "night-shift",
  name: "Night Shift",
  use: "Gaming",
  style: "Dark",
  items: [],
  totalCents: 66100,
};

function renderSetups(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/setups"]}>
        <Setups />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Setups", () => {
  it("shows loading skeletons and retry on error", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    renderSetups();
    expect(screen.getByLabelText("Cargando")).toBeInTheDocument();
  });

  it("shows error state with retry", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("down"))));
    renderSetups();
    expect(
      await screen.findByText(/no hemos podido cargar los setups/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Reintentar")).toBeInTheDocument();
  });

  it("lists setups with links to their detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [setup] }),
        }),
      ),
    );
    renderSetups();
    expect(await screen.findByText("Night Shift")).toBeInTheDocument();
    expect(screen.getByText("Night Shift")).toHaveAttribute(
      "href",
      "/setup/night-shift",
    );
  });
});
