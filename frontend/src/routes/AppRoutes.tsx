import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import CustomSmsPage from "../pages/CustomSmsPage";
import SmsHistoryPage from "../pages/SmsHistoryPage";

import CustomersPage from "../pages/CustomersPage";
import NewCustomerPage from "../pages/NewCustomerPage";

import RepairJobsPage from "../pages/RepairJobsPage";
import NewRepairJobPage from "../pages/NewRepairJobPage";
import RepairJobDetailsPage from "../pages/RepairJobDetailsPage";
import EditRepairJobPage from "../pages/EditRepairJobPage";

import RepairBoardPage from "../pages/RepairBoardPage";

import InventoryPage from "../pages/InventoryPage";
import AddInventoryPage from "../pages/AddInventoryPage";
import SuppliersPage from "../pages/SuppliersPage";
import InvoicePage from "../pages/InvoicePage";

import AccountsDashboard from "../pages/accounts/AccountsDashboard";
import CustomerLedgerPage from "../pages/accounts/CustomerLedgerPage";
import CashBookPage from "../pages/accounts/CashBookPage";
import ReportsPage from "../pages/accounts/ReportsPage";

import SettingsPage from "../pages/SettingsPage";

import BackupPage
  from "../pages/settings/BackupPage";

  import MessagesPage
  from "../pages/settings/MessagesPage";

import TechniciansPage from "../pages/TechniciansPage";

import DeviceTypePage from "../pages/settings/DeviceTypePage";
import BrandPage from "../pages/settings/BrandPage";
import DeviceFieldPage from "../pages/settings/DeviceFieldPage";
import DeviceTypeFieldPage from "../pages/settings/DeviceTypeFieldPage";
import AccessoryPage from "../pages/settings/AccessoryPage";
import InventoryViewPage from "../pages/InventoryViewPage";

import CustomerViewPage from "../pages/CustomerViewPage";
import EditCustomerPage from "../pages/EditCustomerPage";
import SalesPage from "../pages/SalesPage";
import SaleInvoicePage from "../pages/SaleInvoicePage";
import SalesReturnPage from "../pages/SalesReturnPage";
import PurchaseReturnPage from "../pages/PurchaseReturnPage";
import ProtectedRoute from "../components/ProtectedRoute";

import PurchasePartyLedgerPage
  from "../pages/accounts/PurchasePartyLedgerPage";
  import PurchasesPage from "../pages/PurchasesPage";

import SupplierLedgerPage
  from "../pages/accounts/SupplierLedgerPage";

  import ExpensesPage
  from "../pages/accounts/ExpensesPage";

  import CompanySettingsPage
  from "../pages/settings/CompanySettingsPage";

  import FeedbackSettingsPage
  from "../pages/settings/FeedbackSettingsPage";

  import FeedbackPage
  from "../pages/feedback/FeedbackPage";

  import PaymentMethodsPage
  from "../pages/settings/PaymentMethodsPage";

  import SystemSettingsPage
  from "../pages/settings/SystemSettingsPage";

  import UsersPage from "../pages/UsersPage";

  import CustomerLayoutPage
  from "../pages/settings/CustomerLayoutPage";

import ReceivingPrintLayoutPage
  from "../pages/settings/ReceivingPrintLayoutPage";

import ReceivingPrinterSettingPage
  from "../pages/settings/ReceivingPrinterSettingPage";

import MainLayout from "../components/layout/MainLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}

        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
         path="/feedback"
         element={<FeedbackPage />}
         />

        {/* Main Layout */}

        <Route element={<MainLayout />}>

          {/* Dashboard */}

         <Route element={<ProtectedRoute permission="dashboard" />}>

         <Route
          path="/dashboard"
          element={<DashboardPage />}
          />
          </Route>

          {/* Custom SMS */}

         <Route
         element={
         <ProtectedRoute
         permissions={[
        "messages.send-custom",
        "messages.bulk-send",
         ]}
        />
        }
        >
         <Route
        path="/custom-sms"
        element={<CustomSmsPage />}
        />
       </Route>

       {/* SMS History */}

      <Route
      element={
      <ProtectedRoute
     permission="messages.view-history"
     />
    }
    >
    <Route
    path="/sms-history"
    element={<SmsHistoryPage />}
    />
    </Route>

          {/* Customers */}

        <Route
        element={
        <ProtectedRoute permission="customers" />
        }
        >
       <Route
        path="/customers"
         element={<CustomersPage />}
         />
         </Route>


          <Route
           path="/customers/view/:id"
           element={<CustomerViewPage />}
           />

           <Route
           path="/customers/edit/:id"
           element={<EditCustomerPage />}
           />

          <Route
            path="/customers/new"
            element={<NewCustomerPage />}
          />

          {/* Repair Jobs */}

         <Route element={<ProtectedRoute permission="repair-jobs" />}>
         <Route
         path="/repair-jobs"
          element={<RepairJobsPage />}
         />
         </Route>

          <Route element={<ProtectedRoute permission="repair-jobs" />}>
         <Route
          path="/repair-jobs/new"
           element={<NewRepairJobPage />}
          />
           </Route>

                    <Route element={<ProtectedRoute permission="repair-jobs.details" />}>
            <Route
              path="/repair-jobs/:id"
              element={<RepairJobDetailsPage />}
            />
          </Route>

           <Route element={<ProtectedRoute permission="repair-jobs.edit" />}>
          <Route
           path="/repair-jobs/edit/:id"
          element={<EditRepairJobPage />}
          />
          </Route>
       
          <Route
          path="/accounts/expenses"
          element={
         <ExpensesPage />
         }
         />

          {/* Repair Board */}

        <Route element={<ProtectedRoute permission="repair-board" />}>
        <Route
        path="/repair-board"
         element={<RepairBoardPage />}
          />
          </Route>

          {/* Inventory */}

         <Route element={<ProtectedRoute permission="inventory" />}>
         <Route
          path="/inventory"
         element={<InventoryPage />}
          />
         </Route>
 
         <Route element={<ProtectedRoute permission="inventory" />}>
         <Route
         path="/inventory/new"
          element={<AddInventoryPage />}
           />
          </Route>

          <Route
           path="/inventory/:id"
          element={<InventoryViewPage />}
          />

         <Route element={<ProtectedRoute permission="sales" />}>
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales-returns" element={<SalesReturnPage />} />
          </Route>
           
          {/* Suppliers */}

         <Route element={<ProtectedRoute permission="suppliers" />}>
        <Route
         path="/suppliers"
         element={<SuppliersPage />}
         />
         </Route>

          {/* Invoice */}

          <Route
            path="/invoice/:id"
            element={<InvoicePage />}
          />
          <Route
         path="/invoice/sale/:id"
         element={<SaleInvoicePage />}
         />

          {/* Accounts */}

          <Route
  element={
    <ProtectedRoute
      permissions={[
        "accounts.customer-ledger",
        "accounts.supplier-ledger",
        "accounts.purchase-party-ledger",
        "accounts.cash-book",
        "accounts.expenses",
        "accounts.reports",
      ]}
    />
     }
     >
     <Route
    path="/accounts"
    element={<AccountsDashboard />}
     />
     </Route>

          <Route element={<ProtectedRoute permission="accounts.supplier-ledger" />}>
        <Route
          path="/accounts/supplier-ledger"
        element={<SupplierLedgerPage />}
         />
        </Route>

         <Route element={<ProtectedRoute permission="accounts.customer-ledger" />}>
        <Route
        path="/accounts/customer-ledger"
        element={<CustomerLedgerPage />}
        />
         </Route>

         <Route element={<ProtectedRoute permission="accounts.cash-book" />}>
         <Route
       path="/accounts/cash-book"
        element={<CashBookPage />}
       />
      </Route>

         <Route element={<ProtectedRoute permission="accounts.reports" />}>
         <Route
          path="/accounts/reports"
          element={<ReportsPage />}
         />
          </Route>

          <Route
            path="/accounts/reports"
            element={<ReportsPage />}
          />

          <Route element={<ProtectedRoute permission="settings.users" />}>
          <Route
          path="/settings/users"
          element={<UsersPage />}
         />
         </Route>

          {/* Settings */}

          <Route
          element={
          <ProtectedRoute
          permission="settings.device-types"
          />
         }
         >
         <Route
  element={
    <ProtectedRoute
      permissions={[
        "settings.device-types",
        "settings.brands",
        "settings.device-fields",
        "settings.receiving-print-layout",
        "settings.receiving-print-settings",
        "settings.device-type-fields",
        "settings.accessories",
        "settings.users",
        "settings.company",
        "settings.whatsapp",
        "settings.backup",
        "settings.system",
        "settings.feedback",
      ]}
    />
  }
>
  <Route
    path="/settings"
    element={<SettingsPage />}
  />
</Route>
          </Route>

          <Route element={<ProtectedRoute permission="settings.device-types" />}>
         <Route
          path="/settings/device-types"
           element={<DeviceTypePage />}
           />
           </Route>

        <Route element={<ProtectedRoute permission="settings.brands" />}>
       <Route
        path="/settings/brands"
        element={<BrandPage />}
        />
        </Route>

        <Route element={<ProtectedRoute permission="settings.device-fields" />}>
        <Route
        path="/settings/device-fields"
        element={<DeviceFieldPage />}
       />
       </Route>

          <Route
            path="/settings/device-type-fields"
            element={<DeviceTypeFieldPage />}
          />

         <Route element={<ProtectedRoute permission="settings.accessories" />}>
         <Route
         path="/settings/accessories"
        element={<AccessoryPage />}
        />
       </Route>

       <Route
  element={
    <ProtectedRoute
      permission="settings.company"
    />
  }
>
        <Route
        path="/settings/company"
         element={
        <CompanySettingsPage />
        }
        />
        </Route>
<Route
  element={
    <ProtectedRoute
      permission="settings.feedback"
    />
  }
>
  <Route
    path="/settings/feedback"
    element={
      <FeedbackSettingsPage />
    }
  />
</Route>


          <Route
            path="/settings/technicians"
            element={<TechniciansPage />}
          />

          {/* Direct Links */}

          <Route
            path="/brands"
            element={<BrandPage />}
          />

          <Route
            path="/technicians"
            element={<TechniciansPage />}
          />

          <Route
  element={
    <ProtectedRoute
      permission="settings.customer-layout"
    />
  }
>
  <Route
    path="/settings/customer-layout"
    element={
      <CustomerLayoutPage />
    }
  />
</Route>

<Route
  element={
    <ProtectedRoute
      permission="settings.receiving-print-layout"
    />
  }
>
  <Route
    path="/settings/receiving-print-layout"
    element={
      <ReceivingPrintLayoutPage />
    }
  />
</Route>

<Route
  element={
    <ProtectedRoute
      permission="settings.receiving-print-settings"
    />
  }
>
  <Route
    path="/settings/receiving-print-settings"
    element={
      <ReceivingPrinterSettingPage />
    }
  />
</Route>
          <Route
          element={
         <ProtectedRoute
          permission="settings.payment-methods"
          />
       }
      >
      <Route
       path="/settings/payment-methods"
      element={
      <PaymentMethodsPage />
       }
      />
      </Route>

  <Route
  element={
    <ProtectedRoute
      permission="settings.system"
    />
  }
>
  <Route
    path="/settings/system"
    element={
      <SystemSettingsPage />
    }
  />
</Route>

{/* =====================================================
    BACKUP
===================================================== */}

<Route
  element={
    <ProtectedRoute
      permission="settings.backup"
    />
  }
>
  <Route
    path="/settings/backup"
    element={
      <BackupPage />
    }
  />
</Route>

   {/* =====================================================
    MESSAGES
    ===================================================== */}

           <Route
           element={
           <ProtectedRoute
           permission="settings.messages"
           />
           }
           >
           <Route
            path="/settings/messages"
             element={
            <MessagesPage />
           }
          />
          </Route>
          <Route element={<ProtectedRoute permission="accounts.purchase-party-ledger" />}>
         <Route
          path="/accounts/purchase-party-ledger"
          element={<PurchasePartyLedgerPage />}
          />
         </Route>

   <Route
  element={
    <ProtectedRoute
      permission="purchases"
    />
  }
>
  <Route
    element={
      <ProtectedRoute
        permission="purchases"
      />
    }
  >
    <Route
      path="/purchases"
      element={<PurchasesPage />}
    />

    <Route
      path="/purchase-returns"
      element={<PurchaseReturnPage />}
    />
  </Route>
</Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

