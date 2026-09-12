import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { CartProvider, useCart } from "./cart/CartContext";
import { CartDrawer } from "./cart/CartDrawer";
import { Container } from "./design-system";
import { Catalog } from "./pages/Catalog";
import { Checkout } from "./pages/Checkout";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import { SetupDetail } from "./pages/SetupDetail";
import { Setups } from "./pages/Setups";

const queryClient = new QueryClient();

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
              </Routes>
            </main>
          </div>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
