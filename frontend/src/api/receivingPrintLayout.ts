import api from "./axios";

// =====================================================
// GET LAYOUT
// =====================================================

export async function getReceivingPrintLayout(
  documentType: string
) {
  const res = await api.get(
    `/receiving-print-layout/${documentType}`
  );

  return res.data;
}

// =====================================================
// SAVE LAYOUT
// =====================================================

export async function saveReceivingPrintLayout(
  documentType: string,
  fields: any[]
) {
  const res = await api.post(
    `/receiving-print-layout/${documentType}`,
    {
      fields,
    }
  );

  return res.data;
}

// =====================================================
// GET PRINT SIZE
// =====================================================

export async function getReceivingPrintSize(
  documentType: string
) {
  const res = await api.get(
    `/receiving-print-layout/${documentType}/size`
  );

  return res.data;
}

// =====================================================
// SAVE PRINT SIZE
// =====================================================

export async function saveReceivingPrintSize(
  documentType: string,
  widthMm: number,
  heightMm: number
) {
  const res = await api.post(
    `/receiving-print-layout/${documentType}/size`,
    {
      widthMm,
      heightMm,
    }
  );

  return res.data;
}