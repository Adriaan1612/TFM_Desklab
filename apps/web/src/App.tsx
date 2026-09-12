import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Container } from "./design-system";
import { Catalog } from "./pages/Catalog";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import { SetupDetail } from "./pages/SetupDetail";
import { Setups } from "./pages/Setups";

const queryClient = new QueryClient();

function Header(): JSX.Element {
  return (
    <header className="border-b border-line">
      <Container>
        <nav className="flex items-center justify-between py-4">
          <Link to="/" className="font-display text-lg font-bold">
            DeskLab
          </Link>
          <div className="flex gap-6 text-sm">
            <Link to="/" className="hover:underline">
              Inicio
            </Link>
            <Link to="/catalogo" className="hover:underline">
              Catálogo
            </Link>
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
        <div className="min-h-screen bg-canvas text-ink">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/producto/:slug" element={<ProductDetail />} />
              <Route path="/setup/:slug" element={<SetupDetail />} />
              <Route path="/setups" element={<Setups />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
