
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getInventoryItem } from "../api/inventory";

function money(value: unknown) {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? number.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
}

function displayType(value: unknown) {
  const type = String(value || "").toUpperCase();

  if (type === "PRODUCT") return "Product";
  if (type === "SPARE_PART") return "Spare Part";
  if (type === "CONSUMABLE") return "Consumable";

  return String(value || "-");
}

function errorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Failed to load inventory item."
  );
}

export default function InventoryViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await getInventoryItem(id);

        const data = response?.data?.data ?? response?.data;

        setItem(data);
      } catch (error: any) {
        console.error("Failed to load inventory item:", error);
        alert(errorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            Loading inventory item...
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Inventory Item Not Found
            </h1>

            <p className="text-gray-500 mt-2">
              The requested inventory item could not be found.
            </p>

            <button
              onClick={() => navigate("/inventory")}
              className="mt-6 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Back to Inventory
            </button>
          </div>
        </div>
      </div>
    );
  }

  const supplierName =
    item.supplier?.companyName ||
    item.supplier?.name ||
    item.supplierName ||
    "-";

  const quantity = Number(item.quantity ?? 0);
  const minimumStock = Number(item.minimumStock ?? 0);
  const lowStock = quantity <= minimumStock;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Inventory Details
            </h1>

            <p className="text-gray-500 mt-1">
              View inventory item information.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/inventory")}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Back
            </button>

            <button
              onClick={() =>
                navigate(`/inventory/edit/${item.id}`)
              }
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Main Card */}

        <div className="bg-white rounded-xl shadow overflow-hidden">

          {/* Item Header */}

          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  Item Code
                </p>

                <p className="font-mono font-semibold text-lg text-gray-800">
                  {item.itemCode || "-"}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    String(item.status || "Active") === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.status || "Active"}
                </span>
              </div>

            </div>
          </div>

          {/* Details */}

          <div className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Detail
                label="Item Name"
                value={item.itemName}
              />

              <Detail
                label="Item Type"
                value={displayType(item.itemType)}
              />

              <Detail
                label="Category"
                value={item.category}
              />

              <Detail
                label="Brand"
                value={item.brand}
              />

              <Detail
                label="Model"
                value={item.model}
              />

              <Detail
                label="Supplier"
                value={supplierName}
              />

              <Detail
                label="Purchase Price"
                value={`Rs. ${money(item.purchasePrice)}`}
              />

              <Detail
                label="Selling Price"
                value={`Rs. ${money(item.sellingPrice)}`}
              />

              <Detail
                label="Quantity"
                value={
                  <span
                    className={
                      lowStock
                        ? "font-bold text-red-600"
                        : "font-semibold text-gray-800"
                    }
                  >
                    {quantity} {item.unit || "PCS"}
                  </span>
                }
              />

              <Detail
                label="Minimum Stock"
                value={minimumStock}
              />

              <Detail
                label="Location"
                value={item.location}
              />

              <Detail
                label="Barcode"
                value={item.barcode}
              />

              <Detail
                label="Unit"
                value={item.unit || "PCS"}
              />

            </div>

            {/* Low Stock Warning */}

            {lowStock && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">
                  Low Stock Warning
                </p>

                <p className="text-sm text-red-600 mt-1">
                  Current quantity ({quantity}) is at or below
                  the minimum stock level ({minimumStock}).
                </p>
              </div>
            )}

            {/* Description */}

            <div className="mt-6">
              <h2 className="font-semibold text-gray-800 mb-2">
                Description
              </h2>

              <div className="border rounded-lg p-4 bg-gray-50 text-gray-700 min-h-[80px]">
                {item.description || "No description available."}
              </div>
            </div>

          </div>

          {/* Footer */}

          <div className="border-t p-6 flex flex-col sm:flex-row justify-between gap-3">

            <button
              onClick={() => navigate("/inventory")}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Back to Inventory
            </button>

            <button
              onClick={() =>
                navigate(`/inventory/edit/${item.id}`)
              }
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Inventory Item
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">
        {label}
      </p>

      <div className="font-medium text-gray-800">
        {value || "-"}
      </div>
    </div>
  );
}

