import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  void app.register(cors, {
    origin: process.env.WEB_URL ?? "http://localhost:5173",
  });

  app.get("/health", async () => {
    return { status: "ok", service: "desklab-api" };
  });

  return app;
}
