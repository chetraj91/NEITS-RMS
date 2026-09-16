import api from "./api";

// =====================================================
// GET ALL REPAIR JOBS FOR REPAIR BOARD
// =====================================================

export const getRepairBoard = () => {
  return api.get("/repair-board");
};

// =====================================================
// GET ONE REPAIR JOB
// =====================================================

export const getRepairJob = (id: string) => {
  return api.get(`/repair-jobs/${id}`);
};

// =====================================================
// UPDATE COMPLETE REPAIR JOB
// =====================================================

export const updateRepairJob = (
  id: string,
  data: any
) => {
  return api.put(`/repair-jobs/${id}`, data);
};

// =====================================================
// UPDATE REPAIR STATUS ONLY
// =====================================================

export const updateRepairStatus = (
  id: string,
  status: string
) => {
  return api.put(`/repair-board/${id}`, {
    status,
  });
};