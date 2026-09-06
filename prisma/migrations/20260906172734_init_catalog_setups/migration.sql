-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Lighting', 'Organization', 'Peripherals', 'Monitors', 'Stands', 'Decoration');

-- CreateEnum
CREATE TYPE "Style" AS ENUM ('Minimal', 'Natural', 'Dark', 'RGB');

-- CreateEnum
CREATE TYPE "Use" AS ENUM ('Work', 'Gaming', 'Study', 'Streaming', 'Mixed');

-- CreateEnum
CREATE TYPE "Slot" AS ENUM ('Monitor', 'MonitorArm', 'Keyboard', 'Mouse', 'DeskMat', 'Lighting', 'Organization', 'Decoration');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "styles" "Style"[],
    "uses" "Use"[],
    "priceCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setup" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "use" "Use" NOT NULL,
    "style" "Style" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupItem" (
    "id" TEXT NOT NULL,
    "setupId" TEXT NOT NULL,
    "slot" "Slot" NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "SetupItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Setup_slug_key" ON "Setup"("slug");

-- CreateIndex
CREATE INDEX "Setup_use_idx" ON "Setup"("use");

-- CreateIndex
CREATE INDEX "Setup_style_idx" ON "Setup"("style");

-- CreateIndex
CREATE INDEX "SetupItem_productId_idx" ON "SetupItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "SetupItem_setupId_slot_key" ON "SetupItem"("setupId", "slot");

-- AddForeignKey
ALTER TABLE "SetupItem" ADD CONSTRAINT "SetupItem_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "Setup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupItem" ADD CONSTRAINT "SetupItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
