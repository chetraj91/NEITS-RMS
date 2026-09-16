import api from "./axios";

// ========================================
// CREATE SUPPLIER PAYMENT
// ========================================

export async function createSupplierPayment(
  data: {
    supplierId: string;
    purchaseId?: string;
    amount: number;
    paymentDate?: string;
    paymentMethod?: string;
    remarks?: string;
  }
) {
  const res = await api.post(
    "/supplier-payments",
    data
  );

  return res.data;
}

// ========================================
// GET SUPPLIER PAYMENT HISTORY
// ========================================

export async function getSupplierPayments(
  supplierId: string
) {
  const res = await api.get(
    `/supplier-payments/supplier/${supplierId}`
  );

  return res.data;
}