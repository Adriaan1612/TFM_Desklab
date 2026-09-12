import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchSetups } from "../api/client";
import {
  Badge,
  Card,
  Container,
  Price,
} from "../design-system";

export function Setups(): JSX.Element {
  const setups = useQuery({ queryKey: ["setups"], queryFn: fetchSetups });

  return (
    <Container>
      <section className="py-12">
        <h1 className="font-display text-3xl font-bold">Setups</h1>
        <p className="mt-2 text-ink/60">
          Espacios coherentes listos para personalizar.
        </p>

        <div className="mt-8">
          {setups.isPending && <p>Cargando setups…</p>}
          {setups.isError && (
            <p role="alert">
              No hemos podido cargar los setups. Inténtalo de nuevo más tarde.
            </p>
          )}
          {setups.data && setups.data.data.length === 0 && (
            <p>Aún no hay setups publicados.</p>
          )}
          {setups.data && setups.data.data.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {setups.data.data.map((setup) => (
                <Card key={setup.id}>
                  <div className="flex flex-wrap gap-2">
                    <Badge label={setup.use} />
                    <Badge label={setup.style} />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold">
                    <Link
                      to={`/setup/${setup.slug}`}
                      className="hover:underline"
                    >
                      {setup.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-ink/60">
                    {setup.items.length} productos ·{" "}
                    <Price cents={setup.totalCents} />
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
