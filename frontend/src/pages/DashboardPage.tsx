import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import NepaliDate from "nepali-date-converter";

import Footer from "../components/Footer";

import {
  getRepairJobs,
} from "../api/repairJob";

import {
  hasAnyPermission,
  hasPermission,
} from "../utils/permissions";

type CardPeriod =
  | "ALL"
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH";

type DashboardStatus =
  | "RECEIVED"
  | "WORKING"
  | "WAITING_APPROVAL"
  | "READY"
  | "DELIVERED"
  | "NOT_REPAIRABLE";

type JobDateRange = {
  start: Date | null;
  end: Date | null;
};

const NEPAL_TIME_ZONE =
  "Asia/Kathmandu";

const NEPAL_OFFSET =
  "+05:45";

const STATUS_CARDS: {
  key: DashboardStatus;
  title: string;
  icon: string;
  bg: string;
  iconBg: string;
  text: string;
}[] = [
  {
    key: "RECEIVED",
    title: "Job Received",
    icon: "📥",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    text: "text-blue-700",
  },
  {
    key: "WORKING",
    title: "Diagnosis / Work in Progress",
    icon: "🔧",
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    text: "text-purple-700",
  },
  {
    key: "WAITING_APPROVAL",
    title: "Waiting Approval",
    icon: "⏳",
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    text: "text-orange-700",
  },
  {
    key: "READY",
    title: "Ready for Delivery",
    icon: "📦",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    icon: "✅",
    bg: "bg-slate-50",
    iconBg: "bg-slate-200",
    text: "text-slate-700",
  },
  {
    key: "NOT_REPAIRABLE",
    title: "Not Repairable",
    icon: "⚠️",
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    text: "text-red-700",
  },
];

function addDays(
  date: Date,
  days: number
): Date {
  return new Date(
    date.getTime() +
      days * 24 * 60 * 60 * 1000
  );
}

function getNepalDateParts() {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          NEPAL_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
      }
    ).formatToParts(new Date());

  const values: Record<
    string,
    string
  > = {};

  parts.forEach(
    (part) => {
      values[part.type] =
        part.value;
    }
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    weekday:
      values.weekday,
  };
}

function nepalMidnight(
  year: number,
  month: number,
  day: number
): Date {
  const monthText =
    String(month).padStart(
      2,
      "0"
    );

  const dayText =
    String(day).padStart(
      2,
      "0"
    );

  return new Date(
    `${year}-${monthText}-${dayText}T00:00:00${NEPAL_OFFSET}`
  );
}

function getPeriodRange(
  period: CardPeriod
): JobDateRange | null {
  if (period === "ALL") {
    return null;
  }

  const {
    year,
    month,
    day,
    weekday,
  } = getNepalDateParts();

  const todayStart =
    nepalMidnight(
      year,
      month,
      day
    );

  if (period === "TODAY") {
    return {
      start: todayStart,
      end: addDays(
        todayStart,
        1
      ),
    };
  }

  const weekdayMap: Record<
    string,
    number
  > = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  if (period === "THIS_WEEK") {
    const currentWeekday =
  weekdayMap[weekday] ??
  0;

const sundayOffset =
  -currentWeekday;

const weekStart =
  addDays(
    todayStart,
    sundayOffset
  );

    return {
      start: weekStart,
      end: addDays(
        weekStart,
        7
      ),
    };
  }

  const nextMonth =
    month === 12
      ? 1
      : month + 1;

  const nextMonthYear =
    month === 12
      ? year + 1
      : year;

  const monthStart =
    nepalMidnight(
      year,
      month,
      1
    );

  const nextMonthStart =
    nepalMidnight(
      nextMonthYear,
      nextMonth,
      1
    );

  return {
    start: monthStart,
    end: nextMonthStart,
  };
}

function parseInputStart(
  value: string
): Date | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      `${value}T00:00:00${NEPAL_OFFSET}`
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

function getCustomDateRange(
  fromDate: string,
  toDate: string
): JobDateRange | null {
  if (
    !fromDate &&
    !toDate
  ) {
    return null;
  }

  const start =
    parseInputStart(
      fromDate
    );

  const endStart =
    parseInputStart(
      toDate
    );

  return {
    start,
    end: endStart
      ? addDays(
          endStart,
          1
        )
      : null,
  };
}

function matchesDashboardStatus(
  job: any,
  status: DashboardStatus
): boolean {
  const jobStatus =
    job?.status;

  if (
    status === "RECEIVED"
  ) {
    return true;
  }

  if (
    status === "WORKING"
  ) {
    return (
      jobStatus ===
        "DIAGNOSIS" ||
      jobStatus ===
        "IN_PROGRESS"
    );
  }

  return (
    jobStatus ===
    status
  );
}

function getStatusLabel(
  status: string
): string {
  switch (status) {
    case "RECEIVED":
      return "Job Received";

    case "DIAGNOSIS":
      return "Diagnosis";

    case "IN_PROGRESS":
      return "Work in Progress";

    case "WAITING_APPROVAL":
      return "Waiting Approval";

    case "WAITING_PARTS":
      return "Waiting Parts";

    case "READY":
      return "Ready for Delivery";

    case "DELIVERED":
      return "Delivered";

    case "NOT_REPAIRABLE":
      return "Not Repairable";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status || "-";
  }
}

function getStatusColor(
  status: string
): string {
  switch (status) {
    case "RECEIVED":
      return "bg-blue-100 text-blue-700";

    case "DIAGNOSIS":
      return "bg-yellow-100 text-yellow-700";

    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";

    case "WAITING_APPROVAL":
      return "bg-orange-100 text-orange-700";

    case "WAITING_PARTS":
      return "bg-orange-100 text-orange-700";

    case "READY":
      return "bg-green-100 text-green-700";

    case "DELIVERED":
      return "bg-gray-200 text-gray-700";

    case "NOT_REPAIRABLE":
      return "bg-red-100 text-red-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatNepaliDateTime(
  date:
    | string
    | null
    | undefined
): string {
  if (!date) {
    return "-";
  }

  try {
    const jsDate =
      new Date(date);

    if (
      Number.isNaN(
        jsDate.getTime()
      )
    ) {
      return "-";
    }

    const nepaliDate =
      new NepaliDate(
        jsDate
      );

    const bsDate =
      nepaliDate.format(
        "DD MMMM YYYY",
        "en"
      );

    const time =
      jsDate.toLocaleTimeString(
        "en-US",
        {
          timeZone:
            NEPAL_TIME_ZONE,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );

    return `${bsDate}, ${time}`;
  } catch {
    return "-";
  }
}
function getDashboardCardDate(
  job: any,
  status: DashboardStatus
): string | null {
  if (
    status === "RECEIVED"
  ) {
    return (
      job?.receivedDate ||
      job?.createdAt ||
      null
    );
  }

  if (
    status === "DELIVERED"
  ) {
    return (
      job?.deliveryDate ||
      job?.updatedAt ||
      null
    );
  }

  return (
    job?.updatedAt ||
    job?.createdAt ||
    null
  );
}
function isDateInRange(
  date:
    | string
    | null
    | undefined,
  range:
    | JobDateRange
    | null
): boolean {

  if (!range) {
    return true;
  }

  if (!date) {
    return false;
  }

  const time =
    new Date(
      date
    ).getTime();

  if (
    Number.isNaN(time)
  ) {
    return false;
  }

  if (
    range.start &&
    time <
      range.start.getTime()
  ) {
    return false;
  }

  if (
    range.end &&
    time >=
      range.end.getTime()
  ) {
    return false;
  }

  return true;
}

function getInitialCardPeriods(): Record<
  DashboardStatus,
  CardPeriod
> {
  return {
    RECEIVED: "ALL",
    WORKING: "ALL",
    WAITING_APPROVAL:
      "ALL",
    READY: "ALL",
    DELIVERED: "ALL",
    NOT_REPAIRABLE:
      "ALL",
  };
}

export default function DashboardPage() {
  const navigate =
    useNavigate();

  const jobsSectionRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const user = JSON.parse(
    sessionStorage.getItem(
      "user"
    ) || "{}"
  );

  const [
    jobs,
    setJobs,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    dashboardError,
    setDashboardError,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState<DashboardStatus | null>(
      null
    );

  const [
    cardPeriods,
    setCardPeriods,
  ] = useState<
    Record<
      DashboardStatus,
      CardPeriod
    >
  >(
    getInitialCardPeriods
  );

  const [
    customerSearch,
    setCustomerSearch,
  ] = useState("");

  const [
    contactSearch,
    setContactSearch,
  ] = useState("");

  const [
    fromDate,
    setFromDate,
  ] = useState("");

  const [
    toDate,
    setToDate,
  ] = useState("");

  const [
    quickDate,
    setQuickDate,
  ] =
    useState<CardPeriod>(
      "ALL"
    );

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

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      setDashboardError("");

      const res =
        await getRepairJobs();

      const data =
        res?.data?.data ??
        res?.data ??
        [];

      const repairJobs =
        Array.isArray(data)
          ? [...data]
          : [];

      repairJobs.sort(
        (
          a: any,
          b: any
        ) => {
          const aTime =
            new Date(
              a?.receivedDate ||
                a?.createdAt ||
                0
            ).getTime();

          const bTime =
            new Date(
              b?.receivedDate ||
                b?.createdAt ||
                0
            ).getTime();

          return bTime - aTime;
        }
      );

      setJobs(
        repairJobs
      );
    } catch (
      error: any
    ) {
      console.error(
        "Failed to load repair jobs:",
        error
      );

      setJobs([]);

      setDashboardError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load repair jobs."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCardClick(
    status: DashboardStatus
  ) {
    setSelectedStatus(
      status
    );

    window.setTimeout(
      () => {
        jobsSectionRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );
      },
      0
    );
  }

 function handleCardPeriodChange(
  status: DashboardStatus,
  period: CardPeriod
) {
  setCardPeriods(
    (
      current
    ) => ({
      ...current,
      [status]:
        period,
    })
  );

  setSelectedStatus(
    status
  );

  window.setTimeout(
    () => {
      jobsSectionRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "start",
        }
      );
    },
    0
  );
}

  function clearAllFilters() {
    setSelectedStatus(
      null
    );

    setCustomerSearch(
      ""
    );

    setContactSearch(
      ""
    );

    setFromDate("");

    setToDate("");

    setQuickDate(
      "ALL"
    );
  }

  const cardCounts =
    useMemo(() => {
      const counts: Record<
        DashboardStatus,
        number
      > = {
        RECEIVED: 0,
        WORKING: 0,
        WAITING_APPROVAL: 0,
        READY: 0,
        DELIVERED: 0,
        NOT_REPAIRABLE: 0,
      };

      STATUS_CARDS.forEach(
        (card) => {
          const range =
            getPeriodRange(
              cardPeriods[
                card.key
              ]
            );

          counts[
            card.key
          ] =
            jobs.filter(
              (job) =>
                matchesDashboardStatus(
                  job,
                  card.key
                ) &&
                isDateInRange(
                getDashboardCardDate(
                job,
               card.key
               ),
                range
                )
            ).length;
        }
      );

      return counts;
    }, [
      jobs,
      cardPeriods,
    ]);

  const filteredJobs =
    useMemo(() => {
      let result =
        jobs;

      if (
        selectedStatus
      ) {
        result =
          result.filter(
            (job) =>
              matchesDashboardStatus(
                job,
                selectedStatus
              )
          );
      }

      const customer =
        customerSearch
          .trim()
          .toLowerCase();

      if (customer) {
        result =
          result.filter(
            (job) =>
              String(
                job?.customer
                  ?.fullName ||
                  ""
              )
                .toLowerCase()
                .includes(
                  customer
                )
          );
      }

      const contact =
        contactSearch
          .trim()
          .toLowerCase();

      if (contact) {
        result =
          result.filter(
            (job) => {
              const phone =
                String(
                  job?.customer
                    ?.phone ||
                    ""
                ).toLowerCase();

              const alternatePhone =
                String(
                  job?.customer
                    ?.alternatePhone ||
                    ""
                ).toLowerCase();

              return (
                phone.includes(
                  contact
                ) ||
                alternatePhone.includes(
                  contact
                )
              );
            }
          );
      }

           let dateRange:
        | JobDateRange
        | null =
        null;

      if (selectedStatus) {
        const selectedCardPeriod =
          cardPeriods[
            selectedStatus
          ];

        if (
          selectedCardPeriod !==
          "ALL"
        ) {
          dateRange =
            getPeriodRange(
              selectedCardPeriod
            );
        } else {
          dateRange =
            getCustomDateRange(
              fromDate,
              toDate
            );
        }
      } else if (
        quickDate !==
        "ALL"
      ) {
        dateRange =
          getPeriodRange(
            quickDate
          );
      } else {
        dateRange =
          getCustomDateRange(
            fromDate,
            toDate
          );
      }

      if (dateRange) {
  result =
    result.filter(
      (job) =>
        isDateInRange(
          getDashboardCardDate(
            job,
            selectedStatus ||
              "RECEIVED"
          ),
          dateRange
        )
    );
}

      return result;
    }, [
            jobs,
      selectedStatus,
      cardPeriods,
      customerSearch,
      contactSearch,
      fromDate,
      toDate,
      quickDate,
    ]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="p-4 md:p-6">

        {/* =====================================================
            TOP HEADER
        ===================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

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

            <div className="flex flex-wrap items-center justify-end gap-3">

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
                  {user?.fullName ||
                    "User"}
                </p>

                <p className="text-xs text-blue-600">
                  {user?.role || ""}
                </p>
              </div>

              {hasPermission(
                "repair-jobs"
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/repair-jobs/new"
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow font-semibold whitespace-nowrap transition"
                >
                  + New Repair Job
                </button>
              )}

              {hasAnyPermission([
                "messages.send-custom",
                "messages.bulk-send",
              ]) && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/custom-sms"
                    )
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl shadow font-semibold whitespace-nowrap transition"
                >
                  📱 Custom SMS
                </button>
              )}

            </div>

          </div>

        </div>

        {/* =====================================================
            STATUS CARDS
        ===================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">

          {STATUS_CARDS.map(
            (card) => {
              const selected =
                selectedStatus ===
                card.key;

              return (
                <div
                  key={card.key}
                  onClick={() =>
                    handleCardClick(
                      card.key
                    )
                  }
                  className={`${card.bg} rounded-2xl border p-4 shadow-sm cursor-pointer transition ${
                    selected
                      ? "ring-2 ring-blue-500 border-blue-400"
                      : "hover:shadow-md"
                  }`}
                >

                  <div className="flex items-start justify-between gap-2">

                    <div
                      className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center text-lg`}
                    >
                      {card.icon}
                    </div>

                    <select
                      value={
                        cardPeriods[
                          card.key
                        ]
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      onChange={(
                        event
                      ) =>
                        handleCardPeriodChange(
                          card.key,
                          event
                            .target
                            .value as CardPeriod
                        )
                      }
                      className="bg-white/80 border rounded-lg text-xs font-semibold px-2 py-1 outline-none cursor-pointer"
                      aria-label={`${card.title} period`}
                    >
                      <option value="ALL">
                        All
                      </option>
                      <option value="TODAY">
                        Today
                      </option>
                      <option value="THIS_WEEK">
                        This Week
                      </option>
                      <option value="THIS_MONTH">
                        This Month
                      </option>
                    </select>

                  </div>

                  <p
                    className={`text-sm font-semibold mt-4 ${card.text}`}
                  >
                    {card.title}
                  </p>

                  <p className="text-3xl font-extrabold text-slate-800 mt-1">
                    {
                      cardCounts[
                        card.key
                      ]
                    }
                  </p>

                </div>
              );
            }
          )}

        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Customer
                </label>

                <input
                  type="text"
                  value={
                    customerSearch
                  }
                  onChange={(
                    event
                  ) =>
                    setCustomerSearch(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Search customer name"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Contact Number
                </label>

                <input
                  type="text"
                  value={
                    contactSearch
                  }
                  onChange={(
                    event
                  ) =>
                    setContactSearch(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Search contact number"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  From Date
                </label>

                <input
                  type="date"
                  value={
                    fromDate
                  }
                  onChange={(
                    event
                  ) => {
                    setFromDate(
                      event
                        .target
                        .value
                    );

                    setQuickDate(
                      "ALL"
                    );
                  }}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  To Date
                </label>

                <input
                  type="date"
                  value={
                    toDate
                  }
                  onChange={(
                    event
                  ) => {
                    setToDate(
                      event
                        .target
                        .value
                    );

                    setQuickDate(
                      "ALL"
                    );
                  }}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            <button
              type="button"
              onClick={
                clearAllFilters
              }
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-semibold whitespace-nowrap"
            >
              Clear Filters
            </button>

          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">

            <span className="text-sm font-semibold text-gray-600 mr-2">
              Quick Date:
            </span>

            {(
              [
                "ALL",
                "TODAY",
                "THIS_WEEK",
                "THIS_MONTH",
              ] as CardPeriod[]
            ).map(
              (period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() =>
                    setQuickDate(
                      period
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    quickDate ===
                    period
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {period ===
                    "ALL" &&
                    "All"}

                  {period ===
                    "TODAY" &&
                    "Today"}

                  {period ===
                    "THIS_WEEK" &&
                    "This Week"}

                  {period ===
                    "THIS_MONTH" &&
                    "This Month"}
                </button>
              )
            )}

          </div>

        </div>

        {/* =====================================================
            JOB LIST
        ===================================================== */}

        <div
          ref={
            jobsSectionRef
          }
          className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        >

          <div className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Repair Jobs (
                {
                  filteredJobs.length
                }
                )
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Showing{" "}
                {
                  filteredJobs.length
                }{" "}
                of{" "}
                {
                  jobs.length
                }{" "}
                jobs
                {selectedStatus
                  ? ` • ${STATUS_CARDS.find(
                      (card) =>
                        card.key ===
                        selectedStatus
                    )?.title || ""}`
                  : ""}
              </p>
            </div>

            {selectedStatus && (
              <button
                type="button"
                onClick={() =>
                  setSelectedStatus(
                    null
                  )
                }
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                Clear Status Filter
              </button>
            )}

          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 font-semibold">
              Loading Repair Jobs...
            </div>
          ) : dashboardError ? (
            <div className="text-center py-12 px-6">

              <div className="text-4xl mb-3">
                ⚠️
              </div>

              <p className="text-red-600 font-semibold mb-4">
                {dashboardError}
              </p>

              <button
                type="button"
                onClick={
                  loadJobs
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
              >
                Try Again
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-3 text-left whitespace-nowrap">
                      Job No
                    </th>

                    <th className="px-5 py-3 text-left whitespace-nowrap">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-left whitespace-nowrap">
                      Contact
                    </th>

                    <th className="px-5 py-3 text-left whitespace-nowrap">
                      Device
                    </th>

                    <th className="px-5 py-3 text-left whitespace-nowrap">
                      Brand / Model
                    </th>

                    <th className="px-5 py-3 text-center whitespace-nowrap">
                      Status
                    </th>

                    <th className="px-5 py-3 text-center whitespace-nowrap">
                      Received
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredJobs.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center p-12 text-gray-500"
                      >
                        No repair jobs found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map(
                      (
                        job,
                        index
                      ) => (
                        <tr
                          key={
                            job?.id ||
                            index
                          }
                          onClick={() =>
                            navigate(
                              `/repair-jobs/${job.id}`
                            )
                          }
                          className="border-t hover:bg-blue-50 cursor-pointer transition"
                        >

                          <td className="px-5 py-3 font-semibold text-blue-700 whitespace-nowrap">
                            {job?.jobNumber ||
                              "-"}
                          </td>

                          <td className="px-5 py-3 whitespace-nowrap">
                            {job?.customer
                              ?.fullName ||
                              "-"}
                          </td>

                          <td className="px-5 py-3 whitespace-nowrap">
                            {job?.customer
                              ?.phone ||
                              "-"}
                          </td>

                          <td className="px-5 py-3 whitespace-nowrap">
                            {job?.deviceType ||
                              "-"}
                          </td>

                          <td className="px-5 py-3 whitespace-nowrap">
                            {job?.brand ||
                              "-"}{" "}
                            {job?.model ||
                              ""}
                          </td>

                          <td className="px-5 py-3 text-center whitespace-nowrap">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                job?.status
                              )}`}
                            >
                              {getStatusLabel(
                                job?.status
                              )}
                            </span>

                          </td>

                          <td className="px-5 py-3 text-center whitespace-nowrap">
                            {formatNepaliDateTime(
                              job?.receivedDate
                            )}
                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        <div className="mt-6">
          <Footer />
        </div>

      </div>
    </div>
  );
}