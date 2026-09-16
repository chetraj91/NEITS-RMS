import api from "./axios";

// ========================================
// GET SUPPLIER LEDGER
// ========================================

export async function getSupplierLedger(
  supplierId: string
) {
  const res = await api.get(
    `/supplier-ledger/${supplierId}`
  );

  return res.data;
}

// ========================================
// GET DETAILED SUPPLIER LEDGER
// ========================================

export async function getSupplierDetailedLedger(
  supplierId: string
) {
  const res = await api.get(
    `/supplier-ledger/${supplierId}/detailed`
  );

  return res.data;
}