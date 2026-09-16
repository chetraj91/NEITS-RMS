import api from "./axios";

export async function getExpenses() {
  const res = await api.get("/expenses");
  return res.data;
}

export async function createExpense(data: any) {
  const res = await api.post("/expenses", data);
  return res.data;
}

