import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { CartProvider, useCart } from "./cart/CartContext";
import { CartDrawer } from "./cart/CartDrawer";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { Container, Footer } from "./design-system";
import { Catalog } from "./pages/Catalog";
import { Checkout } from "./pages/Checkout";
import { CrearMiSetup } from "./pages/CrearMiSetup";
import { Cuenta } from "./pages/Cuenta";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Registro } from "./pages/Registro";
import { ProductDetail } from "./pages/ProductDetail";
import { SetupDetail } from "./pages/SetupDetail";
import { Setups } from "./pages/Setups";

const queryClient = new QueryClient();

function AccountMenu(): JSX.Element {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  async function handleMenuLogout(): Promise<void> {
    setMenuError(null);
    try {
      await logout();
      setOpen(false);
    } catch {
      setMenuError("No hemos podido cerrar la sesión.");
    }
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open ]);

  if (!user) {
    return (
      <Link
        to="/login"
        aria-label="Entrar en mi cuenta"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink/70 hover:text-ink"
      >
        <svg
          aria-hidden
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="8" cy="5" r="2.5" />
          <path d="M2.5 14c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" />
        </svg>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setMenuError(null);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de cuenta"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white font-display text-sm font-semibold"
      >
        {user.name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 rounded-2xl border border-line bg-white p-2 text-sm"
        >
          <Link
            to="/cuenta"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 hover:bg-canvas"
          >
            Mi cuenta
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleMenuLogout()}
            className="block w-full rounded-xl px-3 py-2 text-left hover:bg-canvas"
          >
            Salir
          </button>
          {menuError && (
            <p role="alert" className="px-3 py-2 text-xs text-red-700">
              {menuError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Header(): JSX.Element {
  const { count, openCart } = useCart();
  return (
    <header className="border-b border-line">
      <Container>
        <nav className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center font-display text-lg font-bold"
          >
            DeskLab
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link to="/" className="inline-flex min-h-[44px] items-center hover:underline">
              Inicio
            </Link>
            <Link
              to="/catalogo"
              className="inline-flex min-h-[44px] items-center hover:underline"
            >
              Catálogo
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="inline-flex min-h-[44px] items-center hover:underline"
              aria-label={`Abrir carrito, ${count} artículos`}
            >
              Carrito ({count})
            </button>
            <AccountMenu />
          </div>
        </nav>
      </Container>
    </header>
  );
}

export default function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
          <div className="min-h-screen bg-canvas text-ink">
            <Header />
            <CartDrawer />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/producto/:slug" element={<ProductDetail />} />
                <Route path="/setup/:slug" element={<SetupDetail />} />
                <Route path="/setups" element={<Setups />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/cuenta" element={<Cuenta />} />
                <Route path="/crear-mi-setup" element={<CrearMiSetup />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
