import api from "./axios";

export async function getDeviceTypeLayout(
  deviceTypeId: string
) {
  const res = await api.get(
    `/device-type-layout/${deviceTypeId}`
  );

  return res.data;
}

export async function saveDeviceTypeLayout(
  deviceTypeId: string,
  fields: any[]
) {
  const res = await api.post(
    `/device-type-layout/${deviceTypeId}`,
    {
      fields,
    }
  );

  return res.data;
}