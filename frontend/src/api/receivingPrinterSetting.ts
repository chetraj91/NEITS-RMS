import api from "./axios";

// =====================================================
// GET SAVED PRINTER SETTINGS
// =====================================================

export async function getReceivingPrinterSettings() {
  const res = await api.get(
    "/receiving-printer-settings"
  );

  return res.data;
}

// =====================================================
// SAVE PRINTER SETTINGS
// =====================================================

export async function saveReceivingPrinterSettings(
  voucherPrinter: string | null,
  stickerPrinter: string | null
) {
  const res = await api.post(
    "/receiving-printer-settings",
    {
      voucherPrinter,
      stickerPrinter,
    }
  );

  return res.data;
}

// =====================================================
// GET WINDOWS PRINTERS FROM LOCAL PRINT AGENT
// =====================================================

export async function getWindowsPrinters() {
  const res = await fetch(
    "http://127.0.0.1:9123/printers"
  );

  if (!res.ok) {
    throw new Error(
      "Unable to connect to NEITS RMS Print Agent."
    );
  }

  return res.json();
}