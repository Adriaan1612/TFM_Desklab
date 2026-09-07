import type { FastifyInstance } from "fastify";
import { db } from "../db.js";
import { sendError } from "../lib/errors.js";
import { toSetupDTO } from "../lib/mappers.js";
import { SetupsQuerySchema, zodMessage } from "../lib/validation.js";

const setupInclude = {
  items: {
    include: { product: true },
    orderBy: { slot: "asc" as const },
  },
};

export async function setupRoutes(app: FastifyInstance): Promise<void> {
  app.get("/setups", async (req, reply) => {
    const parsed = SetupsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(reply, 400, "BAD_REQUEST", zodMessage(parsed.error));
    }
    const setups = await db.setup.findMany({
      where: {
        ...(parsed.data.use ? { use: parsed.data.use } : {}),
        ...(parsed.data.style ? { style: parsed.data.style } : {}),
      },
      include: setupInclude,
      orderBy: { slug: "asc" },
    });
    return { data: setups.map(toSetupDTO) };
  });

  app.get("/setups/:slug", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const setup = await db.setup.findUnique({
      where: { slug },
      include: setupInclude,
    });
    if (!setup) {
      return sendError(reply, 404, "NOT_FOUND", `setup '${slug}' not found`);
    }
    return toSetupDTO(setup);
  });
}
