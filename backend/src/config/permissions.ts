export interface PermissionDefinition {
  key: string;
  label: string;
  group: string;
}

export const PERMISSIONS: PermissionDefinition[] = [
  // =====================================================
  // MAIN
  // =====================================================

  {
    key: "dashboard",
    label: "Dashboard",
    group: "Main",
  },

  {
    key: "customers",
    label: "Customers",
    group: "Main",
  },

  {
    key: "repair-jobs",
    label: "Repair Jobs",
    group: "Main",
  },

  {
  key: "repair-jobs.edit",
  label: "Edit Repair Jobs",
  group: "Main",
},

  {
    key: "repair-board",
    label: "Repair Board",
    group: "Main",
  },

  {
    key: "inventory",
    label: "Inventory",
    group: "Main",
  },

  {
    key: "suppliers",
    label: "Suppliers",
    group: "Main",
  },

  {
    key: "sales",
    label: "Sales",
    group: "Main",
  },

  {
  key: "purchases",
  label: "Purchases",
  group: "Main",
},

  {
    key: "technicians",
    label: "Technicians",
    group: "Main",
  },

  // =====================================================
  // ACCOUNTS
  // =====================================================

  {
    key: "accounts.customer-ledger",
    label: "Customer Ledger",
    group: "Accounts",
  },

  {
    key: "accounts.supplier-ledger",
    label: "Supplier Ledger",
    group: "Accounts",
  },

  {
    key: "accounts.purchase-party-ledger",
    label: "Purchase Party Ledger",
    group: "Accounts",
  },

  {
    key: "accounts.cash-book",
    label: "Cash Book",
    group: "Accounts",
  },

  {
    key: "accounts.expenses",
    label: "Expenses",
    group: "Accounts",
  },

  {
    key: "accounts.reports",
    label: "Reports",
    group: "Accounts",
  },

  // =====================================================
  // SETTINGS
  // =====================================================

  {
    key: "settings.device-types",
    label: "Device Types",
    group: "Settings",
  },

  {
    key: "settings.brands",
    label: "Brands",
    group: "Settings",
  },

  {
    key: "settings.device-fields",
    label: "Device Fields",
    group: "Settings",
  },

  {
    key: "settings.device-type-fields",
    label: "Device Type Fields",
    group: "Settings",
  },

  {
  key: "settings.receiving-print-layout",
  label: "Receiving Print Layout",
  group: "Settings",
},

{
  key: "settings.receiving-print-settings",
  label: "Receiving Print Settings",
  group: "Settings",
},

  {
  key: "settings.customer-layout",
  label: "Customer Layout",
  group: "Settings",
},

  {
    key: "settings.accessories",
    label: "Accessories",
    group: "Settings",
  },

  {
    key: "settings.users",
    label: "Users",
    group: "Settings",
  },

  {
    key: "settings.company",
    label: "Company",
    group: "Settings",
  },

  {
    key: "settings.whatsapp",
    label: "WhatsApp",
    group: "Settings",
  },

  {
    key: "settings.backup",
    label: "Backup",
    group: "Settings",
  },

{
  key: "settings.payment-methods",
  label: "Payment Methods",
  group: "Settings",
},

{
  key: "settings.system",
  label: "System",
  group: "Settings",
},

{
  key: "settings.feedback",
  label: "Feedback Settings",
  group: "Settings",
},

{
  key: "settings.messages",
  label: "Messages",
  group: "Settings",
},

{
  key: "settings.messages.manage",
  label: "Manage SMS Settings",
  group: "Settings",
},

{
  key: "settings.messages.test",
  label: "Test SMS",
  group: "Settings",
},

{
  key: "messages.send",
  label: "Send SMS",
  group: "Messages",
},

{
  key: "messages.send-custom",
  label: "Send Custom SMS",
  group: "Messages",
},

{
  key: "messages.view-history",
  label: "View SMS History",
  group: "Messages",
},

{
  key: "messages.manage-templates",
  label: "Manage Message Templates",
  group: "Messages",
},

{
  key: "messages.bulk-send",
  label: "Send Bulk SMS",
  group: "Messages",
},

];

export function getPermissionKeys() {
  return PERMISSIONS.map(
    (permission) =>
      permission.key
  );
}

export function isValidPermission(
  key: string
) {
  return PERMISSIONS.some(
    (permission) =>
      permission.key === key
  );
}