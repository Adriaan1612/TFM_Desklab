# Design system — estado actual

## Tokens

- **Color**: `canvas #FAF8F5` (fondo), `ink #1E1E1C` (texto/primario),
  `moss #7A8B6F` (acento), `moss-dark #5F7055`, `moss-soft #E7ECE2`,
  `line #E5E0D8` (bordes). Definidos en `tailwind.config.js`.
- **Tipo**: `display` = Space Grotesk (titulares), `sans` = Inter (texto),
  cargadas vía Google Fonts en `index.html`.
- **Base** (`index.css`): fondo canvas, texto ink, antialiased, mucho
  espacio negativo. Sin estética gamer: bordes suaves, redondeados amplios.

## Primitivas (`src/design-system/`)

- `Button` (`primary`/`secondary`, acepta `to` para navegar o `onClick`).
- `Card` (contenedor blanco con borde suave).
- `Badge` (etiqueta para categoría/estilo/uso).
- `Price` (céntimos → EUR con `Intl`, `es-ES`).
- `Container` (ancho máximo + padding lateral).
- `Breadcrumbs` (migas Inicio / sección / página actual).
- `SkeletonCard`/`SkeletonGrid` (carga de listados).
- `Footer` (a nivel App: marca, navegación y "Proyecto académico — TFM").
- `SetupCarousel` (Home): scroll-snap sin librerías ni autoplay; 2 visibles
  en desktop, 1 en mobile con swipe; avance de uno en uno, flechas con
  `aria-label`, indicadores con `aria-current` y flechas de teclado.

## Páginas

- `/` (Home): hero con tagline + setups destacados (`GET /setups`).
- `/catalogo` (Catalog): `FilterBar` (categoría/estilo/uso, sincronizado con
  la URL, resetea a `page=1`), tarjetas de producto, `Pagination`
  (`page`/`pageSize`/`total` de la API, también en la URL) y estados
  carga/error/vacío.
- `/producto/:slug` (ProductDetail): descripción editorial bajo el nombre
  (jerarquía secundaria, `text-ink/70`); no se muestra en tarjetas.
  "Aparece en" enlaza a `/setup/:slug`; Reintentar en error no-404.
- `/setups` + `/setup/:slug` (Setups/SetupDetail): personalización por
  slot con aviso de temporalidad, total en vivo y "Añadido ✓" anti
  doble-clic; "Seguir explorando" vuelve a `/setups`.
- `/checkout` (Checkout): 2 pasos (datos + pago simulado); validación
  espejo del backend con errores inline por campo; sugerencia no
  bloqueante ante typos de email; aviso si los precios cambiaron.
- `/cuenta` (Cuenta): pedidos propios, aviso de pedidos de invitado,
  logout con error visible.
- `/crear-mi-setup` (IA): presupuesto 50–100000 €, nota máx. 500 con
  contador, reintento y escape a `/setups` ante error.
- `/login`, `/registro` y `NotFound` (ruta `*` con enlaces a `/`
  y `/catalogo`).
- Patrones transversales: `role="alert"` en errores, `aria-busy` +
  "Actualizando…" en recargas, tope 99 unidades por línea de carrito,
  corrección de `?page=` fuera de rango.
- Datos con TanStack Query (`src/api/client.ts`, tipado con los DTOs de
  `@desklab/shared`, base `VITE_API_URL` con defecto `http://localhost:3001`).

## Decisiones

- `react-router-dom` + TanStack Query (caché y estados) en lugar de fetch
  manual.
- `pageSize` por defecto 12 en catálogo (la API permite hasta 50).
- Tests con Testing Library + jsdom: primitivas y estados del catálogo.
