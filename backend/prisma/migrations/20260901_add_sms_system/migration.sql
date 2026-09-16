-- CreateTable
CREATE TABLE "SmsSetting" (
    "id" TEXT NOT NULL DEFAULT 'sms',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'SOCIAIR',
    "apiToken" TEXT,
    "senderId" TEXT,
    "apiBaseUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsMessageLog" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "repairJobId" TEXT,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "templateCode" TEXT,
    "provider" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "providerResponse" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsMessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsCampaignRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "customerId" TEXT,
    "phone" TEXT NOT NULL,
    "customerName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "providerResponse" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsCampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsTemplate_code_key" ON "SmsTemplate"("code");

-- CreateIndex
CREATE INDEX "SmsMessageLog_customerId_idx" ON "SmsMessageLog"("customerId");

-- CreateIndex
CREATE INDEX "SmsMessageLog_repairJobId_idx" ON "SmsMessageLog"("repairJobId");

-- CreateIndex
CREATE INDEX "SmsMessageLog_userId_idx" ON "SmsMessageLog"("userId");

-- CreateIndex
CREATE INDEX "SmsMessageLog_phone_idx" ON "SmsMessageLog"("phone");

-- CreateIndex
CREATE INDEX "SmsMessageLog_status_idx" ON "SmsMessageLog"("status");

-- CreateIndex
CREATE INDEX "SmsMessageLog_createdAt_idx" ON "SmsMessageLog"("createdAt");

-- CreateIndex
CREATE INDEX "SmsCampaign_createdById_idx" ON "SmsCampaign"("createdById");

-- CreateIndex
CREATE INDEX "SmsCampaign_status_idx" ON "SmsCampaign"("status");

-- CreateIndex
CREATE INDEX "SmsCampaign_createdAt_idx" ON "SmsCampaign"("createdAt");

-- CreateIndex
CREATE INDEX "SmsCampaignRecipient_campaignId_idx" ON "SmsCampaignRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "SmsCampaignRecipient_customerId_idx" ON "SmsCampaignRecipient"("customerId");

-- CreateIndex
CREATE INDEX "SmsCampaignRecipient_phone_idx" ON "SmsCampaignRecipient"("phone");

-- CreateIndex
CREATE INDEX "SmsCampaignRecipient_status_idx" ON "SmsCampaignRecipient"("status");

-- AddForeignKey
ALTER TABLE "SmsMessageLog"
ADD CONSTRAINT "SmsMessageLog_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessageLog"
ADD CONSTRAINT "SmsMessageLog_repairJobId_fkey"
FOREIGN KEY ("repairJobId") REFERENCES "RepairJob"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessageLog"
ADD CONSTRAINT "SmsMessageLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCampaign"
ADD CONSTRAINT "SmsCampaign_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCampaignRecipient"
ADD CONSTRAINT "SmsCampaignRecipient_campaignId_fkey"
FOREIGN KEY ("campaignId") REFERENCES "SmsCampaign"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCampaignRecipient"
ADD CONSTRAINT "SmsCampaignRecipient_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE SET NULL ON UPDATE CASCADE;