import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ApiError,
  fetchProduct,
  fetchProductSetups,
  fetchProductSubstitutes,
} from "../api/client";
import { useCart } from "../cart/CartContext";
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Price,
} from "../design-system";

export function ProductDetail(): JSX.Element {
  const { slug = "" } = useParams();
  const location = useLocation();
  const { add } = useCart();
  const catalogSearch =
    (location.state as { catalogSearch?: string } | null)?.catalogSearch ??
    "";
  const backTo = `/catalogo${catalogSearch}`;

  const product = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    retry: false,
  });
  const setups = useQuery({
    queryKey: ["product-setups", slug],
    queryFn: () => fetchProductSetups(slug),
  });
  const substitutes = useQuery({
    queryKey: ["product-substitutes", slug],
    queryFn: () => fetchProductSubstitutes(slug),
  });

  return (
    <Container>
      <section className="py-12">
        <Breadcrumbs
          trail={[
            { label: "Inicio", to: "/" },
            { label: "Catálogo", to: "/catalogo" },
            { label: product.data?.name ?? "Producto" },
          ]}
        />
        <div className="mt-4">
          <Link to={backTo} className="text-sm hover:underline">
            ← Volver al catálogo
          </Link>
        </div>

        {product.isPending && <p className="mt-6">Cargando producto…</p>}
        {product.isError && (
          <p className="mt-6" role="alert">
            {product.error instanceof ApiError && product.error.status === 404
              ? "Este producto no existe."
              : "No hemos podido cargar el producto. Inténtalo de nuevo más tarde."}
          </p>
        )}

        {product.data && (
          <>
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <div
                aria-hidden
                className="flex min-h-64 items-center justify-center rounded-2xl bg-moss-soft"
              >
                <span className="font-display text-7xl font-bold text-moss-dark">
                  {product.data.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge label={product.data.category} />
                  <Badge label={product.data.slot} />
                  {product.data.styles.map((s) => (
                    <Badge key={s} label={s} />
                  ))}
                  {product.data.uses.map((u) => (
                    <Badge key={u} label={u} />
                  ))}
                </div>
                <h1 className="mt-4 font-display text-3xl font-bold">
                  {product.data.name}
                </h1>
                <p className="mt-4 text-2xl font-semibold">
                  <Price cents={product.data.priceCents} />
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Precio con IVA incluido.
                </p>
                <div className="mt-6">
                  <Button onClick={() => add(product.data)}>
                    Añadir al carrito
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="font-display text-xl font-semibold">
                Aparece en
              </h2>
              {setups.isPending && <p className="mt-4">Cargando setups…</p>}
              {setups.isError && (
                <p className="mt-4" role="alert">
                  No hemos podido cargar los setups de este producto.
                </p>
              )}
              {setups.data && setups.data.data.length === 0 && (
                <p className="mt-4 text-ink/60">
                  Este producto aún no forma parte de ningún setup.
                </p>
              )}
              {setups.data && setups.data.data.length > 0 && (
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  {setups.data.data.map((setup) => (
                    <Card key={setup.id}>
                      <h3 className="font-display text-lg font-semibold">
                        {setup.name}
                      </h3>
                      <p className="mt-2 text-sm text-ink/60">
                        {setup.items.length} productos ·{" "}
                        <Price cents={setup.totalCents} />
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-12">
              <h2 className="font-display text-xl font-semibold">
                Alternativas compatibles
              </h2>
              {substitutes.isPending && (
                <p className="mt-4">Cargando alternativas…</p>
              )}
              {substitutes.isError && (
                <p className="mt-4" role="alert">
                  No hemos podido cargar las alternativas de este producto.
                </p>
              )}
              {substitutes.data && substitutes.data.data.length === 0 && (
                <p className="mt-4 text-ink/60">
                  Sin alternativas en este slot por ahora.
                </p>
              )}
              {substitutes.data && substitutes.data.data.length > 0 && (
                <div className="mt-4 grid gap-6 md:grid-cols-3">
                  {substitutes.data.data.map((alt) => (
                    <Card key={alt.id}>
                      <h3 className="font-display text-lg font-semibold">
                        <Link
                          to={`/producto/${alt.slug}`}
                          className="hover:underline"
                        >
                          {alt.name}
                        </Link>
                      </h3>
                      <p className="mt-2 font-medium">
                        <Price cents={alt.priceCents} />
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-12">
              <Button to={backTo} variant="secondary">
                Seguir explorando
              </Button>
            </div>
          </>
        )}
      </section>
    </Container>
  );
}
