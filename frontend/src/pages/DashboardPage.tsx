import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getDashboard,
} from "../api/dashboard";

import NepaliDate from "nepali-date-converter";

import Footer from "../components/Footer";

import {
  hasAnyPermission,
} from "../utils/permissions";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<any>(null);

  const [dashboardError, setDashboardError] =
    useState("");

 const user = JSON.parse(
  sessionStorage.getItem("user") || "{}"
);

  // =====================================================
  // HELPERS
  // =====================================================

  function safeNumber(value: any): number {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  }

  function formatCurrency(value: any): string {
    return safeNumber(value).toLocaleString(
      "en-IN"
    );
  }

  function formatDate(value: any): string {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString();
  }

  // =====================================================
  // DATES
  // =====================================================

  const englishDate =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

  const nepaliDate =
    new NepaliDate().format(
      "YYYY MMMM DD dddd"
    );

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setDashboardError("");

      const res = await getDashboard();

      const data =
        res.data?.data ??
        res.data ??
        {};

      setDashboard(data);
    } catch (error: any) {
      console.error(
        "Failed to load dashboard:",
        error
      );

      setDashboardError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load dashboard."
      );
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (!dashboard && !dashboardError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-gray-500 font-semibold">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-red-600 mb-3">
            Unable to Load Dashboard
          </h1>

          <p className="text-gray-600 mb-6">
            {dashboardError}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // SAFE ARRAYS
  // =====================================================

  const recentJobs = Array.isArray(
    dashboard?.recentJobs
  )
    ? dashboard.recentJobs
    : [];

  const recentPayments = Array.isArray(
    dashboard?.recentPayments
  )
    ? dashboard.recentPayments
    : [];

  // =====================================================
  // KPI CARDS
  // =====================================================

  const cards = [
    {
      title: "Today's Collection",
      value: `Rs. ${formatCurrency(
        dashboard?.todayCollection
      )}`,
      icon: "💰",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      text: "text-emerald-700",
    },

    {
      title: "Today's Expense",
      value: `Rs. ${formatCurrency(
        dashboard?.todayExpense
      )}`,
      icon: "💸",
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      text: "text-red-700",
    },

    {
      title: "Today's Profit",
      value: `Rs. ${formatCurrency(
        dashboard?.todayProfit
      )}`,
      icon: "📈",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      text: "text-blue-700",
    },

    {
      title: "Pending Payment",
      value: `Rs. ${formatCurrency(
        dashboard?.pendingPayment
      )}`,
      icon: "⏳",
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      text: "text-orange-700",
    },

    {
      title: "Open Repairs",
      value: safeNumber(
        dashboard?.openRepair
      ),
      icon: "🔧",
      bg: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      text: "text-indigo-700",
    },

    {
      title: "Ready Delivery",
      value: safeNumber(
        dashboard?.readyRepair
      ),
      icon: "📦",
      bg: "bg-cyan-50",
      iconBg: "bg-cyan-100",
      text: "text-cyan-700",
    },

    {
      title: "Pending Estimate",
      value: safeNumber(
        dashboard?.estimatePending
      ),
      icon: "📝",
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      text: "text-yellow-700",
    },

    {
      title: "Low Stock",
      value: safeNumber(
        dashboard?.lowStock
      ),
      icon: "⚠️",
      bg: "bg-rose-50",
      iconBg: "bg-rose-100",
      text: "text-rose-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="p-4 md:p-6">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow">
                  N
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                    NEITS RMS
                  </h1>

                  <p className="text-sm text-gray-500">
                    Nepal Electronics & IT Solution
                  </p>
                </div>

              </div>

            </div>

            <div className="flex flex-wrap gap-3">

              <div className="bg-slate-50 border rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">
                  English Date
                </p>

                <p className="font-semibold text-slate-800 text-sm">
                  {englishDate}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-600">
                  नेपाली मिति
                </p>

                <p className="font-semibold text-blue-900 text-sm">
                  {nepaliDate}
                </p>
              </div>

              <div className="bg-slate-50 border rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">
                  Logged in as
                </p>

                <p className="font-semibold text-slate-800 text-sm">
                  {user?.fullName || "User"}
                </p>

                <p className="text-xs text-blue-600">
                  {user?.role || ""}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            WELCOME + QUICK ACTIONS
        ================================================= */}

        <div className="flex flex-col xl:flex-row gap-5 mb-6">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-lg flex-1">

            <p className="text-blue-100 text-sm mb-1">
              Welcome back
            </p>

            <h2 className="text-2xl font-bold">
              {user?.fullName || "User"}
            </h2>

            <p className="text-blue-100 mt-2">
              Manage repairs, inventory, sales and accounts from one place.
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-4 xl:w-[520px]">

            <p className="text-sm font-semibold text-gray-500 mb-3">
              Quick Actions
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate("/repair-jobs/new")
                }
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl p-3 text-sm font-semibold transition"
              >
                🔧 New Repair
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/sales")
                }
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl p-3 text-sm font-semibold transition"
              >
                🧾 New Sale
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/inventory/add")
                }
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl p-3 text-sm font-semibold transition"
              >
                📦 Add Stock
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/accounts/expenses")
                }
                className="bg-red-50 hover:bg-red-100 text-red-700 rounded-xl p-3 text-sm font-semibold transition"
              >
                💸 Expense
              </button>

              {hasAnyPermission([
             "messages.send-custom",
             "messages.bulk-send",
             ]) && (
             <button
             type="button"
             onClick={() =>
             navigate("/custom-sms")
             }
             className="bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl p-3 text-sm font-semibold transition"
             >
              📱 Custom SMS
            </button>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">

          {cards.map(
            (card, index) => (
              <div
                key={index}
                className={`${card.bg} rounded-2xl border p-4 shadow-sm`}
              >

                <div className="flex items-center justify-between mb-3">

                  <div
                    className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center text-lg`}
                  >
                    {card.icon}
                  </div>

                </div>

                <p className="text-xs text-gray-500">
                  {card.title}
                </p>

                <p
                  className={`text-lg font-bold mt-1 ${card.text}`}
                >
                  {card.value}
                </p>

              </div>
            )
          )}

        </div>

        {/* =================================================
            RECENT REPAIRS + REPAIR OVERVIEW
        ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* RECENT REPAIRS */}

          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">

            <div className="p-5 border-b flex justify-between items-center">

              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Recent Repair Jobs
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Latest repair activity
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/repair-board")
                }
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                View All →
              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-3 text-left">
                      Job No.
                    </th>

                    <th className="px-5 py-3 text-left">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-left">
                      Device
                    </th>

                    <th className="px-5 py-3 text-left">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentJobs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-gray-500"
                      >
                        No recent repair jobs
                      </td>
                    </tr>
                  ) : (
                    recentJobs.map(
                      (
                        job: any,
                        index: number
                      ) => (
                        <tr
                          key={
                            job?.jobNumber ||
                            job?.id ||
                            index
                          }
                          className="border-t hover:bg-slate-50"
                        >

                          <td className="px-5 py-3 font-semibold text-blue-700">
                            {job?.jobNumber || "-"}
                          </td>

                          <td className="px-5 py-3">
                            {job?.customer?.fullName ||
                              job?.customer?.name ||
                              "-"}
                          </td>

                          <td className="px-5 py-3">
                            {job?.brand || ""}{" "}
                            {job?.model || ""}
                          </td>

                          <td className="px-5 py-3">
                            <StatusBadge
                              status={job?.status}
                            />
                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* REPAIR OVERVIEW */}

          <div className="bg-white rounded-2xl shadow-sm border p-5">

            <h3 className="text-lg font-bold text-slate-800">
              Repair Overview
            </h3>

            <p className="text-xs text-gray-500 mt-1 mb-5">
              Current repair workload
            </p>

            <div className="space-y-3">

              <OverviewRow
                label="Open Repairs"
                value={safeNumber(
                  dashboard?.openRepair
                )}
                bg="bg-indigo-50"
                text="text-indigo-700"
              />

              <OverviewRow
                label="Ready Delivery"
                value={safeNumber(
                  dashboard?.readyRepair
                )}
                bg="bg-emerald-50"
                text="text-emerald-700"
              />

              <OverviewRow
                label="Pending Estimate"
                value={safeNumber(
                  dashboard?.estimatePending
                )}
                bg="bg-yellow-50"
                text="text-yellow-700"
              />

              <OverviewRow
                label="Low Stock"
                value={safeNumber(
                  dashboard?.lowStock
                )}
                bg="bg-red-50"
                text="text-red-700"
              />

            </div>

          </div>

        </div>

        {/* =================================================
            RECENT PAYMENTS
        ================================================= */}

        <div className="mt-6">

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

            <div className="p-5 border-b flex justify-between items-center">

              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Recent Payments
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Recent customer collections
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/accounts/cash-book")
                }
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                Cash Book →
              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-3 text-left">
                      Date
                    </th>

                    <th className="px-5 py-3 text-left">
                      Description
                    </th>

                    <th className="px-5 py-3 text-left">
                      Mode
                    </th>

                    <th className="px-5 py-3 text-right">
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-gray-500"
                      >
                        No recent payments
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map(
                      (
                        payment: any,
                        index: number
                      ) => (
                        <tr
                          key={
                            payment?.id ||
                            index
                          }
                          className="border-t hover:bg-slate-50"
                        >

                          <td className="px-5 py-3">
                            {formatDate(
                              payment?.date ||
                                payment?.createdAt
                            )}
                          </td>

                          <td className="px-5 py-3">
                            {payment?.description ||
                              payment?.particulars ||
                              "-"}
                          </td>

                          <td className="px-5 py-3">
                            {payment?.paymentMode ||
                              payment?.method ||
                              "-"}
                          </td>

                          <td className="px-5 py-3 text-right font-semibold text-emerald-600">
                            Rs.{" "}
                            {formatCurrency(
                              payment?.amount
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

        </div>

        <Footer />

      </div>

    </div>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    String(
      status || ""
    ).toUpperCase();

  let classes =
    "bg-gray-100 text-gray-700";

  if (
    normalized === "READY"
  ) {
    classes =
      "bg-emerald-100 text-emerald-700";
  } else if (
    normalized === "DELIVERED"
  ) {
    classes =
      "bg-blue-100 text-blue-700";
  } else if (
    normalized === "IN_PROGRESS"
  ) {
    classes =
      "bg-indigo-100 text-indigo-700";
  } else if (
    normalized === "WAITING_PARTS"
  ) {
    classes =
      "bg-orange-100 text-orange-700";
  } else if (
    normalized === "NOT_REPAIRABLE"
  ) {
    classes =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${classes}`}
    >
      {status || "-"}
    </span>
  );
}

// =====================================================
// OVERVIEW ROW
// =====================================================

function OverviewRow({
  label,
  value,
  bg,
  text,
}: {
  label: string;
  value: number;
  bg: string;
  text: string;
}) {
  return (
    <div
      className={`${bg} rounded-xl p-4 flex items-center justify-between`}
    >

      <span className="font-medium text-gray-700">
        {label}
      </span>

      <span
        className={`${text} text-xl font-bold`}
      >
        {value}
      </span>

    </div>
  );
}