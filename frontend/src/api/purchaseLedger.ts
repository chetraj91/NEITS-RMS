import api from "./axios";

export async function getPurchasePartyLedger() {
  const res = await api.get(
    "/accounts/purchase-party-ledger"
  );

  return res.data;
}