// @desklab/shared — contrato de la API (catálogo + setups).
//
// Estos tipos describen lo que la API promete devolver, no los modelos
// internos de Prisma. Se definen aquí de forma independiente para no acoplar
// el frontend al ORM: si la persistencia cambia, el contrato solo cambia
// cuando la API lo decide.

export type Category =
  | "Lighting"
  | "Organization"
  | "Peripherals"
  | "Monitors"
  | "Stands"
  | "Decoration";

export type Style = "Minimal" | "Natural" | "Dark" | "RGB";

export type Use = "Work" | "Gaming" | "Study" | "Streaming" | "Mixed";

export type Slot =
  | "Monitor"
  | "MonitorArm"
  | "Keyboard"
  | "Mouse"
  | "DeskMat"
  | "Lighting"
  | "Organization"
  | "Decoration";

export interface ProductDTO {
  id: string;
  slug: string;
  name: string;
  category: Category;
  /** Slot que ocupa el producto dentro de un setup (afinidad 1:1 MVP). */
  slot: Slot;
  styles: Style[];
  uses: Use[];
  /** Precio en céntimos para evitar errores de coma flotante. */
  priceCents: number;
  imageUrl: string | null;
}

export interface SetupItemDTO {
  slot: Slot;
  product: ProductDTO;
}

export interface SetupDTO {
  id: string;
  slug: string;
  name: string;
  use: Use;
  style: Style;
  items: SetupItemDTO[];
  /** Precio total calculado (suma de items). Nunca se persiste. */
  totalCents: number;
}

/** Suma el precio de los items. El total siempre se calcula, no se guarda. */
export function setupTotal(
  items: ReadonlyArray<{ product: { priceCents: number } }>,
): number {
  return items.reduce((sum, item) => sum + item.product.priceCents, 0);
}

/**
 * Un setup válido tiene como máximo un producto por slot.
 * Regla MVP: mismo slot = sustitución válida (simplificación deliberada,
 * no compatibilidad física universal — ver docs/data-model.md).
 */
export function hasUniqueSlots(
  items: ReadonlyArray<{ slot: Slot }>,
): boolean {
  const seen = new Set(items.map((item) => item.slot));
  return seen.size === items.length;
}

/**
 * Reemplaza el producto de un slot (inmutable). Valida que el producto
 * pertenezca al mismo slot (regla MVP). El total se recalcula aparte con
 * `setupTotal`; la personalización vive solo en memoria (sin persistencia).
 */
export function swapItem(
  items: ReadonlyArray<SetupItemDTO>,
  slot: Slot,
  product: ProductDTO,
): SetupItemDTO[] {
  if (product.slot !== slot) {
    throw new Error(
      `product '${product.slug}' does not belong to slot '${slot}'`,
    );
  }
  return items.map((item) =>
    item.slot === slot ? { slot, product } : item,
  );
}
