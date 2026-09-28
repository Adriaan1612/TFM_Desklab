// Resolución de imágenes por convención slug → archivo.
// Sin mappings manuales: /img/products/<slug>.webp y /img/setups/<slug>.webp.

export function productImageUrl(
  imageUrl: string | null,
  slug: string,
): string {
  return imageUrl ?? `/img/products/${slug}.webp`;
}

export function setupImageUrl(slug: string): string {
  return `/img/setups/${slug}.webp`;
}
