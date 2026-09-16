-- CreateTable
CREATE TABLE "ReceivingPrinterSetting" (
    "id" TEXT NOT NULL,
    "voucherPrinter" TEXT,
    "stickerPrinter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceivingPrinterSetting_pkey" PRIMARY KEY ("id")
);
