import { prisma } from "../config/prisma";

export async function getRepairInvoice(repairJobId: string) {
  const repairJob = await prisma.repairJob.findUnique({
    where: {
      id: repairJobId,
    },
    include: {
      customer: true,
      technician: true,
      partsUsed: {
        include: {
          inventory: true,
        },
      },
    },
  });

  if (!repairJob) {
    throw new Error("Repair Job not found.");
  }

  const partsTotal = repairJob.partsUsed.reduce(
    (sum, part) => sum + part.total,
    0
  );

  const labourCharge = repairJob.totalAmount || 0;

  const grandTotal = partsTotal + labourCharge;

  return {
    company: {
      name: "Nagmastha Enterprises",
      address: "New Road, Kathmandu",
      phone: "9800000000",
      email: "info@nagmastha.com",
    },

    repairJob,

    summary: {
      partsTotal,
      labourCharge,
      advance: repairJob.advance,
      due: repairJob.dueAmount,
      grandTotal,
    },
  };
}

export async function getSaleInvoice(saleId: string) {
  const sale = await prisma.sale.findUnique({
    where: {
      id: saleId,
    },
    include: {
      customer: true,
      saleItems: {
        include: {
          inventory: true,
        },
      },
    },
  });

  if (!sale) {
    throw new Error("Sale not found.");
  }

  return {
    company: {
      name: "Nagmastha Enterprises",
      address: "New Road, Kathmandu",
      phone: "9800000000",
      email: "info@nagmastha.com",
    },

    sale,
  };
}