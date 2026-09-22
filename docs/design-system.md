# Design system — Fase 4

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

## Páginas

- `/` (Home): hero con tagline + setups destacados (`GET /setups`).
- `/catalogo` (Catalog): `FilterBar` (categoría/estilo/uso, sincronizado con
  la URL, resetea a `page=1`), tarjetas de producto, `Pagination`
  (`page`/`pageSize`/`total` de la API, también en la URL) y estados
  carga/error/vacío.
- Datos con TanStack Query (`src/api/client.ts`, tipado con los DTOs de
  `@desklab/shared`, base `VITE_API_URL` con defecto `http://localhost:3001`).

## Decisiones

- `react-router-dom` + TanStack Query (caché y estados) en lugar de fetch
  manual.
- `pageSize` por defecto 12 en catálogo (la API permite hasta 50).
- Tests con Testing Library + jsdom: primitivas y estados del catálogo.
