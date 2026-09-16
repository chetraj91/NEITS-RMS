import api from "./axios";

export async function getRepairParts(repairJobId: string) {
  const res = await api.get(`/repair-parts/${repairJobId}`);
  return res.data;
}

export async function addRepairPart(data: any) {
  const res = await api.post("/repair-parts", data);
  return res.data;
}

export async function deleteRepairPart(id: string) {
  const res = await api.delete(`/repair-parts/${id}`);
  return res.data;
}

