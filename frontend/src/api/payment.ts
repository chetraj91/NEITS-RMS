import api from "./axios";

// ==============================
// Receive Payment
// ==============================
export async function receivePayment(data: {
  repairJobId: string;
  amount: number;
  method: string;
  remarks?: string;
}) {
  const res = await api.post("/payments", data);
  return res.data;
}

// ==============================
// Get Payment History
// ==============================
export async function getPayments(
  repairJobId: string
) {
  const res = await api.get(
    `/payments/${repairJobId}`
  );

  return res.data;
}

// ==============================
// Send Due Amount Reminder SMS
// ==============================
export async function sendDueAmountReminder(
  repairJobId: string
) {
  const res = await api.post(
    `/sms/due-reminder/${repairJobId}`
  );

  return res.data;
}
// ==============================
// Send Repair Delayed SMS
// ==============================
export async function sendRepairDelayedSms(
  repairJobId: string,
  delayReason: string,
  expectedDate: string
) {
  const res = await api.post(
    `/sms/repair-delayed/${repairJobId}`,
    {
      delayReason,
      expectedDate,
    }
  );

  return res.data;
}
// ==============================
// Send Parts Required SMS
// ==============================
export async function sendPartsRequired(
  repairJobId: string
) {
  const res = await api.post(
    `/sms/parts-required/${repairJobId}`
  );

  return res.data;
}

// ==============================
// Send Customer Approval Required SMS
// ==============================
export async function sendCustomerApprovalRequired(
  repairJobId: string
) {
  const res = await api.post(
    `/sms/customer-approval/${repairJobId}`
  );

  return res.data;
}