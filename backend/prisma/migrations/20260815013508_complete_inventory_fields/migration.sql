-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('PRODUCT', 'SPARE_PART', 'CONSUMABLE');

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "itemType" "InventoryType" NOT NULL DEFAULT 'SPARE_PART',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active',
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'PCS';
