import api from "./axios";

// ========================================
// Get All Suppliers
// ========================================
export async function getSuppliers() {
  const res = await api.get("/suppliers");
  return res.data;
}

// ========================================
// Get Single Supplier
// ========================================
export async function getSupplier(id: string) {
  const res = await api.get(`/suppliers/${id}`);
  return res.data;
}

// ========================================
// Create Supplier
// ========================================
export async function createSupplier(data: any) {
  const res = await api.post("/suppliers", data);
  return res.data;
}

// ========================================
// Update Supplier
// ========================================
export async function updateSupplier(
  id: string,
  data: any
) {
  const res = await api.put(`/suppliers/${id}`, data);
  return res.data;
}

// ========================================
// Delete Supplier
// ========================================
export async function deleteSupplier(id: string) {
  const res = await api.delete(`/suppliers/${id}`);
  return res.data;
}