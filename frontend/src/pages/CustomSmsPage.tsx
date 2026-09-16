import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  searchCustomSmsRecipients,
  sendCustomSms,
  getSmsTemplates,
} from "../api/sms";

import type {
  SmsPartyType,
  CustomSmsRecipient,
} from "../api/sms";
import {
  hasAnyPermission,
  hasPermission,
} from "../utils/permissions";

// =====================================================
// CUSTOM SMS PAGE
// =====================================================

export default function CustomSmsPage() {
  const navigate = useNavigate();

  const [partyType, setPartyType] =
    useState<SmsPartyType>("CUSTOMER");

  const [search, setSearch] = useState("");

  const [recipients, setRecipients] =
    useState<CustomSmsRecipient[]>([]);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [message, setMessage] = useState("");

  const [loadingRecipients, setLoadingRecipients] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

      const [customSmsEnabled, setCustomSmsEnabled] =
    useState(false);

  // =====================================================
  // PERMISSIONS
  // =====================================================

  const canUseCustomSms =
    hasAnyPermission([
      "messages.send-custom",
      "messages.bulk-send",
    ]);

  const canSendCustomSms =
    hasPermission("messages.send-custom");

  const canSendBulkSms =
    hasPermission("messages.bulk-send");

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
    } catch (err) {
      console.error(
        "LOAD CUSTOM SMS SETTING ERROR:",
        err
      );

      setCustomSmsEnabled(false);
    }
  }

  // =====================================================
  // SEARCH RECIPIENTS
  // =====================================================

  async function loadRecipients() {
    if (!canUseCustomSms) return;

    try {
      setLoadingRecipients(true);
      setError("");

      const response =
        await searchCustomSmsRecipients(
          partyType,
          search
        );

      setRecipients(
        Array.isArray(response?.recipients)
          ? response.recipients
          : []
      );
    } catch (err: any) {
      console.error(
        "SEARCH SMS RECIPIENTS ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load recipients."
      );

      setRecipients([]);
    } finally {
      setLoadingRecipients(false);
    }
  }

 useEffect(() => {
  setSelectedIds([]);
  setSuccessMessage("");
  setError("");

  loadCustomSmsSetting();
  loadRecipients();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [partyType]);

  // =====================================================
  // SEARCH BUTTON
  // =====================================================

  async function handleSearch() {
    await loadRecipients();
  }

  // =====================================================
  // SELECT / UNSELECT
  // =====================================================

  function toggleRecipient(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter(
            (selectedId) => selectedId !== id
          )
        : [...current, id]
    );

    setSuccessMessage("");
    setError("");
  }

  function selectAllVisible() {
    const ids = recipients
      .filter((recipient) => recipient.phone)
      .map((recipient) => recipient.id);

    setSelectedIds(ids);
    setSuccessMessage("");
    setError("");
  }

  function clearSelection() {
    setSelectedIds([]);
    setSuccessMessage("");
    setError("");
  }

  // =====================================================
  // RECIPIENT DISPLAY
  // =====================================================

  function getRecipientName(
    recipient: CustomSmsRecipient
  ) {
    if (partyType === "CUSTOMER") {
      return (
        recipient.fullName ||
        recipient.companyName ||
        "Customer"
      );
    }

    return (
      recipient.companyName ||
      recipient.contactPerson ||
      "Supplier"
    );
  }

  function getRecipientCode(
    recipient: CustomSmsRecipient
  ) {
    return partyType === "CUSTOMER"
      ? recipient.customerCode
      : recipient.supplierCode;
  }

  // =====================================================
  // SEND SMS
  // =====================================================

  async function handleSend() {
    setError("");
    setSuccessMessage("");

    if (selectedIds.length === 0) {
      setError(
        "Please select at least one recipient."
      );
      return;
    }

    if (!message.trim()) {
      setError(
        "Please enter an SMS message."
      );
      return;
    }

    if (message.trim().length > 1000) {
      setError(
        "SMS message cannot exceed 1000 characters."
      );
      return;
    }

    const isBulk = selectedIds.length > 1;

    if (isBulk && !canSendBulkSms) {
      setError(
        "You do not have permission to send bulk SMS."
      );
      return;
    }

    if (!isBulk && !canSendCustomSms) {
      setError(
        "You do not have permission to send custom SMS."
      );
      return;
    }

    const partyLabel =
      partyType === "CUSTOMER"
        ? "customer"
        : "supplier";

    const pluralPartyLabel =
      partyType === "CUSTOMER"
        ? "customers"
        : "suppliers";

    const confirmation = window.confirm(
      `You are about to send this message to ${selectedIds.length} ${selectedIds.length === 1 ? partyLabel : pluralPartyLabel}.\n\nAre you sure you want to continue?`
    );

    if (!confirmation) {
      return;
    }

    try {
      setSending(true);

      const response = await sendCustomSms({
        partyType,
        recipientIds: selectedIds,
        message: message.trim(),
      });

      console.log(
        "CUSTOM SMS RESPONSE:",
        response
      );

      const sentCount =
        Number(response?.sentCount || 0);

      const failedCount =
        Number(response?.failedCount || 0);

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            "Unable to send SMS."
        );
      }

      if (failedCount > 0) {
        setSuccessMessage(
          `SMS process completed. Sent: ${sentCount}, Failed: ${failedCount}.`
        );
      } else {
        setSuccessMessage(
          `SMS sent successfully to ${sentCount} recipient${sentCount === 1 ? "" : "s"}.`
        );
      }

      setSelectedIds([]);
      setMessage("");

      await loadRecipients();
    } catch (err: any) {
      console.error(
        "SEND CUSTOM SMS ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send SMS."
      );
    } finally {
      setSending(false);
    }
  }
    // =====================================================
  // CUSTOM SMS DISABLED
  // =====================================================

  if (!customSmsEnabled) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="text-5xl mb-4">
            📱
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-3">
            Custom SMS
          </h1>

          <p className="text-gray-600 mb-6">
            Custom SMS is currently disabled in SMS Templates settings.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }


  // =====================================================
  // NO PERMISSION
  // =====================================================

  if (!canUseCustomSms) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="text-5xl mb-4">
            🔒
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-3">
            Custom SMS
          </h1>

          <p className="text-gray-600 mb-6">
            You do not have permission to
            send custom or bulk SMS.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                💬 Custom SMS
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Send a custom message to selected customers or suppliers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold"
            >
              ← Dashboard
            </button>

          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT - RECIPIENTS */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">

            <div className="p-5 border-b">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Select Recipients
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Choose customers or suppliers.
                  </p>
                </div>

                {/* PARTY TYPE */}
                <div className="flex bg-slate-100 rounded-xl p-1">

                  <button
                    type="button"
                    onClick={() =>
                      setPartyType("CUSTOMER")
                    }
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                      partyType === "CUSTOMER"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    👤 Customers
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPartyType("SUPPLIER")
                    }
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                      partyType === "SUPPLIER"
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    🏢 Suppliers
                  </button>

                </div>

              </div>

              {/* SEARCH */}
              <div className="flex gap-2 mt-5">

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder={
                    partyType === "CUSTOMER"
                      ? "Search name, phone, code or company..."
                      : "Search company, contact, phone or code..."
                  }
                  className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loadingRecipients}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 rounded-xl font-semibold"
                >
                  {loadingRecipients
                    ? "..."
                    : "Search"}
                </button>

              </div>

              {/* SELECTION ACTIONS */}
              <div className="flex flex-wrap items-center gap-3 mt-4">

                <button
                  type="button"
                  onClick={selectAllVisible}
                  disabled={recipients.length === 0}
                  className="text-sm bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 text-blue-700 disabled:text-gray-400 px-4 py-2 rounded-lg font-semibold"
                >
                  Select All Visible
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={selectedIds.length === 0}
                  className="text-sm bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Clear Selection
                </button>

                <span className="text-sm font-semibold text-gray-600">
                  Selected: {selectedIds.length}
                </span>

              </div>

            </div>

            {/* RECIPIENT LIST */}
            <div className="max-h-[520px] overflow-y-auto">

              {loadingRecipients ? (
                <div className="p-10 text-center text-gray-500">
                  Loading recipients...
                </div>
              ) : recipients.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  No recipients found.
                </div>
              ) : (
                <div className="divide-y">

                  {recipients.map(
                    (recipient) => {
                      const selected =
                        selectedIds.includes(
                          recipient.id
                        );

                      const hasPhone =
                        Boolean(
                          recipient.phone
                        );

                      return (
                        <button
                          type="button"
                          key={recipient.id}
                          onClick={() =>
                            hasPhone &&
                            toggleRecipient(
                              recipient.id
                            )
                          }
                          disabled={!hasPhone}
                          className={`w-full text-left p-4 transition ${
                            !hasPhone
                              ? "bg-gray-50 cursor-not-allowed opacity-60"
                              : selected
                                ? "bg-blue-50"
                                : "hover:bg-slate-50"
                          }`}
                        >

                          <div className="flex items-center gap-4">

                            <div
                              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
                                selected
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "border-gray-300"
                              }`}
                            >
                              {selected && "✓"}
                            </div>

                            <div className="flex-1 min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="font-semibold text-slate-800">
                                  {getRecipientName(
                                    recipient
                                  )}
                                </span>

                                {getRecipientCode(
                                  recipient
                                ) && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {getRecipientCode(
                                      recipient
                                    )}
                                  </span>
                                )}

                              </div>

                              {partyType ===
                                "CUSTOMER" &&
                                recipient.companyName && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {recipient.companyName}
                                  </p>
                                )}

                              {partyType ===
                                "SUPPLIER" &&
                                recipient.contactPerson && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Contact:{" "}
                                    {recipient.contactPerson}
                                  </p>
                                )}

                            </div>

                            <div className="text-right shrink-0">

                              <div className="text-sm font-semibold text-slate-700">
                                {recipient.phone ||
                                  "No phone"}
                              </div>

                              {!hasPhone && (
                                <div className="text-xs text-red-500 mt-1">
                                  Cannot send
                                </div>
                              )}

                            </div>

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </div>

          {/* RIGHT - MESSAGE */}
          <div className="bg-white rounded-2xl shadow-sm border p-5 h-fit">

            <h2 className="text-lg font-bold text-slate-800">
              Write Message
            </h2>

            <p className="text-xs text-gray-500 mt-1 mb-5">
              The same message will be sent to every selected recipient.
            </p>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              maxLength={1000}
              rows={10}
              placeholder="Type your SMS message here..."
              className="w-full border rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>
                Maximum 1000 characters
              </span>

              <span>
                {message.length}/1000
              </span>
            </div>

            {/* SUMMARY */}
            <div className="bg-slate-50 rounded-xl p-4 mt-5">

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">
                  Party
                </span>

                <span className="font-semibold text-slate-800">
                  {partyType === "CUSTOMER"
                    ? "Customers"
                    : "Suppliers"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Recipients
                </span>

                <span className="font-bold text-blue-700">
                  {selectedIds.length}
                </span>
              </div>

            </div>

            {/* PERMISSION INFO */}
            {!canSendCustomSms &&
              !canSendBulkSms && (
                <div className="bg-red-50 text-red-700 rounded-xl p-3 mt-4 text-sm">
                  You do not have SMS sending permission.
                </div>
              )}

            {selectedIds.length === 1 &&
              !canSendCustomSms && (
                <div className="bg-orange-50 text-orange-700 rounded-xl p-3 mt-4 text-sm">
                  You need "Send Custom SMS" permission to send to one recipient.
                </div>
              )}

            {selectedIds.length > 1 &&
              !canSendBulkSms && (
                <div className="bg-orange-50 text-orange-700 rounded-xl p-3 mt-4 text-sm">
                  You need "Send Bulk SMS" permission to send to multiple recipients.
                </div>
              )}

            {/* SEND BUTTON */}
            <button
              type="button"
              onClick={handleSend}
              disabled={
                sending ||
                selectedIds.length === 0 ||
                !message.trim() ||
                (selectedIds.length === 1
                  ? !canSendCustomSms
                  : !canSendBulkSms)
              }
              className="w-full mt-5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-lg shadow-sm transition"
            >
              {sending
                ? "Sending SMS..."
                : `📤 Send SMS${
                    selectedIds.length > 0
                      ? ` (${selectedIds.length})`
                      : ""
                  }`}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              A confirmation will appear before sending.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}