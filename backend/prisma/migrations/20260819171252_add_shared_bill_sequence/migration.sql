-- CreateTable
CREATE TABLE "BillSequence" (
    "id" INTEGER NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillSequence_pkey" PRIMARY KEY ("id")
);
