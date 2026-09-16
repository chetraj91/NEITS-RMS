-- AlterTable
ALTER TABLE "SmsCampaignRecipient" ADD COLUMN "supplierId" TEXT;

-- AlterTable
ALTER TABLE "SmsMessageLog" ADD COLUMN "supplierId" TEXT;

-- CreateIndex
CREATE INDEX "SmsCampaignRecipient_supplierId_idx" ON "SmsCampaignRecipient"("supplierId");

-- CreateIndex
CREATE INDEX "SmsMessageLog_supplierId_idx" ON "SmsMessageLog"("supplierId");

-- AddForeignKey
ALTER TABLE "SmsMessageLog"
ADD CONSTRAINT "SmsMessageLog_supplierId_fkey"
FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCampaignRecipient"
ADD CONSTRAINT "SmsCampaignRecipient_supplierId_fkey"
FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
