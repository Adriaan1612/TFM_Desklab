import { z } from "zod";

export const CategorySchema = z.enum([
  "Lighting",
  "Organization",
  "Peripherals",
  "Monitors",
  "Stands",
  "Decoration",
]);

export const StyleSchema = z.enum(["Minimal", "Natural", "Dark", "RGB"]);

export const UseSchema = z.enum(["Work", "Gaming", "Study", "Streaming", "Mixed"]);

export const SlotSchema = z.enum([
  "Monitor",
  "MonitorArm",
  "Keyboard",
  "Mouse",
  "DeskMat",
  "Lighting",
  "Organization",
  "Decoration",
]);

const priceCents = z.coerce.number().int().min(0);

export const ProductsQuerySchema = z.object({
  category: CategorySchema.optional(),
  style: StyleSchema.optional(),
  use: UseSchema.optional(),
  minPriceCents: priceCents.optional(),
  maxPriceCents: priceCents.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const SetupsQuerySchema = z.object({
  use: UseSchema.optional(),
  style: StyleSchema.optional(),
});

export const SubstitutesQuerySchema = z.object({
  slot: SlotSchema,
});

export const CheckoutSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(1).max(20),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
        setupSlug: z.string().min(1).max(120).optional(),
      }),
    )
    .min(1)
    .max(100),
});

export const RegisterSchema = z.object({
  email: z.email().max(160),
  name: z.string().trim().min(1).max(120),
  password: z
    .string()
    .min(8)
    .max(200)
    .regex(/[a-z]/, "password needs a lowercase letter")
    .regex(/[A-Z]/, "password needs an uppercase letter")
    .regex(/\d/, "password needs a number"),
});

export const LoginSchema = z.object({
  email: z.email().max(160),
  password: z.string().min(1).max(200),
});

export function zodMessage(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "query";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}
