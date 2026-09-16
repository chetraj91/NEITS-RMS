import api from "./axios";

// ========================================
// Get All Customers
// ========================================
export async function getCustomers() {
  const res = await api.get("/customers");
  return res.data;
}

// ========================================
// Get Single Customer
// ========================================
export async function getCustomer(id: string) {
  const res = await api.get(`/customers/${id}`);
  return res.data;
}

// ========================================
// Create Customer
// ========================================
export async function createCustomer(data: any) {
  const res = await api.post("/customers", data);
  return res.data;
}

// ========================================
// Update Customer
// ========================================
export async function updateCustomer(
  id: string,
  data: any
) {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
}

// ========================================
// Delete Customer
// ========================================
export async function deleteCustomer(id: string) {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
}

// ========================================
// Search Customer
// ========================================
export async function searchCustomers(query: string) {
  const res = await api.get(
    `/customers/search?q=${encodeURIComponent(query)}`
  );

  return res.data;
}

