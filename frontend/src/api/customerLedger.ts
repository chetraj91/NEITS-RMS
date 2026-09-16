import api from "./axios";

export async function getCustomerLedger(customerId: string) {
  const res = await api.get(`/customer-ledger/${customerId}`);
  return res.data;
}
export async function getCustomerDetailedLedger(
  customerId: string
) {
  const res = await api.get(
    `/customer-ledger/${customerId}/detailed`
  );

  return res.data;
}
