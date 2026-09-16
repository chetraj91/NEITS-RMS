import api from "./axios";

export async function getSystemSettings() {
  const res = await api.get(
    "/system-settings"
  );

  return res.data;
}

export async function updateSystemSettings(
  data: any
) {
  const res = await api.put(
    "/system-settings",
    data
  );

  return res.data;
}