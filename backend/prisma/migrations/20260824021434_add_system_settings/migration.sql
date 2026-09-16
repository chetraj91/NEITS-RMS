-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'system',
    "currency" TEXT NOT NULL DEFAULT 'NPR',
    "currencySymbol" TEXT NOT NULL DEFAULT 'Rs.',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kathmandu',
    "defaultWarrantyDays" INTEGER NOT NULL DEFAULT 0,
    "enableNotifications" BOOLEAN NOT NULL DEFAULT true,
    "allowNegativeStock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
