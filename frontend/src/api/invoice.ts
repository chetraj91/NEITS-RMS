import api from "./axios";

export async function getRepairInvoice(id: string) {
  const response = await api.get(`/invoices/repair/${id}`);
  return response.data;
}

export async function getSaleInvoice(id: string) {
  const response = await api.get(`/invoices/sale/${id}`);
  return response.data;
}