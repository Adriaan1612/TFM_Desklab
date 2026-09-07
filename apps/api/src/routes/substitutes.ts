import type { FastifyInstance } from "fastify";
import { db } from "../db.js";
import { sendError } from "../lib/errors.js";
import { toProductDTO } from "../lib/mappers.js";
import { SubstitutesQuerySchema, zodMessage } from "../lib/validation.js";

// Regla MVP: candidatos del mismo slot, excluyendo el producto actual.
// Sin lógica avanzada de compatibilidad (ver docs/data-model.md).
export async function substituteRoutes(app: FastifyInstance): Promise<void> {
  app.get("/setups/:slug/substitutes", async (req, reply) => {
    const parsed = SubstitutesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(reply, 400, "BAD_REQUEST", zodMessage(parsed.error));
    }
    const { slug } = req.params as { slug: string };
    const setup = await db.setup.findUnique({ where: { slug } });
    if (!setup) {
      return sendError(reply, 404, "NOT_FOUND", `setup '${slug}' not found`);
    }
    const current = await db.setupItem.findUnique({
      where: { setupId_slot: { setupId: setup.id, slot: parsed.data.slot } },
    });
    if (!current) {
      return sendError(
        reply,
        400,
        "INVALID_SLOT",
        `setup '${slug}' has no item in slot '${parsed.data.slot}'`,
      );
    }
    const candidates = await db.product.findMany({
      where: {
        slot: parsed.data.slot,
        id: { not: current.productId },
      },
      orderBy: { slug: "asc" },
    });
    return { data: candidates.map(toProductDTO) };
  });
}
