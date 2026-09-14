# AI — Fase 9 ("Crear mi setup")

Flujo guiado, nunca chatbot. La IA recomienda exclusivamente productos
reales del catálogo; nunca los inventa.

## Entrada

Cuestionario (`POST /ai/recommend`): `use`, `style`, `space` (S/M/L),
`budgetCents` y `note?` libre. Sin persistencia del cuestionario.

## Grounding y validador estricto

- El prompt incluye el catálogo (slug, slot, categoría, estilos, usos y
  precio orientativo) y exige JSON `{ picks: [{slot, slug}], explanation }`.
- OpenAI (`gpt-4o-mini` por defecto, `OPENAI_MODEL`) solo devuelve
  slugs/slots: precios y total se calculan siempre desde PostgreSQL.
- El validador comprueba: slug existente, slot válido, coincidencia con el
  slot real en BD, sin duplicados y total ≤ presupuesto. Un único reintento
  con corrección; si persiste, 502 controlado. Sin `OPENAI_API_KEY` → 503.

## Salida

Setup virtual (`id`/`slug` `ai-<uuid>`, no persistido) con items, total y
`explanation`. Se comporta como un setup normal: personalizable y comprable
(sus líneas llevan el `setupSlug` virtual). Clave nunca en código, logs,
tests ni commits.
