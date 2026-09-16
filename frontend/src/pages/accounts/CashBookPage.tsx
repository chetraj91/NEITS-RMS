import { useEffect, useState } from "react";
import {
  getCashBook,
  getCashBookPaymentSummary,
} from "../../api/cashBook";
import { getPaymentMethods } from "../../api/paymentMethod";

type CashBookEntry = {
  id: string;
  createdAt: string;
  balance: number;
  credit: number;
  debit: number;
  particulars: string;
  customerName?: string;
  paymentMethod?: string;
};

type PaymentSummary = {
  paymentMethod: string;
  cashIn: number;
  cashOut: number;
  net: number;
};

export default function CashBookPage() {
  const [entries, setEntries] =
    useState<CashBookEntry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // PAYMENT SUMMARY
  // =====================================================

  const [summary, setSummary] =
    useState<PaymentSummary[]>([]);

  const [summaryLoading, setSummaryLoading] =
    useState(false);

  const [summaryError, setSummaryError] =
    useState("");

  // =====================================================
  // PAYMENT METHODS
  // =====================================================

 const [, setPaymentMethods] =
  useState<any[]>([]);

  // =====================================================
  // DATE FILTER
  // =====================================================

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  useEffect(() => {
    loadCashBook();
    loadPaymentMethods();
    loadTodaySummary();
  }, []);

  // =====================================================
  // LOAD CASH BOOK
  // =====================================================

  async function loadCashBook() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getCashBook();

      const data =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

      setEntries(data);
    } catch (err: any) {
      console.error(
        "Failed to load cash book:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load cash book."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD PAYMENT METHODS
  // =====================================================

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

  // =====================================================
  // LOAD TODAY SUMMARY
  // =====================================================

  async function loadTodaySummary() {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    setFromDate(today);
    setToDate(today);

    await loadPaymentSummary(
      today,
      today
    );
  }

  // =====================================================
  // LOAD PAYMENT SUMMARY
  // =====================================================

  async function loadPaymentSummary(
    startDate?: string,
    endDate?: string
  ) {
    try {
      setSummaryLoading(true);
      setSummaryError("");

      const response =
        await getCashBookPaymentSummary(
          startDate,
          endDate
        );

      const data =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

      setSummary(data);
    } catch (err: any) {
      console.error(
        "Failed to load payment summary:",
        err
      );

      setSummaryError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load payment summary."
      );

      setSummary([]);
    } finally {
      setSummaryLoading(false);
    }
  }

  // =====================================================
  // TODAY
  // =====================================================

  function handleToday() {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    setFromDate(today);
    setToDate(today);

    loadPaymentSummary(
      today,
      today
    );
  }

  // =====================================================
  // APPLY DATE FILTER
  // =====================================================

  function handleApplyDateFilter() {
    if (
      fromDate &&
      toDate &&
      fromDate > toDate
    ) {
      setSummaryError(
        "From Date cannot be later than To Date."
      );
      return;
    }

    loadPaymentSummary(
      fromDate || undefined,
      toDate || undefined
    );
  }

  // =====================================================
  // CLEAR DATE FILTER
  // =====================================================

  function handleClearDateFilter() {
    setFromDate("");
    setToDate("");

    loadPaymentSummary();
  }

  // =====================================================
  // TOTALS
  // =====================================================

  const totalIn = entries.reduce(
    (sum, entry) =>
      sum +
      Number(entry.credit || 0),
    0
  );

  const totalOut = entries.reduce(
    (sum, entry) =>
      sum +
      Number(entry.debit || 0),
    0
  );

  const closing =
    totalIn - totalOut;

  // =====================================================
  // RUNNING CASH BALANCE
  // =====================================================

  const entriesWithBalance = (() => {
    let runningBalance = 0;

    // API returns latest first.
    // Calculate balance from oldest to newest.
    const chronologicalEntries = [
      ...entries,
    ].reverse();

    const balanceMap = new Map<
      string,
      number
    >();

    chronologicalEntries.forEach(
      (entry) => {
        runningBalance +=
          Number(entry.credit || 0) -
          Number(entry.debit || 0);

        balanceMap.set(
          entry.id,
          runningBalance
        );
      }
    );

    return entries.map((entry) => ({
      ...entry,
      balance:
        balanceMap.get(entry.id) ?? 0,
    }));
  })();

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  function money(value: number) {
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
  // FORMAT DATE
  // =====================================================

  function formatDate(
    value: string
  ) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString();
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          Daily Cash Book
        </h1>

        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Loading Cash Book...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Daily Cash Book
      </h1>

      {/* ERROR */}

      {error && (
        <div className="mb-6 bg-red-100 border border-red-300 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* =================================================
          PAYMENT METHOD DATE FILTER
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-5 mb-6">

        <h2 className="text-xl font-bold mb-4">
          Payment Method Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

          {/* FROM DATE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* TO DATE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* TODAY */}

          <button
            type="button"
            onClick={handleToday}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
          >
            Today
          </button>

          {/* APPLY */}

          <button
            type="button"
            onClick={
              handleApplyDateFilter
            }
            className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
          >
            Apply
          </button>

        </div>

        <div className="mt-3">

          <button
            type="button"
            onClick={
              handleClearDateFilter
            }
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Clear Date Filter
          </button>

        </div>

        {summaryError && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 rounded-lg p-3">
            {summaryError}
          </div>
        )}

        {/* =================================================
            PAYMENT METHOD TABLE
        ================================================= */}

        <div className="overflow-x-auto mt-5">

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-gray-200">

                <th className="border p-3 text-left">
                  Payment Method
                </th>

                <th className="border p-3 text-right">
                  Cash In
                </th>

                <th className="border p-3 text-right">
                  Cash Out
                </th>

                <th className="border p-3 text-right">
                  Net
                </th>

              </tr>

            </thead>

            <tbody>

              {summaryLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border p-5 text-center text-gray-500"
                  >
                    Loading payment summary...
                  </td>
                </tr>
              ) : (
                summary.map(
                  (item) => (
                    <tr
                      key={
                        item.paymentMethod
                      }
                      className={
                        item.paymentMethod ===
                        "TOTAL"
                          ? "bg-gray-100 font-bold"
                          : ""
                      }
                    >

                      <td className="border p-3">
                        {
                          item.paymentMethod
                        }
                      </td>

                      <td className="border p-3 text-right text-green-700 font-semibold">
                        {item.cashIn >
                        0
                          ? `Rs. ${money(
                              item.cashIn
                            )}`
                          : "-"}
                      </td>

                      <td className="border p-3 text-right text-red-700 font-semibold">
                        {item.cashOut >
                        0
                          ? `Rs. ${money(
                              item.cashOut
                            )}`
                          : "-"}
                      </td>

                      <td
                        className={`border p-3 text-right font-bold ${
                          item.net >=
                          0
                            ? "text-blue-700"
                            : "text-red-700"
                        }`}
                      >
                        Rs.{" "}
                        {money(
                          item.net
                        )}
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          EXISTING SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        {/* CASH IN */}

        <div className="bg-green-100 p-5 rounded-xl shadow">

          <p className="text-gray-700">
            Total Cash In
          </p>

          <h2 className="text-3xl font-bold text-green-700 mt-1">
            Rs. {money(totalIn)}
          </h2>

        </div>

        {/* CASH OUT */}

        <div className="bg-red-100 p-5 rounded-xl shadow">

          <p className="text-gray-700">
            Total Cash Out
          </p>

          <h2 className="text-3xl font-bold text-red-700 mt-1">
            Rs. {money(totalOut)}
          </h2>

        </div>

        {/* CLOSING */}

        <div
          className={`p-5 rounded-xl shadow ${
            closing >= 0
              ? "bg-blue-100"
              : "bg-orange-100"
          }`}
        >

          <p className="text-gray-700">
            Closing Cash
          </p>

          <h2
            className={`text-3xl font-bold mt-1 ${
              closing >= 0
                ? "text-blue-700"
                : "text-orange-700"
            }`}
          >
            Rs. {money(closing)}
          </h2>

        </div>

      </div>

      {/* =================================================
          CASH BOOK TABLE
      ================================================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-gray-200">

                <th className="border p-3 text-left">
                  Date
                </th>

                <th className="border p-3 text-left">
                  Customer Name
                </th>

                <th className="border p-3 text-left">
                  Particulars
                </th>

                <th className="border p-3 text-right">
                  Cash In
                </th>

                <th className="border p-3 text-right">
                  Cash Out
                </th>

                <th className="border p-3 text-right">
                  Balance
                </th>

              </tr>

            </thead>

            <tbody>

              {entriesWithBalance.map(
                (entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="border p-3">
                      {formatDate(
                        entry.createdAt
                      )}
                    </td>

                    <td className="border p-3">
                      {
                        entry.customerName ||
                        "-"
                      }
                    </td>

                    <td className="border p-3">
                      {
                        entry.particulars ||
                        "-"
                      }
                    </td>

                    <td className="border p-3 text-right text-green-700 font-semibold">
                      {Number(
                        entry.credit || 0
                      ) > 0
                        ? `Rs. ${money(
                            Number(
                              entry.credit
                            )
                          )}`
                        : "-"}
                    </td>

                    <td className="border p-3 text-right text-red-700 font-semibold">
                      {Number(
                        entry.debit || 0
                      ) > 0
                        ? `Rs. ${money(
                            Number(
                              entry.debit
                            )
                          )}`
                        : "-"}
                    </td>

                    <td
                      className={`border p-3 text-right font-bold ${
                        Number(
                          entry.balance || 0
                        ) >= 0
                          ? "text-blue-700"
                          : "text-red-700"
                      }`}
                    >
                      Rs.{" "}
                      {money(
                        Number(
                          entry.balance || 0
                        )
                      )}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {/* EMPTY */}

        {entries.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No cash book entries found.
          </div>
        )}

      </div>

    </div>
  );
}