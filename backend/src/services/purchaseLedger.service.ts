import { prisma } from "../config/prisma";

export async function getPurchasePartyLedger() {
  const purchases = await prisma.purchase.findMany({
    include: {
      supplier: true,
      items: {
        include: {
          inventory: {
            include: {
              saleItems: {
                include: {
                  sale: {
                    include: {
                      customer: true,
                    },
                  },
                },
              },
              repairParts: {
                include: {
                  repairJob: {
                    include: {
                      customer: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      purchaseDate: "desc",
    },
  });

  return purchases;
}