-- AlterTable: add slot as nullable, backfill from existing slugs, then NOT NULL.
ALTER TABLE "Product" ADD COLUMN "slot" "Slot";

UPDATE "Product" SET "slot" = 'Monitor' WHERE "slug" = 'monitor-27-4k';
UPDATE "Product" SET "slot" = 'MonitorArm' WHERE "slug" = 'brazo-monitor-individual';
UPDATE "Product" SET "slot" = 'Keyboard' WHERE "slug" = 'teclado-mecanico-75';
UPDATE "Product" SET "slot" = 'Mouse' WHERE "slug" = 'raton-inalambrico';
UPDATE "Product" SET "slot" = 'DeskMat' WHERE "slug" = 'alfombrilla-fieltro';
UPDATE "Product" SET "slot" = 'Lighting' WHERE "slug" = 'lampara-escritorio-calida';
UPDATE "Product" SET "slot" = 'Organization' WHERE "slug" = 'bandeja-organizadora';
UPDATE "Product" SET "slot" = 'Decoration' WHERE "slug" = 'mini-planta';

ALTER TABLE "Product" ALTER COLUMN "slot" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Product_slot_idx" ON "Product"("slot");
