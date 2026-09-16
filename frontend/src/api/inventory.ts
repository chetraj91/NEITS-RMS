import api from "./axios";

export type InventoryType =
  | "PRODUCT"
  | "SPARE_PART"
  | "CONSUMABLE";

export interface InventoryPayload {
  itemName: string;
  itemType: InventoryType;
  category: string;
  brand?: string;
  model?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  quantity?: number;
  minimumStock?: number;
 supplierId?: string;
 supplier?: string;
  location?: string;
  barcode?: string;
  unit?: string;
  description?: string;
  status?: string;
}

export async function getInventory() {
  return api.get("/inventory");
}

export async function getInventoryItem(id: string) {
  return api.get(`/inventory/${id}`);
}

export async function createInventory(data: InventoryPayload) {
  return api.post("/inventory", data);
}

export async function updateInventory(
  id: string,
  data: Partial<InventoryPayload>
) {
  return api.put(`/inventory/${id}`, data);
}

export async function deleteInventory(id: string) {
  return api.delete(`/inventory/${id}`);
}

// =====================================================
// INVENTORY CATEGORIES
// =====================================================

export interface InventoryCategory {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getInventoryCategories() {
  return api.get("/inventory-categories");
}

export async function getAllInventoryCategories() {
  return api.get("/inventory-categories/all");
}

export async function createInventoryCategory(name: string) {
  return api.post("/inventory-categories", {
    name,
  });
}

export async function updateInventoryCategory(
  id: string,
  data: {
    name?: string;
    active?: boolean;
    sortOrder?: number;
  }
) {
  return api.put(`/inventory-categories/${id}`, data);
}

export async function deleteInventoryCategory(id: string) {
  return api.delete(`/inventory-categories/${id}`);
}