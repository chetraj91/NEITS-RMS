import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import {
  hasPermission,
  hasAnyPermission,
} from "../utils/permissions";

import { getSmsTemplates } from "../api/sms";

export default function Sidebar() {
  const [
    customSmsEnabled,
    setCustomSmsEnabled,
  ] = useState(false);
  useEffect(() => {
    async function loadCustomSmsSetting() {
      try {
        const response = await getSmsTemplates();

        const templates = Array.isArray(response?.data)
          ? response.data
          : [];

        const customTemplate = templates.find(
          (template: any) =>
            template.code === "CUSTOM_MESSAGE"
        );

        setCustomSmsEnabled(
          Boolean(customTemplate?.enabled)
        );
      } catch (error) {
        console.error(
          "LOAD SIDEBAR CUSTOM SMS SETTING ERROR:",
          error
        );

        setCustomSmsEnabled(false);
      }
    }

    loadCustomSmsSetting();
  }, []);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

const [
  accountsOpen,
  setAccountsOpen,
] = useState(false);

  function MenuLink({
    permission,
    to,
    children,
    indent = false,
  }: {
    permission: string;
    to: string;
    children: React.ReactNode;
    indent?: boolean;
  }) {
    if (
      !hasPermission(permission)
    ) {
      return null;
    }

   return (
  <div
    style={{
      marginLeft: indent ? 15 : 0,
      marginBottom: 14,
    }}
  >
    <Link
      to={to}
      style={{
        color: "white",
        textDecoration: "none",
        display: "block",
        fontSize: 17,
        fontWeight: 500,
        padding: "7px 4px",
      }}
    >
      {children}
    </Link>
  </div>
);
  }

  const showAccounts =
    hasAnyPermission([
      "accounts.customer-ledger",
      "accounts.supplier-ledger",
      "accounts.purchase-party-ledger",
      "accounts.cash-book",
      "accounts.expenses",
      "accounts.reports",
    ]);

  const showSettings =
    hasAnyPermission([
      "settings.device-types",
      "settings.brands",
      "settings.device-fields",
      "settings.device-type-fields",
      "settings.customer-layout",
      "settings.receiving-print-layout",
      "settings.receiving-print-settings",
      "settings.accessories",
      "settings.users",
      "settings.company",
      "settings.whatsapp",
      "settings.backup",
      "settings.system",
      "settings.feedback",
    ]);

  return (
  <div
  style={{
    width: 250,
    background: "#0f172a",
    color: "white",
    height: "100vh",
    overflowY: "auto",
    boxSizing: "border-box",
    padding: 20,
  }}
>
      <h2
        style={{
          marginBottom: 20,
        }}
      >
        NEITS RMS
      </h2>

      <hr />

      <MenuLink
        permission="dashboard"
        to="/dashboard"
      >
        Dashboard
      </MenuLink>

      <MenuLink
        permission="customers"
        to="/customers"
      >
        Customers
      </MenuLink>

      <MenuLink
        permission="suppliers"
        to="/suppliers"
      >
        Suppliers
      </MenuLink>

      <MenuLink
        permission="repair-jobs"
        to="/repair-jobs"
      >
        Repair Jobs
      </MenuLink>

            <MenuLink
        permission="repair-jobs"
        to="/repair-jobs/new"
      >
        New Repair Job
      </MenuLink>

      <MenuLink
        permission="repair-board"
        to="/repair-board"
      >
        Repair Board
      </MenuLink>

      <MenuLink
        permission="inventory"
        to="/inventory"
      >
        Inventory
      </MenuLink>

      <MenuLink
      permission="sales"
      to="/sales"
      >
      Sales
      </MenuLink>

      <MenuLink
       permission="sales"
        to="/sales-returns"
        >
        Sales Return
      </MenuLink>

            <MenuLink
        permission="purchases"
        to="/purchases"
      >
        Purchases
      </MenuLink>

      <MenuLink
        permission="purchases"
        to="/purchase-returns"
      >
        Purchase Return
      </MenuLink>
        <MenuLink
        permission="technicians"
        to="/technicians"
        >
        Technicians
        </MenuLink>

            {customSmsEnabled &&
           hasAnyPermission([
          "messages.send-custom",
           "messages.bulk-send",
            ]) && (

        <div
          style={{
            marginBottom: 14,
          }}
        >
          <Link
            to="/custom-sms"
            style={{
              color: "white",
              textDecoration: "none",
              display: "block",
              fontSize: 17,
              fontWeight: 500,
              padding: "7px 4px",
            }}
          >
            Custom SMS
          </Link>
        </div>
      )}

      <MenuLink
        permission="messages.view-history"
        to="/sms-history"
      >
        SMS History
      </MenuLink>

      {/* =========================================
          ACCOUNTS
      ========================================= */}

      {showAccounts && (
  <>
    <hr />

    <h3
      style={{
        cursor: "pointer",
        userSelect: "none",
        fontSize: 17,
        fontWeight: 700,
        marginTop: 18,
        marginBottom: 10,
      }}
      onClick={() =>
        setAccountsOpen(
          !accountsOpen
        )
      }
    >
      💵 Accounts{" "}
      {accountsOpen
        ? "▲"
        : "▼"}
    </h3>

    {accountsOpen && (
      <div
        style={{
          marginLeft: 20,
        }}
      >
        <MenuLink
          permission="accounts.customer-ledger"
          to="/accounts/customer-ledger"
        >
          Customer Ledger
        </MenuLink>

        <MenuLink
          permission="accounts.supplier-ledger"
          to="/accounts/supplier-ledger"
        >
          Supplier Ledger
        </MenuLink>

        <MenuLink
          permission="accounts.purchase-party-ledger"
          to="/accounts/purchase-party-ledger"
        >
          Purchase Party Ledger
        </MenuLink>

        <MenuLink
          permission="accounts.cash-book"
          to="/accounts/cash-book"
        >
          Cash Book
        </MenuLink>

        <MenuLink
          permission="accounts.expenses"
          to="/accounts/expenses"
        >
          Expenses
        </MenuLink>

        <MenuLink
          permission="accounts.reports"
          to="/accounts/reports"
        >
          Reports
        </MenuLink>
      </div>
    )}
  </>
)}
      {/* =========================================
          SETTINGS
      ========================================= */}

      {showSettings && (
        <>
          <hr />

          <h3
            style={{
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={() =>
              setSettingsOpen(
                !settingsOpen
              )
            }
          >
            ⚙ Settings{" "}
            {settingsOpen
              ? "▲"
              : "▼"}
          </h3>

          {settingsOpen && (
            <div
              style={{
                marginLeft: 20,
              }}
            >
              <MenuLink
                permission="settings.device-types"
                to="/settings/device-types"
              >
                Device Types
              </MenuLink>

              <MenuLink
                permission="settings.brands"
                to="/settings/brands"
              >
                Brands
              </MenuLink>

              <MenuLink
                permission="settings.device-fields"
                to="/settings/device-fields"
              >
                Device Fields
              </MenuLink>

              <MenuLink
                permission="settings.device-type-fields"
                to="/settings/device-type-fields"
              >
                Device Type Fields
              </MenuLink>

              <MenuLink
               permission="settings.customer-layout"
              to="/settings/customer-layout"
               >
               Customer Layout
              </MenuLink>

              <MenuLink
               permission="settings.receiving-print-layout"
               to="/settings/receiving-print-layout"
                >
               Receiving Print Layout
              </MenuLink>

              <MenuLink
             permission="settings.receiving-print-settings"
             to="/settings/receiving-print-settings"
              >
             Receiving Print Settings
             </MenuLink>

              <MenuLink
                permission="settings.accessories"
                to="/settings/accessories"
              >
                Accessories
              </MenuLink>

              <MenuLink
                permission="settings.users"
                to="/settings/users"
              >
                Users
              </MenuLink>

              <MenuLink
                permission="settings.company"
                to="/settings/company"
              >
                Company
              </MenuLink>

              <MenuLink
               permission="settings.feedback"
               to="/settings/feedback"
               >
                Feedback Settings
                </MenuLink>

              <MenuLink
                permission="settings.whatsapp"
                to="/settings/whatsapp"
              >
                WhatsApp
              </MenuLink>

              <MenuLink
                permission="settings.backup"
                to="/settings/backup"
              >
                Backup
              </MenuLink>

              <MenuLink
              permission="settings.messages"
              to="/settings/messages"
              >
              Messages
              </MenuLink>

            <MenuLink
             
             permission="settings.payment-methods"
             to="/settings/payment-methods"
             >
            Payment Methods
            </MenuLink>

            <MenuLink
            permission="settings.system"
            to="/settings/system"
            >
            System
            </MenuLink>

            </div>
          )}
        </>
      )}
    </div>
  );
}