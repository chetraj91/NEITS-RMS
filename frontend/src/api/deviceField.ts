import api from "./axios";

// Get all device fields
export const getDeviceFields = () =>
  api.get("/device-fields");

// Create
export const createDeviceField = (data: any) =>
  api.post("/device-fields", data);

// Update
export const updateDeviceField = (
  id: string,
  data: any
) =>
  api.put(`/device-fields/${id}`, data);

// Delete
export const deleteDeviceField = (id: string) =>
  api.delete(`/device-fields/${id}`);

