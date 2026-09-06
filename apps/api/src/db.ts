import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __desklabPrisma?: PrismaClient;
};

export const db: PrismaClient =
  globalForPrisma.__desklabPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__desklabPrisma = db;
}
