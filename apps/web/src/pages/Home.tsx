import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchSetups } from "../api/client";
import {
  Button,
  Card,
  Container,
  SetupCarousel,
  SetupImage,
  SkeletonGrid,
} from "../design-system";

const COLLECTIONS = [
  { style: "Minimal", text: "Menos, pero mejor." },
  { style: "Natural", text: "Materiales que respiran." },
  { style: "Dark", text: "Concentración total." },
  { style: "RGB", text: "Tu espacio, tu luz." },
];

const VALUES = [
  {
    title: "Setups coherentes",
    text: "Cada espacio está montado con criterio, no es una lista de piezas sueltas.",
  },
  {
    title: "IA sobre catálogo real",
    text: "Te proponemos setups solo con productos que existen y puedes comprar.",
  },
  {
    title: "Compra simulada sin sorpresas",
    text: "Precios claros con IVA y pago simulado: aquí no hay cargos reales.",
  },
];

export function Home(): JSX.Element {
  const setups = useQuery({ queryKey: ["setups"], queryFn: fetchSetups });
  const heroSlug = setups.data?.data[0]?.slug ?? "the-calm-desk";
  const heroName = setups.data?.data[0]?.name ?? "The Calm Desk";

  return (
    <Container>
      <section className="grid items-center gap-10 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-moss-dark">
            DeskLab
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
            Tu rincón, bien montado.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/70">
            Descubre setups de escritorio coherentes, explora el catálogo y
            monta un espacio calmado que encaje contigo.
          </p>
          <div className="mt-10 flex gap-3">
            <Button to="/catalogo">Explorar catálogo</Button>
            <Button to="/setups" variant="secondary">
              Ver setups
            </Button>
          </div>
        </div>
        <Link
          to={`/setup/${heroSlug}`}
          aria-label={`Ver setup ${heroName}`}
          className="block"
        >
          <SetupImage slug={heroSlug} name={heroName} />
        </Link>
      </section>

      <section aria-label="Colecciones por estilo">
        <h2 className="font-display text-2xl font-semibold">
          Explora por estilo
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <Card key={c.style} className="transition-colors hover:border-ink/30">
              <Link
                to={`/catalogo?style=${c.style}`}
                className="group block"
                aria-label={`Ver productos de estilo ${c.style}`}
              >
                <h3 className="flex items-center justify-between font-display text-lg font-semibold">
                  {c.style}
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </h3>
                <p className="mt-2 text-sm text-ink/60">{c.text}</p>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section
        aria-label="Crear setup con IA"
        className="mt-16 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-8 md:mt-24"
      >
        <div>
          <h2 className="font-display text-2xl font-semibold">
            ¿No sabes por dónde empezar?
          </h2>
          <p className="mt-2 max-w-xl text-ink/60">
            Responde 5 preguntas y la IA monta un setup con productos reales
            del catálogo.
          </p>
        </div>
        <Button to="/crear-mi-setup" className="md:ml-auto">
          Crear mi setup con IA
        </Button>
      </section>

      <section className="py-16 md:py-24">
        <h2 className="font-display text-2xl font-semibold">
          Setups destacados
        </h2>
        {setups.isPending && (
          <div className="mt-6">
            <SkeletonGrid count={4} />
          </div>
        )}
        {setups.isError && (
          <div className="mt-6">
            <p role="alert">
              No hemos podido cargar los setups. Inténtalo de nuevo más tarde.
            </p>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => setups.refetch()}>
                Reintentar
              </Button>
            </div>
          </div>
        )}
        {setups.data && (
          <div className="mt-6">
            <SetupCarousel setups={setups.data.data} />
          </div>
        )}
      </section>

      <section
        aria-label="Por qué DeskLab"
        className="grid gap-6 pb-16 md:grid-cols-3 md:pb-24"
      >
        {VALUES.map((v) => (
          <div key={v.title}>
            <h3 className="font-display text-lg font-semibold">{v.title}</h3>
            <p className="mt-2 text-sm text-ink/60">{v.text}</p>
          </div>
        ))}
      </section>
    </Container>
  );
}
