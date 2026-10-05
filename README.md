# DeskLab

> Tu rincón, bien montado.

Ecommerce de setups de escritorio — TFM del Master en AI Development (BigSchool).

**Estado:** proyecto completo y estabilizado. Catálogo (32 productos con
imagen), 6 setups con personalización, carrito, checkout con pago simulado,
cuentas con pedidos propios y recomendador IA sobre catálogo real.
QA funcional cerrado en Fases 13.1–13.4.

## Funcionalidades

- **Catálogo**: 32 productos con filtros (categoría, estilo, uso),
  ordenación, paginación y estados de carga/error/vacío.
- **Setups**: 6 setups con sustitución por slot, total en vivo y
  aviso de personalización temporal.
- **Carrito**: persistente (`localStorage`), tope 99 uds./línea,
  aviso si los precios cambian antes de pagar.
- **Checkout**: 2 pasos con validación espejo frontend/backend
  (CP español de 5 dígitos, email con sugerencia anti-typos);
  pago **simulado** — `4242…` aprueba, terminada en `0002` rechaza
  (402) conservando el carrito. Sin cargos reales.
- **Cuenta**: registro/login por cookie HttpOnly, pedidos propios,
  logout robusto.
- **IA**: "Crear mi setup" guiado (uso, estilo, espacio, presupuesto, nota) con validación estricta contra catálogo real y manejo controlado de errores del proveedor.

## Stack

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
│   └── api/        # Fastify
├── packages/
│   └── shared/     # Tipos/utilidades compartidas (contrato API)
├── prisma/         # schema.prisma + migraciones + seed
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
npm run prisma:migrate
npm run prisma:seed
npm run dev:api   # http://localhost:3001/health
npm run dev:web   # http://localhost:5173
```

Sin `OPENAI_API_KEY` en `.env`, la IA responde 503 y la web muestra el
aviso correspondiente (el resto funciona igual).

## Verificación

```bash
npm run typecheck   # 3 workspaces
npm test            # API 50 · shared 16 · web 81
npm run build --workspace=@desklab/web
```

## Demo (2 minutos)

1. Home → entra en un setup destacado → personaliza un slot → añade al carrito.
2. Catálogo → filtra por estilo → entra en un producto → añade otro.
3. Checkout: paso 1 con código postal de 5 dígitos; paso 2 con
   `4242 4242 4242 4242` (aprueba) o terminada en `0002` (rechazo 402,
   el carrito se conserva).
4. `/registro` → `/cuenta`: crea una cuenta y comprueba la sección "Mis pedidos".
   Para que aparezca un pedido, realiza el checkout estando autenticado.
   

## Docs

- `docs/product.md` — alcance del producto (fuente única).
- `docs/architecture.md` — arquitectura y estado actual.
- `docs/data-model.md` — entidades, migraciones y seed.
- `docs/api.md` — endpoints, errores y validaciones.
- `docs/design-system.md` — tokens, primitivas y páginas.
- `docs/ai.md` — comportamiento de la IA.
- `docs/images.md` — convención de imágenes (38 WebP).
- `AGENTS.md` — reglas de trabajo y roadmap histórico.
