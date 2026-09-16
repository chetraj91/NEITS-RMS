import { prisma } from "../config/prisma";

export async function getDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const paymentsToday = await prisma.payment.aggregate({
    where: {
      createdAt: {
        gte: today,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // CashBook has no "type" field — expenses are recorded with debit > 0
  // (see expense.service.ts: debit: data.amount, credit: 0)
  const expensesToday = await prisma.cashBook.aggregate({
    where: {
      createdAt: {
        gte: today,
      },
      debit: {
        gt: 0,
      },
    },
    _sum: {
      debit: true,
    },
  });

  // RepairJob has no "dueAmount" — use balanceAmount instead
  const pendingPayment = await prisma.repairJob.aggregate({
    where: {
      balanceAmount: {
        gt: 0,
      },
    },
    _sum: {
      balanceAmount: true,
    },
  });

  const openRepair = await prisma.repairJob.count({
    where: {
      status: {
        not: "DELIVERED",
      },
    },
  });

  const readyRepair = await prisma.repairJob.count({
    where: {
      status: "READY",
    },
  });

  const deliveredToday = await prisma.repairJob.count({
    where: {
      status: "DELIVERED",
      updatedAt: {
        gte: today,
      },
    },
  });

  // RepairJob has no "estimate" — use estimatedCost instead
  const estimatePending = await prisma.repairJob.count({
    where: {
      estimatedCost: null,
    },
  });

  const lowStock = await prisma.inventory.count({
    where: {
      quantity: {
        lte: 2,
      },
    },
  });

  const recentJobs = await prisma.repairJob.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      jobNumber: true,
      brand: true,
      model: true,
      status: true,
      customer: {
        select: {
          fullName: true,
        },
      },
    },
  });

  // CashBook has no type/date/description/amount/paymentMode —
  // income entries are recorded with credit > 0
  const recentPayments = await prisma.cashBook.findMany({
    where: {
      credit: {
        gt: 0,
      },
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
      particulars: true,
      credit: true,
    },
  });

  const lowStockItems = await prisma.inventory.findMany({
    where: {
      quantity: {
        lte: 2,
      },
    },
    orderBy: {
      quantity: "asc",
    },
    select: {
      id: true,
      itemName: true,
      quantity: true,
      sellingPrice: true,
    },
  });

  return {
    todayCollection: paymentsToday._sum.amount ?? 0,
    todayExpense: expensesToday._sum.debit ?? 0,
    todayProfit:
      (paymentsToday._sum.amount ?? 0) -
      (expensesToday._sum.debit ?? 0),

    pendingPayment: pendingPayment._sum.balanceAmount ?? 0,

    openRepair,

    readyRepair,

    deliveredToday,

    estimatePending,

    lowStock,

    recentJobs,

    recentPayments,
    lowStockItems,
  };
}