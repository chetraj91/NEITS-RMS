import api from "./axios";

export async function getCashBook() {
  const res = await api.get("/cash-book");
  return res.data;
}

// =====================================================
// CASH BOOK PAYMENT METHOD SUMMARY
// =====================================================

export async function getCashBookPaymentSummary(
  fromDate?: string,
  toDate?: string
) {
  const params: Record<string, string> = {};

  if (fromDate) {
    params.fromDate = fromDate;
  }

  if (toDate) {
    params.toDate = toDate;
  }

  const res = await api.get(
    "/cash-book/payment-summary",
    {
      params,
    }
  );

  return res.data;
}