import api from "./axios";

export const getBrands = () =>
  api.get("/brands");

export const getBrandsByDeviceType = (
  deviceTypeId: string
) =>
  api.get(`/brands/device-type/${deviceTypeId}`);

export const createBrand = (data: any) =>
  api.post("/brands", data);

export const updateBrand = (
  id: string,
  data: any
) =>
  api.put(`/brands/${id}`, data);

export const deleteBrand = (id: string) =>
  api.delete(`/brands/${id}`);

