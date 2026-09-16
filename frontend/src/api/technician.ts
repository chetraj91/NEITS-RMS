import api from "./api";

export const getTechnicians = async () =>
  api.get("/technicians");

export const createTechnician = async (data: any) =>
  api.post("/technicians", data);

export const deleteTechnician = async (id: string) =>
  api.delete(`/technicians/${id}`);

