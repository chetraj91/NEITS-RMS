import axios from "axios";

import { prisma } from "../config/prisma";

// =====================================================
// TYPES
// =====================================================

export interface SociairBalance {
  balance: string;
  ntc_rate?: string;
  ncell_rate?: string;
  smartcell_rate?: string;
}

export interface SociairSendResponse {
  message?: string;
  ntc?: number;
  ncell?: number;
  smartcell?: number;
  other?: number;
  invalid_number?: string[];
}

// =====================================================
// CONSTANTS
// =====================================================

const SOCIAIR_BASE_URL =
  "https://sms.sociair.com/api";

// =====================================================
// GET SMS SETTINGS
// =====================================================

export async function getSmsSettings() {
  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  return settings;
}

// =====================================================
// GET SOCIAIR TOKEN
// =====================================================

async function getSociairToken(): Promise<string> {
  const settings =
    await getSmsSettings();

  if (!settings) {
    throw new Error(
      "SMS settings have not been configured."
    );
  }

  if (!settings.enabled) {
    throw new Error(
      "SMS service is disabled."
    );
  }

  const token =
    String(
      settings.apiToken || ""
    ).trim();

  if (!token) {
    throw new Error(
      "Sociair API token has not been configured."
    );
  }

  return token;
}

// =====================================================
// BALANCE INQUIRY
// =====================================================

export async function getSociairBalance(): Promise<SociairBalance> {
  const token =
    await getSociairToken();

  try {
    const response =
      await axios.get(
        `${SOCIAIR_BASE_URL}/balance`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          timeout: 15000,
        }
      );

    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to connect to Sociair.";

    throw new Error(message);
  }
}

// =====================================================
// TEST SOCIAIR TOKEN
// =====================================================

export async function testSociairConnection() {
  const balance =
    await getSociairBalance();

  return {
    success: true,
    balance,
  };
}

// =====================================================
// SEND SINGLE SMS
// =====================================================

export async function sendSociairSms(
  mobile: string,
  message: string
): Promise<SociairSendResponse> {

  const token =
    await getSociairToken();

  const phone =
    String(mobile || "").trim();

  const sms =
    String(message || "").trim();

  if (!phone) {
    throw new Error(
      "Mobile number is required."
    );
  }

  if (!sms) {
    throw new Error(
      "SMS message cannot be empty."
    );
  }

  try {
    const response =
      await axios.post(
        `${SOCIAIR_BASE_URL}/sms`,
        {
          message: sms,
          mobile: phone,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          timeout: 15000,
        }
      );

    return response.data;
  } catch (error: any) {

    const data =
      error?.response?.data;

    if (data?.message) {
      throw new Error(
        data.message
      );
    }

    throw new Error(
      error?.message ||
      "Unable to send SMS through Sociair."
    );
  }
}