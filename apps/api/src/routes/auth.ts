import type { FastifyInstance } from "fastify";
import { db } from "../db.js";
import { sendError } from "../lib/errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  clearSessionCookie,
  createSession,
  resolveUser,
  setSessionCookie,
} from "../lib/session.js";
import { LoginSchema, RegisterSchema, zodMessage } from "../lib/validation.js";

function publicUser(user: {
  id: string;
  email: string;
  name: string;
}): { id: string; email: string; name: string } {
  return { id: user.id, email: user.email, name: user.name };
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/auth/register", async (req, reply) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(reply, 400, "BAD_REQUEST", zodMessage(parsed.error));
    }
    const email = parsed.data.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(reply, 409, "EMAIL_TAKEN", "email already registered");
    }
    const user = await db.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash: await hashPassword(parsed.data.password),
      },
    });
    setSessionCookie(reply, await createSession(user.id));
    return reply.code(201).send({ user: publicUser(user) });
  });

  app.post("/auth/login", async (req, reply) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(reply, 400, "BAD_REQUEST", zodMessage(parsed.error));
    }
    const user = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return sendError(reply, 401, "INVALID_CREDENTIALS", "invalid email or password");
    }
    setSessionCookie(reply, await createSession(user.id));
    return { user: publicUser(user) };
  });

  app.post("/auth/logout", async (req, reply) => {
    const token = req.cookies?.["desklab_session"];
    if (token) {
      await db.session.deleteMany({ where: { token } });
    }
    clearSessionCookie(reply);
    return { ok: true };
  });

  app.get("/auth/me", async (req, reply) => {
    const user = await resolveUser(req);
    if (!user) {
      return sendError(reply, 401, "UNAUTHENTICATED", "no active session");
    }
    return { user: publicUser(user) };
  });
}
