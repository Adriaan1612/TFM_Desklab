# AGENTS.md — DeskLab

## Qué es DeskLab
DeskLab es el TFM del Master en AI Development de BigSchool: un ecommerce de
setups de escritorio, con una futura funcionalidad de IA para ayudar al usuario
a crear un setup personalizado.

## Objetivo del proyecto
Construir paso a paso una base sólida y evolutiva: catálogo, personalización de
setups, carrito/checkout, cuentas y, al final, integración de IA. Fase 1 es solo
inicialización y arquitectura, sin funcionalidades todavía.

## Stack tecnológico previsto
- Frontend: React + TypeScript + Vite
- Backend: Node.js + TypeScript + Fastify
- Base de datos: PostgreSQL + Prisma
- Styling frontend: Tailwind CSS
- Tests: Vitest
- Monorepo npm workspaces: `apps/web`, `apps/api`, `packages/shared`, `prisma/`, `docs/`

## Principios de desarrollo
- Mantener el proyecto simple.
- Evitar sobreingeniería.
- TypeScript estricto.
- Código mantenible y testeable.
- Separar frontend, backend y dominio.
- Priorizar una buena UX.
- No implementar funcionalidades que no hayan sido solicitadas.
- Antes de hacer cambios arquitectónicos importantes, explicar la decisión.
- Trabajar siempre de forma incremental.

## Project Roadmap
Construiremos el proyecto progresivamente, fase a fase:

1. Inicialización y arquitectura
2. Modelo de datos
3. Backend/API
4. Design system y frontend
5. Catálogo y productos
6. Setups y personalización
7. Carrito y checkout
8. Autenticación y cuenta
9. Integración de IA
10. Testing, calidad y documentación

No avanzar automáticamente a la siguiente fase sin confirmación explícita.
