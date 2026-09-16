import { prisma } from "../config/prisma";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

type InventoryType =
  | "PRODUCT"
  | "SPARE_PART"
  | "CONSUMABLE";

function normalizeItemType(value: unknown): InventoryType {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (
    normalized === "PRODUCT" ||
    normalized === "SPARE_PART" ||
    normalized === "CONSUMABLE"
  ) {
    return normalized;
  }

  if (normalized === "SPAREPART") {
    return "SPARE_PART";
  }

  if (normalized === "CONSUMABLES") {
    return "CONSUMABLE";
  }

  throw new Error(
    'Invalid item type. Use "PRODUCT", "SPARE_PART", or "CONSUMABLE".'
  );
}

function nonNegativeNumber(
  value: unknown,
  fallback = 0
) {
  const n = Number(value);

  return Number.isFinite(n) && n >= 0
    ? n
    : fallback;
}

function nonNegativeInt(
  value: unknown,
  fallback = 0
) {
  const n = Math.floor(Number(value));

  return Number.isFinite(n) && n >= 0
    ? n
    : fallback;
}

function cleanOptional(value: unknown) {
  if (
    value === undefined ||
    value === null
  ) {
    return undefined;
  }

  const text = String(value).trim();

  return text === ""
    ? undefined
    : text;
}


/**
 * Generate automatic inventory code
 */
async function generateItemCode() {
  const existing =
    await prisma.inventory.findMany({
      select: {
        itemCode: true,
      },
      where: {
        itemCode: {
          startsWith: "INV-",
        },
      },
    });

  let next = 1;

  for (const item of existing) {
    const match =
      /^INV-(\d+)$/.exec(
        item.itemCode
      );

    if (match) {
      next = Math.max(
        next,
        Number(match[1]) + 1
      );
    }
  }

  while (
    await prisma.inventory.findUnique({
      where: {
        itemCode:
          `INV-${String(next).padStart(5, "0")}`,
      },
      select: {
        id: true,
      },
    })
  ) {
    next++;
  }

  return `INV-${String(next).padStart(5, "0")}`;
}


/**
 * Find supplier.
 *
 * The frontend may send:
 *
 * 1. Supplier ID
 * 2. Supplier company name
 *
 * This function supports both.
 */
async function findSupplier(
  supplier?: string
) {
  const value = cleanOptional(supplier);

  if (!value) {
    return undefined;
  }

  // First try supplier ID
  const byId =
    await prisma.supplier.findUnique({
      where: {
        id: value,
      },
      select: {
        id: true,
      },
    });

  if (byId) {
    return byId.id;
  }

  // Then try company name
  const byName =
    await prisma.supplier.findFirst({
      where: {
        companyName: {
          equals: value,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

  if (byName) {
    return byName.id;
  }

  throw new Error(
    `Supplier "${value}" was not found.`
  );
}


/**
 * CREATE INVENTORY
 */
export async function createInventory(
  data: {
    itemName: string;
    itemType: string;
    category: string;

    brand?: string;
    model?: string;

    purchasePrice?: number;
    sellingPrice?: number;

    quantity?: number;

    minimumStock?: number;
    reorderLevel?: number;

    supplierId?: string;
    supplier?: string;

    location?: string;
    barcode?: string;
    unit?: string;
    description?: string;
    status?: string;
  }
) {
  const itemName =
    String(data.itemName ?? "").trim();

  const category =
    String(data.category ?? "").trim();

  if (!itemName) {
    throw new Error(
      "Item Name is required."
    );
  }

  if (!category) {
    throw new Error(
      "Category is required."
    );
  }

  const itemType =
    normalizeItemType(data.itemType);

  const itemCode =
    await generateItemCode();

  /**
   * Supplier is a relation.
   *
   * Convert supplier text/id into supplierId.
   */
  let supplierId: string | undefined;

  if (data.supplierId) {
    const supplier =
      await prisma.supplier.findUnique({
        where: {
          id: String(data.supplierId),
        },
        select: {
          id: true,
        },
      });

    if (!supplier) {
      throw new Error(
        "Selected supplier was not found."
      );
    }

    supplierId = supplier.id;
  } else if (data.supplier) {
    supplierId = await findSupplier(data.supplier);
  }

  /**
   * Support both names:
   *
   * minimumStock
   * reorderLevel
   *
   * Internally database uses reorderLevel.
   */
  const reorderLevel =
    data.reorderLevel !== undefined
      ? nonNegativeInt(
          data.reorderLevel
        )
      : nonNegativeInt(
          data.minimumStock
        );

  const inventory =
    await prisma.inventory.create({
      data: {
        itemCode,

        itemName,

        itemType,

        category,

        brand:
          cleanOptional(data.brand),

        model:
          cleanOptional(data.model),

        purchasePrice:
          nonNegativeNumber(
            data.purchasePrice
          ),

        sellingPrice:
          nonNegativeNumber(
            data.sellingPrice
          ),

        quantity:
          nonNegativeInt(
            data.quantity
          ),

        minimumStock: reorderLevel,

        supplierId,

        location:
          cleanOptional(
            data.location
          ),

        barcode:
          cleanOptional(
            data.barcode
          ),

        unit:
          cleanOptional(data.unit) ??
          "PCS",

        description:
          cleanOptional(
            data.description
          ),

        status:
          cleanOptional(
            data.status
          ) ?? "Active",
      },
    });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return inventory;
}


/**
 * GET ALL INVENTORY
 */
export async function getInventory() {
  return prisma.inventory.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      supplier: true,

      purchaseItems: {
        include: {
          purchase: {
            include: {
              supplier: true,
            },
          },
        },

        orderBy: {
          purchase: {
            purchaseDate: "desc",
          },
        },
      },
    },
  });
}


/**
 * GET ONE INVENTORY ITEM
 */
export async function getInventoryItem(
  id: string
) {
  return prisma.inventory.findUnique({
    where: {
      id,
    },

    include: {
      supplier: true,

      purchaseItems: {
        include: {
          purchase: {
            include: {
              supplier: true,
            },
          },
        },

        orderBy: {
          purchase: {
            purchaseDate: "desc",
          },
        },
      },
    },
  });
}


/**
 * UPDATE INVENTORY
 */
export async function updateInventory(
  id: string,
  data: any
) {
  const existing =
    await prisma.inventory.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    throw new Error(
      "Inventory item not found."
    );
  }

  const updateData: any = {};

  if (data.itemName !== undefined) {
    const itemName =
      String(data.itemName).trim();

    if (!itemName) {
      throw new Error(
        "Item Name is required."
      );
    }

    updateData.itemName =
      itemName;
  }

  if (data.itemType !== undefined) {
    updateData.itemType =
      normalizeItemType(
        data.itemType
      );
  }

  if (data.category !== undefined) {
    const category =
      String(data.category).trim();

    if (!category) {
      throw new Error(
        "Category is required."
      );
    }

    updateData.category =
      category;
  }

  if (data.brand !== undefined) {
    updateData.brand =
      cleanOptional(data.brand);
  }

  if (data.model !== undefined) {
    updateData.model =
      cleanOptional(data.model);
  }

  if (
    data.purchasePrice !== undefined
  ) {
    updateData.purchasePrice =
      nonNegativeNumber(
        data.purchasePrice
      );
  }

  if (
    data.sellingPrice !== undefined
  ) {
    updateData.sellingPrice =
      nonNegativeNumber(
        data.sellingPrice
      );
  }

  if (data.quantity !== undefined) {
    updateData.quantity =
      nonNegativeInt(
        data.quantity
      );
  }

  if (data.minimumStock !== undefined) {
    updateData.minimumStock =
      nonNegativeInt(data.minimumStock);
  }

  if (data.reorderLevel !== undefined) {
    updateData.minimumStock =
      nonNegativeInt(data.reorderLevel);
  }

  if (data.supplierId !== undefined) {
    if (!data.supplierId) {
      updateData.supplierId = null;
    } else {
      const supplier =
        await prisma.supplier.findUnique({
          where: {
            id: String(data.supplierId),
          },
          select: {
            id: true,
          },
        });

      if (!supplier) {
        throw new Error(
          "Selected supplier was not found."
        );
      }

      updateData.supplierId =
        supplier.id;
    }
  } else if (data.supplier !== undefined) {
    updateData.supplierId =
      await findSupplier(data.supplier);
  }

  if (data.location !== undefined) {
    updateData.location =
      cleanOptional(
        data.location
      );
  }

  if (data.barcode !== undefined) {
    updateData.barcode =
      cleanOptional(
        data.barcode
      );
  }

  if (data.unit !== undefined) {
    updateData.unit =
      cleanOptional(data.unit) ??
      "PCS";
  }

  if (data.description !== undefined) {
    updateData.description =
      cleanOptional(
        data.description
      );
  }

  if (data.status !== undefined) {
    updateData.status =
      cleanOptional(
        data.status
      ) ?? "Active";
  }

  /**
   * Item code intentionally
   * cannot be changed.
   */
  const inventory =
    await prisma.inventory.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        supplier: true,
      },
    });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return inventory;
}


/**
 * DELETE INVENTORY
 */
export async function deleteInventory(
  id: string
) {
  const existing =
    await prisma.inventory.findUnique({
      where: {
        id,
      },

      include: {
        repairParts: {
          select: {
            id: true,
          },
        },

        saleItems: {
          select: {
            id: true,
          },
        },

        purchaseItems: {
          select: {
            id: true,
          },
        },
      },
    });

  if (!existing) {
    throw new Error(
      "Inventory item not found."
    );
  }

  if (
    existing.repairParts.length > 0 ||
    existing.saleItems.length > 0 ||
    existing.purchaseItems.length > 0
  ) {
    throw new Error(
      "This inventory item is already used in a repair, sale, or purchase and cannot be deleted. Mark it Inactive instead."
    );
  }

  const inventory =
    await prisma.inventory.delete({
      where: {
        id,
      },
    });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return inventory;
}