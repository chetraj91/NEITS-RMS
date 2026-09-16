import { prisma } from "../config/prisma";

export async function getNextSalesReturnNumber(): Promise<string> {
  const sequence = await prisma.$transaction(
    async (tx) => {
      let row = await tx.salesReturnSequence.findUnique({
        where: {
          id: 1,
        },
      });

      if (!row) {
        row = await tx.salesReturnSequence.create({
          data: {
            id: 1,
            nextNumber: 2,
          },
        });

        return 1;
      }

      const currentNumber = row.nextNumber;

      await tx.salesReturnSequence.update({
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

  return `SR-${String(sequence).padStart(5, "0")}`;
}