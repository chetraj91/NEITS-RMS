import { prisma } from "../config/prisma";

/**
 * GET ACTIVE INVENTORY CATEGORIES
 *
 * Returns categories for the Add Inventory dropdown.
 * Only active categories are shown.
 */
export async function getInventoryCategories() {
  return prisma.inventoryCategory.findMany({
    where: {
      active: true,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

/**
 * GET ALL INVENTORY CATEGORIES
 *
 * Used by Field Settings / Category management.
 * Includes both active and inactive categories.
 */
export async function getAllInventoryCategories() {
  return prisma.inventoryCategory.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

/**
 * CREATE INVENTORY CATEGORY
 */
export async function createInventoryCategory(name: string) {
  const categoryName = String(name ?? "").trim();

  if (!categoryName) {
    throw new Error("Category name is required.");
  }

  const existing = await prisma.inventoryCategory.findUnique({
    where: {
      name: categoryName,
    },
  });

  if (existing) {
    throw new Error("Category already exists.");
  }

  const lastCategory = await prisma.inventoryCategory.findFirst({
    orderBy: {
      sortOrder: "desc",
    },
    select: {
      sortOrder: true,
    },
  });

  const sortOrder = (lastCategory?.sortOrder ?? 0) + 1;

  return prisma.inventoryCategory.create({
    data: {
      name: categoryName,
      active: true,
      sortOrder,
    },
  });
}

/**
 * UPDATE INVENTORY CATEGORY
 *
 * Can rename a category and/or change its active status.
 */
export async function updateInventoryCategory(
  id: string,
  data: {
    name?: string;
    active?: boolean;
    sortOrder?: number;
  }
) {
  const existing = await prisma.inventoryCategory.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new Error("Inventory category not found.");
  }

  const updateData: {
    name?: string;
    active?: boolean;
    sortOrder?: number;
  } = {};

  if (data.name !== undefined) {
    const categoryName = String(data.name).trim();

    if (!categoryName) {
      throw new Error("Category name is required.");
    }

    if (categoryName !== existing.name) {
      const duplicate = await prisma.inventoryCategory.findUnique({
        where: {
          name: categoryName,
        },
      });

      if (duplicate) {
        throw new Error("Category already exists.");
      }
    }

    updateData.name = categoryName;
  }

  if (data.active !== undefined) {
    updateData.active = Boolean(data.active);
  }

  if (data.sortOrder !== undefined) {
    const sortOrder = Number(data.sortOrder);

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      throw new Error("Invalid category sort order.");
    }

    updateData.sortOrder = Math.floor(sortOrder);
  }

  return prisma.inventoryCategory.update({
    where: {
      id,
    },
    data: updateData,
  });
}

/**
 * DELETE INVENTORY CATEGORY
 *
 * A category cannot be deleted if it is already used by inventory.
 */
export async function deleteInventoryCategory(id: string) {
  const existing = await prisma.inventoryCategory.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new Error("Inventory category not found.");
  }

  const usedInventory = await prisma.inventory.count({
    where: {
      category: existing.name,
    },
  });

  if (usedInventory > 0) {
    throw new Error(
      `Category "${existing.name}" is already used by ${usedInventory} inventory item(s). Deactivate it instead of deleting it.`
    );
  }

  return prisma.inventoryCategory.delete({
    where: {
      id,
    },
  });
}