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
import { Registro } from "./pages/Registro";
import { ProductDetail } from "./pages/ProductDetail";
import { SetupDetail } from "./pages/SetupDetail";
import { Setups } from "./pages/Setups";

const queryClient = new QueryClient();

function AccountMenu(): JSX.Element {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink/70 hover:text-ink"
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
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de cuenta"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white font-display text-sm font-semibold"
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
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className="block w-full rounded-xl px-3 py-2 text-left hover:bg-canvas"
          >
            Salir
          </button>
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
        <nav className="flex items-center justify-between py-4">
          <Link to="/" className="font-display text-lg font-bold">
            DeskLab
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="hover:underline">
              Inicio
            </Link>
            <Link to="/catalogo" className="hover:underline">
              Catálogo
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="hover:underline"
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
