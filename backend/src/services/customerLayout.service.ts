import { prisma } from "../config/prisma";

const DEFAULT_CUSTOMER_LAYOUT = [
  {
    fieldKey: "fullName",
    fieldLabel: "Customer Name",
    displayOrder: 1,
    columnSpan: 1,
  },
  {
    fieldKey: "phone",
    fieldLabel: "Contact Number",
    displayOrder: 2,
    columnSpan: 1,
  },
  {
    fieldKey: "email",
    fieldLabel: "Email",
    displayOrder: 3,
    columnSpan: 1,
  },
  {
    fieldKey: "companyName",
    fieldLabel: "Company Name",
    displayOrder: 4,
    columnSpan: 1,
  },
  {
    fieldKey: "alternatePhone",
    fieldLabel: "Alternate Phone",
    displayOrder: 5,
    columnSpan: 1,
  },
  {
    fieldKey: "panVat",
    fieldLabel: "PAN / VAT",
    displayOrder: 6,
    columnSpan: 1,
  },
  {
    fieldKey: "address",
    fieldLabel: "Address",
    displayOrder: 7,
    columnSpan: 3,
  },
  {
    fieldKey: "notes",
    fieldLabel: "Notes",
    displayOrder: 8,
    columnSpan: 3,
  },
];

// =====================================================
// GET CUSTOMER LAYOUT
// =====================================================

export async function getCustomerLayout() {
  const existing =
    await prisma.customerLayoutField.findMany({
      orderBy: {
        displayOrder: "asc",
      },
    });

  if (
    existing.length ===
    DEFAULT_CUSTOMER_LAYOUT.length
  ) {
    return existing;
  }

  for (
    const field of DEFAULT_CUSTOMER_LAYOUT
  ) {
    await prisma.customerLayoutField.upsert({
      where: {
        fieldKey:
          field.fieldKey,
      },

      update: {},

      create: {
        fieldKey:
          field.fieldKey,

        fieldLabel:
          field.fieldLabel,

        visible: true,

        displayOrder:
          field.displayOrder,

        columnSpan:
          field.columnSpan,
      },
    });
  }

  return prisma.customerLayoutField.findMany({
    orderBy: {
      displayOrder: "asc",
    },
  });
}

// =====================================================
// SAVE CUSTOMER LAYOUT
// =====================================================

export async function saveCustomerLayout(
  fields: any[]
) {
  if (!Array.isArray(fields)) {
    throw new Error(
      "Customer layout fields are required."
    );
  }

  return prisma.$transaction(
    async (tx) => {
      await tx.customerLayoutField.deleteMany();

      for (
        const field of fields
      ) {
        const columnSpan =
          Number(
            field.columnSpan
          );

        await tx.customerLayoutField.create({
          data: {
            fieldKey:
              field.fieldKey,

            fieldLabel:
              field.fieldLabel,

            visible:
              field.visible !== false,

            displayOrder:
              Number(
                field.displayOrder
              ) || 0,

            columnSpan:
              Number.isFinite(
                columnSpan
              ) &&
              columnSpan >= 1 &&
              columnSpan <= 3
                ? columnSpan
                : 1,
          },
        });
      }

      return tx.customerLayoutField.findMany({
        orderBy: {
          displayOrder: "asc",
        },
      });
    }
  );
}