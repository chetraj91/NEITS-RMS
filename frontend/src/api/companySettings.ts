import api from "./axios";

// =====================================================
// GET COMPANY SETTINGS
// =====================================================

export async function getCompanySettings() {
  const res = await api.get(
    "/company-settings"
  );

  return res.data;
}

// =====================================================
// UPDATE COMPANY SETTINGS
// =====================================================

export async function updateCompanySettings(
  data: any
) {
  const res = await api.put(
    "/company-settings",
    data
  );

  return res.data;
}