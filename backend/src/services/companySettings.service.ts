import { prisma } from "../config/prisma";
import { encryptGoogleDriveSecret } from "../utils/googleDriveToken";

// =====================================================
// DEFAULT COMPANY DATA
// =====================================================

const DEFAULT_COMPANY = {
  companyName:
    "Nepal Electronics & IT Solution",

  address:
    "New Road, Kathmandu, Nepal",

  phone:
    "+977-9803453571",

  email:
    "neitslab@gmail.com",

  panVat:
    "601837201",

  website:
    "",

  logoUrl:
    "",

  invoiceFooter:
    "Thank you for your business.",

  // Excel / Google Drive Backup
  excelBackupEnabled: false,

  googleDriveEmail:
    "",

  googleDriveFolderId:
    "",

 googleClientId:
    "",

  googleClientSecret:
    "",

  repairExcelEnabled: true,

  salesExcelEnabled: true,

  purchaseExcelEnabled: true,
};

// =====================================================
// GET COMPANY SETTINGS
// =====================================================

export async function getCompanySettings() {
  let company =
    await prisma.companySettings.findUnique({
      where: {
        id: "company",
      },
    });

  // Create default record on first access
  if (!company) {
    company =
      await prisma.companySettings.create({
        data: {
          id: "company",
          ...DEFAULT_COMPANY,
        },
      });
  }
  const {
    googleClientSecret,
    ...safeCompany
  } = company;

  return safeCompany;
}

// =====================================================
// UPDATE COMPANY SETTINGS
// =====================================================

export async function updateCompanySettings(
  data: any
) {
  const companyName =
    String(
      data.companyName || ""
    ).trim();

  if (!companyName) {
    throw new Error(
      "Company name is required."
    );
  }

  return prisma.companySettings.upsert({
    where: {
      id: "company",
    },

    create: {
      id: "company",

      companyName,

      address:
        data.address?.trim() ||
        null,

      phone:
        data.phone?.trim() ||
        null,

      email:
        data.email?.trim() ||
        null,

      panVat:
        data.panVat?.trim() ||
        null,

      website:
        data.website?.trim() ||
        null,

      logoUrl:
        data.logoUrl?.trim() ||
        null,

      invoiceFooter:
        data.invoiceFooter?.trim() ||
        null,

      // Excel / Google Drive Backup
      excelBackupEnabled:
        data.excelBackupEnabled === true,

      googleDriveEmail:
        data.googleDriveEmail?.trim() ||
        null,

      googleDriveFolderId:
        data.googleDriveFolderId?.trim() ||
        null,

        googleClientId:
        data.googleClientId?.trim() ||
        null,

        googleClientSecret:
         data.googleClientSecret?.trim()
        ? encryptGoogleDriveSecret(
        data.googleClientSecret.trim()
       )
       : null,

      repairExcelEnabled:
        data.repairExcelEnabled !== false,

      salesExcelEnabled:
        data.salesExcelEnabled !== false,

      purchaseExcelEnabled:
        data.purchaseExcelEnabled !== false,
    },

    update: {
      companyName,

      address:
        data.address?.trim() ||
        null,

      phone:
        data.phone?.trim() ||
        null,

      email:
        data.email?.trim() ||
        null,

      panVat:
        data.panVat?.trim() ||
        null,

      website:
        data.website?.trim() ||
        null,

      logoUrl:
        data.logoUrl?.trim() ||
        null,

      invoiceFooter:
        data.invoiceFooter?.trim() ||
        null,

      // Excel / Google Drive Backup
      excelBackupEnabled:
        data.excelBackupEnabled === true,

      googleDriveEmail:
        data.googleDriveEmail?.trim() ||
        null,

      googleDriveFolderId:
        data.googleDriveFolderId?.trim() ||
        null,

        googleClientId:
       data.googleClientId?.trim() ||
       null,

        googleClientSecret:
        data.googleClientSecret?.trim()
       ? encryptGoogleDriveSecret(
        data.googleClientSecret.trim()
       )
       : undefined,

      repairExcelEnabled:
        data.repairExcelEnabled !== false,

      salesExcelEnabled:
        data.salesExcelEnabled !== false,

      purchaseExcelEnabled:
        data.purchaseExcelEnabled !== false,
    },
  });
}