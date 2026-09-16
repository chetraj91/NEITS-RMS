import api from "./axios";

// ========================================
// GET ALL PURCHASES
// ========================================

export async function getPurchases() {
  const res = await api.get("/purchases");
  return res.data;
}

// ========================================
// GET SINGLE PURCHASE
// ========================================

export async function getPurchase(id: string) {
  const res = await api.get(`/purchases/${id}`);
  return res.data;
}

// ========================================
// CREATE PURCHASE
// ========================================

export async function createPurchase(data: any) {
  const res = await api.post(
    "/purchases",
    data
  );

  return res.data;
}

// ========================================
// DELETE PURCHASE
// ========================================

export async function deletePurchase(
  id: string
) {
  const res = await api.delete(
    `/purchases/${id}`
  );

  return res.data;
}

// ========================================
// GET ALL PURCHASE RETURNS
// ========================================

export async function getPurchaseReturns() {
  const res = await api.get(
    "/purchases/returns"
  );

  return res.data;
}

// ========================================
// GET SINGLE PURCHASE RETURN
// ========================================

export async function getPurchaseReturn(
  id: string
) {
  const res = await api.get(
    `/purchases/returns/${id}`
  );

  return res.data;
}

// ========================================
// CREATE PURCHASE RETURN
// ========================================

export async function createPurchaseReturn(
  data: any
) {
  const res = await api.post(
    "/purchases/returns",
    data
  );

  return res.data;
}