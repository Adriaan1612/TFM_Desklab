import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import { db } from "./db.js";

const app = buildApp();

afterAll(async () => {
  await app.close();
});

function cookieOf(res: { headers: Record<string, unknown> }): string {
  const setCookie = res.headers["set-cookie"];
  const first = Array.isArray(setCookie) ? setCookie[0] : (setCookie as string);
  return String(first).split(";")[0] ?? "";
}

async function register(email: string): Promise<string> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}-${email}`;
  const res = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: { email: unique, name: "Test User", password: "password123" },
  });
  expect(res.statusCode).toBe(201);
  return cookieOf(res);
}

describe("auth", () => {
  it("registers, returns me and logs out", async () => {
    const cookie = await register("cuenta1@desklab.es");
    expect(cookie).toContain("desklab_session=");
    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().user.email).toContain("cuenta1@desklab.es");
    expect(me.json().user).not.toHaveProperty("passwordHash");
    const logout = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: { cookie },
    });
    expect(logout.statusCode).toBe(200);
    const after = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie },
    });
    expect(after.statusCode).toBe(401);
  });

  it("rejects duplicate email, short password and bad login", async () => {
    const dupEmail = `${Date.now()}-dup@desklab.es`;
    const first = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: dupEmail, name: "X", password: "password123" },
    });
    expect(first.statusCode).toBe(201);
    const dup = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: dupEmail, name: "X", password: "password123" },
    });
    expect(dup.statusCode).toBe(409);
    const short = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: "nuevo@desklab.es", name: "X", password: "corto" },
    });
    expect(short.statusCode).toBe(400);
    const wrong = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: dupEmail, password: "otra-clave" },
    });
    expect(wrong.statusCode).toBe(401);
    const unknown = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "nadie@desklab.es", password: "password123" },
    });
    expect(unknown.statusCode).toBe(401);
  });

  it("rejects me without session and expired sessions", async () => {
    const anon = await app.inject({ method: "GET", url: "/auth/me" });
    expect(anon.statusCode).toBe(401);
    const user = await db.user.create({
      data: {
        email: `${Date.now()}-caducada@desklab.es`,
        name: "X",
        passwordHash: "x",
      },
    });
    const expiredToken = `expired-${Date.now()}`;
    await db.session.create({
      data: {
        token: expiredToken,
        userId: user.id,
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: `desklab_session=${expiredToken}` },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("orders ownership", () => {
  it("links checkout to the session and isolates users", async () => {
    const cookieA = await register("a@desklab.es");
    const cookieB = await register("b@desklab.es");
    const prod = await app.inject({
      method: "GET",
      url: "/products/mini-planta",
    });
    const productId = prod.json().id as string;
    const created = await app.inject({
      method: "POST",
      url: "/checkout",
      headers: { cookie: cookieA },
      payload: {
        email: "a@desklab.es",
        name: "A",
        address: "Calle 1",
        city: "Madrid",
        postalCode: "28001",
        items: [{ productId, quantity: 1 }],
      },
    });
    expect(created.statusCode).toBe(201);
    const orderId = created.json().id as string;

    const mine = await app.inject({
      method: "GET",
      url: "/orders",
      headers: { cookie: cookieA },
    });
    expect(mine.statusCode).toBe(200);
    expect(mine.json().data.map((o: { id: string }) => o.id)).toContain(orderId);

    const other = await app.inject({
      method: "GET",
      url: "/orders",
      headers: { cookie: cookieB },
    });
    expect(other.json().data.map((o: { id: string }) => o.id)).not.toContain(
      orderId,
    );

    const forbidden = await app.inject({
      method: "GET",
      url: `/orders/${orderId}`,
      headers: { cookie: cookieB },
    });
    expect(forbidden.statusCode).toBe(404);

    const anon = await app.inject({ method: "GET", url: "/orders" });
    expect(anon.statusCode).toBe(401);
  });

  it("keeps guest orders accessible by id", async () => {
    const prod = await app.inject({
      method: "GET",
      url: "/products/mini-planta",
    });
    const created = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: {
        email: "invitado@desklab.es",
        name: "Invitado",
        address: "Calle 2",
        city: "Madrid",
        postalCode: "28002",
        items: [{ productId: prod.json().id, quantity: 1 }],
      },
    });
    const orderId = created.json().id as string;
    const res = await app.inject({ method: "GET", url: `/orders/${orderId}` });
    expect(res.statusCode).toBe(200);
  });
});
