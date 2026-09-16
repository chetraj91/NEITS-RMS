import api from "./axios";

export const getDeviceTypes = () =>
  api.get("/device-types");

export const createDeviceType = (data: any) =>
  api.post("/device-types", data);

export const updateDeviceType = (id: string, data: any) =>
  api.put(`/device-types/${id}`, data);

export const deleteDeviceType = (id: string) =>
  api.delete(`/device-types/${id}`);

