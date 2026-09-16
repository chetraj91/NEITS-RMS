import api from "./axios";

// ========================================
// GET ALL USERS
// ========================================

export async function getUsers() {
  const res = await api.get("/users");
  return res.data;
}

// ========================================
// GET SINGLE USER
// ========================================

export async function getUser(id: string) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

// ========================================
// GET USER PERMISSIONS
// ========================================

export async function getUserPermissions(
  id: string
) {
  const res = await api.get(
    `/users/${id}/permissions`
  );

  return res.data;
}

// ========================================
// CREATE USER
// ========================================

export async function createUser(
  data: any
) {
  const res = await api.post(
    "/users",
    data
  );

  return res.data;
}

// ========================================
// UPDATE USER
// ========================================

export async function updateUser(
  id: string,
  data: any
) {
  const res = await api.put(
    `/users/${id}`,
    data
  );

  return res.data;
}

// ========================================
// DELETE USER
// ========================================

export async function deleteUser(
  id: string
) {
  const res = await api.delete(
    `/users/${id}`
  );

  return res.data;
}