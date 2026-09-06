# DeskLab

Ecommerce de setups de escritorio — TFM del Master en AI Development (BigSchool).

**Objetivo:** permitir a los usuarios explorar, personalizar y comprar setups de
escritorio, con una futura funcionalidad de IA que ayude a crear un setup
personalizado según necesidades, espacio y presupuesto.

> Fase 1: solo inicialización y arquitectura. Sin ecommerce, autenticación, IA,
> catálogo, checkout ni lógica de negocio todavía.

## Stack previsto

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + TypeScript + Fastify
- **DB:** PostgreSQL + Prisma
- **Styling:** Tailwind CSS
- **Tests:** Vitest
- **Monorepo:** npm workspaces

## Estructura

```text
desklab/
├── apps/
│   ├── web/        # React + Vite + Tailwind
│   └── api/        # Fastify (GET /health)
├── packages/
│   └── shared/     # Tipos/utilidades compartidas (placeholder)
├── prisma/         # schema.prisma sin modelos (fase 2)
├── docs/           # arquitectura y decisiones
├── AGENTS.md
├── README.md
├── docker-compose.yml  # Postgres 16
├── package.json
└── .gitignore
```

## Arranque rápido

```bash
cp .env.example .env
docker-compose up -d
npm install
npm run dev:api   # http://localhost:3001/health
npm run dev:web   # http://localhost:5173
```

## Roadmap

Ver `AGENTS.md` → Project Roadmap (10 fases, construcción progresiva).
