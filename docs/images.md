# Imágenes — Fase 12

> Las imágenes se generan aparte. Este documento fija estructura, nombres,
> relación con el catálogo y criterios visuales. Nada aquí genera imágenes.

## Estructura

```text
apps/web/public/img/
├── products/   # 32 WebP, uno por producto
└── setups/     # 6 WebP, uno por setup
```

Vite sirve `public/` en la raíz: `/img/products/<slug>.webp`.

## Convención de nombres

`<slug>.webp` exacto, sin mappings manuales:

- Producto → `/img/products/<product.slug>.webp` (el seed lo fija en
  `imageUrl`; el frontend usa `imageUrl` con fallback a la convención).
- Setup → `/img/setups/<setup.slug>.webp` (resuelto por
  `setupImageUrl(slug)`).

Formato WebP, ~1200px lado mayor, `loading="lazy"`, `alt` con el nombre.
Si el archivo falta o falla la carga, se muestra el placeholder con la
inicial (`ProductImage`/`SetupImage`).

## Tabla slug → archivo

### Productos (32)

| slug | archivo |
| --- | --- |
| monitor-27-4k | `products/monitor-27-4k.webp` |
| monitor-32-curvo | `products/monitor-32-curvo.webp` |
| monitor-24-fhd | `products/monitor-24-fhd.webp` |
| monitor-portatil-156 | `products/monitor-portatil-156.webp` |
| brazo-monitor-individual | `products/brazo-monitor-individual.webp` |
| soporte-dual | `products/soporte-dual.webp` |
| base-madera-monitor | `products/base-madera-monitor.webp` |
| teclado-mecanico-75 | `products/teclado-mecanico-75.webp` |
| teclado-minimal-blanco | `products/teclado-minimal-blanco.webp` |
| teclado-ergonomico | `products/teclado-ergonomico.webp` |
| teclado-rgb-tkl | `products/teclado-rgb-tkl.webp` |
| teclado-compacto-60 | `products/teclado-compacto-60.webp` |
| raton-inalambrico | `products/raton-inalambrico.webp` |
| raton-ergonomico-vertical | `products/raton-ergonomico-vertical.webp` |
| raton-gaming-rgb | `products/raton-gaming-rgb.webp` |
| raton-simetrico | `products/raton-simetrico.webp` |
| alfombrilla-fieltro | `products/alfombrilla-fieltro.webp` |
| alfombrilla-xl-negra | `products/alfombrilla-xl-negra.webp` |
| alfombrilla-corcho | `products/alfombrilla-corcho.webp` |
| lampara-escritorio-calida | `products/lampara-escritorio-calida.webp` |
| barra-luz-monitor | `products/barra-luz-monitor.webp` |
| tira-led-rgb | `products/tira-led-rgb.webp` |
| lampara-pie-arco | `products/lampara-pie-arco.webp` |
| bandeja-organizadora | `products/bandeja-organizadora.webp` |
| organizador-cajones-bambu | `products/organizador-cajones-bambu.webp` |
| soporte-auriculares | `products/soporte-auriculares.webp` |
| hub-usb-c | `products/hub-usb-c.webp` |
| mini-planta | `products/mini-planta.webp` |
| poster-abstracto | `products/poster-abstracto.webp` |
| figura-madera | `products/figura-madera.webp` |
| panel-acustico-hex | `products/panel-acustico-hex.webp` |
| reloj-minimal | `products/reloj-minimal.webp` |

### Setups (6)

| slug | archivo |
| --- | --- |
| the-calm-desk | `setups/the-calm-desk.webp` |
| night-shift | `setups/night-shift.webp` |
| the-study | `setups/the-study.webp` |
| the-creator | `setups/the-creator.webp` |
| green-corner | `setups/green-corner.webp` |
| rgb-focus | `setups/rgb-focus.webp` |

## Criterios visuales

- Luz natural, escritorios reales, mucho espacio negativo; afín a
  canvas `#FAF8F5`, ink `#1E1E1C`, moss `#7A8B6F`.
- Productos: objeto centrado sobre fondo neutro coherente por categoría,
  misma altura de horizonte y temperatura de color en todo el catálogo.
- Setups: escena completa del escritorio acorde a su estilo/uso
  (Minimal/Natural/Dark/RGB), sin estética gamer agresiva.
- Sin texto, logos ni marcas de agua dentro de la imagen.

## Prompts (para la generación posterior)

Base productos: `Minimalist editorial product photography of [PRODUCTO],
centered on a warm neutral background (#FAF8F5), soft natural daylight,
generous negative space, calm high-end e-commerce aesthetic, no text, no
watermark, photorealistic`.

Base setups: `Calm editorial photograph of a complete real desk setup,
[ESTILO] style for [USO], soft natural daylight, tidy and coherent space,
warm neutral tones, generous negative space, no aggressive gamer aesthetic,
no text, no watermark, photorealistic`.

Sustituir `[PRODUCTO]` por el nombre del producto y `[ESTILO]`/`[USO]` por
los del setup (p. ej. "Dark style for Gaming").
