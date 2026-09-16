import {
  useEffect,
  useState,
} from "react";

import { getDashboardReport } from "../../api/report";
import { getPaymentMethods } from "../../api/paymentMethod";
import { getCustomers } from "../../api/customer";
import { getSuppliers } from "../../api/supplier";

export default function ReportsPage() {
  const [report, setReport] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [error, setError] =
    useState("");

    const [paymentType, setPaymentType] =
  useState("ALL");

const [paymentMethod, setPaymentMethod] =
  useState("ALL");

const [paymentMethods, setPaymentMethods] =
  useState<any[]>([]);

  const [customers, setCustomers] =
  useState<any[]>([]);

const [suppliers, setSuppliers] =
  useState<any[]>([]);

const [customerId, setCustomerId] =
  useState("ALL");

const [supplierId, setSupplierId] =
  useState("ALL");

  // =====================================================
  // LOAD REPORT
  // =====================================================
useEffect(() => {
  loadReport();
  loadPaymentMethods();
  loadCustomers();
  loadSuppliers();
}, []);

async function loadPaymentMethods() {
  try {
    const response =
      await getPaymentMethods(true);

    const data =
      response?.data?.data ??
      response?.data ??
      [];

    setPaymentMethods(
      Array.isArray(data)
        ? data
        : []
    );
  } catch (err) {
    console.error(
      "Failed to load payment methods:",
      err
    );

    setPaymentMethods([]);
  }
}

async function loadCustomers() {
  try {
    const response =
      await getCustomers();

    const data =
      response?.data?.data ??
      response?.data ??
      [];

    setCustomers(
      Array.isArray(data)
        ? data
        : []
    );
  } catch (err) {
    console.error(
      "Failed to load customers:",
      err
    );

    setCustomers([]);
  }
}

async function loadSuppliers() {
  try {
    const response =
      await getSuppliers();

    const data =
      response?.data?.data ??
      response?.data ??
      [];

    setSuppliers(
      Array.isArray(data)
        ? data
        : []
    );
  } catch (err) {
    console.error(
      "Failed to load suppliers:",
      err
    );

    setSuppliers([]);
  }
}

async function loadReport() {

    try {
      setLoading(true);
      setError("");

      const response =
  await getDashboardReport(
    fromDate,
    toDate,
    paymentType,
    paymentMethod,
    customerId,
    supplierId
  );

      setReport(
        response?.data ?? null
      );
    } catch (err: any) {
      console.error(
        "Failed to load report:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  function money(
    value: number
  ) {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  // =====================================================
  // CLEAR DATE FILTER
  // =====================================================

  function clearDates() {
    setFromDate("");
    setToDate("");

    setTimeout(() => {
      loadReport();
    }, 0);
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading &&
    !report
  ) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">
          Accounts Reports
        </h1>

        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Loading report...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Accounts Reports
          </h1>

          <p className="text-gray-500 mt-1">
            Sales, purchases, repairs, expenses and cash summary
          </p>
        </div>

      </div>

      {/* =================================================
          DATE FILTER
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-5 mb-8">

        <div className="flex flex-wrap items-end gap-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="border rounded-lg p-3"
            />
          </div>

                    <div>
            <label className="block text-sm font-medium mb-1">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Type
            </label>

            <select
              value={paymentType}
              onChange={(e) =>
                setPaymentType(
                  e.target.value
                )
              }
              className="border rounded-lg p-3 min-w-[180px]"
            >
              <option value="ALL">
                All Payments
              </option>

              <option value="RECEIVED">
                Payment Received
              </option>

              <option value="PAID">
                Payment Paid
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
              className="border rounded-lg p-3 min-w-[180px]"
            >
              <option value="ALL">
                All Methods
              </option>

              {paymentMethods.map(
                (method) => (
                  <option
                    key={method.id}
                    value={
                      method.code ??
                      method.name
                    }
                  >
                    {method.name}
                  </option>
                )
              )}
            </select>
          </div>

                    <div>
            <label className="block text-sm font-medium mb-1">
              Customer
            </label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(
                  e.target.value
                )
              }
              className="border rounded-lg p-3 min-w-[200px]"
            >
              <option value="ALL">
                All Customers
              </option>

              {customers.map(
                (customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                    {customer.phone
                      ? ` - ${customer.phone}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Supplier
            </label>

            <select
              value={supplierId}
              onChange={(e) =>
                setSupplierId(
                  e.target.value
                )
              }
              className="border rounded-lg p-3 min-w-[200px]"
            >
              <option value="ALL">
                All Suppliers
              </option>

              {suppliers.map(
                (supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.companyName ??
                      supplier.name ??
                      "Unnamed Supplier"}
                  </option>
                )
              )}
            </select>
          </div>

          <button

            type="button"
            onClick={
              loadReport
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
          >
            {loading
              ? "Generating..."
              : "Generate Report"}
          </button>

          <button
            type="button"
            onClick={
              clearDates
            }
            className="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded-lg"
          >
            Clear
          </button>

        </div>

      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-8">
          {error}
        </div>
      )}

      {report && (
        <>
          {/* =================================================
              SALES
          ================================================= */}

          <section className="mb-8">

            <h2 className="text-xl font-bold mb-4">
              Sales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

              <ReportCard
                title="Total Sales"
                value={`Rs. ${money(
                  report.sales
                    ?.totalSales
                )}`}
                className="bg-blue-50"
              />

              <ReportCard
                title="Amount Received"
                value={`Rs. ${money(
                  report.sales
                    ?.received
                )}`}
                className="bg-green-50"
              />

              <ReportCard
                title="Sales Due"
                value={`Rs. ${money(
                  report.sales
                    ?.due
                )}`}
                className="bg-red-50"
              />

              <ReportCard
                title="Sales Invoices"
                value={
                  report.sales
                    ?.invoiceCount ??
                  0
                }
                className="bg-gray-50"
              />

            </div>

          </section>

          {/* =================================================
              PURCHASES
          ================================================= */}

          <section className="mb-8">

            <h2 className="text-xl font-bold mb-4">
              Purchases
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

              <ReportCard
                title="Total Purchases"
                value={`Rs. ${money(
                  report.purchases
                    ?.totalPurchases
                )}`}
                className="bg-orange-50"
              />

              <ReportCard
                title="Amount Paid"
                value={`Rs. ${money(
                  report.purchases
                    ?.paid
                )}`}
                className="bg-green-50"
              />

              <ReportCard
                title="Supplier Due"
                value={`Rs. ${money(
                  report.purchases
                    ?.due
                )}`}
                className="bg-red-50"
              />

              <ReportCard
                title="Purchase Entries"
                value={
                  report.purchases
                    ?.purchaseCount ??
                  0
                }
                className="bg-gray-50"
              />

            </div>

          </section>

          {/* =================================================
              REPAIRS
          ================================================= */}

          <section className="mb-8">

            <h2 className="text-xl font-bold mb-4">
              Repairs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

              <ReportCard
                title="Repair Charges"
                value={`Rs. ${money(
                  report.repairs
                    ?.charges
                )}`}
                className="bg-purple-50"
              />

              <ReportCard
                title="Payments Received"
                value={`Rs. ${money(
                  report.repairs
                    ?.paymentsReceived
                )}`}
                className="bg-green-50"
              />

              <ReportCard
                title="Customer Due"
                value={`Rs. ${money(
                  report.repairs
                    ?.due
                )}`}
                className="bg-red-50"
              />

              <ReportCard
                title="Repair Jobs"
                value={
                  report.repairs
                    ?.jobCount ??
                  0
                }
                className="bg-gray-50"
              />

            </div>

          </section>

      {/* =================================================
              PAYMENT SUMMARY
          ================================================= */}

          <section className="mb-8">

            <h2 className="text-xl font-bold mb-4">
              Payment Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <ReportCard
                title="Payment Received"
                value={`Rs. ${money(
                  report.payments
                    ?.received
                )}`}
                className="bg-green-50"
              />

              <ReportCard
                title="Payment Paid"
                value={`Rs. ${money(
                  report.payments
                    ?.paid
                )}`}
                className="bg-red-50"
              />

              <ReportCard
                title="Net Payment"
                value={`Rs. ${money(
                  Number(
                    report.payments
                      ?.received ?? 0
                  ) -
                    Number(
                      report.payments
                        ?.paid ?? 0
                    )
                )}`}
                className="bg-blue-50"
              />

            </div>

          </section>

          {/* =================================================
              EXPENSES
          ================================================= */}

          <section className="mb-8">

            <h2 className="text-xl font-bold mb-4">
              Expenses
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <ReportCard
                title="Total Expenses"
                value={`Rs. ${money(
                  report.expenses
                    ?.total
                )}`}
                className="bg-red-50"
              />

            </div>

          </section>

          {/* =================================================
              CASH
          ================================================= */}

          <section className="mb-8">

            <h2 className="text-xl font-bold mb-4">
              Cash Movement
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <ReportCard
                title="Cash In"
                value={`Rs. ${money(
                  report.cash
                    ?.in
                )}`}
                className="bg-green-50"
              />

              <ReportCard
                title="Cash Out"
                value={`Rs. ${money(
                  report.cash
                    ?.out
                )}`}
                className="bg-red-50"
              />

              <ReportCard
                title="Net Cash"
                value={`Rs. ${money(
                  report.cash
                    ?.net
                )}`}
                className="bg-blue-50"
              />

            </div>

          </section>

          {/* =================================================
              BUSINESS SUMMARY
          ================================================= */}

          <section className="mb-8">

            <h2 className="text-xl font-bold mb-4">
              Business Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

              <ReportCard
                title="Total Income"
                value={`Rs. ${money(
                  report.summary
                    ?.totalIncome
                )}`}
                className="bg-green-50"
              />

              <ReportCard
                title="Purchase Cost"
                value={`Rs. ${money(
                  report.summary
                    ?.totalPurchases
                )}`}
                className="bg-orange-50"
              />

              <ReportCard
                title="Expenses"
                value={`Rs. ${money(
                  report.summary
                    ?.totalExpenses
                )}`}
                className="bg-red-50"
              />

              <ReportCard
                title="Net Result"
                value={`Rs. ${money(
                  report.summary
                    ?.netResult
                )}`}
                className="bg-purple-50"
              />

            </div>

          </section>

          {/* =================================================
              COUNTS
          ================================================= */}

          <section>

            <h2 className="text-xl font-bold mb-4">
              Business Counts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

              <ReportCard
                title="Customers"
                value={
                  report.totalCustomers ??
                  0
                }
                className="bg-white"
              />

              <ReportCard
                title="Repair Jobs"
                value={
                  report.repairs
                    ?.jobCount ??
                  0
                }
                className="bg-white"
              />

              <ReportCard
                title="Sales Invoices"
                value={
                  report.sales
                    ?.invoiceCount ??
                  0
                }
                className="bg-white"
              />

              <ReportCard
                title="Inventory Items"
                value={
                  report.totalInventory ??
                  0
                }
                className="bg-white"
              />

            </div>

          </section>
        </>
      )}

    </div>
  );
}

// =====================================================
// REPORT CARD
// =====================================================

function ReportCard({
  title,
  value,
  className = "bg-white",
}: {
  title: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={`${className} rounded-xl shadow p-5 border`}
    >
      <p className="text-gray-500">
        {title}
      </p>

      <h3 className="text-2xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}