import { prisma } from "../config/prisma";

// ===============================
// Get All Device Fields
// ===============================
export async function getDeviceFields() {
  return prisma.deviceField.findMany({
    orderBy: {
      displayOrder: "asc",
    },
  });
}

// ===============================
// Create Device Field
// ===============================
export async function createDeviceField(data: {
  name: string;
  fieldType: string;
  placeholder?: string;
  required?: boolean;
  active?: boolean;
  category?: string;
}) {
  return prisma.deviceField.create({
    data: {
      name: data.name,
      fieldType: data.fieldType,
      placeholder: data.placeholder || "",
      required: data.required ?? false,
      active: data.active ?? true,
      category: data.category || "DEVICE_INFORMATION",
    },
  });
}

// ===============================
// Update Device Field
// ===============================
export async function updateDeviceField(
  id: string,
  data: {
    name?: string;
    fieldType?: string;
    placeholder?: string;
    required?: boolean;
    active?: boolean;
    displayOrder?: number;
    category?: string;
  }
) {
  return prisma.deviceField.update({
    where: {
      id,
    },
    data,
  });
}

// ===============================
// Delete Device Field
// ===============================
export async function deleteDeviceField(id: string) {
  return prisma.$transaction(async (tx) => {
    // First remove all device-type mappings
    await tx.deviceTypeField.deleteMany({
      where: {
        deviceFieldId: id,
      },
    });

    // Then delete the device field
    return tx.deviceField.delete({
      where: {
        id,
      },
    });
  });
}