import { prisma } from "../config/prisma";

// =====================================================
// DEFAULT SYSTEM SETTINGS
// =====================================================

const DEFAULT_SETTINGS = {
  currency: "NPR",
  currencySymbol: "Rs.",
  dateFormat: "DD/MM/YYYY",
  timeZone: "Asia/Kathmandu",
  defaultWarrantyDays: 0,
  enableNotifications: true,
  allowNegativeStock: false,
};

// =====================================================
// GET SYSTEM SETTINGS
// =====================================================

export async function getSystemSettings() {
  let settings =
    await prisma.systemSettings.findUnique({
      where: {
        id: "system",
      },
    });

  if (!settings) {
    settings =
      await prisma.systemSettings.create({
        data: {
          id: "system",
          ...DEFAULT_SETTINGS,
        },
      });
  }

  return settings;
}

// =====================================================
// UPDATE SYSTEM SETTINGS
// =====================================================

export async function updateSystemSettings(
  data: any
) {
  const currency =
    String(
      data.currency ??
        DEFAULT_SETTINGS.currency
    ).trim();

  const currencySymbol =
    String(
      data.currencySymbol ??
        DEFAULT_SETTINGS.currencySymbol
    ).trim();

  const dateFormat =
    String(
      data.dateFormat ??
        DEFAULT_SETTINGS.dateFormat
    ).trim();

  const timeZone =
    String(
      data.timeZone ??
        DEFAULT_SETTINGS.timeZone
    ).trim();

  const defaultWarrantyDays =
    Number(
      data.defaultWarrantyDays ??
        DEFAULT_SETTINGS.defaultWarrantyDays
    );

  const enableNotifications =
    data.enableNotifications !==
    undefined
      ? Boolean(
          data.enableNotifications
        )
      : DEFAULT_SETTINGS.enableNotifications;

  const allowNegativeStock =
    data.allowNegativeStock !==
    undefined
      ? Boolean(
          data.allowNegativeStock
        )
      : DEFAULT_SETTINGS.allowNegativeStock;

  if (!currency) {
    throw new Error(
      "Currency is required."
    );
  }

  if (!currencySymbol) {
    throw new Error(
      "Currency symbol is required."
    );
  }

  if (!dateFormat) {
    throw new Error(
      "Date format is required."
    );
  }

  if (!timeZone) {
    throw new Error(
      "Time zone is required."
    );
  }

  return prisma.systemSettings.upsert({
    where: {
      id: "system",
    },

    create: {
      id: "system",
      currency,
      currencySymbol,
      dateFormat,
      timeZone,
      defaultWarrantyDays:
        Number.isFinite(
          defaultWarrantyDays
        )
          ? Math.max(
              0,
              Math.floor(
                defaultWarrantyDays
              )
            )
          : 0,
      enableNotifications,
      allowNegativeStock,
    },

    update: {
      currency,
      currencySymbol,
      dateFormat,
      timeZone,
      defaultWarrantyDays:
        Number.isFinite(
          defaultWarrantyDays
        )
          ? Math.max(
              0,
              Math.floor(
                defaultWarrantyDays
              )
            )
          : 0,
      enableNotifications,
      allowNegativeStock,
    },
  });
}