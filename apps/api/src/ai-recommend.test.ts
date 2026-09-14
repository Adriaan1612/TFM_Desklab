import { afterAll, describe, expect, it, vi } from "vitest";

const { mockLlmCall } = vi.hoisted(() => ({ mockLlmCall: vi.fn() }));

vi.mock("./lib/ai.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./lib/ai.js")>();
  return { ...actual, createLlmCall: () => mockLlmCall };
});

import { buildApp } from "./app.js";

const app = buildApp();

afterAll(async () => {
  await app.close();
});

const validBody = {
  use: "Work",
  style: "Minimal",
  space: "M",
  budgetCents: 100000,
};

describe("POST /ai/recommend (mocked provider)", () => {
  it("returns a virtual ai-* setup with real catalog prices", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    mockLlmCall.mockResolvedValue({
      picks: [
        { slot: "Monitor", slug: "monitor-27-4k" },
        { slot: "Keyboard", slug: "teclado-mecanico-75" },
      ],
      explanation: "Equilibrio para trabajar.",
    });
    const res = await app.inject({
      method: "POST",
      url: "/ai/recommend",
      payload: validBody,
    });
    vi.unstubAllEnvs();
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.setupSlug).toMatch(/^ai-/);
    expect(body.setup.slug).toBe(body.setupSlug);
    // Precios siempre desde PostgreSQL, nunca del LLM.
    expect(body.setup.totalCents).toBe(34900 + 12900);
    expect(body.setup.items).toHaveLength(2);
    expect(body.explanation).toBe("Equilibrio para trabajar.");
  });

  it("maps provider 429 to controlled 503 without leaking details", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    mockLlmCall.mockRejectedValue(
      Object.assign(
        new Error(
          "429 Rate limit exceeded. Billing hard limit reached. sk-secret.",
        ),
        { status: 429 },
      ),
    );
    const res = await app.inject({
      method: "POST",
      url: "/ai/recommend",
      payload: validBody,
    });
    vi.unstubAllEnvs();
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({
      error: { code: "AI_UNAVAILABLE", message: "AI service unavailable" },
    });
    expect(res.body).not.toContain("Billing");
    expect(res.body).not.toContain("sk-secret");
  });

  it("maps generic provider errors to 503", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    mockLlmCall.mockRejectedValue(new Error("socket hang up"));
    const res = await app.inject({
      method: "POST",
      url: "/ai/recommend",
      payload: validBody,
    });
    vi.unstubAllEnvs();
    expect(res.statusCode).toBe(503);
    expect(res.json().error.code).toBe("AI_UNAVAILABLE");
  });
});
