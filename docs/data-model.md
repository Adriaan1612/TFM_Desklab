# Data model — estado actual (catálogo, setups, checkout y cuenta)

## Entidades

```text
Product 1──* SetupItem *──1 Setup
```

- **Product**: `id`, `slug` (único), `name`, `description` (editorial ES,
  obligatoria), `category`, `slot` (afinidad 1:1
  con un slot de setup, base de substitutes), `styles[]`, `uses[]`,
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

## Fuera del modelo (decisión)

`Cart`, `SavedSetup` y persistencia del cuestionario IA no se persisten.
El carrito vive en el frontend (`localStorage`); los pedidos (`Order`,
`OrderItem` con snapshot de nombre/precio y `setupSlug?`) se crean
en `POST /checkout`.

## Cuenta

`User` (`email` único, `name`, `passwordHash` scrypt), `Session`
(`token` único, `expiresAt` 30 días, cascade por usuario) y
`Order.userId?` (solo pedidos hechos logueado, sin backfill).
Migración `20260914174204_add_users_sessions`.

## Seed actual

32 productos y 6 setups (`the-calm-desk`, `night-shift`, `the-study`,
`the-creator`, `green-corner`, `rgb-focus`) que validan las
relaciones y alimentan el catálogo.

## Migraciones

`20260906172734_init_catalog_setups` creada y aplicada contra PostgreSQL 16.
`20260907184631_add_product_slot` añade `Product.slot` requerido con backfill
por slug (nullable → UPDATE → NOT NULL). `20260912162537_add_orders` crea
`Order`/`OrderItem`. `20260914174204_add_users_sessions` crea
`User`/`Session` y `Order.userId?`.
`20260924095042_add_product_description` añade `Product.description`
obligatoria con backfill (nullable → UPDATE → NOT NULL).
Las migraciones se versionan en Git (`prisma/migrations/`).
