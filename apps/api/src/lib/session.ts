import type { FastifyReply, FastifyRequest } from "fastify";
import type { User } from "@prisma/client";
import { db } from "../db.js";
import { newSessionToken } from "./password.js";

export const SESSION_COOKIE = "desklab_session";
const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

function cookieOptions(maxAge?: number) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    // En producción servir siempre tras HTTPS con COOKIE_SECURE=true.
    secure: process.env.COOKIE_SECURE === "true",
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = newSessionToken();
  await db.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + THIRTY_DAYS_SECONDS * 1000),
    },
  });
  return token;
}

export function setSessionCookie(reply: FastifyReply, token: string): void {
  reply.setCookie(SESSION_COOKIE, token, cookieOptions(THIRTY_DAYS_SECONDS));
}

export function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(SESSION_COOKIE, cookieOptions());
}

export async function resolveUser(
  req: FastifyRequest,
): Promise<User | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return session.user;
}
