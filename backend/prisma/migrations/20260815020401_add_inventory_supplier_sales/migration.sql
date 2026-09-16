/*
  Warnings:

  - You are about to drop the column `reorderLevel` on the `Inventory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "reorderLevel",
ADD COLUMN     "minimumStock" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Inventory_supplierId_idx" ON "Inventory"("supplierId");

-- CreateIndex
CREATE INDEX "Inventory_itemType_idx" ON "Inventory"("itemType");

-- CreateIndex
CREATE INDEX "Inventory_category_idx" ON "Inventory"("category");
