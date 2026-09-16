import api from "./axios";

// =====================================================
// GET FEEDBACK SETTINGS
// =====================================================

export async function getFeedbackSettings() {
  const res =
    await api.get(
      "/feedback-settings"
    );

  return res.data;
}

// =====================================================
// UPDATE FEEDBACK SETTINGS
// =====================================================

export async function updateFeedbackSettings(
  data: {
    feedbackPageUrl?: string;
    websiteUrl?: string;
    facebookPageUrl?: string;
    enabled?: boolean;
  }
) {
  const res =
    await api.put(
      "/feedback-settings",
      data
    );

  return res.data;
}