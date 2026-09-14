import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./auth/AuthContext";
import { Cuenta } from "./pages/Cuenta";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";

function renderAt(path: string): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const routes: Record<string, JSX.Element> = {
    "/login": <Login />,
    "/registro": <Registro />,
    "/cuenta": <Cuenta />,
  };
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            {Object.entries(routes).map(([p, el]) => (
              <Route key={p} path={p} element={el} />
            ))}
          </Routes>
        </AuthProvider>
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

describe("auth pages", () => {
  it("shows login error on 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        Promise.resolve({
          ok: url.endsWith("/auth/me") ? false : false,
          status: 401,
        }),
      ),
    );
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@desklab.es" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByText("Entrar", { selector: "button" }));
    expect(
      await screen.findByText("Email o contraseña incorrectos."),
    ).toBeInTheDocument();
  });

  it("shows taken-email message on 409", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.endsWith("/auth/register")) {
          return Promise.resolve({ ok: false, status: 409 });
        }
        return Promise.resolve({ ok: false, status: 401 });
      }),
    );
    renderAt("/registro");
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@desklab.es" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Crear cuenta", { selector: "button" }));
    expect(
      await screen.findByText("Ese email ya tiene cuenta. Entra en su lugar."),
    ).toBeInTheDocument();
  });

  it("invites to login when unauthenticated", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 401 })),
    );
    renderAt("/cuenta");
    expect(
      await screen.findByText("Entra para ver tus pedidos."),
    ).toBeInTheDocument();
  });

  it("lists my orders when authenticated", async () => {
    const order = {
      id: "o1",
      orderNumber: 7,
      email: "a@desklab.es",
      name: "A",
      totalCents: 11800,
      createdAt: new Date().toISOString(),
      items: [
        {
          productId: "p1",
          name: "Ratón inalámbrico",
          priceCents: 5900,
          quantity: 2,
          setupSlug: null,
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.endsWith("/auth/me")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                user: { id: "u1", email: "a@desklab.es", name: "A" },
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [order] }),
        });
      }),
    );
    renderAt("/cuenta");
    expect(await screen.findByText("Pedido #7")).toBeInTheDocument();
    expect(screen.getByText("Ratón inalámbrico × 2")).toBeInTheDocument();
  });

  it("updates password requirements while typing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 401 })),
    );
    renderAt("/registro");
    const input = screen.getByLabelText("Contraseña");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(screen.getByText("× Mínimo 8 caracteres")).toBeInTheDocument();
    expect(screen.getByText("✓ Al menos una minúscula")).toBeInTheDocument();
    expect(screen.getByText("× Al menos una mayúscula")).toBeInTheDocument();
    expect(screen.getByText("× Al menos un número")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "Abcdefg1" } });
    expect(screen.getByText("✓ Mínimo 8 caracteres")).toBeInTheDocument();
    expect(screen.getByText("✓ Al menos una mayúscula")).toBeInTheDocument();
    expect(screen.getByText("✓ Al menos un número")).toBeInTheDocument();
  });
});
