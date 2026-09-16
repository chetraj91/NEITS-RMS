
import {
  useEffect,
  useState,
} from "react";

import {
  getCompanySettings,
  updateCompanySettings,
} from "../../api/companySettings";

export default function CompanySettingsPage() {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // COMPANY INFORMATION
  // =====================================================

  const [companyName, setCompanyName] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [panVat, setPanVat] =
    useState("");

  const [website, setWebsite] =
    useState("");

  const [logoUrl, setLogoUrl] =
    useState("");

  const [invoiceFooter, setInvoiceFooter] =
    useState("");

  // =====================================================
  // EXCEL / GOOGLE DRIVE BACKUP
  // =====================================================

  const [excelBackupEnabled, setExcelBackupEnabled] =
    useState(false);

  const [googleDriveEmail, setGoogleDriveEmail] =
    useState("");

  const [googleDriveFolderId, setGoogleDriveFolderId] =
    useState("");

    const [googleClientId, setGoogleClientId] =
     useState("");

    const [googleClientSecret, setGoogleClientSecret] =
     useState("");

  const [repairExcelEnabled, setRepairExcelEnabled] =
    useState(true);

  const [salesExcelEnabled, setSalesExcelEnabled] =
    useState(true);

  const [purchaseExcelEnabled, setPurchaseExcelEnabled] =
    useState(true);

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    loadCompany();
  }, []);

  async function loadCompany() {
    try {
      setLoading(true);

      const response =
        await getCompanySettings();

      const company =
        response?.data ?? {};

      // Company Information
      setCompanyName(
        company.companyName || ""
      );

      setAddress(
        company.address || ""
      );

      setPhone(
        company.phone || ""
      );

      setEmail(
        company.email || ""
      );

      setPanVat(
        company.panVat || ""
      );

      setWebsite(
        company.website || ""
      );

      setLogoUrl(
        company.logoUrl || ""
      );

      setInvoiceFooter(
        company.invoiceFooter || ""
      );

      // Excel / Google Drive Backup
      setExcelBackupEnabled(
        company.excelBackupEnabled === true
      );

      setGoogleDriveEmail(
        company.googleDriveEmail || ""
      );

      setGoogleDriveFolderId(
        company.googleDriveFolderId || ""
      );
      
      setGoogleClientId(
      company.googleClientId || ""
      );

      setGoogleClientSecret("");

      setRepairExcelEnabled(
        company.repairExcelEnabled !== false
      );

      setSalesExcelEnabled(
        company.salesExcelEnabled !== false
      );

      setPurchaseExcelEnabled(
        company.purchaseExcelEnabled !== false
      );
    } catch (error: any) {
      console.error(
        "Failed to load company settings:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to load company settings."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SAVE
  // =====================================================

  async function handleSave() {
    if (!companyName.trim()) {
      alert(
        "Company name is required."
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await updateCompanySettings({
          // Company Information
          companyName:
            companyName.trim(),

          address:
            address.trim() ||
            null,

          phone:
            phone.trim() ||
            null,

          email:
            email.trim() ||
            null,

          panVat:
            panVat.trim() ||
            null,

          website:
            website.trim() ||
            null,

          logoUrl:
            logoUrl.trim() ||
            null,

          invoiceFooter:
            invoiceFooter.trim() ||
            null,

          // Excel / Google Drive Backup
          excelBackupEnabled,

          googleDriveEmail:
            googleDriveEmail.trim() ||
            null,

          googleDriveFolderId:
            googleDriveFolderId.trim() ||
            null,

            googleClientId:
            googleClientId.trim() ||
            null,

            googleClientSecret:
            googleClientSecret.trim() ||
             null,

          repairExcelEnabled,

          salesExcelEnabled,

          purchaseExcelEnabled,
        });

      alert(
        response?.message ||
          "Company settings updated successfully."
      );

      await loadCompany();
    } catch (error: any) {
      console.error(
        "Save company settings error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to save company settings."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Loading company settings...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Company Settings
          </h1>

          <p className="text-gray-500 mt-1">
            Manage the company information used throughout NEITS RMS.
          </p>
        </div>

        {/* =====================================================
            COMPANY INFORMATION
            ===================================================== */}

        <div className="bg-white rounded-2xl shadow border p-7">

          <h2 className="text-xl font-bold mb-6">
            Company Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* COMPANY NAME */}

            <div className="md:col-span-2">

              <label className="block text-sm font-medium mb-1">
                Company Name
              </label>

              <input
                type="text"
                value={companyName}
                onChange={(e) =>
                  setCompanyName(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="Company name"
              />

            </div>

            {/* ADDRESS */}

            <div className="md:col-span-2">

              <label className="block text-sm font-medium mb-1">
                Address
              </label>

              <textarea
                rows={3}
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="Company address"
              />

            </div>

            {/* PHONE */}

            <div>

              <label className="block text-sm font-medium mb-1">
                Phone
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="+977-..."
              />

            </div>

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-medium mb-1">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="company@example.com"
              />

            </div>

            {/* PAN */}

            <div>

              <label className="block text-sm font-medium mb-1">
                PAN / VAT
              </label>

              <input
                type="text"
                value={panVat}
                onChange={(e) =>
                  setPanVat(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="PAN / VAT number"
              />

            </div>

            {/* WEBSITE */}

            <div>

              <label className="block text-sm font-medium mb-1">
                Website
              </label>

              <input
                type="text"
                value={website}
                onChange={(e) =>
                  setWebsite(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="https://..."
              />

            </div>

            {/* LOGO */}

            <div className="md:col-span-2">

              <label className="block text-sm font-medium mb-1">
                Logo URL
              </label>

              <input
                type="text"
                value={logoUrl}
                onChange={(e) =>
                  setLogoUrl(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="Logo image URL"
              />

              {logoUrl && (
                <div className="mt-4">

                  <p className="text-sm text-gray-500 mb-2">
                    Logo Preview
                  </p>

                  <div className="border rounded-lg p-4 inline-block bg-gray-50">

                    <img
                      src={logoUrl}
                      alt="Company Logo"
                      className="max-h-24 max-w-64 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                </div>
              )}

            </div>

            {/* INVOICE FOOTER */}

            <div className="md:col-span-2">

              <label className="block text-sm font-medium mb-1">
                Invoice Footer
              </label>

              <textarea
                rows={3}
                value={invoiceFooter}
                onChange={(e) =>
                  setInvoiceFooter(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
                placeholder="Text shown at the bottom of invoices"
              />

            </div>

          </div>

        </div>

        {/* =====================================================
            EXCEL / GOOGLE DRIVE BACKUP
            ===================================================== */}

        <div className="bg-white rounded-2xl shadow border p-7 mt-6">

          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Excel / Google Drive Backup
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Configure automatic Excel backup and Google Drive synchronization.
            </p>
          </div>

          {/* MASTER ENABLE */}

          <div className="border rounded-xl p-5 mb-6">

            <div className="flex items-center justify-between gap-4">

              <div>
                <h3 className="font-semibold text-slate-800">
                  Enable Excel Backup
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Enable automatic Excel backup and Google Drive synchronization.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">

                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={excelBackupEnabled}
                  onChange={(e) =>
                    setExcelBackupEnabled(
                      e.target.checked
                    )
                  }
                />

                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />

              </label>

            </div>

          </div>

          {/* GOOGLE DRIVE SETTINGS */}

          <div
            className={
              excelBackupEnabled
                ? "space-y-6"
                : "space-y-6 opacity-60"
            }
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* GOOGLE CLIENT ID */}

             <div>
            <label className="block text-sm font-medium mb-1">
            Google Client ID
             </label>

              <input
              type="text"
              value={googleClientId}
              onChange={(e) =>
              setGoogleClientId(e.target.value)
             }
             disabled={!excelBackupEnabled}
             className="border rounded-lg p-3 w-full disabled:bg-gray-100"
             placeholder="Google OAuth Client ID"
              />

             <p className="text-xs text-gray-500 mt-1">
             OAuth Client ID used to connect NEITS RMS to Google Drive.
             </p>
             </div>

             {/* GOOGLE CLIENT SECRET */}

<div>
  <label className="block text-sm font-medium mb-1">
    Google Client Secret
  </label>

  <input
    type="password"
      autoComplete="new-password"
      name="google-client-secret"
    value={googleClientSecret}
    onChange={(e) =>
      setGoogleClientSecret(e.target.value)
    }
    disabled={!excelBackupEnabled}
    className="border rounded-lg p-3 w-full disabled:bg-gray-100"
    placeholder="Google OAuth Client Secret"
  />

  <p className="text-xs text-gray-500 mt-1">
    OAuth Client Secret used to connect NEITS RMS to Google Drive.
  </p>
</div>

              {/* GOOGLE DRIVE EMAIL */}

              <div>

                <label className="block text-sm font-medium mb-1">
                  Google Drive Email
                </label>

                <input
                  type="email"
                  value={googleDriveEmail}
                  onChange={(e) =>
                    setGoogleDriveEmail(
                      e.target.value
                    )
                  }
                  disabled={!excelBackupEnabled}
                  className="border rounded-lg p-3 w-full disabled:bg-gray-100"
                  placeholder="neitslab@gmail.com"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Google account that will be used for the Drive backup.
                </p>

              </div>

              {/* GOOGLE DRIVE FOLDER ID */}

              <div>

                <label className="block text-sm font-medium mb-1">
                  Google Drive Folder ID
                </label>

                <input
                  type="text"
                  value={googleDriveFolderId}
                  onChange={(e) =>
                    setGoogleDriveFolderId(
                      e.target.value
                    )
                  }
                  disabled={!excelBackupEnabled}
                  className="border rounded-lg p-3 w-full disabled:bg-gray-100"
                  placeholder="Google Drive folder ID"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Optional. The folder where the Excel backups will be stored.
                </p>

              </div>

            </div>

            {/* EXCEL FILES */}

            <div>

              <h3 className="font-semibold text-slate-800 mb-3">
                Excel Files
              </h3>

              <div className="space-y-3">

                {/* REPAIR */}

                <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={repairExcelEnabled}
                    disabled={!excelBackupEnabled}
                    onChange={(e) =>
                      setRepairExcelEnabled(
                        e.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <div className="font-medium">
                      Repair Excel
                    </div>

                    <div className="text-xs text-gray-500">
                      Include repair job data in the Excel backup.
                    </div>
                  </div>

                </label>

                {/* SALES */}

                <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={salesExcelEnabled}
                    disabled={!excelBackupEnabled}
                    onChange={(e) =>
                      setSalesExcelEnabled(
                        e.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <div className="font-medium">
                      Sales Excel
                    </div>

                    <div className="text-xs text-gray-500">
                      Include sales data in the Excel backup.
                    </div>
                  </div>

                </label>

                {/* PURCHASE */}

                <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={purchaseExcelEnabled}
                    disabled={!excelBackupEnabled}
                    onChange={(e) =>
                      setPurchaseExcelEnabled(
                        e.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <div className="font-medium">
                      Purchase Excel
                    </div>

                    <div className="text-xs text-gray-500">
                      Include purchase data in the Excel backup.
                    </div>
                  </div>

                </label>

              </div>

            </div>

          </div>

          {/* NOTE */}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">

            <p className="text-sm text-blue-800">
              <strong>Note:</strong>{" "}
              Google Drive authentication and automatic Excel synchronization
              will be configured separately. These settings only store the
              backup configuration.
            </p>

          </div>

          {/* SAVE */}

          <div className="flex justify-end mt-8">

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-lg font-semibold"
            >
              {saving
                ? "Saving..."
                : "Save Company Settings"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

