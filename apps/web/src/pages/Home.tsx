import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchSetups } from "../api/client";
import {
  Badge,
  Button,
  Card,
  Container,
  Price,
} from "../design-system";

export function Home(): JSX.Element {
  const setups = useQuery({ queryKey: ["setups"], queryFn: fetchSetups });

  return (
    <Container>
      <section className="py-16 md:py-24">
        <p className="text-sm font-medium uppercase tracking-widest text-moss-dark">
          DeskLab
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight md:text-6xl">
          Tu rincón, bien montado.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/70">
          Descubre setups de escritorio coherentes, explora el catálogo y
          monta un espacio calmado que encaje contigo.
        </p>
        <div className="mt-8 flex gap-3">
          <Button to="/catalogo">Explorar catálogo</Button>
          <Button to="/catalogo" variant="secondary">
            Ver setups
          </Button>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <h2 className="font-display text-2xl font-semibold">
          Setups destacados
        </h2>
        {setups.isPending && <p className="mt-6">Cargando setups…</p>}
        {setups.isError && (
          <p className="mt-6" role="alert">
            No hemos podido cargar los setups. Inténtalo de nuevo más tarde.
          </p>
        )}
        {setups.data && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {setups.data.data.map((setup) => (
              <Card key={setup.id}>
                <div className="flex flex-wrap gap-2">
                  <Badge label={setup.use} />
                  <Badge label={setup.style} />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  <Link to="/catalogo" className="hover:underline">
                    {setup.name}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-ink/60">
                  {setup.items.length} productos ·{" "}
                  <Price cents={setup.totalCents} />
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
