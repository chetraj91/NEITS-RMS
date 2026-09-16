import {
  useEffect,
  useState,
} from "react";

import {
  getSystemSettings,
  updateSystemSettings,
} from "../../api/systemSettings";

export default function SystemSettingsPage() {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [currency, setCurrency] =
    useState("NPR");

  const [currencySymbol, setCurrencySymbol] =
    useState("Rs.");

  const [dateFormat, setDateFormat] =
    useState("DD/MM/YYYY");

  const [timeZone, setTimeZone] =
    useState("Asia/Kathmandu");

  const [defaultWarrantyDays, setDefaultWarrantyDays] =
    useState(0);

  const [enableNotifications, setEnableNotifications] =
    useState(true);

  const [allowNegativeStock, setAllowNegativeStock] =
    useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      const response =
        await getSystemSettings();

      const settings =
        response?.data ?? {};

      setCurrency(
        settings.currency || "NPR"
      );

      setCurrencySymbol(
        settings.currencySymbol || "Rs."
      );

      setDateFormat(
        settings.dateFormat ||
          "DD/MM/YYYY"
      );

      setTimeZone(
        settings.timeZone ||
          "Asia/Kathmandu"
      );

      setDefaultWarrantyDays(
        Number(
          settings.defaultWarrantyDays ||
            0
        )
      );

      setEnableNotifications(
        settings.enableNotifications !==
          false
      );

      setAllowNegativeStock(
        settings.allowNegativeStock ===
          true
      );
    } catch (error: any) {
      console.error(
        "Load system settings error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to load system settings."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!currency.trim()) {
      alert(
        "Currency is required."
      );
      return;
    }

    if (!currencySymbol.trim()) {
      alert(
        "Currency symbol is required."
      );
      return;
    }

    if (!dateFormat.trim()) {
      alert(
        "Date format is required."
      );
      return;
    }

    if (!timeZone.trim()) {
      alert(
        "Time zone is required."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await updateSystemSettings({
          currency:
            currency.trim(),

          currencySymbol:
            currencySymbol.trim(),

          dateFormat:
            dateFormat.trim(),

          timeZone:
            timeZone.trim(),

          defaultWarrantyDays:
            Number(
              defaultWarrantyDays
            ) || 0,

          enableNotifications,

          allowNegativeStock,
        });

      alert(
        response?.message ||
          "System settings updated successfully."
      );

      await loadSettings();
    } catch (error: any) {
      console.error(
        "Save system settings error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to save system settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Loading system settings...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            System Settings
          </h1>

          <p className="text-gray-500 mt-1">
            Configure general NEITS RMS system behavior.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow border p-7">

          <h2 className="text-xl font-bold mb-6">
            General Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium mb-1">
                Currency
              </label>

              <input
                type="text"
                value={currency}
                onChange={(e) =>
                  setCurrency(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="NPR"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Currency Symbol
              </label>

              <input
                type="text"
                value={currencySymbol}
                onChange={(e) =>
                  setCurrencySymbol(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="Rs."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date Format
              </label>

              <select
                value={dateFormat}
                onChange={(e) =>
                  setDateFormat(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
              >
                <option value="DD/MM/YYYY">
                  DD/MM/YYYY
                </option>

                <option value="MM/DD/YYYY">
                  MM/DD/YYYY
                </option>

                <option value="YYYY-MM-DD">
                  YYYY-MM-DD
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Time Zone
              </label>

              <input
                type="text"
                value={timeZone}
                onChange={(e) =>
                  setTimeZone(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="Asia/Kathmandu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Default Warranty Days
              </label>

              <input
                type="number"
                min={0}
                value={
                  defaultWarrantyDays
                }
                onChange={(e) =>
                  setDefaultWarrantyDays(
                    Number(
                      e.target.value
                    ) || 0
                  )
                }
                className="border rounded-lg p-3 w-full"
              />
            </div>

          </div>

          <div className="border-t mt-8 pt-6 space-y-5">

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={
                  enableNotifications
                }
                onChange={(e) =>
                  setEnableNotifications(
                    e.target.checked
                  )
                }
                className="w-5 h-5"
              />

              <div>
                <p className="font-semibold">
                  Enable Notifications
                </p>

                <p className="text-sm text-gray-500">
                  Allow system notifications and alerts.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={
                  allowNegativeStock
                }
                onChange={(e) =>
                  setAllowNegativeStock(
                    e.target.checked
                  )
                }
                className="w-5 h-5"
              />

              <div>
                <p className="font-semibold">
                  Allow Negative Stock
                </p>

                <p className="text-sm text-gray-500">
                  Allow sales when inventory quantity is insufficient.
                </p>
              </div>
            </label>

          </div>

          <div className="flex justify-end mt-8">

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-lg font-semibold"
            >
              {saving
                ? "Saving..."
                : "Save System Settings"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}