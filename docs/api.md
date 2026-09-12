# API — Fase 3 (lectura + substitutes)

Base: `http://localhost:3001`. Contratos en `packages/shared`
(`ProductDTO`, `SetupDTO` con `totalCents` calculado). Errores:
`{ error: { code, message } }` con `BAD_REQUEST` (400), `NOT_FOUND` (404)
o `INVALID_SLOT` (400).

## GET /products

Filtros opcionales: `category`, `style`, `use`, `minPriceCents`,
`maxPriceCents`. Paginación: `page` (≥ 1, defecto 1), `pageSize` (1–50,
defecto 20; `> 50` → 400). `total` es el conteo antes de paginar.

```text
GET /products?style=Dark&use=Gaming&page=1&pageSize=20
→ { data: ProductDTO[], page, pageSize, total }
```

## GET /products/:slug

Un producto o 404.

## GET /products/:slug/setups

Setups donde aparece el producto (`{ data: SetupDTO[] }`, 404 si no existe).
Base de la sección "Aparece en" del detalle.

## GET /products/:slug/substitutes

Productos del mismo slot sin el actual (`{ data: ProductDTO[] }`, 404 si no
existe). Base de "Alternativas compatibles" del detalle.

## GET /setups

Lista con filtros opcionales `use` y `style`. Cada setup incluye sus items
(`slot` + `ProductDTO`) y `totalCents` calculado con `setupTotal`.

## GET /setups/:slug

Un setup completo o 404.

## GET /setups/:slug/substitutes?slot=X

`slot` requerido (400 si falta o es inválido). 404 si el setup no existe,
`INVALID_SLOT` si el setup no tiene item en ese slot. Devuelve productos
del mismo slot excluyendo el actual (`{ data: ProductDTO[] }`).
Regla MVP sin compatibilidad avanzada.

## Fuera de esta fase

Cuentas y auth, IA. Sin cambios de modelo salvo
`Product.slot` (requerido por substitutes, migración
`20260907184631_add_product_slot`).

## POST /checkout (Fase 7)

Alta de pedido simulado para invitado. El cliente envía solo
identificadores y cantidades; precios y total se calculan en servidor.
`email` válido, `name`/`address`/`city`/`postalCode` y `items`
(`productId`, `quantity` 1–99, `setupSlug?`) requeridos. 404 si un producto
no existe. Responde `201` con la Order (`orderNumber` autoincremental,
`totalCents`, items con snapshot de nombre y precio).

## GET /orders/:id (Fase 7)

Devuelve un pedido (simplificación de invitado hasta la fase de cuenta)
o 404.
