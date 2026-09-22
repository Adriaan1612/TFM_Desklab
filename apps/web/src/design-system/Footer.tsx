import { Link } from "react-router-dom";
import { Container } from "./Container";

export function Footer(): JSX.Element {
  return (
    <footer className="mt-16 border-t border-line">
      <Container>
        <div className="grid gap-8 py-12 md:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold">DeskLab</p>
            <p className="mt-2 text-sm text-ink/60">
              Tu rincón, bien montado.
            </p>
          </div>
          <nav aria-label="Catálogo">
            <p className="text-sm font-semibold">Catálogo</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink/70">
              <li>
                <Link to="/catalogo" className="hover:underline">
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link to="/setups" className="hover:underline">
                  Setups
                </Link>
              </li>
              <li>
                <Link to="/crear-mi-setup" className="hover:underline">
                  Crear mi setup
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Cuenta">
            <p className="text-sm font-semibold">Cuenta</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink/70">
              <li>
                <Link to="/cuenta" className="hover:underline">
                  Mi cuenta
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:underline">
                  Checkout
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="text-sm font-semibold">Proyecto</p>
            <p className="mt-3 text-sm text-ink/60">
              Proyecto académico — TFM del Master en AI Development.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
