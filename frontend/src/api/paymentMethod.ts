import api from "./axios";

export async function getPaymentMethods(
  activeOnly = false
) {
  const res = await api.get(
    "/payment-methods",
    {
      params: {
        activeOnly,
      },
    }
  );

  return res.data;
}

export async function getPaymentMethod(
  id: string
) {
  const res = await api.get(
    `/payment-methods/${id}`
  );

  return res.data;
}

export async function createPaymentMethod(
  data: any
) {
  const res = await api.post(
    "/payment-methods",
    data
  );

  return res.data;
}

export async function updatePaymentMethod(
  id: string,
  data: any
) {
  const res = await api.put(
    `/payment-methods/${id}`,
    data
  );

  return res.data;
}

export async function deletePaymentMethod(
  id: string
) {
  const res = await api.delete(
    `/payment-methods/${id}`
  );

  return res.data;
}