import { prisma } from "../config/prisma";

const BUILT_IN_FIELDS = [
  {
    fieldKey: "DEVICE_TYPE",
    fieldLabel: "Device Type",
    displayOrder: 1,
    columnSpan: 1,
  },
  {
    fieldKey: "BRAND",
    fieldLabel: "Brand",
    displayOrder: 2,
    columnSpan: 1,
  },
];

// =====================================================
// GET DEVICE TYPE LAYOUT
// =====================================================

export async function getDeviceTypeLayout(
  deviceTypeId: string
) {
  const existing =
    await prisma.deviceTypeLayout.findMany({
      where: {
        deviceTypeId,
      },

      orderBy: {
        displayOrder: "asc",
      },
    });

  if (existing.length > 0) {
    return existing;
  }

  for (
    const field of BUILT_IN_FIELDS
  ) {
    await prisma.deviceTypeLayout.upsert({
      where: {
        deviceTypeId_fieldKey: {
          deviceTypeId,
          fieldKey:
            field.fieldKey,
        },
      },

      update: {},

      create: {
        deviceTypeId,

        fieldKey:
          field.fieldKey,

        fieldLabel:
          field.fieldLabel,

        visible: true,

        required: true,

        displayOrder:
          field.displayOrder,

        columnSpan:
          field.columnSpan,
      },
    });
  }

  return prisma.deviceTypeLayout.findMany({
    where: {
      deviceTypeId,
    },

    orderBy: {
      displayOrder: "asc",
    },
  });
}

// =====================================================
// SAVE DEVICE TYPE LAYOUT
// =====================================================

export async function saveDeviceTypeLayout(
  deviceTypeId: string,
  fields: any[]
) {
  if (!deviceTypeId) {
    throw new Error(
      "Device Type is required."
    );
  }

  if (!Array.isArray(fields)) {
    throw new Error(
      "Layout fields are required."
    );
  }

  return prisma.$transaction(
    async (tx) => {
      await tx.deviceTypeLayout.deleteMany({
        where: {
          deviceTypeId,
        },
      });

      for (
        const field of fields
      ) {
        const columnSpan =
          Number(
            field.columnSpan
          );

        await tx.deviceTypeLayout.create({
          data: {
            deviceTypeId,

            fieldKey:
              field.fieldKey,

            fieldLabel:
              field.fieldLabel,

            visible:
              field.visible !==
              false,

            required:
              field.required !==
              false,

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

      return tx.deviceTypeLayout.findMany({
        where: {
          deviceTypeId,
        },

        orderBy: {
          displayOrder: "asc",
        },
      });
    }
  );
}