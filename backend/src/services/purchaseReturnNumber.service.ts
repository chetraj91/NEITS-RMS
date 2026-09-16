import { prisma } from "../config/prisma";

export async function getNextPurchaseReturnNumber(): Promise<string> {
  const sequence = await prisma.$transaction(
    async (tx) => {
      let row =
        await tx.purchaseReturnSequence.findUnique({
          where: {
            id: 1,
          },
        });

      if (!row) {
        row =
          await tx.purchaseReturnSequence.create({
            data: {
              id: 1,
              nextNumber: 2,
            },
          });

        return 1;
      }

      const currentNumber =
        row.nextNumber;

      await tx.purchaseReturnSequence.update({
        where: {
          id: 1,
        },

        data: {
          nextNumber: {
            increment: 1,
          },
        },
      });

      return currentNumber;
    }
  );

  return `PR-${String(sequence).padStart(5, "0")}`;
}