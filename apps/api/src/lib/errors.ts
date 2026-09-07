import type { FastifyReply } from "fastify";

export type ErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "INVALID_SLOT";

export function sendError(
  reply: FastifyReply,
  status: 400 | 404,
  code: ErrorCode,
  message: string,
): unknown {
  return reply.code(status).send({ error: { code, message } });
}
