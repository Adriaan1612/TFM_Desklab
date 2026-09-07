import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { db } from "../db.js";
import { sendError } from "../lib/errors.js";
import { toProductDTO } from "../lib/mappers.js";
import { ProductsQuerySchema, zodMessage } from "../lib/validation.js";

export async function productRoutes(app: FastifyInstance): Promise<void> {
  app.get("/products", async (req, reply) => {
    const parsed = ProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(reply, 400, "BAD_REQUEST", zodMessage(parsed.error));
    }
    const {
      category,
      style,
      use,
      minPriceCents,
      maxPriceCents,
      page,
      pageSize,
    } = parsed.data;

    const where: Prisma.ProductWhereInput = {
      ...(category ? { category } : {}),
      ...(style ? { styles: { has: style } } : {}),
      ...(use ? { uses: { has: use } } : {}),
      ...(minPriceCents !== undefined || maxPriceCents !== undefined
        ? {
            priceCents: {
              ...(minPriceCents !== undefined ? { gte: minPriceCents } : {}),
              ...(maxPriceCents !== undefined ? { lte: maxPriceCents } : {}),
            },
          }
        : {}),
    };

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: { slug: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: products.map(toProductDTO),
      page,
      pageSize,
      total,
    };
  });

  app.get("/products/:slug", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const product = await db.product.findUnique({ where: { slug } });
    if (!product) {
      return sendError(reply, 404, "NOT_FOUND", `product '${slug}' not found`);
    }
    return toProductDTO(product);
  });
}
