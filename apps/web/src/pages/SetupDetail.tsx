import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { setupTotal, swapItem, type ProductDTO, type Slot } from "@desklab/shared";
import {
  ApiError,
  fetchSetup,
  fetchSetupSubstitutes,
} from "../api/client";
import {
  Badge,
  Button,
  Card,
  Container,
  Price,
} from "../design-system";

function SlotRow({
  setupSlug,
  slot,
  current,
  customized,
  onSwap,
  onReset,
}: {
  setupSlug: string;
  slot: Slot;
  current: ProductDTO;
  customized: boolean;
  onSwap: (product: ProductDTO) => void;
  onReset: () => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const substitutes = useQuery({
    queryKey: ["setup-substitutes", setupSlug, slot],
    queryFn: () => fetchSetupSubstitutes(setupSlug, slot),
    enabled: open,
  });

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={slot} />
            {customized && <Badge label="Personalizado" />}
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">
            <Link to={`/producto/${current.slug}`} className="hover:underline">
              {current.name}
            </Link>
          </h3>
          <p className="mt-1 font-medium">
            <Price cents={current.priceCents} />
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {customized && (
            <Button variant="secondary" onClick={onReset}>
              Restablecer
            </Button>
          )}
          <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
            {open ? "Cerrar" : "Cambiar"}
          </Button>
        </div>
      </div>
      {open && (
        <div className="mt-4 border-t border-line pt-4">
          {substitutes.isPending && <p>Cargando alternativas…</p>}
          {substitutes.isError && (
            <p role="alert">No hemos podido cargar las alternativas.</p>
          )}
          {substitutes.data && substitutes.data.data.length === 0 && (
            <p className="text-sm text-ink/60">
              Sin alternativas en este slot por ahora.
            </p>
          )}
          {substitutes.data && substitutes.data.data.length > 0 && (
            <ul className="flex flex-col gap-2">
              {substitutes.data.data.map((alt) => (
                <li
                  key={alt.id}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm">{alt.name}</span>
                  <span className="flex items-center gap-3">
                    <Price cents={alt.priceCents} />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onSwap(alt);
                        setOpen(false);
                      }}
                    >
                      Elegir
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

export function SetupDetail(): JSX.Element {
  const { slug = "" } = useParams();
  // Personalización solo en memoria: se pierde al salir de la página.
  const [overrides, setOverrides] = useState<Partial<Record<Slot, ProductDTO>>>(
    {},
  );

  const setup = useQuery({
    queryKey: ["setup", slug],
    queryFn: () => fetchSetup(slug),
    retry: false,
  });

  const items =
    setup.data?.items.map((item) => ({
      slot: item.slot,
      product: overrides[item.slot] ?? item.product,
    })) ?? [];
  const total = setupTotal(items);
  const customizedCount = Object.keys(overrides).length;

  function handleSwap(slot: Slot, product: ProductDTO): void {
    // Valida que el producto pertenezca al slot antes de aplicarlo.
    swapItem(items, slot, product);
    setOverrides((prev) => ({ ...prev, [slot]: product }));
  }

  function handleReset(slot: Slot): void {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  }

  return (
    <Container>
      <section className="py-12">
        <Link to="/" className="text-sm hover:underline">
          ← Volver al inicio
        </Link>

        {setup.isPending && <p className="mt-6">Cargando setup…</p>}
        {setup.isError && (
          <p className="mt-6" role="alert">
            {setup.error instanceof ApiError && setup.error.status === 404
              ? "Este setup no existe."
              : "No hemos podido cargar el setup. Inténtalo de nuevo más tarde."}
          </p>
        )}

        {setup.data && (
          <>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge label={setup.data.use} />
                  <Badge label={setup.data.style} />
                  {customizedCount > 0 && (
                    <Badge label={`${customizedCount} cambios`} />
                  )}
                </div>
                <h1 className="mt-4 font-display text-3xl font-bold">
                  {setup.data.name}
                </h1>
              </div>
              <p className="text-2xl font-semibold">
                <Price cents={total} />
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-6">
              {items.map((item) => (
                <SlotRow
                  key={item.slot}
                  setupSlug={setup.data.slug}
                  slot={item.slot}
                  current={item.product}
                  customized={item.slot in overrides}
                  onSwap={(product) => handleSwap(item.slot, product)}
                  onReset={() => handleReset(item.slot)}
                />
              ))}
            </div>

            <div className="mt-12 flex gap-3">
              <Button disabled title="Disponible próximamente">
                Añadir al carrito (próximamente)
              </Button>
              <Button to="/" variant="secondary">
                Seguir explorando
              </Button>
            </div>
          </>
        )}
      </section>
    </Container>
  );
}
