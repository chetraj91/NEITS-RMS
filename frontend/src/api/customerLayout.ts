import api from "./axios";

export async function getCustomerLayout() {
  const res =
    await api.get(
      "/customer-layout"
    );

  return res.data;
}

export async function saveCustomerLayout(
  fields: any[]
) {
  const res =
    await api.post(
      "/customer-layout",
      {
        fields,
      }
    );

  return res.data;
}