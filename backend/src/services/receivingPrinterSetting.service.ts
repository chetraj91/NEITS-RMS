import { prisma } from "../config/prisma";

// =====================================================
// GET SETTINGS
// =====================================================

export async function getReceivingPrinterSettings() {
  const existing =
    await prisma.receivingPrinterSetting.findFirst();

  if (existing) {
    return existing;
  }

  return prisma.receivingPrinterSetting.create({
    data: {
      voucherPrinter: null,
      stickerPrinter: null,
    },
  });
}

// =====================================================
// SAVE SETTINGS
// =====================================================

export async function saveReceivingPrinterSettings(
  voucherPrinter: string | null,
  stickerPrinter: string | null
) {
  const existing =
    await prisma.receivingPrinterSetting.findFirst();

  if (existing) {
    return prisma.receivingPrinterSetting.update({
      where: {
        id: existing.id,
      },

      data: {
        voucherPrinter:
          voucherPrinter?.trim() || null,

        stickerPrinter:
          stickerPrinter?.trim() || null,
      },
    });
  }

  return prisma.receivingPrinterSetting.create({
    data: {
      voucherPrinter:
        voucherPrinter?.trim() || null,

      stickerPrinter:
        stickerPrinter?.trim() || null,
    },
  });
}