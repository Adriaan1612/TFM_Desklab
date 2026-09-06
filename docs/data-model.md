# Data model — Fase 2 (catálogo + setups, lectura)

## Entidades

```text
Product 1──* SetupItem *──1 Setup
```

- **Product**: `id`, `slug` (único), `name`, `category`, `styles[]`, `uses[]`,
  `priceCents` (entero, sin floats), `imageUrl?`, `createdAt`.
- **Setup**: `id`, `slug` (único), `name`, `use`, `style`, `createdAt`.
- **SetupItem**: `setupId + slot` (único: un producto por slot), `productId`.
  - `setup → Cascade` (borrar un setup borra sus items).
  - `product → Restrict` (no se puede borrar un producto usado en un setup).

## Decisiones

- **Enums Prisma** para `Category` (6), `Style` (4), `Use` (5) y `Slot` (8),
  con los valores de `docs/product.md`.
- **`styles` y `uses` como arrays de enums PostgreSQL** (`Style[]`, `Use[]`):
  un producto puede servir a varios estilos/usos sin tabla intermedia.
- **Precio calculado, nunca guardado**: el total de un setup es la suma de
  sus items (`setupTotal` en `packages/shared`). Así el precio siempre es
  consistente al sustituir productos.
- **Mismo slot = sustitución válida**: simplificación deliberada del MVP para
  permitir personalizar setups sin un motor de compatibilidad. No representa
  compatibilidad física universal (medidas, conectores, carga del brazo, etc.).
- **DTOs de `packages/shared` como contrato de la API**, no como espejos de
  Prisma: el frontend solo conoce `ProductDTO` / `SetupDTO` / `SetupItemDTO`.
  La persistencia puede cambiar sin romper el contrato.

## Fuera de esta fase (estricto)

`User`, `Cart`, `Order`, `SavedSetup` y persistencia del cuestionario IA.
Llegan en sus fases (carrito/checkout, cuenta, IA).

## Seed mínimo

8 productos y 2 setups (`the-calm-desk`, `night-shift`) que validan las
relaciones. El catálogo completo (30–40 productos) llega en la fase de
Productos.

## Migración inicial

`20260906172734_init_catalog_setups` creada y aplicada contra PostgreSQL 16.
Las migraciones se versionan en Git (`prisma/migrations/`).
