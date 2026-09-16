import type { FastifyReply } from "fastify";

export type ErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "INVALID_SLOT"
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "PAYMENT_DECLINED"
  | "AI_UNAVAILABLE"
  | "AI_INVALID";

export function sendError(
  reply: FastifyReply,
  status: 400 | 401 | 402 | 404 | 409 | 502 | 503,
  code: ErrorCode,
  message: string,
): unknown {
  return reply.code(status).send({ error: { code, message } });
}
