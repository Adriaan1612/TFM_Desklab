import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function renderApp(me: unknown): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.endsWith("/auth/me")) {
        return me
          ? Promise.resolve({ ok: true, json: () => Promise.resolve({ user: me }) })
          : Promise.resolve({ ok: false, status: 401 });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [], page: 1, pageSize: 12, total: 0 }),
      });
    }),
  );
  render(
    <QueryClientProvider client={client}>
      <App />
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

describe("AccountMenu", () => {
  it("shows person icon after cart when anonymous", async () => {
    renderApp(null);
    const icon = await screen.findByRole("link", {
      name: "Entrar en mi cuenta",
    });
    expect(icon).toHaveAttribute("href", "/login");
    const nav = within(screen.getByRole("banner")).getByRole("navigation");
    const order = within(nav)
      .getAllByRole("link")
      .map((el) => el.getAttribute("href"));
    expect(order.indexOf("/login")).toBeGreaterThan(
      order.indexOf("/catalogo"),
    );
  });

  it("shows avatar initial without name and opens Mi cuenta", async () => {
    renderApp({ id: "u1", email: "a@desklab.es", name: "Ada" });
    const button = await screen.findByRole("button", { name: "Menú de cuenta" });
    expect(button).toHaveTextContent("A");
    expect(screen.queryByText("Ada", { selector: "nav *" })).not.toBeInTheDocument();
    fireEvent.click(button);
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(within(menu).getByText("Mi cuenta")).toHaveAttribute(
      "href",
      "/cuenta",
    );
    fireEvent.click(within(menu).getByText("Mi cuenta"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes with Escape and outside click", async () => {
    renderApp({ id: "u1", email: "a@desklab.es", name: "Ada" });
    const button = await screen.findByRole("button", { name: "Menú de cuenta" });
    fireEvent.click(button);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("Home sections", () => {
  it("links collections, IA band and footer", async () => {
    window.history.pushState({}, "", "/");
    renderApp(null);
    expect(await screen.findByText("Explora por estilo")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver setups de estilo minimal/i }),
    ).toHaveAttribute("href", "/catalogo?style=Minimal");
    expect(screen.getByText("Crear mi setup con IA")).toHaveAttribute(
      "href",
      "/crear-mi-setup",
    );
    expect(screen.getByText(/Proyecto académico/)).toBeInTheDocument();
  });

  it("shows hero visual linking to its setup", async () => {
    window.history.pushState({}, "", "/");
    renderApp(null);
    const img = await screen.findByAltText("The Calm Desk");
    expect(img).toHaveAttribute("src", "/img/setups/the-calm-desk.webp");
    expect(img.closest("a")).toHaveAttribute("href", "/setup/the-calm-desk");
  });
});
