# AGENTS.md — DeskLab

## Qué es
DeskLab es el TFM del Master en AI Development de BigSchool: un ecommerce de
setups de escritorio que ayuda a descubrir, montar y personalizar un espacio
coherente. No es una tienda genérica de periféricos.

Tagline: **Tu rincón, bien montado.**

Visión completa del producto: `docs/product.md`.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + TypeScript + Fastify
- DB: PostgreSQL + Prisma
- Styling: Tailwind CSS
- Tests: Vitest
- Monorepo npm workspaces: `apps/web`, `apps/api`, `packages/shared`, `prisma/`, `docs/`

Arranque y estructura: ver `README.md`.

## Reglas de trabajo
- Mantener el proyecto sencillo y controlado.
- Evitar sobreingeniería.
- TypeScript estricto.
- Código mantenible y testeable.
- Separar frontend, backend y dominio.
- Priorizar UX, claridad y mantenibilidad.
- No inventar funcionalidades.
- No tomar decisiones importantes sin explicar primero el motivo.
- Construir de forma incremental.
- Si algo no está definido, preguntar antes de asumir.
- No avanzar a una nueva fase ni implementar decisiones no confirmadas sin confirmación explícita del usuario.

## Docs
- `docs/product.md` — qué es DeskLab y qué debe hacer (fuente única de alcance).
- `docs/data-model.md` — entidades y relaciones.
- `docs/api.md` — endpoints.
- `docs/design-system.md` — diseño.
- `docs/ai.md` — comportamiento de la IA.
- `docs/architecture.md` — arquitectura base del monorepo.

## Roadmap (histórico)

1. Arquitectura y modelo de datos
2. Backend/API
3. Design system y frontend
4. Productos
5. Setups y personalización
6. Carrito y checkout
7. Cuenta
8. IA
9. Testing y documentación

> Estado actual: fases 1–9 completadas, más Fase 12 (contenido visual)
> y Fases 13.1–13.4 (QA y estabilización). Ver `README.md`.
