import type { FastifyInstance } from "fastify";
import { db } from "../db.js";
import { sendError } from "../lib/errors.js";
import { toProductDTO, toSetupDTO } from "../lib/mappers.js";

const setupInclude = {
  items: {
    include: { product: true },
    orderBy: { slot: "asc" as const },
  },
};

export async function productRelationsRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/products/:slug/setups", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const product = await db.product.findUnique({ where: { slug } });
    if (!product) {
      return sendError(reply, 404, "NOT_FOUND", `product '${slug}' not found`);
    }
    const setups = await db.setup.findMany({
      where: { items: { some: { productId: product.id } } },
      include: setupInclude,
      orderBy: { slug: "asc" },
    });
    return { data: setups.map(toSetupDTO) };
  });

  app.get("/products/:slug/substitutes", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const product = await db.product.findUnique({ where: { slug } });
    if (!product) {
      return sendError(reply, 404, "NOT_FOUND", `product '${slug}' not found`);
    }
    const candidates = await db.product.findMany({
      where: { slot: product.slot, id: { not: product.id } },
      orderBy: { slug: "asc" },
    });
    return { data: candidates.map(toProductDTO) };
  });
}
