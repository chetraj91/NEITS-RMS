import { useEffect, useMemo, useState } from "react";
import {
  getPurchases,
  createPurchase,
  deletePurchase,
} from "../api/purchase";
import { getSuppliers } from "../api/supplier";
import { getInventory } from "../api/inventory";

import {
  getPaymentMethods,
} from "../api/paymentMethod";

export default function PurchasesPage() {
  const [purchases, setPurchases] =
    useState<any[]>([]);

  const [suppliers, setSuppliers] =
    useState<any[]>([]);

  const [inventory, setInventory] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // PURCHASE HEADER
  // =====================================================

  const [supplierId, setSupplierId] =
    useState("");

    const [supplierSearch, setSupplierSearch] =
      useState("");

  const [purchaseDate, setPurchaseDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");
    const [
  paymentMethods,
  setPaymentMethods,
] = useState<any[]>([]);

  const [remarks, setRemarks] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [tax, setTax] =
    useState(0);

  const [paidAmount, setPaidAmount] =
    useState(0);

  // =====================================================
  // PURCHASE ITEMS
  // =====================================================

  const [selectedInventoryId, setSelectedInventoryId] =
    useState("");

    const [inventorySearch, setInventorySearch] =
       useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [purchasePrice, setPurchasePrice] =
    useState(0);

  const [sellingPrice, setSellingPrice] =
    useState(0);

  const [purchaseItems, setPurchaseItems] =
    useState<any[]>([]);

  // =====================================================
  // LOAD DATA
  // =====================================================

useEffect(() => {
  loadData();
  loadPaymentMethods();
}, []);

async function loadPaymentMethods() {
  try {
    const response =
      await getPaymentMethods(true);

    const methods =
      Array.isArray(response)
        ? response
        : response?.data ?? [];

    setPaymentMethods(
      Array.isArray(methods)
        ? methods
        : []
    );
  } catch (error) {
    console.error(
      "Failed to load payment methods:",
      error
    );
  }
}

async function loadData() {
    try {
      setLoading(true);

      const [
        purchaseResponse,
        supplierResponse,
        inventoryResponse,
      ] = await Promise.all([
        getPurchases(),
        getSuppliers(),
        getInventory(),
      ]);

      setPurchases(
        Array.isArray(
          purchaseResponse?.data
        )
          ? purchaseResponse.data
          : []
      );

      setSuppliers(
        Array.isArray(
          supplierResponse?.data
        )
          ? supplierResponse.data
          : []
      );

      const inventoryData =
        inventoryResponse?.data?.data ??
        inventoryResponse?.data ??
        [];

      setInventory(
        Array.isArray(inventoryData)
          ? inventoryData
          : []
      );
    } catch (err: any) {
      console.error(
        "Failed to load purchase data:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Unable to load purchase data."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INVENTORY SELECTION
  // =====================================================

  function handleInventoryChange(
    id: string
  ) {
    setSelectedInventoryId(id);

    const item =
      inventory.find(
        (row: any) =>
          row.id === id
      );

    if (!item) {
      setPurchasePrice(0);
      setSellingPrice(0);
      return;
    }

    setPurchasePrice(
      Number(
        item.purchasePrice ?? 0
      )
    );

    setSellingPrice(
      Number(
        item.sellingPrice ?? 0
      )
    );
  }

  // =====================================================
  // ADD PURCHASE ITEM
  // =====================================================

  function addPurchaseItem() {
    if (!selectedInventoryId) {
      alert(
        "Please select an inventory item."
      );
      return;
    }

    if (quantity <= 0) {
      alert(
        "Quantity must be greater than zero."
      );
      return;
    }

    if (purchasePrice < 0) {
      alert(
        "Purchase price cannot be negative."
      );
      return;
    }

    const item =
      inventory.find(
        (row: any) =>
          row.id ===
          selectedInventoryId
      );

    if (!item) {
      alert(
        "Inventory item not found."
      );
      return;
    }

    const total =
      Number(quantity) *
      Number(purchasePrice);

    setPurchaseItems((prev) => [
      ...prev,
      {
        inventoryId:
          selectedInventoryId,

        itemName:
          item.itemName,

        itemCode:
          item.itemCode,

        quantity:
          Number(quantity),

        purchasePrice:
          Number(purchasePrice),

        sellingPrice:
          Number(sellingPrice),

        total,
      },
    ]);

      setSelectedInventoryId("");
      setInventorySearch("");
      setQuantity(1);
      setPurchasePrice(0);
      setSellingPrice(0);
  }

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  function removePurchaseItem(
    index: number
  ) {
    setPurchaseItems((prev) =>
      prev.filter(
        (_item, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  // =====================================================
  // TOTALS
  // =====================================================

  const subtotal =
    useMemo(() => {
      return purchaseItems.reduce(
        (
          sum: number,
          item: any
        ) =>
          sum +
          Number(
            item.total || 0
          ),
        0
      );
    }, [purchaseItems]);

  const grandTotal =
    Math.max(
      0,
      subtotal -
        Number(discount || 0) +
        Number(tax || 0)
    );

  const dueAmount =
    Math.max(
      0,
      grandTotal -
        Number(paidAmount || 0)
    );

  // =====================================================
  // OPEN NEW PURCHASE
  // =====================================================

  function openNewPurchase() {
  setSupplierId("");
  setSupplierSearch("");

  setPurchaseDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setInvoiceNumber("");
    setPaymentMethod("CASH");
    setRemarks("");
    setDiscount(0);
    setTax(0);
    setPaidAmount(0);

    setSelectedInventoryId("");
    setInventorySearch("");
    setQuantity(1);
    setPurchasePrice(0);
    setSellingPrice(0);
    setPurchaseItems([]);

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
  }

  // =====================================================
  // SAVE PURCHASE
  // =====================================================

  async function handleSavePurchase() {
    if (!supplierId) {
      alert(
        "Please select a supplier."
      );
      return;
    }

    if (
      purchaseItems.length === 0
    ) {
      alert(
        "Please add at least one item."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        supplierId,

        purchaseDate,

        invoiceNumber:
          invoiceNumber.trim() ||
          null,

        paymentMethod,

        remarks:
          remarks.trim() ||
          null,

        discount:
          Number(discount || 0),

        tax:
          Number(tax || 0),

        paidAmount:
          Number(paidAmount || 0),

        items:
          purchaseItems.map(
            (item: any) => ({
              inventoryId:
                item.inventoryId,

              quantity:
                Number(
                  item.quantity
                ),

              purchasePrice:
                Number(
                  item.purchasePrice
                ),

              sellingPrice:
                Number(
                  item.sellingPrice
                ),
            })
          ),
      };

      const response =
        await createPurchase(
          payload
        );

      alert(
        response?.message ||
          "Purchase created successfully."
      );

      setShowForm(false);

      await loadData();
    } catch (err: any) {
      console.error(
        "Create purchase error:",
        err
      );

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create purchase."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE PURCHASE
  // =====================================================

  async function handleDeletePurchase(
    purchase: any
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${purchase.purchaseNumber}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deletePurchase(
        purchase.id
      );

      alert(
        "Purchase deleted successfully."
      );

      await loadData();
    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Unable to delete purchase."
      );
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Loading Purchases...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Purchases
          </h1>

          <p className="text-gray-500 mt-1">
            Record goods purchased from suppliers
          </p>
        </div>

        <button
          onClick={openNewPurchase}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + New Purchase
        </button>

      </div>

      {/* PURCHASE LIST */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-4 py-4 text-left">
                  Purchase No.
                </th>

                <th className="px-4 py-4 text-left">
                  Date
                </th>

                <th className="px-4 py-4 text-left">
                  Supplier
                </th>

                <th className="px-4 py-4 text-right">
                  Total
                </th>

                <th className="px-4 py-4 text-right">
                  Paid
                </th>

                <th className="px-4 py-4 text-right">
                  Due
                </th>

                <th className="px-4 py-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {purchases.map(
                (purchase: any) => (
                  <tr
                    key={purchase.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-4 py-4 font-semibold">
                      {purchase.purchaseNumber}
                    </td>

                    <td className="px-4 py-4">
                      {purchase.purchaseDate
                        ? new Date(
                            purchase.purchaseDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="px-4 py-4">
                      {purchase.supplier
                        ?.companyName ||
                        "-"}
                    </td>

                    <td className="px-4 py-4 text-right">
                      Rs.{" "}
                      {Number(
                        purchase.totalAmount ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-right text-green-700">
                      Rs.{" "}
                      {Number(
                        purchase.paidAmount ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-right text-red-600 font-semibold">
                      Rs.{" "}
                      {Number(
                        purchase.dueAmount ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-center">

                      <button
                        onClick={() =>
                          handleDeletePurchase(
                            purchase
                          )
                        }
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {!purchases.length && (
          <div className="text-center py-10 text-gray-500">
            No purchase records found.
          </div>
        )}

      </div>

      {/* =================================================
          NEW PURCHASE FORM
      ================================================= */}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto p-8">

            <div className="flex justify-between items-center mb-8">

              <div>
                <h2 className="text-2xl font-bold">
                  New Purchase
                </h2>

                <p className="text-gray-500 mt-1">
                  Record goods purchased from supplier
                </p>
              </div>

              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-900 text-2xl"
              >
                ×
              </button>

            </div>

            {/* =========================================
                PURCHASE INFORMATION
            ========================================= */}

            <div className="grid grid-cols-2 gap-5 mb-8">

      <div className="relative">
  <label className="text-sm font-medium">
    Supplier *
  </label>

  <input
    type="text"
    value={
      supplierSearch ||
      suppliers.find(
        (supplier: any) =>
          supplier.id === supplierId
      )?.companyName ||
      ""
    }
    onChange={(e) => {
      setSupplierSearch(e.target.value);
      setSupplierId("");
    }}
    placeholder="Type supplier name, phone or code..."
    className="border rounded-lg p-3 w-full mt-1"
  />

  {supplierSearch.trim() && !supplierId && (
    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {suppliers
        .filter((supplier: any) => {
          const search =
            supplierSearch
              .trim()
              .toLowerCase();

          return (
            String(
              supplier.companyName || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              supplier.supplierCode || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              supplier.phone || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              supplier.contactPerson || ""
            )
              .toLowerCase()
              .includes(search)
          );
        })
        .slice(0, 50)
        .map((supplier: any) => (
          <button
            key={supplier.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();

              setSupplierId(
                supplier.id
              );

              setSupplierSearch(
                supplier.companyName || ""
              );
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
          >
            <div className="font-semibold">
              {supplier.companyName}
            </div>

            <div className="text-xs text-gray-500">
              {supplier.supplierCode
                ? `Code: ${supplier.supplierCode}`
                : ""}

              {supplier.phone
                ? ` • Phone: ${supplier.phone}`
                : ""}
            </div>
          </button>
        ))}
      
      {suppliers.filter((supplier: any) => {
        const search =
          supplierSearch
            .trim()
            .toLowerCase();

        return (
          String(
            supplier.companyName || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            supplier.supplierCode || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            supplier.phone || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            supplier.contactPerson || ""
          )
            .toLowerCase()
            .includes(search)
            );
            }).length === 0 && (
            <div className="px-4 py-3 text-gray-500">
            No supplier found.
           </div>
            )}
           </div>
          )}
 
          {!supplierSearch && !supplierId && (
          <div className="text-xs text-gray-500 mt-1">
          Type to search supplier
          </div>
          )}
        </div>

              <div>
                <label className="text-sm font-medium">
                  Purchase Date *
                </label>

                <input
                  type="date"
                  value={
                    purchaseDate
                  }
                  onChange={(e) =>
                    setPurchaseDate(
                      e.target.value
                    )
                  }
                  className="border rounded-lg p-3 w-full mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Supplier Invoice No.
                </label>

                <input
                  value={
                    invoiceNumber
                  }
                  onChange={(e) =>
                    setInvoiceNumber(
                      e.target.value
                    )
                  }
                  className="border rounded-lg p-3 w-full mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Payment Method
                </label>

          <select
      value={paymentMethod}
      onChange={(e) =>
      setPaymentMethod(
      e.target.value
     )
      }
     className="border rounded-lg p-3 w-full mt-1"
      >
     {paymentMethods.map(
       (method: any) => (
      <option
        key={method.id}
        value={method.code}
      >
        {method.name}
      </option>
       )
       )}
       </select>
              </div>

            </div>

            <div className="mb-8">

              <label className="text-sm font-medium">
                Remarks
              </label>

              <textarea
                rows={3}
                value={remarks}
                onChange={(e) =>
                  setRemarks(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full mt-1"
              />

            </div>

            {/* =========================================
                ADD ITEM
            ========================================= */}

            <div className="bg-gray-50 border rounded-xl p-6">

              <h3 className="text-lg font-bold mb-5">
                Add Purchase Item
              </h3>

              <div className="grid grid-cols-5 gap-4">

   <div className="col-span-2 relative">

  <label className="text-sm font-medium">
    Inventory Item *
  </label>

  <input
    type="text"
    value={
      inventorySearch ||
      inventory.find(
        (item: any) =>
          item.id ===
          selectedInventoryId
      )?.itemName ||
      ""
    }
    onChange={(e) => {
      setInventorySearch(
        e.target.value
      );

      setSelectedInventoryId("");
    }}
    placeholder="Type item name, code, brand or model..."
    className="border rounded-lg p-3 w-full mt-1"
  />

  {inventorySearch.trim() &&
    !selectedInventoryId && (
      <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">

        {inventory
          .filter((item: any) => {
            const search =
              inventorySearch
                .trim()
                .toLowerCase();

            return (
              String(
                item.itemName || ""
              )
                .toLowerCase()
                .includes(search) ||

              String(
                item.itemCode || ""
              )
                .toLowerCase()
                .includes(search) ||

              String(
                item.brand || ""
              )
                .toLowerCase()
                .includes(search) ||

              String(
                item.model || ""
              )
                .toLowerCase()
                .includes(search)
            );
          })
          .slice(0, 50)
          .map((item: any) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();

                handleInventoryChange(
                  item.id
                );

                setInventorySearch(
                  `${item.itemName} - ${item.itemCode}`
                );
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
            >
              <div className="font-semibold">
                {item.itemName}
              </div>

              <div className="text-xs text-gray-500">
                Code:{" "}
                {item.itemCode || "-"}
                {item.brand
                  ? ` • Brand: ${item.brand}`
                  : ""}
                {item.model
                  ? ` • Model: ${item.model}`
                  : ""}
              </div>
            </button>
          ))}

        {inventory.filter(
          (item: any) => {
            const search =
              inventorySearch
                .trim()
                .toLowerCase();

            return (
              String(
                item.itemName || ""
              )
                .toLowerCase()
                .includes(search) ||

              String(
                item.itemCode || ""
              )
                .toLowerCase()
                .includes(search) ||

              String(
                item.brand || ""
              )
                .toLowerCase()
                .includes(search) ||

              String(
                item.model || ""
              )
                .toLowerCase()
                .includes(search)
            );
          }
        ).length === 0 && (
          <div className="px-4 py-3 text-gray-500">
            No inventory item found.
          </div>
        )}

      </div>
    )}

  {!inventorySearch &&
    !selectedInventoryId && (
      <div className="text-xs text-gray-500 mt-1">
        Type to search inventory item
      </div>
    )}

</div>

                <div>

                  <label className="text-sm font-medium">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={
                      quantity
                    }
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Number(
                            e.target.value
                          ) || 1
                        )
                      )
                    }
                    className="border rounded-lg p-3 w-full mt-1"
                  />

                </div>

                <div>

                  <label className="text-sm font-medium">
                    Purchase Price *
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={
                      purchasePrice
                    }
                    onChange={(e) =>
                      setPurchasePrice(
                        Math.max(
                          0,
                          Number(
                            e.target.value
                          ) || 0
                        )
                      )
                    }
                    className="border rounded-lg p-3 w-full mt-1"
                  />

                </div>

                <div>

                  <label className="text-sm font-medium">
                    Selling Price
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={
                      sellingPrice
                    }
                    onChange={(e) =>
                      setSellingPrice(
                        Math.max(
                          0,
                          Number(
                            e.target.value
                          ) || 0
                        )
                      )
                    }
                    className="border rounded-lg p-3 w-full mt-1"
                  />

                </div>

              </div>

              <button
                onClick={
                  addPurchaseItem
                }
                className="mt-5 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                + Add Item
              </button>

            </div>

            {/* =========================================
                ITEMS TABLE
            ========================================= */}

            <div className="mt-8">

              <h3 className="text-lg font-bold mb-4">
                Purchase Items
              </h3>

              <div className="overflow-x-auto">

                <table className="w-full border">

                  <thead className="bg-gray-100">

                    <tr>

                      <th className="border p-3 text-left">
                        Item
                      </th>

                      <th className="border p-3 text-center">
                        Qty
                      </th>

                      <th className="border p-3 text-right">
                        Purchase Price
                      </th>

                      <th className="border p-3 text-right">
                        Selling Price
                      </th>

                      <th className="border p-3 text-right">
                        Total
                      </th>

                      <th className="border p-3 text-center">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {purchaseItems.map(
                      (
                        item: any,
                        index: number
                      ) => (
                        <tr
                          key={`${item.inventoryId}-${index}`}
                        >

                          <td className="border p-3">
                            <div className="font-semibold">
                              {item.itemName}
                            </div>

                            <div className="text-xs text-gray-500">
                              {item.itemCode}
                            </div>
                          </td>

                          <td className="border p-3 text-center">
                            {item.quantity}
                          </td>

                          <td className="border p-3 text-right">
                            Rs.{" "}
                            {Number(
                              item.purchasePrice
                            ).toFixed(2)}
                          </td>

                          <td className="border p-3 text-right">
                            Rs.{" "}
                            {Number(
                              item.sellingPrice
                            ).toFixed(2)}
                          </td>

                          <td className="border p-3 text-right font-semibold">
                            Rs.{" "}
                            {Number(
                              item.total
                            ).toFixed(2)}
                          </td>

                          <td className="border p-3 text-center">

                            <button
                              onClick={() =>
                                removePurchaseItem(
                                  index
                                )
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                            >
                              Remove
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                  <tfoot>

                    <tr>
                      <td
                        colSpan={4}
                        className="border p-3 text-right font-bold"
                      >
                        Subtotal
                      </td>

                      <td className="border p-3 text-right font-bold">
                        Rs.{" "}
                        {subtotal.toFixed(
                          2
                        )}
                      </td>

                      <td className="border p-3"></td>
                    </tr>

                  </tfoot>

                </table>

              </div>

            </div>

            {/* =========================================
                FINANCIALS
            ========================================= */}

            <div className="grid grid-cols-2 gap-6 mt-8">

              <div>

                <label className="text-sm font-medium">
                  Discount
                </label>

                <input
                  type="number"
                  min={0}
                  value={
                    discount
                  }
                  onChange={(e) =>
                    setDiscount(
                      Math.max(
                        0,
                        Number(
                          e.target.value
                        ) || 0
                      )
                    )
                  }
                  className="border rounded-lg p-3 w-full mt-1"
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Tax
                </label>

                <input
                  type="number"
                  min={0}
                  value={tax}
                  onChange={(e) =>
                    setTax(
                      Math.max(
                        0,
                        Number(
                          e.target.value
                        ) || 0
                      )
                    )
                  }
                  className="border rounded-lg p-3 w-full mt-1"
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Grand Total
                </label>

                <input
                  readOnly
                  value={grandTotal.toFixed(
                    2
                  )}
                  className="border rounded-lg p-3 w-full mt-1 bg-blue-50 font-bold"
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Paid Amount
                </label>

                <input
                  type="number"
                  min={0}
                  value={
                    paidAmount
                  }
                  onChange={(e) =>
                    setPaidAmount(
                      Math.max(
                        0,
                        Number(
                          e.target.value
                        ) || 0
                      )
                    )
                  }
                  className="border rounded-lg p-3 w-full mt-1"
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Due Amount
                </label>

                <input
                  readOnly
                  value={dueAmount.toFixed(
                    2
                  )}
                  className="border rounded-lg p-3 w-full mt-1 bg-red-50 text-red-600 font-bold"
                />

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex gap-4 mt-8">

              <button
                onClick={
                  handleSavePurchase
                }
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-lg font-semibold"
              >
                {saving
                  ? "Saving..."
                  : "Save Purchase"}
              </button>

              <button
                onClick={
                  closeForm
                }
                className="bg-gray-500 hover:bg-gray-600 text-white px-7 py-3 rounded-lg"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}