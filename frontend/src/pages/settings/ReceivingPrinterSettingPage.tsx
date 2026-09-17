import {
  useEffect,
  useState,
} from "react";

import {
  getReceivingPrinterSettings,
  saveReceivingPrinterSettings,
  getWindowsPrinters,
} from "../../api/receivingPrinterSetting";

interface Printer {
  name?: string;
  deviceId?: string;
}

export default function ReceivingPrinterSettingPage() {

  const [printers, setPrinters] =
    useState<Printer[]>([]);

  const [
    voucherPrinter,
    setVoucherPrinter,
  ] = useState("");

  const [
    stickerPrinter,
    setStickerPrinter,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    agentError,
    setAgentError,
  ] = useState("");

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {

      setLoading(true);
      setAgentError("");

      const [
        settingsRes,
        printersRes,
      ] = await Promise.all([
        getReceivingPrinterSettings(),
        getWindowsPrinters(),
      ]);

      const settings =
        settingsRes?.data || {};

      const printerList =
        Array.isArray(
          printersRes?.data
        )
          ? printersRes.data
          : [];

      console.log(
        "PRINT AGENT DATA:",
        printersRes
      );

      console.log(
        "PRINTER LIST:",
        printerList,
        "COUNT:",
        printerList.length
      );

      setPrinters(
        printerList
      );

      setVoucherPrinter(
        settings.voucherPrinter ||
        ""
      );

      setStickerPrinter(
        settings.stickerPrinter ||
        ""
      );

    } catch (error: any) {

      console.error(
        "Unable to load printer settings:",
        error
      );

      setAgentError(
        error?.message ||
        "Unable to connect to the Print Agent."
      );

    } finally {

      setLoading(false);

    }
  }

  // =====================================================
  // SAVE
  // =====================================================

  async function save() {

    try {

      setSaving(true);

      await saveReceivingPrinterSettings(
        voucherPrinter || null,
        stickerPrinter || null
      );

      alert(
        "Receiving Printer Settings Saved Successfully."
      );

    } catch (error: any) {

      console.error(
        error
      );

      alert(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save printer settings."
      );

    } finally {

      setSaving(false);

    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* TITLE */}

      <div>

        <h1 className="text-3xl font-bold">
          Receiving Print Settings
        </h1>

        <p className="text-gray-500 mt-2">
          Select which Windows printer should be
          used for customer vouchers and stickers.
        </p>

      </div>

      {/* PRINT AGENT STATUS */}

      <div
        className={`rounded-xl border p-5 ${
          agentError
            ? "bg-red-50 border-red-200"
            : "bg-green-50 border-green-200"
        }`}
      >

        {agentError ? (

          <>
            <h2 className="font-bold text-red-800">
              Print Agent Not Connected
            </h2>

            <p className="text-red-700 text-sm mt-1">
              {agentError}
            </p>

            <button
              type="button"
              onClick={
                loadSettings
              }
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Retry Connection
            </button>
          </>

        ) : (

          <>
            <h2 className="font-bold text-green-800">
              Print Agent Connected
            </h2>

            <p className="text-green-700 text-sm mt-1">
              Windows printers loaded successfully.
            </p>
          </>

        )}

      </div>

      {/* SETTINGS */}

      <div className="bg-white rounded-xl shadow p-6 max-w-3xl">

        <div className="space-y-6">

          {/* VOUCHER PRINTER */}

          <div>

            <label className="block font-semibold mb-2">
              Voucher Printer
            </label>

            <select
              value={
                voucherPrinter
              }
              onChange={(e) =>
                setVoucherPrinter(
                  e.target.value
                )
              }
              disabled={
                loading ||
                printers.length === 0
              }
              className="border rounded-lg p-3 w-full"
            >

              <option value="">
                Select Voucher Printer
              </option>

              {printers.map(
                (
                  printer,
                  index
                ) => {

                  const name =
                    printer.name ||
                    printer.deviceId ||
                    "";

                  return (
                    <option
                      key={
                        `${name}-${index}`
                      }
                      value={name}
                    >
                      {name}
                    </option>
                  );
                }
              )}

            </select>

            <p className="text-sm text-gray-500 mt-2">
              Used for the A4 customer voucher.
            </p>

          </div>

          {/* STICKER PRINTER */}

          <div>

            <label className="block font-semibold mb-2">
              Sticker Printer
            </label>

            <select
              value={
                stickerPrinter
              }
              onChange={(e) =>
                setStickerPrinter(
                  e.target.value
                )
              }
              disabled={
                loading ||
                printers.length === 0
              }
              className="border rounded-lg p-3 w-full"
            >

              <option value="">
                Not configured
              </option>

              {printers.map(
                (
                  printer,
                  index
                ) => {

                  const name =
                    printer.name ||
                    printer.deviceId ||
                    "";

                  return (
                    <option
                      key={
                        `${name}-${index}`
                      }
                      value={name}
                    >
                      {name}
                    </option>
                  );
                }
              )}

            </select>

            <p className="text-sm text-gray-500 mt-2">
              Used for the Job Sticker and
              all received Accessory Stickers.
            </p>

          </div>

        </div>

        {/* SAVE */}

        <div className="mt-8 pt-6 border-t">

          <button
            type="button"
            onClick={
              save
            }
            disabled={
              saving
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {saving
              ? "Saving..."
              : "Save Printer Settings"}
          </button>

        </div>

      </div>

    </div>
  );
}