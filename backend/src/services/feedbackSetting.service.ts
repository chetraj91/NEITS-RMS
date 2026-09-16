import { prisma } from "../config/prisma";

// =====================================================
// DEFAULT FEEDBACK SETTINGS
// =====================================================

const DEFAULT_FEEDBACK_SETTINGS = {
  feedbackPageUrl: "",
  websiteUrl: "",
  facebookPageUrl: "",
  enabled: true,
};

// =====================================================
// GET FEEDBACK SETTINGS
// =====================================================

export async function getFeedbackSettings() {
  let settings =
    await prisma.feedbackSetting.findUnique({
      where: {
        id: "feedback",
      },
    });

  // Create default record on first access
  if (!settings) {
    settings =
      await prisma.feedbackSetting.create({
        data: {
          id: "feedback",
          ...DEFAULT_FEEDBACK_SETTINGS,
        },
      });
  }

  return settings;
}

// =====================================================
// UPDATE FEEDBACK SETTINGS
// =====================================================

export async function updateFeedbackSettings(
  data: any
) {
  return prisma.feedbackSetting.upsert({
    where: {
      id: "feedback",
    },

    create: {
      id: "feedback",

      feedbackPageUrl:
        String(
          data.feedbackPageUrl || ""
        ).trim() || null,

      websiteUrl:
        String(
          data.websiteUrl || ""
        ).trim() || null,

      facebookPageUrl:
        String(
          data.facebookPageUrl || ""
        ).trim() || null,

      enabled:
        typeof data.enabled === "boolean"
          ? data.enabled
          : true,
    },

    update: {
      feedbackPageUrl:
        String(
          data.feedbackPageUrl || ""
        ).trim() || null,

      websiteUrl:
        String(
          data.websiteUrl || ""
        ).trim() || null,

      facebookPageUrl:
        String(
          data.facebookPageUrl || ""
        ).trim() || null,

      enabled:
        typeof data.enabled === "boolean"
          ? data.enabled
          : true,
    },
  });
}