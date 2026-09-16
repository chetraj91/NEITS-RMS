CREATE TABLE "FeedbackSetting" (
    "id" TEXT NOT NULL DEFAULT 'feedback',
    "feedbackPageUrl" TEXT,
    "websiteUrl" TEXT,
    "facebookPageUrl" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackSetting_pkey" PRIMARY KEY ("id")
);
