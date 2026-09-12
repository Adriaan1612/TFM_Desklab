// Contrato de pedidos (invitado). El servidor calcula precios y total;
// el cliente solo envía identificadores y cantidades.

export interface OrderItemDTO {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  setupSlug: string | null;
}

export interface OrderDTO {
  id: string;
  orderNumber: number;
  email: string;
  name: string;
  totalCents: number;
  createdAt: string;
  items: OrderItemDTO[];
}
