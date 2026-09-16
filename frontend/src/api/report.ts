import api from "./axios";
export async function getDashboardReport(
  fromDate?: string,
  toDate?: string,
  paymentType?: string,
  paymentMethod?: string,
  customerId?: string,
  supplierId?: string
) {
  const params: Record<string, string> = {};

  if (fromDate) {
    params.fromDate = fromDate;
  }

  if (toDate) {
    params.toDate = toDate;
  }

  if (paymentType && paymentType !== "ALL") {
    params.paymentType = paymentType;
  }

  if (paymentMethod && paymentMethod !== "ALL") {
    params.paymentMethod = paymentMethod;
  }

  if (customerId && customerId !== "ALL") {
    params.customerId = customerId;
  }

  if (supplierId && supplierId !== "ALL") {
    params.supplierId = supplierId;
  }

  const res = await api.get(
    "/reports/dashboard",
    { params }
  );

  return res.data;
}