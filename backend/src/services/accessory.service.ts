import { prisma } from "../config/prisma";

// =====================================================
// GET ALL ACCESSORIES
// =====================================================

export async function getAccessories() {
  return prisma.accessory.findMany({
    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

// =====================================================
// GET ACTIVE ACCESSORIES
// =====================================================

export async function getActiveAccessories() {
  return prisma.accessory.findMany({
    where: {
      active: true,
    },
    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

// =====================================================
// GET ACCESSORY BY ID
// =====================================================

export async function getAccessoryById(id: string) {
  return prisma.accessory.findUnique({
    where: {
      id,
    },
  });
}

// =====================================================
// CREATE ACCESSORY
// =====================================================

export async function createAccessory(
  name: string,
  displayOrder: number = 0
) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Accessory name is required");
  }

  return prisma.accessory.create({
    data: {
      name: trimmedName,
      displayOrder,
      active: true,
    },
  });
}

// =====================================================
// UPDATE ACCESSORY
// =====================================================

export async function updateAccessory(
  id: string,
  data: {
    name?: string;
    active?: boolean;
    displayOrder?: number;
  }
) {
  return prisma.accessory.update({
    where: {
      id,
    },

    data: {
      ...(data.name !== undefined
        ? {
            name: data.name.trim(),
          }
        : {}),

      ...(data.active !== undefined
        ? {
            active: data.active,
          }
        : {}),

      ...(data.displayOrder !== undefined
        ? {
            displayOrder: data.displayOrder,
          }
        : {}),
    },
  });
}

// =====================================================
// DELETE ACCESSORY
// =====================================================

export async function deleteAccessory(id: string) {
  return prisma.accessory.delete({
    where: {
      id,
    },
  });
}

// =====================================================
// GET ACCESSORIES BY DEVICE TYPE
// =====================================================
//
// Example:
//
// Laptop
//   Charger
//   Battery
//   Bag
//   Mouse
//
// Printer
//   Power Cable
//   USB Cable
//   Ink Bottle
//
// Only accessories assigned to that device type
// are returned.
// =====================================================

export async function getAccessoriesByDeviceType(
  deviceTypeId: string
) {
  return prisma.deviceTypeAccessory.findMany({
    where: {
      deviceTypeId,

      visible: true,

      accessory: {
        active: true,
      },
    },

    include: {
      accessory: true,
    },

    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        accessory: {
          name: "asc",
        },
      },
    ],
  });
}

// =====================================================
// SAVE DEVICE TYPE ACCESSORIES
// =====================================================
//
// This replaces the complete accessory configuration
// for one device type.
//
// Example:
//
// Laptop:
//
// Charger  -> visible
// Battery  -> visible
// Bag      -> visible
// Mouse    -> visible
//
// Printer:
//
// Power Cable -> visible
// USB Cable   -> visible
//
// =====================================================

export async function saveDeviceTypeAccessories(
  deviceTypeId: string,
  accessories: {
    accessoryId: string;
    visible?: boolean;
    required?: boolean;
    displayOrder?: number;
  }[]
) {
  return prisma.$transaction(async (tx) => {
    // -------------------------------------------------
    // Remove existing mappings for this device type
    // -------------------------------------------------

    await tx.deviceTypeAccessory.deleteMany({
      where: {
        deviceTypeId,
      },
    });

    // -------------------------------------------------
    // If nothing is selected, return empty list
    // -------------------------------------------------

    if (accessories.length === 0) {
      return [];
    }

    // -------------------------------------------------
    // Remove duplicate accessory IDs
    // -------------------------------------------------

    const uniqueAccessories = accessories.filter(
      (item, index, array) =>
        array.findIndex(
          (x) => x.accessoryId === item.accessoryId
        ) === index
    );

    // -------------------------------------------------
    // Create new mappings
    // -------------------------------------------------

    await tx.deviceTypeAccessory.createMany({
      data: uniqueAccessories.map((item, index) => ({
        deviceTypeId,

        accessoryId: item.accessoryId,

        visible: item.visible ?? true,

        required: item.required ?? false,

        displayOrder:
          item.displayOrder !== undefined
            ? Number(item.displayOrder)
            : index,
      })),
    });

    // -------------------------------------------------
    // Return saved configuration
    // -------------------------------------------------

    return tx.deviceTypeAccessory.findMany({
      where: {
        deviceTypeId,
      },

      include: {
        accessory: true,
      },

      orderBy: [
        {
          displayOrder: "asc",
        },
        {
          accessory: {
            name: "asc",
          },
        },
      ],
    });
  });
}

// =====================================================
// GET DEVICE TYPE ACCESSORY CONFIGURATION
// =====================================================
//
// Unlike getAccessoriesByDeviceType(), this returns
// the complete configuration including:
//
// visible
// required
// displayOrder
//
// This is useful for the Settings page.
// =====================================================

export async function getDeviceTypeAccessoryConfiguration(
  deviceTypeId: string
) {
  return prisma.deviceTypeAccessory.findMany({
    where: {
      deviceTypeId,
    },

    include: {
      accessory: true,
    },

    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        accessory: {
          name: "asc",
        },
      },
    ],
  });
}

// =====================================================
// ADD ONE ACCESSORY TO DEVICE TYPE
// =====================================================

export async function addAccessoryToDeviceType(
  deviceTypeId: string,
  accessoryId: string,
  options?: {
    visible?: boolean;
    required?: boolean;
    displayOrder?: number;
  }
) {
  return prisma.deviceTypeAccessory.upsert({
    where: {
      deviceTypeId_accessoryId: {
        deviceTypeId,
        accessoryId,
      },
    },

    update: {
      visible: options?.visible ?? true,
      required: options?.required ?? false,
      displayOrder: options?.displayOrder ?? 0,
    },

    create: {
      deviceTypeId,
      accessoryId,
      visible: options?.visible ?? true,
      required: options?.required ?? false,
      displayOrder: options?.displayOrder ?? 0,
    },

    include: {
      accessory: true,
    },
  });
}

// =====================================================
// REMOVE ONE ACCESSORY FROM DEVICE TYPE
// =====================================================

export async function removeAccessoryFromDeviceType(
  deviceTypeId: string,
  accessoryId: string
) {
  return prisma.deviceTypeAccessory.delete({
    where: {
      deviceTypeId_accessoryId: {
        deviceTypeId,
        accessoryId,
      },
    },
  });
}

// =====================================================
// UPDATE ONE DEVICE TYPE ACCESSORY
// =====================================================
//
// Used when Settings changes:
//
// Required
// Visible
// Display Order
// =====================================================

export async function updateDeviceTypeAccessory(
  deviceTypeId: string,
  accessoryId: string,
  data: {
    visible?: boolean;
    required?: boolean;
    displayOrder?: number;
  }
) {
  return prisma.deviceTypeAccessory.update({
    where: {
      deviceTypeId_accessoryId: {
        deviceTypeId,
        accessoryId,
      },
    },

    data: {
      ...(data.visible !== undefined
        ? {
            visible: data.visible,
          }
        : {}),

      ...(data.required !== undefined
        ? {
            required: data.required,
          }
        : {}),

      ...(data.displayOrder !== undefined
        ? {
            displayOrder: Number(data.displayOrder),
          }
        : {}),
    },

    include: {
      accessory: true,
    },
  });
}