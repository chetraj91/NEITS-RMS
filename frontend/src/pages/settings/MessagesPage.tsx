import { useEffect, useState } from "react";

import {
  getSmsSettings,
  updateSmsSettings,
  testSmsConnection,
  getSmsBalance,
  getSmsTemplates,
  updateSmsTemplate,
  toggleSmsTemplate,
} from "../../api/sms";

// =====================================================
// TYPES
// =====================================================

interface SmsBalance {
  balance?: string;
  ntc_rate?: string;
  ncell_rate?: string;
  smartcell_rate?: string;
}

interface SmsTemplate {
  id: string;
  name: string;
  code: string;
  message: string;
  enabled: boolean;
}

// =====================================================
// AVAILABLE VARIABLES
// =====================================================

const SMS_VARIABLES = [
  "{customerName}",
  "{customerPhone}",
  "{jobNumber}",
  "{deviceType}",
  "{brand}",
  "{model}",
  "{serialNumber}",
  "{complaint}",
  "{diagnosis}",
  "{estimatedCost}",
  "{totalAmount}",
  "{advanceAmount}",
  "{dueAmount}",
  "{expectedDate}",
  "{deliveryDate}",
  "{feedbackLink}",
];

// =====================================================
// PAGE
// =====================================================

export default function MessagesPage() {
  // ===================================================
  // SMS SETTINGS
  // ===================================================

  const [enabled, setEnabled] =
    useState(false);

  const [hasToken, setHasToken] =
    useState(false);

  const [apiToken, setApiToken] =
    useState("");

  const [showToken, setShowToken] =
    useState(false);

  const [senderId, setSenderId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [testing, setTesting] =
    useState(false);

  const [loadingBalance, setLoadingBalance] =
    useState(false);

  const [balance, setBalance] =
    useState<SmsBalance | null>(null);

  // ===================================================
  // TEMPLATES
  // ===================================================

  const [templates, setTemplates] =
    useState<SmsTemplate[]>([]);

  const [templatesLoading, setTemplatesLoading] =
    useState(true);

  const [editingTemplate, setEditingTemplate] =
    useState<SmsTemplate | null>(null);

  const [savingTemplate, setSavingTemplate] =
    useState(false);

  // ===================================================
  // MESSAGES
  // ===================================================

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ===================================================
  // LOAD SMS SETTINGS
  // ===================================================

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getSmsSettings();

      const data =
        response?.data || {};

      setEnabled(
        data.enabled === true
      );

      setHasToken(
        data.hasToken === true
      );

      setSenderId(
        data.senderId || ""
      );

    } catch (err: any) {
      console.error(
        "LOAD SMS SETTINGS ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load SMS settings."
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // LOAD TEMPLATES
  // ===================================================

  async function loadTemplates() {
    try {
      setTemplatesLoading(true);

      const response =
        await getSmsTemplates();

      setTemplates(
        response?.data || []
      );
    } catch (err: any) {
      console.error(
        "LOAD SMS TEMPLATES ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load SMS templates."
      );
    } finally {
      setTemplatesLoading(false);
    }
  }

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadSettings();
    loadTemplates();
  }, []);

  // ===================================================
  // SAVE SMS SETTINGS
  // ===================================================

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload: {
        enabled: boolean;
        apiToken?: string;
        senderId?: string;
      } = {
        enabled,
        senderId,
      };

      // Only send token if a new token
      // was actually entered.
      if (apiToken.trim()) {
        payload.apiToken =
          apiToken.trim();
      }

      const response =
        await updateSmsSettings(
          payload
        );

      setHasToken(
        response?.data?.hasToken === true
      );

      // Never keep the real token
      // in browser state after saving.
      setApiToken("");

      setShowToken(false);

      setMessage(
        "SMS settings saved successfully."
      );
    } catch (err: any) {
      console.error(
        "SAVE SMS SETTINGS ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save SMS settings."
      );
    } finally {
      setSaving(false);
    }
  }

  // ===================================================
  // TEST SOCIAIR CONNECTION
  // ===================================================

  async function handleTestConnection() {
    try {
      setTesting(true);
      setMessage("");
      setError("");

      const response =
        await testSmsConnection();

      setBalance(
        response?.data || null
      );

      setMessage(
        "Sociair connection successful."
      );
    } catch (err: any) {
      console.error(
        "TEST SOCIAIR CONNECTION ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to connect to Sociair."
      );
    } finally {
      setTesting(false);
    }
  }

  // ===================================================
  // GET BALANCE
  // ===================================================

  async function handleGetBalance() {
    try {
      setLoadingBalance(true);
      setMessage("");
      setError("");

      const response =
        await getSmsBalance();

      setBalance(
        response?.data || null
      );
    } catch (err: any) {
      console.error(
        "GET SMS BALANCE ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to retrieve Sociair balance."
      );
    } finally {
      setLoadingBalance(false);
    }
  }

  // ===================================================
  // EDIT TEMPLATE
  // ===================================================

  function handleEditTemplate(
    template: SmsTemplate
  ) {
    setEditingTemplate({
      ...template,
    });

    setMessage("");
    setError("");
  }

  // ===================================================
  // SAVE TEMPLATE
  // ===================================================

  async function handleSaveTemplate() {
    if (!editingTemplate) {
      return;
    }

    try {
      setSavingTemplate(true);
      setMessage("");
      setError("");

      const response =
        await updateSmsTemplate(
          editingTemplate.id,
          {
            name:
              editingTemplate.name,
            code:
              editingTemplate.code,
            message:
              editingTemplate.message,
            enabled:
              editingTemplate.enabled,
          }
        );

      const updated =
        response?.data;

      if (updated) {
        setTemplates((current) =>
          current.map((template) =>
            template.id === updated.id
              ? updated
              : template
          )
        );
      }

      setEditingTemplate(null);

      setMessage(
        "Message template saved successfully."
      );
    } catch (err: any) {
      console.error(
        "SAVE SMS TEMPLATE ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to save message template."
      );
    } finally {
      setSavingTemplate(false);
    }
  }

  // ===================================================
  // TOGGLE TEMPLATE
  // ===================================================

  async function handleToggleTemplate(
    template: SmsTemplate
  ) {
    try {
      setMessage("");
      setError("");

      const response =
        await toggleSmsTemplate(
          template.id
        );

      const updated =
        response?.data;

      if (updated) {
        setTemplates((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item
          )
        );
      }
    } catch (err: any) {
      console.error(
        "TOGGLE SMS TEMPLATE ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to change template status."
      );
    }
  }

  // ===================================================
  // INSERT VARIABLE
  // ===================================================

  function insertVariable(
    variable: string
  ) {
    if (!editingTemplate) {
      return;
    }

    setEditingTemplate({
      ...editingTemplate,
      message:
        editingTemplate.message +
        variable,
    });
  }

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="p-6">

        <div className="bg-white rounded-xl shadow p-6">
          Loading SMS settings...
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
          Messages
        </h1>

        <p className="text-gray-500 mt-1">
          Configure SMS messaging,
          message templates and Sociair
          integration.
        </p>

      </div>


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {message && (

        <div className="mb-5 bg-green-50 border border-green-300 rounded-lg p-4">

          <p className="text-green-700 font-medium">
            ✓ {message}
          </p>

        </div>

      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (

        <div className="mb-5 bg-red-50 border border-red-300 rounded-lg p-4">

          <p className="text-red-700 font-medium">
            ✕ {error}
          </p>

        </div>

      )}


      {/* =================================================
          SMS SERVICE
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-6 max-w-5xl mb-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold">
              SMS Service
            </h2>

            <p className="text-gray-500 mt-1">
              Master switch for all automatic
              SMS communication.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              setEnabled(!enabled)
            }
            className={`
              relative
              inline-flex
              h-7
              w-14
              items-center
              rounded-full
              transition
              ${
                enabled
                  ? "bg-green-600"
                  : "bg-gray-400"
              }
            `}
            aria-label="Toggle SMS service"
          >

            <span
              className={`
                inline-block
                h-5
                w-5
                transform
                rounded-full
                bg-white
                transition
                ${
                  enabled
                    ? "translate-x-8"
                    : "translate-x-1"
                }
              `}
            />

          </button>

        </div>


        <div className="mt-4">

          {enabled ? (

            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              SMS Enabled
            </span>

          ) : (

            <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
              SMS Disabled
            </span>

          )}

        </div>

      </div>


      {/* =================================================
          SOCIAIR CONFIGURATION
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-6 max-w-5xl mb-6">

        <h2 className="text-xl font-bold">
          Sociair SMS Provider
        </h2>

        <p className="text-gray-500 mt-1 mb-6">
          Configure your Sociair SMS API
          connection.
        </p>


        {/* PROVIDER */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Provider
          </label>

          <input
            type="text"
            value="Sociair SMS"
            disabled
            className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
          />

        </div>


        {/* TOKEN STATUS */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            API Token Status
          </label>

          {hasToken ? (

            <span className="inline-block bg-green-100 text-green-700 px-3 py-2 rounded-lg font-medium">
              ✓ Token Configured
            </span>

          ) : (

            <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg font-medium">
              ⚠ Token Not Configured
            </span>

          )}

        </div>


        {/* TOKEN */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-gray-700 mb-2">

            {hasToken
              ? "Replace API Token"
              : "API Token"}

          </label>


          <div className="flex gap-2">

            <input
              type={
                showToken
                  ? "text"
                  : "password"
              }
              value={apiToken}
              onChange={(event) =>
                setApiToken(
                  event.target.value
                )
              }
              placeholder={
                hasToken
                  ? "Enter new token to replace current token"
                  : "Enter Sociair API token"
              }
              autoComplete="new-password"
              className="flex-1 border rounded-lg px-4 py-3"
            />


            <button
              type="button"
              onClick={() =>
                setShowToken(!showToken)
              }
              className="px-4 py-3 border rounded-lg hover:bg-gray-50"
            >
              {showToken
                ? "Hide"
                : "Show"}
            </button>

          </div>


          <p className="text-xs text-gray-500 mt-2">
            The API token is never displayed
            after it has been saved.
          </p>

        </div>


        {/* SENDER ID */}

        <div className="mb-6">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sender ID
          </label>

          <input
            type="text"
            value={senderId}
            onChange={(event) =>
              setSenderId(
                event.target.value
              )
            }
            placeholder="Optional"
            className="w-full border rounded-lg px-4 py-3"
          />

          <p className="text-xs text-gray-500 mt-2">
            Sociair's documented SMS request
            does not require a sender ID.
          </p>

        </div>


        {/* BUTTONS */}

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-lg
              font-semibold
              hover:bg-blue-700
              disabled:bg-gray-400
              disabled:cursor-not-allowed
            "
          >
            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>


          <button
            type="button"
            onClick={
              handleTestConnection
            }
            disabled={
              testing ||
              !hasToken
            }
            className="
              bg-green-600
              text-white
              px-6
              py-3
              rounded-lg
              font-semibold
              hover:bg-green-700
              disabled:bg-gray-400
              disabled:cursor-not-allowed
            "
          >
            {testing
              ? "Testing..."
              : "Test Connection"}
          </button>


          <button
            type="button"
            onClick={
              handleGetBalance
            }
            disabled={
              loadingBalance ||
              !hasToken
            }
            className="
              bg-gray-700
              text-white
              px-6
              py-3
              rounded-lg
              font-semibold
              hover:bg-gray-800
              disabled:bg-gray-400
              disabled:cursor-not-allowed
            "
          >
            {loadingBalance
              ? "Checking..."
              : "Check Balance"}
          </button>

        </div>

      </div>


      {/* =================================================
          BALANCE
      ================================================= */}

      {balance && (

        <div className="bg-white rounded-xl shadow p-6 max-w-5xl mb-6">

          <h2 className="text-xl font-bold mb-4">
            Sociair Balance
          </h2>


          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div className="border rounded-lg p-4">

              <p className="text-sm text-gray-500">
                Balance
              </p>

              <p className="text-2xl font-bold mt-1">
                Rs. {balance.balance || "0"}
              </p>

            </div>


            <div className="border rounded-lg p-4">

              <p className="text-sm text-gray-500">
                NTC Rate
              </p>

              <p className="text-xl font-bold mt-1">
                Rs. {balance.ntc_rate || "-"}
              </p>

            </div>


            <div className="border rounded-lg p-4">

              <p className="text-sm text-gray-500">
                Ncell Rate
              </p>

              <p className="text-xl font-bold mt-1">
                Rs. {balance.ncell_rate || "-"}
              </p>

            </div>


            <div className="border rounded-lg p-4">

              <p className="text-sm text-gray-500">
                Smartcell Rate
              </p>

              <p className="text-xl font-bold mt-1">
                Rs. {balance.smartcell_rate || "-"}
              </p>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          MESSAGE TEMPLATES
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-6 max-w-5xl mb-6">

        <div className="mb-6">

          <h2 className="text-xl font-bold">
            Message Templates
          </h2>

          <p className="text-gray-500 mt-1">
            Configure the messages used by
            NEITS RMS for different repair
            job stages.
          </p>

        </div>


        {templatesLoading ? (

          <div className="py-8 text-center text-gray-500">
            Loading message templates...
          </div>

        ) : templates.length === 0 ? (

          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-5">

            <p className="font-semibold text-yellow-800">
              No message templates found.
            </p>

            <p className="text-sm text-yellow-700 mt-1">
              The template database is currently
              empty. We will add the default
              templates in the next step.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {templates.map(
              (template) => (

                <div
                  key={template.id}
                  className="
                    border
                    rounded-xl
                    p-5
                    hover:shadow-sm
                    transition
                  "
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="font-bold text-lg">
                          {template.name}
                        </h3>


                        {template.enabled ? (

                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            Enabled
                          </span>

                        ) : (

                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                            Disabled
                          </span>

                        )}

                      </div>


                      <p className="text-xs text-gray-400 mt-1">
                        Code: {template.code}
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        handleToggleTemplate(
                          template
                        )
                      }
                      className={`
                        px-4
                        py-2
                        rounded-lg
                        text-sm
                        font-semibold
                        whitespace-nowrap
                        ${
                          template.enabled
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }
                      `}
                    >
                      {template.enabled
                        ? "Disable"
                        : "Enable"}
                    </button>

                  </div>


                  <div className="bg-gray-50 border rounded-lg p-4 mt-4">

                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {template.message}
                    </p>

                  </div>


                  <div className="mt-4">

                    <button
                      type="button"
                      onClick={() =>
                        handleEditTemplate(
                          template
                        )
                      }
                      className="
                        bg-blue-600
                        text-white
                        px-4
                        py-2
                        rounded-lg
                        text-sm
                        font-semibold
                        hover:bg-blue-700
                      "
                    >
                      Edit Message
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =================================================
          SECURITY
      ================================================= */}

      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 max-w-5xl mb-6">

        <h2 className="font-bold text-yellow-800">
          Security
        </h2>

        <ul className="list-disc ml-5 mt-3 text-sm text-yellow-700 space-y-1">

          <li>
            The Sociair API token is never
            returned to the browser.
          </li>

          <li>
            Only an Administrator can replace
            the API token.
          </li>

          <li>
            Automatic SMS respects the master
            SMS switch and individual message
            template settings.
          </li>

          <li>
            SMS sending will be recorded in
            SMS history.
          </li>

          <li>
            Bulk SMS requires separate
            authorization.
          </li>

        </ul>

      </div>


      {/* =================================================
          EDIT TEMPLATE MODAL
      ================================================= */}

      {editingTemplate && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            <div className="p-6">

              {/* HEADER */}

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-xl font-bold">
                  Edit Message
                </h2>


                <button
                  type="button"
                  onClick={() =>
                    setEditingTemplate(null)
                  }
                  className="text-gray-500 hover:text-gray-800 text-xl"
                >
                  ✕
                </button>

              </div>


              {/* NAME */}

              <div className="mb-5">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message Name
                </label>

                <input
                  type="text"
                  value={
                    editingTemplate.name
                  }
                  onChange={(event) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      name:
                        event.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-4 py-3"
                />

              </div>


              {/* CODE */}

              <div className="mb-5">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Code
                </label>

                <input
                  type="text"
                  value={
                    editingTemplate.code
                  }
                  disabled
                  className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                />

              </div>


              {/* ENABLED */}

              <div className="mb-5">

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={
                      editingTemplate.enabled
                    }
                    onChange={(event) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        enabled:
                          event.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />

                  <span className="font-semibold">
                    Enable this message
                  </span>

                </label>

              </div>


              {/* MESSAGE */}

              <div className="mb-5">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>

                <textarea
                  value={
                    editingTemplate.message
                  }
                  onChange={(event) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      message:
                        event.target.value,
                    })
                  }
                  rows={10}
                  className="
                    w-full
                    border
                    rounded-lg
                    px-4
                    py-3
                    font-mono
                    text-sm
                  "
                />

              </div>


              {/* VARIABLES */}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">

                <p className="font-semibold text-blue-800 mb-2">
                  Available Variables
                </p>


                <div className="flex flex-wrap gap-2">

                  {SMS_VARIABLES.map(
                    (variable) => (

                      <button
                        key={variable}
                        type="button"
                        onClick={() =>
                          insertVariable(
                            variable
                          )
                        }
                        className="
                          bg-white
                          border
                          border-blue-300
                          text-blue-700
                          px-2
                          py-1
                          rounded
                          text-xs
                          hover:bg-blue-100
                        "
                      >
                        {variable}
                      </button>

                    )
                  )}

                </div>


                <p className="text-xs text-blue-700 mt-3">
                  Click a variable to add it
                  to the message. The value will
                  be filled automatically when
                  the SMS is sent.
                </p>

              </div>


              {/* PREVIEW */}

              <div className="bg-gray-50 border rounded-lg p-4 mb-6">

                <p className="font-semibold text-gray-700 mb-2">
                  Message Preview
                </p>

                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {editingTemplate.message}
                </p>

              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setEditingTemplate(null)
                  }
                  className="
                    px-5
                    py-3
                    rounded-lg
                    border
                    font-semibold
                    hover:bg-gray-50
                  "
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={
                    handleSaveTemplate
                  }
                  disabled={savingTemplate}
                  className="
                    bg-blue-600
                    text-white
                    px-5
                    py-3
                    rounded-lg
                    font-semibold
                    hover:bg-blue-700
                    disabled:bg-gray-400
                    disabled:cursor-not-allowed
                  "
                >
                  {savingTemplate
                    ? "Saving..."
                    : "Save Message"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}