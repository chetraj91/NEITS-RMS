-- CreateTable
CREATE TABLE "ReceivingPrintLayoutField" (
    "id" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "columnSpan" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceivingPrintLayoutField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceivingPrintSetting" (
    "id" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "widthMm" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "heightMm" DOUBLE PRECISION NOT NULL DEFAULT 35,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceivingPrintSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReceivingPrintLayoutField_documentType_fieldKey_key" ON "ReceivingPrintLayoutField"("documentType", "fieldKey");

-- CreateIndex
CREATE UNIQUE INDEX "ReceivingPrintSetting_documentType_key" ON "ReceivingPrintSetting"("documentType");
