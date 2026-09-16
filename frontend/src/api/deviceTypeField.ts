import api from "./axios";

// =====================================
// Get Fields of a Device Type
// =====================================

export const getDeviceTypeFields = (
  deviceTypeId: string
) =>
  api.get(`/device-type-fields/${deviceTypeId}`);

// =====================================
// Save Mapping
// =====================================

export const saveDeviceTypeFields = (
  deviceTypeId: string,
  fields: any[]
) =>
  api.post(`/device-type-fields/${deviceTypeId}`, {
    fields,
  });

