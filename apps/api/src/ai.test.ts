import { afterAll, describe, expect, it, vi } from "vitest";
import type { Product } from "@prisma/client";
import { buildApp } from "./app.js";
import {
  RecommendationError,
  recommendSetup,
  type LlmCall,
  type RecommendInput,
} from "./lib/ai.js";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    slug: "teclado-mecanico-75",
    name: "Teclado mecánico 75%",
    category: "Peripherals",
    slot: "Keyboard",
    styles: ["Minimal"],
    uses: ["Work"],
    priceCents: 12900,
    imageUrl: null,
    createdAt: new Date(),
    ...overrides,
  } as Product;
}

const catalog: Product[] = [
  product(),
  product({
    id: "m",
    slug: "monitor-27-4k",
    name: "Monitor 27 4K",
    category: "Monitors",
    slot: "Monitor",
    priceCents: 34900,
  }),
];

const input: RecommendInput = {
  use: "Work",
  style: "Minimal",
  space: "M",
  budgetCents: 100000,
};

describe("recommendSetup", () => {
  it("builds a virtual setup with DB prices and unique ai slug", async () => {
    const llm: LlmCall = async () => ({
      picks: [
        { slot: "Monitor", slug: "monitor-27-4k" },
        { slot: "Keyboard", slug: "teclado-mecanico-75" },
      ],
      explanation: "Equilibrio trabajo y calma.",
    });
    const result = await recommendSetup(input, catalog, llm);
    expect(result.setupSlug).toMatch(/^ai-/);
    expect(result.setup.totalCents).toBe(47800);
    expect(result.explanation).toBe("Equilibrio trabajo y calma.");
  });

  it("retries once on invented slug then fails with 502", async () => {
    const llm: LlmCall = async () => ({
      picks: [{ slot: "Keyboard", slug: "teclado-magico" }],
      explanation: "",
    });
    const spy = vi.fn(llm);
    await expect(recommendSetup(input, catalog, spy)).rejects.toThrow(
      RecommendationError,
    );
    expect(spy).toHaveBeenCalledTimes(2);
    try {
      await recommendSetup(input, catalog, async () => ({
        picks: [{ slot: "Keyboard", slug: "teclado-magico" }],
        explanation: "",
      }));
    } catch (err) {
      expect((err as RecommendationError).statusCode).toBe(502);
    }
  });

  it("rejects slot mismatch, duplicates and over-budget", async () => {
    const mismatch: LlmCall = async () => ({
      picks: [{ slot: "Mouse", slug: "teclado-mecanico-75" }],
      explanation: "",
    });
    await expect(recommendSetup(input, catalog, mismatch)).rejects.toThrow(
      /belongs to slot 'Keyboard'/,
    );
    const dup: LlmCall = async () => ({
      picks: [
        { slot: "Keyboard", slug: "teclado-mecanico-75" },
        { slot: "Keyboard", slug: "teclado-mecanico-75" },
      ],
      explanation: "",
    });
    await expect(recommendSetup(input, catalog, dup)).rejects.toThrow(
      /duplicated slot/,
    );
    const over: LlmCall = async () => ({
      picks: [{ slot: "Monitor", slug: "monitor-27-4k" }],
      explanation: "",
    });
    await expect(
      recommendSetup({ ...input, budgetCents: 100 }, catalog, over),
    ).rejects.toThrow(/exceeds budget/);
  });

  it("accepts correction on retry", async () => {
    let calls = 0;
    const llm: LlmCall = async () => {
      calls += 1;
      if (calls === 1) {
        return { picks: [{ slot: "Mouse", slug: "teclado-mecanico-75" }], explanation: "" };
      }
      return {
        picks: [{ slot: "Keyboard", slug: "teclado-mecanico-75" }],
        explanation: "Corregido.",
      };
    };
    const result = await recommendSetup(input, catalog, llm);
    expect(calls).toBe(2);
    expect(result.setup.items).toHaveLength(1);
  });
});
describe("POST /ai/recommend", () => { const app = buildApp(); afterAll(async () => { await app.close(); }); it("returns 400 for invalid body", async () => { const res = await app.inject({ method: "POST", url: "/ai/recommend", payload: { use: "Work" } }); expect(res.statusCode).toBe(400); });   it("returns 503 without API key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const res = await app.inject({
      method: "POST",
      url: "/ai/recommend",
      payload: { use: "Work", style: "Minimal", space: "M", budgetCents: 50000 },
    });
    vi.unstubAllEnvs();
    expect(res.statusCode).toBe(503);
    expect(res.json().error.code).toBe("AI_UNAVAILABLE");
  }); });
