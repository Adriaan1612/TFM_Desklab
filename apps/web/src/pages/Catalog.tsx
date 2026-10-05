import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import { fetchProducts } from "../api/client";
import {
  Badge,
  Button,
  Card,
  Container,
  Price,
  ProductImage,
  SkeletonGrid,
} from "../design-system";

const DEFAULT_PAGE_SIZE = 12;

const CATEGORIES = [
  "Lighting",
  "Organization",
  "Peripherals",
  "Monitors",
  "Stands",
  "Decoration",
];
const STYLES = ["Minimal", "Natural", "Dark", "RGB"];
const USES = ["Work", "Gaming", "Study", "Streaming", "Mixed"];

const SORTS = [
  { value: "default", label: "Orden por defecto" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name-asc", label: "Nombre: A–Z" },
  { value: "name-desc", label: "Nombre: Z–A" },
];

function updateParams(
  params: URLSearchParams,
  setParams: (next: URLSearchParams) => void,
  next: Record<string, string | undefined>,
  resetPage = true,
): void {
  const updated = new URLSearchParams(params);
  for (const [key, value] of Object.entries(next)) {
    if (!value) {
      updated.delete(key);
    } else {
      updated.set(key, value);
    }
  }
  if (resetPage) updated.set("page", "1");
  setParams(updated);
}

const selectCls =
  "appearance-none rounded-full border border-line bg-white pl-4 pr-9 py-2 text-sm text-ink";

function SelectWrap({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="relative inline-flex items-center text-ink/60">
      {children}
      <svg
        aria-hidden
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="pointer-events-none absolute right-3"
      >
        <path d="M3 4.5 6 7.5 9 4.5" />
      </svg>
    </span>
  );
}

function FilterBar(): JSX.Element {
  const [params, setParams] = useSearchParams();
  const update = (next: Record<string, string | undefined>): void =>
    updateParams(params, setParams, next);

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        Categoría
        <SelectWrap>
          <select
            aria-label="Categoría"
            className={selectCls}
            value={params.get("category") ?? ""}
            onChange={(e) =>
              update({ category: e.target.value || undefined })
            }
          >
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </SelectWrap>
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        Estilo
        <SelectWrap>
          <select
            aria-label="Estilo"
            className={selectCls}
            value={params.get("style") ?? ""}
            onChange={(e) => update({ style: e.target.value || undefined })}
          >
            <option value="">Todos</option>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </SelectWrap>
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        Uso
        <SelectWrap>
          <select
            aria-label="Uso"
            className={selectCls}
            value={params.get("use") ?? ""}
            onChange={(e) => update({ use: e.target.value || undefined })}
          >
            <option value="">Todos</option>
            {USES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </SelectWrap>
      </label>
      <Button variant="secondary" onClick={() => setParams({})}>
        Limpiar
      </Button>
    </form>
  );
}

function sortValue(params: URLSearchParams): string {
  const sort = params.get("sort");
  const order = params.get("order") ?? "asc";
  if (sort === "price" || sort === "name") return `${sort}-${order}`;
  return "default";
}

function SortBar(): JSX.Element {
  const [params, setParams] = useSearchParams();

  function change(value: string): void {
    if (value === "default") {
      const updated = new URLSearchParams(params);
      updated.delete("sort");
      updated.delete("order");
      updated.set("page", "1");
      setParams(updated);
      return;
    }
    const [sort, order] = value.split("-");
    updateParams(params, setParams, {
      sort,
      order,
    });
  }

  return (
    <label className="flex items-center gap-2 text-xs text-ink/60">
      Ordenar
      <SelectWrap>
        <select
          aria-label="Ordenar"
          className={selectCls}
          value={sortValue(params)}
          onChange={(e) => change(e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </SelectWrap>
    </label>
  );
}

function ActiveChips(): JSX.Element | null {
  const [params, setParams] = useSearchParams();
  const chips = (["category", "style", "use"] as const)
    .map((key) => ({ key, value: params.get(key) }))
    .filter((c) => c.value !== null);
  if (chips.length === 0) return null;
  return (
    <ul aria-label="Filtros activos" className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() =>
              updateParams(params, setParams, { [chip.key]: undefined })
            }
            aria-label={`Quitar filtro ${chip.value}`}
            className="inline-flex items-center gap-1 rounded-full bg-moss-soft px-3 py-1 text-xs font-medium text-moss-dark hover:underline"
          >
            {chip.value} <span aria-hidden>×</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Pagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}): JSX.Element {
  const [, setParams] = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function go(next: number): void {
    const clamped = Math.min(Math.max(next, 1), totalPages);
    setParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("page", String(clamped));
      return updated;
    });
  }

  return (
    <nav
      aria-label="Paginación"
      className="mt-8 flex flex-wrap items-center justify-between gap-4"
    >
      <p className="text-sm text-ink/60">
        Mostrando {from}–{to} de {total}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}

export function Catalog(): JSX.Element {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const query = params.toString();

  const products = useQuery({
    queryKey: ["products", query],
    queryFn: () => {
      const api = new URLSearchParams(query);
      if (!api.get("pageSize")) api.set("pageSize", String(DEFAULT_PAGE_SIZE));
      return fetchProducts(api.toString());
    },
    // Mantiene la parrilla anterior al cambiar filtros: el aviso
    // "Actualizando…" da feedback en vez de un skeleton completo.
    placeholderData: keepPreviousData,
  });

  // Corrige ?page=999 y similares: vuelve a la última página válida.
  const requestedPage = Number(params.get("page") ?? "1");
  useEffect(() => {
    if (!products.data || products.data.total === 0) return;
    const totalPages = Math.max(
      1,
      Math.ceil(products.data.total / products.data.pageSize),
    );
    if (requestedPage > totalPages) {
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          updated.set("page", String(totalPages));
          return updated;
        },
        { replace: true },
      );
    }
  }, [products.data, requestedPage, setParams]);

  const refreshing = products.isFetching && !products.isPending;

  return (
    <Container>
      <section className="py-12">
        <h1 className="font-display text-3xl font-bold">Catálogo</h1>
        <p className="mt-2 text-ink/60">
          Filtra por categoría, estilo y uso. Precios con IVA incluido.
        </p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <FilterBar />
          <SortBar />
        </div>
        <div className="mt-4">
          <ActiveChips />
        </div>

        <div className="mt-8">
          {products.isPending && <SkeletonGrid count={6} />}
          {products.isError && (
            <div>
              <p role="alert">
                No hemos podido cargar el catálogo. Inténtalo de nuevo más
                tarde.
              </p>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => products.refetch()}>
                  Reintentar
                </Button>
              </div>
            </div>
          )}
          {products.data && (
            <p className="text-sm text-ink/60" aria-live="polite">
              {products.data.total === 1
                ? "1 producto"
                : `${products.data.total} productos`}
              {refreshing ? " · Actualizando…" : ""}
            </p>
          )}
          {products.data && products.data.total === 0 && (
            <p className="mt-4">
              Sin resultados para estos filtros. Prueba a limpiar la búsqueda.
            </p>
          )}
          {products.data && products.data.total > 0 && (
            <>
              <div
                className="mt-4 grid gap-6 md:grid-cols-3"
                aria-busy={refreshing ? true : undefined}
              >
                {products.data.data.map((product) => (
                  <Card key={product.id}>
                    <ProductImage
                      slug={product.slug}
                      name={product.name}
                      imageUrl={product.imageUrl}
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge label={product.category} />
                      {product.styles.map((s) => (
                        <Badge key={s} label={s} />
                      ))}
                    </div>
                    <h2 className="mt-4 font-display text-lg font-semibold">
                      <Link
                        to={`/producto/${product.slug}`}
                        state={{ catalogSearch: location.search }}
                        className="hover:underline"
                      >
                        {product.name}
                      </Link>
                    </h2>
                    <p className="mt-2 font-medium">
                      <Price cents={product.priceCents} />
                    </p>
                  </Card>
                ))}
              </div>
              <Pagination
                page={products.data.page}
                pageSize={products.data.pageSize}
                total={products.data.total}
              />
            </>
          )}
        </div>
      </section>
    </Container>
  );
}
