import { prisma } from "../config/prisma";

// =====================================================
// GET EXPENSES
// =====================================================

export async function getExpenses() {
  return prisma.expense.findMany({
    orderBy: {
      expenseDate: "desc",
    },
  });
}

// =====================================================
// CREATE EXPENSE
// =====================================================

export async function createExpense(
  data: any
) {
  const amount =
    Number(data.amount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Expense amount must be greater than zero."
    );
  }

  if (!data.title?.trim()) {
    throw new Error(
      "Expense title is required."
    );
  }

  const paymentMethod =
    String(
      data.paymentMethod ||
        "CASH"
    ).trim() || "CASH";

  return prisma.$transaction(
    async (tx) => {
      const expense =
        await tx.expense.create({
          data: {
            title:
              data.title.trim(),

            expenseDate:
              data.expenseDate
                ? new Date(
                    data.expenseDate
                  )
                : new Date(),

            category:
              data.category?.trim() ||
              null,

            amount,

            paymentMethod,

            remarks:
              data.remarks?.trim() ||
              null,
          },
        });

      // ===============================================
      // CASH BOOK
      // ===============================================

      await tx.cashBook.create({
        data: {
          particulars:
            `Expense - ${
              data.category || "Other"
            } - ${
              data.title
            } (${paymentMethod})`,

          debit:
            amount,

          credit: 0,

          balance: 0,
        },
      });

      return expense;
    }
  );
}