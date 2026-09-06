# Arquitectura (Fase 1 — base)

Monorepo npm workspaces:

- `apps/web`: React + TS + Vite + Tailwind. SPA del ecommerce.
- `apps/api`: Node + TS + Fastify. API REST (`/health` como único endpoint inicial).
- `packages/shared`: tipos/utilidades compartidas (placeholder).
- `prisma/`: solo datasource Postgres. Sin modelos todavía.
- `docs/`: notas de arquitectura y decisiones.

Principios: simplicidad, TypeScript estricto, separación frontend/backend/dominio, incremental.
