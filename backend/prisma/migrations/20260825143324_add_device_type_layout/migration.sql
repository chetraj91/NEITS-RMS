-- CreateTable
CREATE TABLE "DeviceTypeLayout" (
    "id" TEXT NOT NULL,
    "deviceTypeId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "columnSpan" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "DeviceTypeLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceTypeLayout_deviceTypeId_fieldKey_key" ON "DeviceTypeLayout"("deviceTypeId", "fieldKey");

-- AddForeignKey
ALTER TABLE "DeviceTypeLayout" ADD CONSTRAINT "DeviceTypeLayout_deviceTypeId_fkey" FOREIGN KEY ("deviceTypeId") REFERENCES "DeviceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
