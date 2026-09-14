import type { FastifyReply } from "fastify";

export type ErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "INVALID_SLOT"
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN";

export function sendError(
  reply: FastifyReply,
  status: 400 | 401 | 404 | 409,
  code: ErrorCode,
  message: string,
): unknown {
  return reply.code(status).send({ error: { code, message } });
}
