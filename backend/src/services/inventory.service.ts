import { prisma } from "../config/prisma";

export async function createInventory(data: {
  itemName: string;
  itemType: "PRODUCT" | "SPARE_PART" | "CONSUMABLE";
  category: string;
  brand?: string;
  model?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  quantity?: number;
  minimumStock?: number;
  supplier?: string;
  location?: string;
  barcode?: string;
  unit?: string;
  description?: string;
}) {
  const inventoryCount = await prisma.inventory.count();

  const itemCode = `INV-${String(inventoryCount + 1).padStart(5, "0")}`;

  return prisma.inventory.create({
    data: {
      itemCode,
      itemName: data.itemName,
      itemType: data.itemType,
      category: data.category,
      brand: data.brand,
      model: data.model,
      purchasePrice: data.purchasePrice ?? 0,
      sellingPrice: data.sellingPrice ?? 0,
      quantity: data.quantity ?? 0,
      minimumStock: data.minimumStock ?? 0,
      supplier: data.supplier,
      location: data.location,
      barcode: data.barcode,
      unit: data.unit ?? "PCS",
      description: data.description,
    },
  });
}

export async function getInventory() {
  return prisma.inventory.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getInventoryItem(id: string) {
  return prisma.inventory.findUnique({
    where: {
      id,
    },
  });
}

export async function updateInventory(id: string, data: any) {
  return prisma.inventory.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteInventory(id: string) {
  return prisma.inventory.delete({
    where: {
      id,
    },
  });
}