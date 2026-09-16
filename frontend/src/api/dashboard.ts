import api from "./axios";

export async function getDashboard() {
  const res = await api.get("/dashboard");
  return res.data;
}

