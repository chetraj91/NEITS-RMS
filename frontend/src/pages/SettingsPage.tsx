import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        ⚙ Settings
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Device Types */}
        <div
          onClick={() =>
            navigate(
              "/settings/device-types"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            💻
          </div>

          <h2 className="text-xl font-bold">
            Device Types
          </h2>

          <p className="text-gray-500 mt-2">
            Laptop, Printer, Desktop, CCTV, UPS...
          </p>
        </div>

        {/* Brands */}
        <div
          onClick={() =>
            navigate(
              "/settings/brands"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            🏷️
          </div>

          <h2 className="text-xl font-bold">
            Brands
          </h2>

          <p className="text-gray-500 mt-2">
            Manage brands by device type.
          </p>
        </div>

        {/* Device Fields */}
        <div
          onClick={() =>
            navigate(
              "/settings/device-fields"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            📋
          </div>

          <h2 className="text-xl font-bold">
            Device Fields
          </h2>

          <p className="text-gray-500 mt-2">
            Create reusable repair form fields.
          </p>
        </div>

        {/* Device Type Fields */}
        <div
          onClick={() =>
            navigate(
              "/settings/device-type-fields"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            🔗
          </div>

          <h2 className="text-xl font-bold">
            Device Type Fields
          </h2>

          <p className="text-gray-500 mt-2">
            Assign fields to each device type.
          </p>
        </div>

        {/* Customer Layout */}
        <div
          onClick={() =>
            navigate(
              "/settings/customer-layout"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            👤
          </div>

          <h2 className="text-xl font-bold">
            Customer Layout
          </h2>

          <p className="text-gray-500 mt-2">
            Configure customer information fields,
            order and columns.
          </p>
        </div>

        {/* Receiving Print Layout */}

<div
  onClick={() =>
    navigate(
      "/settings/receiving-print-layout"
    )
  }
  className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
>

  <div className="text-5xl mb-4">
    🖨️
  </div>

  <h2 className="text-xl font-bold">
    Receiving Print Layout
  </h2>

  <p className="text-gray-500 mt-2">
    Configure customer vouchers, job stickers
    and accessory stickers.
  </p>

</div>

{/* Receiving Print Settings */}

<div
  onClick={() =>
    navigate(
      "/settings/receiving-print-settings"
    )
  }
  className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
>

  <div className="text-5xl mb-4">
    🖨️
  </div>

  <h2 className="text-xl font-bold">
    Receiving Print Settings
  </h2>

  <p className="text-gray-500 mt-2">
    Select voucher and sticker printers.
  </p>

</div>

        {/* Accessories */}
        <div
          onClick={() =>
            navigate(
              "/settings/accessories"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            🔌
          </div>

          <h2 className="text-xl font-bold">
            Accessories
          </h2>

          <p className="text-gray-500 mt-2">
            Manage accessories and assign them to device types.
          </p>
        </div>

        {/* Technicians */}
        <div
          onClick={() =>
            navigate(
              "/technicians"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            👨‍🔧
          </div>

          <h2 className="text-xl font-bold">
            Technicians
          </h2>

          <p className="text-gray-500 mt-2">
            Add, edit and manage technicians.
          </p>
        </div>

        {/* Users */}
        <div
          onClick={() =>
            navigate(
              "/settings/users"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            👤
          </div>

          <h2 className="text-xl font-bold">
            Users
          </h2>

          <p className="text-gray-500 mt-2">
            Manage system users and page permissions.
          </p>
        </div>

        {/* Company */}
        <div
          onClick={() =>
            navigate(
              "/settings/company"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            🏢
          </div>

          <h2 className="text-xl font-bold">
            Company
          </h2>

          <p className="text-gray-500 mt-2">
            Company information.
          </p>
        </div>

         {/* Feedback Settings */}
        <div
          onClick={() =>
            navigate(
              "/settings/feedback"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            ⭐
          </div>

          <h2 className="text-xl font-bold">
            Feedback Settings
          </h2>

          <p className="text-gray-500 mt-2">
            Manage feedback, website and Facebook links.
          </p>
        </div>

        {/* Payment Methods */}
        <div
          onClick={() =>
            navigate(
              "/settings/payment-methods"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            💳
          </div>

          <h2 className="text-xl font-bold">
            Payment Methods
          </h2>

          <p className="text-gray-500 mt-2">
            Manage Cash, Bank, Card, eSewa, Khalti and other payment methods.
          </p>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg">
          <div className="text-5xl mb-4">
            💬
          </div>

          <h2 className="text-xl font-bold">
            WhatsApp
          </h2>

          <p className="text-gray-500 mt-2">
            Configure WhatsApp Cloud API.
          </p>
        </div>

           {/* Backup */}
          <div
          onClick={() =>
          navigate(
         "/settings/backup"
          )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
          >
          <div className="text-5xl mb-4">
          💾
          </div>

          <h2 className="text-xl font-bold">
           Backup
           </h2>

          <p className="text-gray-500 mt-2">
          Database backup and restore.
         </p>
         </div>

        {/* System */}
        <div
          onClick={() =>
            navigate(
              "/settings/system"
            )
          }
          className="bg-white rounded-xl shadow p-6 hover:shadow-xl hover:scale-105 transition cursor-pointer"
        >
          <div className="text-5xl mb-4">
            ⚙️
          </div>

          <h2 className="text-xl font-bold">
            System
          </h2>

          <p className="text-gray-500 mt-2">
            General system configuration.
          </p>
        </div>

      </div>
    </div>
  );
}