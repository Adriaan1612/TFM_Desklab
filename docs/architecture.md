# Arquitectura — estado actual

Monorepo npm workspaces:

- `apps/web`: React + TS + Vite + Tailwind. SPA del ecommerce
  (Home, catálogo, producto, setups, carrito, checkout, cuenta, IA).
- `apps/api`: Node + TS + Fastify. API REST: `GET /health`, catálogo
  y setups (lectura + substitutes), checkout con pago simulado,
  auth por cookie de sesión, pedidos y recomendador IA.
- `packages/shared`: tipos/utilidades compartidas (DTOs, carrito,
  validación de tarjeta, totales). Contrato de la API.
- `prisma/`: PostgreSQL con modelos (`Product`, `Setup`, `SetupItem`,
  `User`, `Session`, `Order`, `OrderItem`), migraciones versionadas
  en Git y seed (32 productos + 6 setups).
- `docs/`: notas de arquitectura y decisiones.

Principios: simplicidad, TypeScript estricto, separación frontend/backend/dominio, incremental.
