import {
  useEffect,
  useState,
} from "react";

import {
  getDashboardReport,
  getDueOutstandingReport,
} from "../../api/report";

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

const [dueType, setDueType] =
  useState("ALL");

const [duePartySearch, setDuePartySearch] =
  useState("");

const [dueReport, setDueReport] =
  useState<any>(null);

  const [dueReportLoading, setDueReportLoading] =
    useState(false);

    const [selectedDueParty, setSelectedDueParty] =
    useState<any>(null);

    const [showDueOnly, setShowDueOnly] =
    useState(false);

  // =====================================================
  // LOAD REPORT
  // =====================================================
useEffect(() => {
  loadReport();
  loadDueReport();
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

    async function loadDueReport() {
    try {
      setDueReportLoading(true);

      const response =
        await getDueOutstandingReport();

      setDueReport(
        response?.data ?? null
      );
    } catch (err) {
      console.error(
        "Failed to load due outstanding report:",
        err
      );

      setDueReport(null);
    } finally {
      setDueReportLoading(false);
    }
  }

    const dueParties = [
    ...(dueReport?.customers ?? []).map(
      (customer: any) => ({
        ...customer,
        partyType: "CUSTOMER",
      })
    ),
    ...(dueReport?.suppliers ?? []).map(
      (supplier: any) => ({
        ...supplier,
        partyType: "SUPPLIER",
      })
    ),
  ].filter((party: any) => {
    if (dueType !== "ALL" &&
        party.partyType !== dueType) {
      return false;
    }

    const search =
      duePartySearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      String(
        party.name ?? ""
      ).toLowerCase().includes(search) ||
      String(
        party.phone ?? ""
      ).toLowerCase().includes(search)
    );
  });

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

          <label className="flex items-center gap-2 px-3">
            <input
              type="checkbox"
              checked={showDueOnly}
              onChange={(e) =>
                setShowDueOnly(e.target.checked)
              }
              className="h-4 w-4"
            />

            <span className="text-sm font-medium">
              Show Due / Outstanding Only
            </span>
          </label>

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
        {showDueOnly && (
       <>
        {/* =================================================
            DUE / OUTSTANDING
        ================================================= */}

        <section className="mb-8">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Due / Outstanding
              </h2>

              {dueReportLoading && (
                <span className="text-sm text-gray-500">
                  Loading...
                </span>
              )}
            </div>

            {/* DUE FILTER */}

            <div className="bg-white rounded-xl shadow p-5 mb-5">

              <div className="flex flex-wrap items-end gap-4">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due Type
                  </label>

                  <select
                    value={dueType}
                    onChange={(e) =>
                      setDueType(e.target.value)
                    }
                    className="border rounded-lg p-3 min-w-[200px]"
                  >
                    <option value="ALL">
                      All Due
                    </option>

                    <option value="CUSTOMER">
                      Customer Due
                    </option>

                    <option value="SUPPLIER">
                      Supplier Due
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Search Party
                  </label>

                  <input
                    type="text"
                    value={duePartySearch}
                    onChange={(e) =>
                      setDuePartySearch(
                        e.target.value
                      )
                    }
                    placeholder="Name or contact number"
                    className="border rounded-lg p-3 min-w-[280px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDueType("ALL");
                    setDuePartySearch("");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded-lg"
                >
                  Clear
                </button>

              </div>

            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">

              <ReportCard
                title="Customer Due"
                value={`Rs. ${money(
                  dueReport?.summary?.customerDue
                )}`}
                className="bg-red-50"
              />

              <ReportCard
                title="Repair Due"
                value={`Rs. ${money(
                  dueReport?.summary?.repairDue
                )}`}
                className="bg-purple-50"
              />

              <ReportCard
                title="Sales Due"
                value={`Rs. ${money(
                  dueReport?.summary?.salesDue
                )}`}
                className="bg-orange-50"
              />

              <ReportCard
                title="Supplier Due"
                value={`Rs. ${money(
                  dueReport?.summary?.supplierDue
                )}`}
                className="bg-blue-50"
              />

            </div>

            {/* PARTY-WISE OUTSTANDING */}

            <div className="bg-white rounded-xl shadow overflow-hidden">

              <div className="p-5 border-b">
                <h3 className="text-lg font-semibold">
                  Outstanding Parties
                </h3>
              </div>

              {dueParties.length === 0 ? (

                <div className="p-8 text-center text-gray-500">
                  No outstanding amount found.
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead className="bg-gray-50">

                      <tr>
                        <th className="text-left p-4">
                          Party
                        </th>

                        <th className="text-left p-4">
                          Type
                        </th>

                        <th className="text-left p-4">
                          Contact
                        </th>

                        <th className="text-right p-4">
                          Repair Due
                        </th>

                        <th className="text-right p-4">
                          Sales Due
                        </th>

                        <th className="text-right p-4">
                          Supplier Due
                        </th>

                        <th className="text-right p-4">
                          Total Due
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {dueParties.map(
                        (party: any) => (

                          <tr
                          key={`${party.partyType}-${party.id}`}
                          onClick={() => setSelectedDueParty(party)}
                          className={`border-t cursor-pointer hover:bg-blue-50 ${
                          selectedDueParty?.id === party.id &&
                          selectedDueParty?.partyType === party.partyType
                          ? "bg-blue-50"
                           : ""
                           }`}
                          >

                            <td className="p-4 font-medium">
                              {party.name ||
                                "Unnamed Party"}
                            </td>

                            <td className="p-4">
                              {party.partyType}
                            </td>

                            <td className="p-4">
                              {party.phone || "-"}
                            </td>

                            <td className="p-4 text-right">
                              {party.partyType ===
                              "CUSTOMER"
                                ? `Rs. ${money(
                                    party.repairDue
                                  )}`
                                : "-"}
                            </td>

                            <td className="p-4 text-right">
                              {party.partyType ===
                              "CUSTOMER"
                                ? `Rs. ${money(
                                    party.salesDue
                                  )}`
                                : "-"}
                            </td>

                            <td className="p-4 text-right">
                              {party.partyType ===
                              "SUPPLIER"
                                ? `Rs. ${money(
                                    party.supplierDue
                                  )}`
                                : "-"}
                            </td>

                            <td className="p-4 text-right font-semibold">
                              Rs.{" "}
                              {money(
                                party.totalDue
                              )}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

                       </div>

            {selectedDueParty && (
              <div className="bg-white rounded-xl shadow overflow-hidden mt-5">
                <div className="p-5 border-b flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Outstanding Details
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedDueParty.name}
                      {selectedDueParty.phone
                        ? ` - ${selectedDueParty.phone}`
                        : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDueParty(null)
                    }
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4">
                          Type
                        </th>
                        <th className="text-left p-4">
                          Reference
                        </th>
                        <th className="text-left p-4">
                          Date
                        </th>
                        <th className="text-right p-4">
                          Total
                        </th>
                        <th className="text-right p-4">
                          Paid
                        </th>
                        <th className="text-right p-4">
                          Outstanding
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {[
                        ...(selectedDueParty.repairDetails ?? []),
                        ...(selectedDueParty.salesDetails ?? []),
                        ...(selectedDueParty.purchaseDetails ?? []),
                      ].map((item: any) => (
                        <tr
                          key={`${item.type}-${item.id}`}
                          className="border-t"
                        >
                          <td className="p-4">
                            {item.type}
                          </td>

                          <td className="p-4 font-medium">
                            {item.reference || "-"}
                          </td>

                          <td className="p-4">
                            {item.date
                              ? new Date(
                                  item.date
                                ).toLocaleDateString(
                                  "en-GB"
                                )
                              : "-"}
                          </td>

                          <td className="p-4 text-right">
                            Rs.{" "}
                            {money(
                              item.totalAmount
                            )}
                          </td>

                          <td className="p-4 text-right">
                            Rs.{" "}
                            {money(
                              item.paidAmount
                            )}
                          </td>

                          <td className="p-4 text-right font-semibold">
                            Rs.{" "}
                            {money(
                              item.dueAmount
                            )}
                          </td>
                        </tr>
                      ))}

                      {[
                        ...(selectedDueParty.repairDetails ?? []),
                        ...(selectedDueParty.salesDetails ?? []),
                        ...(selectedDueParty.purchaseDetails ?? []),
                      ].length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-gray-500"
                          >
                            No outstanding transactions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </section>
              </>
            )}

          {!showDueOnly && (
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
  value={
    <div className="text-lg leading-7">
      <div>
        Sale: Rs.{" "}
        {money(
          report.sales
            ?.grossSales
        )}
      </div>

      <div className="text-red-600">
        Sales Return: Rs.{" "}
        {money(
          report.sales
            ?.salesReturns
        )}
      </div>

      <div className="font-bold">
        Net Sales: Rs.{" "}
        {money(
          report.sales
            ?.totalSales
        )}
      </div>
    </div>
  }
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
  title="Total Purchase"
  value={
    <div className="text-lg leading-7">
      <div>
        Purchase: Rs.{" "}
        {money(
          report.purchases
            ?.grossPurchases
        )}
      </div>

      <div className="text-red-600">
        Purchase Return: Rs.{" "}
        {money(
          report.purchases
            ?.purchaseReturns
        )}
      </div>

      <div className="font-bold">
        Net Purchase: Rs.{" "}
        {money(
          report.purchases
            ?.totalPurchases
        )}
      </div>
    </div>
  }
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
  title="Total Repair Charge"
  value={
    <div className="text-lg font-bold leading-7">
      <div>
        Repair: Rs.{" "}
        {money(report.repairs?.charges)}
      </div>

      <div className="text-red-600">
        Repair Refund: Rs.{" "}
        {money(report.repairs?.refunds)}
      </div>

      <div>
        Net Repair Charge: Rs.{" "}
        {money(report.repairs?.netCharges)}
      </div>
    </div>
  }
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
 value: React.ReactNode;
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