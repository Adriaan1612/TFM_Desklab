// Seed mínimo — Fase 2/3. Solo catálogo + setups de lectura.
// 8 productos y 2 setups para validar relaciones. El catálogo completo
// (30–40 productos) llega en la fase de Productos.
// Fuera de alcance: User, Cart, Order, SavedSetup, cuestionario IA.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main(): Promise<void> {
  const products = [
    {
      slug: "monitor-27-4k",
      name: "Monitor 27 4K",
      category: "Monitors",
      slot: "Monitor",
      styles: ["Minimal", "Dark"],
      uses: ["Work", "Gaming", "Study"],
      priceCents: 34900,
    },
    {
      slug: "brazo-monitor-individual",
      name: "Brazo de monitor individual",
      category: "Stands",
      slot: "MonitorArm",
      styles: ["Minimal", "Dark"],
      uses: ["Work", "Gaming"],
      priceCents: 8900,
    },
    {
      slug: "teclado-mecanico-75",
      name: "Teclado mecánico 75%",
      category: "Peripherals",
      slot: "Keyboard",
      styles: ["Minimal", "Dark"],
      uses: ["Work", "Gaming"],
      priceCents: 12900,
    },
    {
      slug: "raton-inalambrico",
      name: "Ratón inalámbrico",
      category: "Peripherals",
      slot: "Mouse",
      styles: ["Minimal", "Dark"],
      uses: ["Work", "Gaming", "Study"],
      priceCents: 5900,
    },
    {
      slug: "alfombrilla-fieltro",
      name: "Alfombrilla de fieltro",
      category: "Peripherals",
      slot: "DeskMat",
      styles: ["Minimal", "Natural"],
      uses: ["Work", "Study"],
      priceCents: 3500,
    },
    {
      slug: "lampara-escritorio-calida",
      name: "Lámpara de escritorio cálida",
      category: "Lighting",
      slot: "Lighting",
      styles: ["Minimal", "Natural"],
      uses: ["Work", "Study"],
      priceCents: 4500,
    },
    {
      slug: "bandeja-organizadora",
      name: "Bandeja organizadora",
      category: "Organization",
      slot: "Organization",
      styles: ["Minimal", "Natural"],
      uses: ["Work", "Study"],
      priceCents: 2900,
    },
    {
      slug: "mini-planta",
      name: "Mini planta",
      category: "Decoration",
      slot: "Decoration",
      styles: ["Natural", "Minimal"],
      uses: ["Work", "Study"],
      priceCents: 1500,
    },
  ] as const;

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        slot: p.slot,
        priceCents: p.priceCents,
        styles: { set: [...p.styles] },
        uses: { set: [...p.uses] },
      },
      create: {
        slug: p.slug,
        name: p.name,
        category: p.category,
        slot: p.slot,
        styles: { set: [...p.styles] },
        uses: { set: [...p.uses] },
        priceCents: p.priceCents,
      },
    });
  }

  const setups = [
    {
      slug: "the-calm-desk",
      name: "The Calm Desk",
      use: "Work",
      style: "Minimal",
      items: [
        { slot: "Monitor", productSlug: "monitor-27-4k" },
        { slot: "Keyboard", productSlug: "teclado-mecanico-75" },
        { slot: "Mouse", productSlug: "raton-inalambrico" },
        { slot: "Lighting", productSlug: "lampara-escritorio-calida" },
        { slot: "Organization", productSlug: "bandeja-organizadora" },
        { slot: "Decoration", productSlug: "mini-planta" },
      ],
    },
    {
      slug: "night-shift",
      name: "Night Shift",
      use: "Gaming",
      style: "Dark",
      items: [
        { slot: "Monitor", productSlug: "monitor-27-4k" },
        { slot: "MonitorArm", productSlug: "brazo-monitor-individual" },
        { slot: "Keyboard", productSlug: "teclado-mecanico-75" },
        { slot: "Mouse", productSlug: "raton-inalambrico" },
        { slot: "DeskMat", productSlug: "alfombrilla-fieltro" },
      ],
    },
  ] as const;

  for (const s of setups) {
    const setup = await db.setup.upsert({
      where: { slug: s.slug },
      update: { name: s.name },
      create: { slug: s.slug, name: s.name, use: s.use, style: s.style },
    });
    await db.setupItem.deleteMany({ where: { setupId: setup.id } });
    for (const item of s.items) {
      const product = await db.product.findUniqueOrThrow({
        where: { slug: item.productSlug },
      });
      await db.setupItem.create({
        data: { setupId: setup.id, slot: item.slot, productId: product.id },
      });
    }
  }
}

try {
  await main();
} finally {
  await db.$disconnect();
}
