import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

const app = buildApp();

afterAll(async () => {
  await app.close();
});

describe("GET /products", () => {
  it("returns paginated catalog with pre-pagination total", async () => {
    const res = await app.inject({ method: "GET", url: "/products" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.total).toBe(32);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(20);
    expect(body.data).toHaveLength(20);
  });

  it("keeps total before pagination", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products?page=2&pageSize=3",
    });
    const body = res.json();
    expect(body.total).toBe(32);
    expect(body.page).toBe(2);
    expect(body.data).toHaveLength(3);
  });

  it("filters by category", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products?category=Lighting",
    });
    const body = res.json();
    expect(body.total).toBe(4);
    expect(body.data[0].slug).toBe("barra-luz-monitor");
  });

  it("filters by style and use", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products?style=Dark&use=Gaming",
    });
    const body = res.json();
    expect(body.total).toBe(14);
  });

  it("filters by price range", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products?minPriceCents=5000&maxPriceCents=10000",
    });
    const body = res.json();
    expect(body.total).toBe(9);
  });

  it("rejects pageSize over 50", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products?pageSize=51",
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("BAD_REQUEST");
  });

  it("rejects invalid enum and page", async () => {
    const badEnum = await app.inject({
      method: "GET",
      url: "/products?category=Nope",
    });
    expect(badEnum.statusCode).toBe(400);
    const badPage = await app.inject({
      method: "GET",
      url: "/products?page=0",
    });
    expect(badPage.statusCode).toBe(400);
  });
});

describe("GET /products/:slug", () => {
  it("returns the API contract without ORM leakage", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products/teclado-mecanico-75",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      id: expect.any(String),
      slug: "teclado-mecanico-75",
      name: "Teclado mecánico 75%",
      category: "Peripherals",
      slot: "Keyboard",
      styles: expect.arrayContaining(["Minimal", "Dark"]),
      uses: expect.arrayContaining(["Work", "Gaming"]),
      priceCents: 12900,
      imageUrl: null,
    });
  });

  it("returns 404 for unknown slug", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products/no-existe",
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe("NOT_FOUND");
  });
});

describe("GET /setups", () => {
  it("returns setups with calculated totals", async () => {
    const res = await app.inject({ method: "GET", url: "/setups" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toHaveLength(2);
    const calm = body.data.find((s: { slug: string }) => s.slug === "the-calm-desk");
    expect(calm.totalCents).toBe(62600);
    expect(calm.items).toHaveLength(6);
  });

  it("filters by use", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/setups?use=Gaming",
    });
    const body = res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].slug).toBe("night-shift");
    expect(body.data[0].totalCents).toBe(66100);
  });
});

describe("GET /products/:slug/setups", () => {
  it("returns setups containing the product", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products/teclado-mecanico-75/setups",
    });
    expect(res.statusCode).toBe(200);
    const slugs = res.json().data.map((s: { slug: string }) => s.slug);
    expect(slugs).toEqual(["night-shift", "the-calm-desk"]);
  });

  it("returns 404 for unknown slug", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products/no-existe/setups",
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("GET /products/:slug/substitutes", () => {
  it("returns same-slot products excluding itself", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products/teclado-mecanico-75/substitutes",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(
      body.data.every(
        (p: { slot: string; slug: string }) =>
          p.slot === "Keyboard" && p.slug !== "teclado-mecanico-75",
      ),
    ).toBe(true);
  });

  it("returns 404 for unknown slug", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/products/no-existe/substitutes",
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("GET /setups/:slug/substitutes", () => {
  it("returns same-slot candidates excluding the current product", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/setups/night-shift/substitutes?slot=Keyboard",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(
      body.data.every(
        (p: { slug: string }) => p.slug !== "teclado-mecanico-75",
      ),
    ).toBe(true);
  });

  it("returns 404 for unknown setup", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/setups/no-existe/substitutes?slot=Keyboard",
    });
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for missing, invalid or unused slot", async () => {
    const missing = await app.inject({
      method: "GET",
      url: "/setups/night-shift/substitutes",
    });
    expect(missing.statusCode).toBe(400);
    const invalid = await app.inject({
      method: "GET",
      url: "/setups/night-shift/substitutes?slot=Nope",
    });
    expect(invalid.statusCode).toBe(400);
    const unused = await app.inject({
      method: "GET",
      url: "/setups/night-shift/substitutes?slot=Decoration",
    });
    expect(unused.statusCode).toBe(400);
    expect(unused.json().error.code).toBe("INVALID_SLOT");
  });
});

describe("GET /setups/:slug", () => {
  it("returns items with slots and products", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/setups/night-shift",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.items).toHaveLength(5);
    expect(body.totalCents).toBe(66100);
    expect(body.items.map((i: { slot: string }) => i.slot)).toContain("MonitorArm");
  });

  it("returns 404 for unknown slug", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/setups/no-existe",
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe("NOT_FOUND");
  });
});
