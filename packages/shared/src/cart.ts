import type { ProductDTO } from "./catalog.js";

// Contrato del carrito (solo frontend: contexto + localStorage).
// El servidor nunca recibe precios: el checkout los calcula desde la DB.

export interface CartLine {
  product: ProductDTO;
  quantity: number;
  /** Setup origen si la línea viene de un setup personalizado. */
  setupSlug?: string;
}

function sameLine(a: CartLine, productId: string, setupSlug?: string): boolean {
  return a.product.id === productId && (a.setupSlug ?? undefined) === (setupSlug ?? undefined);
}

export function addLine(
  lines: ReadonlyArray<CartLine>,
  product: ProductDTO,
  setupSlug?: string,
): CartLine[] {
  const existing = lines.find((l) => sameLine(l, product.id, setupSlug));
  if (existing) {
    return lines.map((l) =>
      sameLine(l, product.id, setupSlug)
        ? { ...l, quantity: l.quantity + 1 }
        : l,
    );
  }
  return [...lines, { product, quantity: 1, ...(setupSlug ? { setupSlug } : {}) }];
}

export function removeLine(
  lines: ReadonlyArray<CartLine>,
  productId: string,
  setupSlug?: string,
): CartLine[] {
  return lines.filter((l) => !sameLine(l, productId, setupSlug));
}

export function setQty(
  lines: ReadonlyArray<CartLine>,
  productId: string,
  quantity: number,
  setupSlug?: string,
): CartLine[] {
  if (quantity <= 0) {
    return removeLine(lines, productId, setupSlug);
  }
  return lines.map((l) =>
    sameLine(l, productId, setupSlug) ? { ...l, quantity } : l,
  );
}

export function cartTotal(lines: ReadonlyArray<CartLine>): number {
  return lines.reduce(
    (sum, l) => sum + l.product.priceCents * l.quantity,
    0,
  );
}

export function cartCount(lines: ReadonlyArray<CartLine>): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
