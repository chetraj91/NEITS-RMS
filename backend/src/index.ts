import express from "express";
import cors from "cors";
import { env } from "./config/env";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import repairJobRoutes from "./routes/repairJob.routes";
import backupRoutes from "./routes/backup.routes";
import smsRoutes from "./routes/sms.routes";
import technicianRoutes from "./routes/technician.routes";
import inventoryRoutes from "./routes/inventory.routes";
import inventoryCategoryRoutes from "./routes/inventoryCategory.routes";
import supplierRoutes from "./routes/supplier.routes";
import purchaseRoutes from "./routes/purchase.routes";
import customerPaymentRoutes from "./routes/customerPayment.routes";
import saleRoutes from "./routes/sale.routes";
import salesReturnRoutes from "./routes/salesReturn.routes";

import repairPartRoutes from "./routes/repairPart.routes";
import invoiceRoutes from "./routes/invoice.routes";
import paymentRoutes from "./routes/payment.routes";
import customerLedgerRoutes from "./routes/customerLedger.routes";
import supplierLedgerRoutes from "./routes/supplierLedger.routes";
import cashBookRoutes from "./routes/cashBook.routes";
import expenseRoutes from "./routes/expense.routes";
import reportRoutes from "./routes/report.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import repairBoardRoutes from "./routes/repairBoard.routes";
import repairBoardUpdateRoutes from "./routes/repairBoardUpdate.routes";

import deviceTypeRoutes from "./routes/deviceType.routes";
import brandRoutes from "./routes/brand.routes";
import deviceFieldRoutes from "./routes/deviceField.routes";

import deviceTypeLayoutRoutes
  from "./routes/deviceTypeLayout.routes";

import deviceTypeFieldRoutes from "./routes/deviceTypeField.routes";
import accessoryRoutes from "./routes/accessory.routes";
import purchaseLedgerRoutes from "./routes/purchaseLedger.routes";
import userRoutes from "./routes/user.routes";
import supplierPaymentRoutes
  from "./routes/supplierPayment.routes";

  import companySettingsRoutes
  from "./routes/companySettings.routes";

  import feedbackSettingRoutes
  from "./routes/feedbackSetting.routes";

  import feedbackRoutes from "./routes/feedback.routes";

  import paymentMethodRoutes
  from "./routes/paymentMethod.routes";

  import systemSettingsRoutes
  from "./routes/systemSettings.routes";

  import customerLayoutRoutes
  from "./routes/customerLayout.routes";


  import receivingPrintLayoutRoutes
  from "./routes/receivingPrintLayout.routes";

  import receivingPrinterSettingRoutes
  from "./routes/receivingPrinterSetting.routes";

  import smsTemplateRoutes
  from "./routes/smsTemplate.routes";

  import excelBackupRoutes from "./routes/excelBackup.routes";
  import googleDriveRoutes from "./routes/googleDrive.routes";


const app = express();

app.use(cors());
app.use(express.json());

// =========================
// API Routes
// =========================

app.use("/api/auth", authRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/repair-jobs", repairJobRoutes);

app.use("/api/technicians", technicianRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use(
  "/api/inventory-categories",
  inventoryCategoryRoutes
);

app.use("/api/suppliers", supplierRoutes);

app.use("/api/purchases", purchaseRoutes);

app.use(
  "/api/customer-payments",
  customerPaymentRoutes
);

app.use("/api/sales", saleRoutes);

app.use(
  "/api/sales-returns",
  salesReturnRoutes
);

app.use("/api/repair-parts", repairPartRoutes);

app.use("/api/invoices", invoiceRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/customer-ledger", customerLedgerRoutes);

app.use(
  "/api/supplier-ledger",
  supplierLedgerRoutes
);

app.use("/api/cash-book", cashBookRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/repair-board", repairBoardRoutes);

app.use(
  "/api/repair-board/update",
  repairBoardUpdateRoutes
);

app.use(
  "/api/users",
  userRoutes
);

// =========================
// Settings
// =========================

app.use(
  "/api/device-types",
  deviceTypeRoutes
);

app.use(
  "/api/customer-layout",
  customerLayoutRoutes
);

app.use(
  "/api/payment-methods",
  paymentMethodRoutes
);

app.use(
  "/api/company-settings",
  companySettingsRoutes
);

app.use(
  "/api/feedback-settings",
  feedbackSettingRoutes
);

app.use(
  "/api/feedback",
  feedbackRoutes
);

app.use(
  "/api/brands",
  brandRoutes
);

app.use(
  "/api/device-fields",
  deviceFieldRoutes
);

app.use(
  "/api/device-type-fields",
  deviceTypeFieldRoutes
);

app.use(
  "/api/device-type-layout",
  deviceTypeLayoutRoutes
);

app.use(
  "/api/supplier-payments",
  supplierPaymentRoutes
);

// Accessories
app.use(
  "/api/accessories",
  accessoryRoutes
);

app.use(
  "/api/accounts/purchase-party-ledger",
  purchaseLedgerRoutes
);

app.use(
  "/api/system-settings",
  systemSettingsRoutes
);

app.use(
  "/api/receiving-print-layout",
  receivingPrintLayoutRoutes
);

app.use(
  "/api/receiving-printer-settings",
  receivingPrinterSettingRoutes
);

app.use(
  "/api/backup",
  backupRoutes
);

app.use(
  "/api/excel-backup",
  excelBackupRoutes
);

app.use(
  "/api/google-drive",
  googleDriveRoutes
);

app.use(
  "/api/sms",
  smsRoutes
);

app.use(
  "/api/sms/templates",
  smsTemplateRoutes
);

// =========================
// Home Route
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    application: "NEITS Repair Management System",
    version: "1.0.0",
    status: "Running",
  });
});

// =========================
// Start Server
// =========================

app.listen(env.PORT, () => {
  console.log(
    `🚀 Server running on port ${env.PORT}`
  );
});