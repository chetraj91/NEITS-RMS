import { prisma } from "../config/prisma";

// ===========================
// Get Mapping By Device Type
// ===========================

export async function getDeviceTypeFields(deviceTypeId: string) {
  return prisma.deviceTypeField.findMany({
    where: {
      deviceTypeId,
    },
    include: {
      deviceField: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
  });
}

// ===========================
// Save Mapping
// ===========================

export async function saveDeviceTypeFields(
  deviceTypeId: string,
  fields: any[]
) {

  // Remove previous mapping

  await prisma.deviceTypeField.deleteMany({
    where: {
      deviceTypeId,
    },
  });

  // Insert new mapping

  for (const field of fields) {

   await prisma.deviceTypeField.create({
  data: {
    deviceTypeId,

    deviceFieldId:
      field.deviceFieldId,

    visible:
      field.visible,

    required:
      field.required,

    displayOrder:
      field.displayOrder,

    columnSpan:
      Number(field.columnSpan) >= 1 &&
      Number(field.columnSpan) <= 3
        ? Number(field.columnSpan)
        : 1,
  },
});

  }

  return getDeviceTypeFields(deviceTypeId);

}