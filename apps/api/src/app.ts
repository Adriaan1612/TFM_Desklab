import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { db } from "./db.js";
import { authRoutes } from "./routes/auth.js";
import { productRoutes } from "./routes/products.js";
import { productRelationsRoutes } from "./routes/product-relations.js";
import { checkoutRoutes } from "./routes/checkout.js";
import { setupRoutes } from "./routes/setups.js";
import { substituteRoutes } from "./routes/substitutes.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  void app.register(cookie);
  void app.register(cors, {
    origin: process.env.WEB_URL ?? "http://localhost:5173",
    credentials: true,
  });

  app.get("/health", async () => {
    return { status: "ok", service: "desklab-api" };
  });

  void app.register(productRoutes);
  void app.register(authRoutes);
  void app.register(productRelationsRoutes);
  void app.register(checkoutRoutes);
  void app.register(setupRoutes);
  void app.register(substituteRoutes);

  app.addHook("onClose", async () => {
    await db.$disconnect();
  });

  return app;
}
