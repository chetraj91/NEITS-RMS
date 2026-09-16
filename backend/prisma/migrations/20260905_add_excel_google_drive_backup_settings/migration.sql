-- AlterTable
ALTER TABLE "CompanySettings"
ADD COLUMN "excelBackupEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "googleDriveEmail" TEXT,
ADD COLUMN "googleDriveFolderId" TEXT,
ADD COLUMN "repairExcelEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "salesExcelEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "purchaseExcelEnabled" BOOLEAN NOT NULL DEFAULT true;
