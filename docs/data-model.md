# Data model — TBD

> Estado: pendiente de su fase. No hay diseño definitivo todavía.
> `prisma/schema.prisma` sigue solo con datasource + generator.
> Taxonomías y alcance en `docs/product.md` (fuente única).

## Preguntas a resolver
- ¿Qué entidades mínimas cubren catálogo, setups, carrito/checkout y cuenta?
- ¿Categorías, estilos, usos y slots como enums o como tablas?
- ¿Cómo se modela la compatibilidad de sustitutos dentro de un slot?
- ¿El precio de un setup es calculado o guardado?
- ¿Setups guardados del usuario vs setups predefinidos: misma entidad o separadas?
- ¿Qué parte del cuestionario de “Crear mi setup” necesita persistencia?
