import api from "./axios";

// ========================================
// GET ALL SALES
// ========================================

export async function getSales() {
  const res = await api.get("/sales");
  return res.data;
}

// ========================================
// GET SINGLE SALE
// ========================================

export async function getSale(id: string) {
  const res = await api.get(`/sales/${id}`);
  return res.data;
}

// ========================================
// CREATE SALE
// ========================================

export async function createSale(data: any) {
  const res = await api.post("/sales", data);
  return res.data;
}

export async function receiveSalePayment(
  id: string,
  data: {
    amount: number;
    method: string;
    remarks?: string;
  }
) {
  const res = await api.post(
    `/sales/${id}/payment`,
    data
  );

  return res.data;
}

// ========================================
// UPDATE SALE
// ========================================

export async function updateSale(
  id: string,
  data: any
) {
  const res = await api.put(
    `/sales/${id}`,
    data
  );

  return res.data;
}

// ========================================
// DELETE SALE
// ========================================

export async function deleteSale(id: string) {
  const res = await api.delete(
    `/sales/${id}`
  );

  return res.data;
}

// ========================================
// SALES RETURNS
// ========================================

export async function getSalesReturns() {
  const res = await api.get(
    "/sales-returns"
  );

  return res.data;
}

// ========================================
// GET SINGLE SALES RETURN
// ========================================

export async function getSalesReturn(
  id: string
) {
  const res = await api.get(
    `/sales-returns/${id}`
  );

  return res.data;
}

// ========================================
// CREATE SALES RETURN
// ========================================

export async function createSalesReturn(
  data: any
) {
  const res = await api.post(
    "/sales-returns",
    data
  );

  return res.data;
}