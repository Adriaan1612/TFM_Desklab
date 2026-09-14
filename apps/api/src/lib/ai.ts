import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import type { Product } from "@prisma/client";
import {
  setupTotal,
  type SetupDTO,
  type Slot,
} from "@desklab/shared";
import { toProductDTO } from "./mappers.js";

export interface RecommendInput {
  use: string;
  style: string;
  space: "S" | "M" | "L";
  budgetCents: number;
  note?: string;
}

export interface LlmPick {
  slot: string;
  slug: string;
}

export type LlmCall = (
  system: string,
  user: string,
) => Promise<{ picks: LlmPick[]; explanation: string }>;

export class RecommendationError extends Error {
  readonly statusCode = 502;

  constructor(message: string) {
    super(message);
  }
}

const VALID_SLOTS: ReadonlySet<string> = new Set([
  "Monitor",
  "MonitorArm",
  "Keyboard",
  "Mouse",
  "DeskMat",
  "Lighting",
  "Organization",
  "Decoration",
]);

function buildPrompt(
  input: RecommendInput,
  products: Product[],
): { system: string; user: string } {
  const lines = products.map(
    (p) =>
      `- ${p.slug} | slot:${p.slot} | ${p.category} | estilos:${p.styles.join(",")} | usos:${p.uses.join(",")} | ${(p.priceCents / 100).toFixed(2)}€`,
  );
  const system = [
    "Eres el asesor de DeskLab, una tienda de setups de escritorio.",
    "Respondes SOLO con un JSON: {\"picks\": [{\"slot\": ..., \"slug\": ...}], \"explanation\": \"...\"}.",
    "Reglas duras: usa EXCLUSIVAMENTE slugs de la lista; un slot por setup como máximo;",
    "cada slug debe ir en el slot que indica su ficha; no inventes productos ni slots.",
    "Los precios son orientativos; el total lo calcula el sistema.",
  ].join(" ");
  const user = [
    `Uso: ${input.use}. Estilo: ${input.style}. Espacio: ${input.space}.`,
    `Presupuesto máximo: ${(input.budgetCents / 100).toFixed(2)}€.`,
    input.note ? `Preferencia: ${input.note}.` : "",
    "Catálogo:",
    ...lines,
  ].join("\n");
  return { system, user };
}

function validate(
  picks: LlmPick[],
  bySlug: Map<string, Product>,
  budgetCents: number,
): string | null {
  if (picks.length === 0) return "empty picks";
  const seen = new Set<string>();
  let total = 0;
  for (const pick of picks) {
    if (!VALID_SLOTS.has(pick.slot)) return `invalid slot '${pick.slot}'`;
    const product = bySlug.get(pick.slug);
    if (!product) return `unknown slug '${pick.slug}'`;
    if (product.slot !== pick.slot) {
      return `slug '${pick.slug}' belongs to slot '${product.slot}', not '${pick.slot}'`;
    }
    if (seen.has(pick.slot)) return `duplicated slot '${pick.slot}'`;
    seen.add(pick.slot);
    total += product.priceCents;
  }
  if (total > budgetCents) {
    return `total ${total} exceeds budget ${budgetCents}`;
  }
  return null;
}

export interface Recommendation {
  setup: SetupDTO;
  setupSlug: string;
  explanation: string;
}

export async function recommendSetup(
  input: RecommendInput,
  products: Product[],
  llm: LlmCall,
  maxAttempts = 2,
): Promise<Recommendation> {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const { system, user } = buildPrompt(input, products);
  let correction = "";
  let lastError = "no attempts";
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await llm(system, correction ? `${user}\nCorrección necesaria: ${correction}. Reintenta.` : user);
    const problem = validate(result.picks, bySlug, input.budgetCents);
    if (!problem) {
      const items = result.picks.map((pick) => {
        const product = bySlug.get(pick.slug);
        if (!product) throw new RecommendationError("unreachable");
        return { slot: pick.slot as Slot, product: toProductDTO(product) };
      });
      const setupSlug = `ai-${randomUUID()}`;
      return {
        setup: {
          id: setupSlug,
          slug: setupSlug,
          name: "Mi setup IA",
          use: input.use as SetupDTO["use"],
          style: input.style as SetupDTO["style"],
          items,
          totalCents: setupTotal(items),
        },
        setupSlug,
        explanation: result.explanation,
      };
    }
    lastError = problem;
    correction = problem;
  }
  throw new RecommendationError(`invalid recommendation: ${lastError}`);
}

export function createLlmCall(): LlmCall {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new RecommendationError("missing OPENAI_API_KEY");
  }
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  return async (system: string, user: string) => {
    const completion = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as {
      picks?: LlmPick[];
      explanation?: string;
    };
    return {
      picks: Array.isArray(parsed.picks) ? parsed.picks : [],
      explanation:
        typeof parsed.explanation === "string" ? parsed.explanation : "",
    };
  };
}
