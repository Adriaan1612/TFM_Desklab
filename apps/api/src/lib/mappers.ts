import type { Product, Setup, SetupItem } from "@prisma/client";
import {
  setupTotal,
  type ProductDTO,
  type SetupDTO,
  type SetupItemDTO,
} from "@desklab/shared";

export function toProductDTO(product: Product): ProductDTO {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    slot: product.slot,
    styles: [...product.styles],
    uses: [...product.uses],
    priceCents: product.priceCents,
    imageUrl: product.imageUrl,
  };
}

type SetupWithItems = Setup & {
  items: Array<SetupItem & { product: Product }>;
};

export function toSetupDTO(setup: SetupWithItems): SetupDTO {
  const items: SetupItemDTO[] = setup.items.map((item) => ({
    slot: item.slot,
    product: toProductDTO(item.product),
  }));
  return {
    id: setup.id,
    slug: setup.slug,
    name: setup.name,
    use: setup.use,
    style: setup.style,
    items,
    totalCents: setupTotal(items),
  };
}
