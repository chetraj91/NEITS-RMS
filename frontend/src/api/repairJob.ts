import api from "./axios";

// ==========================================
// Get All Repair Jobs
// ==========================================

export const getRepairJobs = () => {
  return api.get("/repair-jobs");
};

// ==========================================
// Get Single Repair Job
// ==========================================

export const getRepairJob = (id: string) => {
  return api.get(`/repair-jobs/${id}`);
};

// ==========================================
// Create Repair Job
// ==========================================

export const createRepairJob = (data: any) => {
  return api.post("/repair-jobs", data);
};

// ==========================================
// Update Repair Job
// ==========================================

export const updateRepairJob = (
  id: string,
  data: any
) => {
  return api.put(`/repair-jobs/${id}`, data);
};

// ==========================================
// Update Status
// ==========================================

export const updateRepairStatus = (
  id: string,
  status: string
) => {
  return api.put(
    `/repair-board/update/${id}`,
    {
      status,
    }
  );
};

// ==========================================
// Assign Technician
// ==========================================

export const assignTechnician = (
  id: string,
  technicianId: string
) => {
  return api.put(
    `/repair-jobs/${id}/assign-technician`,
    {
      technicianId,
    }
  );
};

// ==========================================
// Receive Payment
// ==========================================

export const receivePayment = (
  id: string,
  amount: number
) => {
  return api.post(
    `/repair-jobs/${id}/payment`,
    {
      amount,
    }
  );
};

// ==========================================
// Delete Repair Job
// ==========================================

export const deleteRepairJob = (
  id: string
) => {
  return api.delete(`/repair-jobs/${id}`);
};

