import type { FastifyInstance } from "fastify";
import type { Order } from "@prisma/client";
import type { OrderDTO } from "@desklab/shared";
import { db } from "../db.js";
import { sendError } from "../lib/errors.js";
import { CheckoutSchema, zodMessage } from "../lib/validation.js";

export function toOrderDTO(
  order: Order & {
    items: Array<{
      productId: string;
      name: string;
      priceCents: number;
      quantity: number;
      setupSlug: string | null;
    }>;
  },
): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    name: order.name,
    totalCents: order.totalCents,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      priceCents: item.priceCents,
      quantity: item.quantity,
      setupSlug: item.setupSlug,
    })),
  };
}

export async function checkoutRoutes(app: FastifyInstance): Promise<void> {
  app.post("/checkout", async (req, reply) => {
    const parsed = CheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(reply, 400, "BAD_REQUEST", zodMessage(parsed.error));
    }
    const { email, name, address, city, postalCode, items } = parsed.data;

    const products = await db.product.findMany({
      where: { id: { in: [...new Set(items.map((i) => i.productId))] } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    const missing = items.find((i) => !byId.has(i.productId));
    if (missing) {
      return sendError(
        reply,
        404,
        "NOT_FOUND",
        `product '${missing.productId}' not found`,
      );
    }

    // Precios y total siempre desde la DB; los del cliente se ignoran.
    const lines = items.map((i) => {
      const p = byId.get(i.productId);
      if (!p) throw new Error("unreachable");
      return {
        productId: p.id,
        name: p.name,
        priceCents: p.priceCents,
        quantity: i.quantity,
        setupSlug: i.setupSlug ?? null,
      };
    });
    const totalCents = lines.reduce(
      (sum, l) => sum + l.priceCents * l.quantity,
      0,
    );

    const order = await db.order.create({
      data: {
        email,
        name,
        address,
        city,
        postalCode,
        totalCents,
        items: { create: lines },
      },
      include: { items: true },
    });
    return reply.code(201).send(toOrderDTO(order));
  });

  app.get("/orders/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      return sendError(reply, 404, "NOT_FOUND", `order '${id}' not found`);
    }
    return toOrderDTO(order);
  });
}
