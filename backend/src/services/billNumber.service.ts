import { prisma } from "../config/prisma";

export async function getNextBillNumber(): Promise<string> {
  const sequence = await prisma.$transaction(
    async (tx) => {
      let row = await tx.billSequence.findUnique({
        where: {
          id: 1,
        },
      });

      if (!row) {
        row = await tx.billSequence.create({
          data: {
            id: 1,
            nextNumber: 2,
          },
        });

        return 1;
      }

      const currentNumber = row.nextNumber;

      await tx.billSequence.update({
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

  return `BILL-${String(sequence).padStart(5, "0")}`;
}