import api from "./axios";

// =====================================================
// TYPES
// =====================================================

export interface SmsSettings {
  enabled: boolean;
  provider: string;
  hasToken: boolean;
  senderId: string;
  apiBaseUrl?: string;
}

export interface SmsBalance {
  balance: string;
  ntc_rate?: string;
  ncell_rate?: string;
  smartcell_rate?: string;
}

// =====================================================
// GET SMS SETTINGS
// =====================================================

export async function getSmsSettings() {
  const response = await api.get(
    "/sms/settings"
  );

  return response.data;
}

// =====================================================
// UPDATE SMS SETTINGS
// =====================================================

export async function updateSmsSettings(
  data: {
    enabled: boolean;
    apiToken?: string;
    senderId?: string;
  }
) {
  const response = await api.put(
    "/sms/settings",
    data
  );

  return response.data;
}

// =====================================================
// TEST SOCIAIR CONNECTION
// =====================================================

export async function testSmsConnection() {
  const response = await api.get(
    "/sms/test-connection"
  );

  return response.data;
}

// =====================================================
// GET SOCIAIR BALANCE
// =====================================================

export async function getSmsBalance() {
  const response = await api.get(
    "/sms/balance"
  );

  return response.data;
}

// =====================================================
// SEND TEST SMS
// =====================================================

export async function sendTestSms(
  mobile: string,
  message: string
) {
  const response = await api.post(
    "/sms/test",
    {
      mobile,
      message,
    }
  );

  return response.data;
}
// =====================================================
// SMS TEMPLATES
// =====================================================

export async function getSmsTemplates() {
  const response = await api.get(
    "/sms/templates"
  );

  return response.data;
}

// =====================================================
// CREATE SMS TEMPLATE
// =====================================================

export async function createSmsTemplate(
  data: {
    name: string;
    code: string;
    message: string;
    enabled?: boolean;
  }
) {
  const response = await api.post(
    "/sms/templates",
    data
  );

  return response.data;
}

// =====================================================
// UPDATE SMS TEMPLATE
// =====================================================

export async function updateSmsTemplate(
  id: string,
  data: {
    name: string;
    code: string;
    message: string;
    enabled?: boolean;
  }
) {
  const response = await api.put(
    `/sms/templates/${id}`,
    data
  );

  return response.data;
}

// =====================================================
// TOGGLE SMS TEMPLATE
// =====================================================

export async function toggleSmsTemplate(
  id: string
) {
  const response = await api.patch(
    `/sms/templates/${id}/toggle`
  );

  return response.data;
}

// =====================================================
// DELETE SMS TEMPLATE
// =====================================================

export async function deleteSmsTemplate(
  id: string
) {
  const response = await api.delete(
    `/sms/templates/${id}`
  );

  return response.data;
}
// =====================================================
// SEND FEEDBACK REQUEST SMS
// =====================================================

export async function sendFeedbackRequestSms(
  repairJobId: string
) {
  const response = await api.post(
    `/sms/feedback-request/${repairJobId}`
  );

  return response.data;
}

// =====================================================
// GET FEEDBACK REQUEST STATUS
// =====================================================

export async function getFeedbackRequestStatus(
  repairJobId: string
) {
  const response = await api.get(
    `/sms/feedback-request-status/${repairJobId}`
  );

  return response.data;
}

// =====================================================
// CUSTOM SMS - RECIPIENT TYPES
// =====================================================

export type SmsPartyType =
  | "CUSTOMER"
  | "SUPPLIER";

export interface CustomSmsRecipient {
  id: string;
  fullName?: string;
  companyName?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  customerCode?: string;
  supplierCode?: string;
}

// =====================================================
// SEARCH CUSTOM SMS RECIPIENTS
// =====================================================

export async function searchCustomSmsRecipients(
  partyType: SmsPartyType,
  search: string = ""
) {
  const response = await api.get(
    "/sms/custom/recipients",
    {
      params: {
        partyType,
        search,
      },
    }
  );

  return response.data;
}

// =====================================================
// SEND CUSTOM / BULK SMS
// =====================================================

export async function sendCustomSms(
  data: {
    partyType: SmsPartyType;
    recipientIds: string[];
    message: string;
  }
) {
  const response = await api.post(
    "/sms/custom/send",
    data
  );

  return response.data;
}

// =====================================================
// SMS HISTORY
// =====================================================

export async function getSmsHistory(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    partyType?: "ALL" | "CUSTOMER" | "SUPPLIER";
    status?: "ALL" | "SENT" | "FAILED" | "PENDING";
  } = {}
) {
  const response = await api.get(
    "/sms/history",
    {
      params,
    }
  );

  return response.data;
}