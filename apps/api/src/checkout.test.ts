import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import { db } from "./db.js";

const app = buildApp();

afterAll(async () => {
  await app.close();
});

async function productId(slug: string): Promise<string> {
  const res = await app.inject({ method: "GET", url: `/products/${slug}` });
  return res.json().id as string;
}

function orderBody(productId: string, quantity = 1, last4 = "4242") {
  return {
    email: "test@desklab.es",
    name: "Test User",
    address: "Calle Mayor 1",
    city: "Madrid",
    postalCode: "28001",
    payment: { last4 },
    items: [{ productId, quantity }],
  };
}

describe("POST /checkout", () => {
  it("creates an order with server-side prices", async () => {
    const id = await productId("teclado-mecanico-75");
    const res = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: orderBody(id, 2),
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.orderNumber).toEqual(expect.any(Number));
    expect(body.totalCents).toBe(12900 * 2);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      productId: id,
      name: "Teclado mecánico 75%",
      priceCents: 12900,
      quantity: 2,
      setupSlug: null,
    });
  });

  it("keeps setup origin on lines", async () => {
    const id = await productId("raton-inalambrico");
    const res = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: {
        ...orderBody(id),
        items: [{ productId: id, quantity: 1, setupSlug: "night-shift" }],
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().items[0].setupSlug).toBe("night-shift");
  });

  it("rejects invalid email, empty items and bad quantities", async () => {
    const id = await productId("raton-inalambrico");
    const badEmail = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: { ...orderBody(id), email: "no-es-email" },
    });
    expect(badEmail.statusCode).toBe(400);
    const empty = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: { ...orderBody(id), items: [] },
    });
    expect(empty.statusCode).toBe(400);
    const badQty = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: {
        ...orderBody(id),
        items: [{ productId: id, quantity: 0 }],
      },
    });
    expect(badQty.statusCode).toBe(400);
  });

  it("returns 404 for unknown product", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: orderBody("producto-inexistente"),
    });
    expect(res.statusCode).toBe(404);
  });

  it("declines card ending 0002 with 402 and creates nothing", async () => {
    const id = await productId("raton-inalambrico");
    const before = await db.order.count();
    const res = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: orderBody(id, 1, "0002"),
    });
    expect(res.statusCode).toBe(402);
    expect(res.json().error.code).toBe("PAYMENT_DECLINED");
    expect(await db.order.count()).toBe(before);
  });

  it("rejects malformed last4 and stores no card data", async () => {    const id = await productId("raton-inalambrico");
    const bad = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: { ...orderBody(id), payment: { last4: "12" } },
    });
    expect(bad.statusCode).toBe(400);
    const ok = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: orderBody(id),
    });
    expect(ok.statusCode).toBe(201);
    expect(JSON.stringify(ok.json())).not.toContain("4242");
    const stored = await db.order.findUnique({
      where: { id: ok.json().id as string },
    });
    expect(stored).toBeTruthy();
    expect(JSON.stringify(stored)).not.toContain("4242");
  });

  it("requires a 5-digit spanish postal code", async () => {
    const id = await productId("raton-inalambrico");
    for (const postalCode of ["280", "280041", "28A04", "   ", ""]) {
      const res = await app.inject({
        method: "POST",
        url: "/checkout",
        payload: { ...orderBody(id), postalCode },
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error.message).toContain("postalCode");
    }
    const ok = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: { ...orderBody(id), postalCode: "28004" },
    });
    expect(ok.statusCode).toBe(201);
  });

  it("rejects whitespace-only fields and overlong names", async () => {
    const id = await productId("raton-inalambrico");
    const blank = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: { ...orderBody(id), name: "   " },
    });
    expect(blank.statusCode).toBe(400);
    expect(blank.json().error.message).toContain("name");
    const long = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: { ...orderBody(id), name: "x".repeat(121) },
    });
    expect(long.statusCode).toBe(400);
    const blankCity = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: { ...orderBody(id), city: "  " },
    });
    expect(blankCity.statusCode).toBe(400);
  });

  it("trims surrounding spaces in the email", async () => {
    const id = await productId("raton-inalambrico");
    const res = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: { ...orderBody(id), email: "  test@desklab.es  " },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().email).toBe("test@desklab.es");
  });
});

describe("GET /orders/:id", () => {
  it("returns the created order", async () => {
    const id = await productId("mini-planta");
    const created = await app.inject({
      method: "POST",
      url: "/checkout",
      payload: orderBody(id),
    });
    const orderId = created.json().id as string;
    const res = await app.inject({ method: "GET", url: `/orders/${orderId}` });
    expect(res.statusCode).toBe(200);
    expect(res.json().totalCents).toBe(1500);
  });

  it("returns 404 for unknown order", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/orders/no-existe",
    });
    expect(res.statusCode).toBe(404);
  });
});
