import { useEffect, useState } from "react";
import {
  getSmsHistory,
} from "../api/sms";
import {
  hasPermission,
} from "../utils/permissions";

// =====================================================
// TYPES
// =====================================================

interface SmsHistoryCustomer {
  id: string;
  fullName: string;
  companyName?: string | null;
  customerCode?: string;
}

interface SmsHistorySupplier {
  id: string;
  companyName: string;
  contactPerson?: string | null;
  supplierCode?: string;
}

interface SmsHistoryUser {
  id: string;
  fullName: string;
  username: string;
}

interface SmsHistoryItem {
  id: string;
  customerId?: string | null;
  supplierId?: string | null;
  repairJobId?: string | null;
  userId?: string | null;
  phone: string;
  message: string;
  templateCode?: string | null;
  provider?: string | null;
  status: string;
  providerMessageId?: string | null;
  providerResponse?: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
  customer?: SmsHistoryCustomer | null;
  supplier?: SmsHistorySupplier | null;
  user?: SmsHistoryUser | null;
}

interface SmsHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =====================================================
// PAGE
// =====================================================

export default function SmsHistoryPage() {
  const [messages, setMessages] =
    useState<SmsHistoryItem[]>([]);

  const [pagination, setPagination] =
    useState<SmsHistoryPagination>({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });

  const [search, setSearch] =
    useState("");

  const [partyType, setPartyType] =
    useState<
      "ALL" | "CUSTOMER" | "SUPPLIER"
    >("ALL");

  const [status, setStatus] =
    useState<
      "ALL" | "SENT" | "FAILED" | "PENDING"
    >("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedMessage, setSelectedMessage] =
    useState<SmsHistoryItem | null>(null);

  // ===================================================
  // PERMISSION
  // ===================================================

  const allowed =
    hasPermission("messages.view-history");

  // ===================================================
  // LOAD HISTORY
  // ===================================================

  async function loadHistory(
    page = pagination.page
  ) {
    try {
      setLoading(true);
      setError("");

      const response =
        await getSmsHistory({
          page,
          limit: pagination.limit,
          search: search.trim(),
          partyType,
          status,
        });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to load SMS history."
        );
      }

      setMessages(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setPagination(
        response.pagination || {
          page,
          limit: pagination.limit,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err: any) {
      console.error(
        "LOAD SMS HISTORY ERROR:",
        err
      );

      setMessages([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load SMS history."
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }

    loadHistory(1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  // ===================================================
  // FILTER
  // ===================================================

  function applyFilters() {
    loadHistory(1);
  }

  function clearFilters() {
    setSearch("");
    setPartyType("ALL");
    setStatus("ALL");

    setTimeout(() => {
      loadHistory(1);
    }, 0);
  }

  // ===================================================
  // DATE FORMAT
  // ===================================================

  function formatDate(
    value?: string | null
  ) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  // ===================================================
  // PARTY NAME
  // ===================================================

  function getPartyName(
    item: SmsHistoryItem
  ) {
    if (item.customer) {
      return (
        item.customer.fullName ||
        item.customer.companyName ||
        "Customer"
      );
    }

    if (item.supplier) {
      return (
        item.supplier.companyName ||
        item.supplier.contactPerson ||
        "Supplier"
      );
    }

    return "-";
  }

  // ===================================================
  // PARTY TYPE
  // ===================================================

  function getPartyType(
    item: SmsHistoryItem
  ) {
    if (item.customerId) {
      return "CUSTOMER";
    }

    if (item.supplierId) {
      return "SUPPLIER";
    }

    return "-";
  }

  // ===================================================
  // STATUS STYLE
  // ===================================================

  function getStatusClass(
    messageStatus: string
  ) {
    switch (
      messageStatus.toUpperCase()
    ) {
      case "SENT":
        return "bg-green-100 text-green-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // ===================================================
  // NO PERMISSION
  // ===================================================

  if (!allowed) {
    return (
      <div className="p-6">

        <div className="bg-white rounded-xl shadow p-6">

          <h1 className="text-2xl font-bold text-gray-800">
            SMS History
          </h1>

          <p className="text-red-600 mt-2">
            You do not have permission to view SMS history.
          </p>

        </div>

      </div>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div className="p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold">
          SMS History
        </h1>

        <p className="text-gray-500 mt-1">
          View all customer and supplier SMS messages.
        </p>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="mb-5 bg-red-50 border border-red-300 rounded-lg p-4">

          <p className="text-red-700 font-medium">
            {error}
          </p>

        </div>

      )}


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-6 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* SEARCH */}

          <div className="md:col-span-2">

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
              placeholder="Name, phone or message..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>


          {/* PARTY */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Party
            </label>

            <select
              value={partyType}
              onChange={(event) =>
                setPartyType(
                  event.target.value as
                    | "ALL"
                    | "CUSTOMER"
                    | "SUPPLIER"
                )
              }
              className="w-full border rounded-lg px-3 py-2 bg-white"
            >
              <option value="ALL">
                All Parties
              </option>

              <option value="CUSTOMER">
                Customers
              </option>

              <option value="SUPPLIER">
                Suppliers
              </option>

            </select>

          </div>


          {/* STATUS */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "ALL"
                    | "SENT"
                    | "FAILED"
                    | "PENDING"
                )
              }
              className="w-full border rounded-lg px-3 py-2 bg-white"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="SENT">
                Sent
              </option>

              <option value="FAILED">
                Failed
              </option>

              <option value="PENDING">
                Pending
              </option>

            </select>

          </div>

        </div>


        {/* FILTER BUTTONS */}

        <div className="flex gap-3 mt-4">

          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Search
          </button>

          <button
            type="button"
            onClick={clearFilters}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Clear
          </button>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-4 mb-4">

        <div className="flex flex-wrap gap-6 text-sm">

          <div>
            <span className="text-gray-500">
              Total:
            </span>{" "}
            <span className="font-semibold">
              {pagination.total}
            </span>
          </div>

          <div>
            <span className="text-gray-500">
              Page:
            </span>{" "}
            <span className="font-semibold">
              {pagination.page}
              {" / "}
              {pagination.totalPages || 1}
            </span>
          </div>

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {loading ? (

          <div className="p-8 text-center text-gray-500">
            Loading SMS history...
          </div>

        ) : messages.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No SMS history found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Date / Time
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Party
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Type
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Phone
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-700 min-w-[300px]">
                    Message
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Type / Template
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Sent By
                  </th>

                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {messages.map((item) => (

                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setSelectedMessage(item)
                    }
                  >

                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(
                        item.sentAt ||
                          item.createdAt
                      )}
                    </td>

                    <td className="px-4 py-3">

                      <div className="font-medium text-gray-800">
                        {getPartyName(item)}
                      </div>

                      {item.customer?.customerCode && (
                        <div className="text-xs text-gray-500">
                          {item.customer.customerCode}
                        </div>
                      )}

                      {item.supplier?.supplierCode && (
                        <div className="text-xs text-gray-500">
                          {item.supplier.supplierCode}
                        </div>
                      )}

                    </td>

                    <td className="px-4 py-3">

                      <span
                        className={
                          getPartyType(item) ===
                          "CUSTOMER"
                            ? "bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                            : "bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
                        }
                      >
                        {getPartyType(item)}
                      </span>

                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.phone}
                    </td>

                    <td className="px-4 py-3 max-w-[400px]">

                      <div className="truncate">
                        {item.message}
                      </div>

                    </td>

                    <td className="px-4 py-3">
                      {item.templateCode || "CUSTOM_SMS"}
                    </td>

                    <td className="px-4 py-3">
                      {item.user?.fullName ||
                        item.user?.username ||
                        "-"}
                    </td>

                    <td className="px-4 py-3">

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =================================================
          PAGINATION
      ================================================= */}

      {!loading &&
        pagination.totalPages > 1 && (

          <div className="bg-white rounded-xl shadow p-4 mt-4 flex items-center justify-between">

            <button
              type="button"
              disabled={
                pagination.page <= 1
              }
              onClick={() =>
                loadHistory(
                  pagination.page - 1
                )
              }
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={
                pagination.page >=
                pagination.totalPages
              }
              onClick={() =>
                loadHistory(
                  pagination.page + 1
                )
              }
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>

          </div>

        )}


      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedMessage && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() =>
            setSelectedMessage(null)
          }
        >

          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="p-6 border-b flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  SMS Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(
                    selectedMessage.sentAt ||
                      selectedMessage.createdAt
                  )}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(null)
                }
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
              </button>

            </div>


            <div className="p-6 space-y-5">

              {/* PARTY */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-gray-500">
                    Party
                  </p>

                  <p className="font-medium">
                    {getPartyName(
                      selectedMessage
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Party Type
                  </p>

                  <p className="font-medium">
                    {getPartyType(
                      selectedMessage
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Phone
                  </p>

                  <p className="font-medium">
                    {selectedMessage.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Sent By
                  </p>

                  <p className="font-medium">
                    {selectedMessage.user?.fullName ||
                      selectedMessage.user?.username ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Provider
                  </p>

                  <p className="font-medium">
                    {selectedMessage.provider ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Template
                  </p>

                  <p className="font-medium">
                    {selectedMessage.templateCode ||
                      "CUSTOM_SMS"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Status
                  </p>

                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                      selectedMessage.status
                    )}`}
                  >
                    {selectedMessage.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Provider Message ID
                  </p>

                  <p className="font-medium break-all">
                    {selectedMessage.providerMessageId ||
                      "-"}
                  </p>
                </div>

              </div>


              {/* MESSAGE */}

              <div>

                <p className="text-xs text-gray-500 mb-1">
                  Message
                </p>

                <div className="bg-gray-50 border rounded-lg p-4 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>

              </div>


              {/* PROVIDER RESPONSE */}

              {selectedMessage.providerResponse && (

                <div>

                  <p className="text-xs text-gray-500 mb-1">
                    Provider Response
                  </p>

                  <pre className="bg-gray-50 border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                    {selectedMessage.providerResponse}
                  </pre>

                </div>

              )}


              {/* ERROR */}

              {selectedMessage.errorMessage && (

                <div>

                  <p className="text-xs text-red-600 mb-1 font-medium">
                    Error
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 whitespace-pre-wrap">
                    {selectedMessage.errorMessage}
                  </div>

                </div>

              )}

            </div>


            <div className="p-4 border-t text-right">

              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(null)
                }
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}