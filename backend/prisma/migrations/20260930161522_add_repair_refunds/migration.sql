-- CreateTable
CREATE TABLE "RepairRefund" (
    "id" TEXT NOT NULL,
    "repairJobId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refundMethod" TEXT NOT NULL DEFAULT 'CASH',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairRefund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepairRefund_repairJobId_idx" ON "RepairRefund"("repairJobId");

-- CreateIndex
CREATE INDEX "RepairRefund_customerId_idx" ON "RepairRefund"("customerId");

-- CreateIndex
CREATE INDEX "RepairRefund_createdAt_idx" ON "RepairRefund"("createdAt");

-- AddForeignKey
ALTER TABLE "RepairRefund" ADD CONSTRAINT "RepairRefund_repairJobId_fkey" FOREIGN KEY ("repairJobId") REFERENCES "RepairJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairRefund" ADD CONSTRAINT "RepairRefund_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
