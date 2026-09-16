import { prisma } from "../config/prisma";

const DEFAULT_PAYMENT_METHODS = [
  {
    name: "Cash",
    code: "CASH",
    sortOrder: 1,
  },
  {
    name: "Bank",
    code: "BANK",
    sortOrder: 2,
  },
  {
    name: "Card",
    code: "CARD",
    sortOrder: 3,
  },
  {
    name: "eSewa",
    code: "ESEWA",
    sortOrder: 4,
  },
  {
    name: "Khalti",
    code: "KHALTI",
    sortOrder: 5,
  },
  {
    name: "FonePay",
    code: "FONEPAY",
    sortOrder: 6,
  },
  {
    name: "Other",
    code: "OTHER",
    sortOrder: 7,
  },
];

async function main() {
  for (const method of DEFAULT_PAYMENT_METHODS) {
    await prisma.paymentMethod.upsert({
      where: {
        code: method.code,
      },

      update: {
        name: method.name,
        sortOrder: method.sortOrder,
        active: true,
      },

      create: {
        name: method.name,
        code: method.code,
        sortOrder: method.sortOrder,
        active: true,
      },
    });
  }

  console.log(
    "Default payment methods seeded successfully."
  );
}

main()
  .catch((error) => {
    console.error(
      "Failed to seed payment methods:",
      error
    );

    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });