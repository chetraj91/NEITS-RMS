-- CreateTable
CREATE TABLE "SalesReturnSequence" (
    "id" INTEGER NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesReturnSequence_pkey" PRIMARY KEY ("id")
);
