import api from "./axios";

// =====================================================
// GET PUBLIC FEEDBACK
// =====================================================

export async function getPublicFeedback(
  token: string
) {
  const res = await api.get(
    `/feedback/${encodeURIComponent(token)}`
  );

  return res.data;
}

// =====================================================
// SUBMIT PUBLIC FEEDBACK
// =====================================================

export async function submitPublicFeedback(
  token: string,
  data: {
    rating: number;
    comment?: string;
  }
) {
  const res = await api.post(
    `/feedback/${encodeURIComponent(token)}`,
    data
  );

  return res.data;
}

// =====================================================
// SEND FEEDBACK REQUEST SMS
// =====================================================

export async function sendFeedbackRequest(
  repairJobId: string
) {
  const res = await api.post(
    `/sms/feedback-request/${repairJobId}`
  );

  return res.data;
}