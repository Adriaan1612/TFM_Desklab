import { Button, Container } from "../design-system";

export function NotFound(): JSX.Element {
  return (
    <Container>
      <section className="py-12">
        <h1 className="font-display text-3xl font-bold">
          Página no encontrada
        </h1>
        <p className="mt-4 text-ink/70">
          Esta dirección no existe o se ha movido.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/">Volver al inicio</Button>
          <Button to="/catalogo" variant="secondary">
            Explorar el catálogo
          </Button>
        </div>
      </section>
    </Container>
  );
}
