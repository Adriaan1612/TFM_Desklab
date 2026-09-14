import type { FastifyInstance } from "fastify";
import { db } from "../db.js";
import { sendError } from "../lib/errors.js";
import {
  createLlmCall,
  RecommendationError,
  recommendSetup,
} from "../lib/ai.js";
import { RecommendSchema, zodMessage } from "../lib/validation.js";

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  app.post("/ai/recommend", async (req, reply) => {
    const parsed = RecommendSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(reply, 400, "BAD_REQUEST", zodMessage(parsed.error));
    }
    if (!process.env.OPENAI_API_KEY) {
      return sendError(reply, 503, "AI_UNAVAILABLE", "AI service not configured");
    }
    const products = await db.product.findMany({
      orderBy: { slug: "asc" },
    });
    try {
      const result = await recommendSetup(parsed.data, products, createLlmCall());
      return {
        setup: result.setup,
        setupSlug: result.setupSlug,
        explanation: result.explanation,
      };
    } catch (err) {
      if (err instanceof RecommendationError) {
        return sendError(reply, 502, "AI_INVALID", err.message);
      }
      // Errores del proveedor (429, auth, red, etc.): nunca se propagan
      // crudos al cliente (billing, API key, detalles internos).
      req.log.warn({ err }, "AI provider failed");
      return sendError(reply, 503, "AI_UNAVAILABLE", "AI service unavailable");
    }
  });
}
