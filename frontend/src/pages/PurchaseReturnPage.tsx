import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPurchaseReturns,
  createPurchaseReturn,
} from "../api/purchase";

import { getSuppliers } from "../api/supplier";
import { getInventory } from "../api/inventory";

export default function PurchaseReturnPage() {
  const [suppliers, setSuppliers] =
    useState<any[]>([]);

  const [inventory, setInventory] =
    useState<any[]>([]);

  const [purchaseReturns, setPurchaseReturns] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // RETURN INFORMATION
  // =====================================================

  const [supplierId, setSupplierId] =
    useState("");

  const [supplierSearch, setSupplierSearch] =
    useState("");

  const [refundMethod, setRefundMethod] =
    useState("SUPPLIER_CREDIT");

  const [reason, setReason] =
    useState("");

  const [notes, setNotes] =
    useState("");

  // =====================================================
  // ITEM SELECTION
  // =====================================================

  const [selectedInventoryId, setSelectedInventoryId] =
    useState("");

  const [inventorySearch, setInventorySearch] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [returnItems, setReturnItems] =
    useState<any[]>([]);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        supplierResponse,
        inventoryResponse,
        returnsResponse,
      ] = await Promise.all([
        getSuppliers(),
        getInventory(),
        getPurchaseReturns(),
      ]);

      setSuppliers(
        Array.isArray(supplierResponse?.data)
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

      setPurchaseReturns(
        Array.isArray(returnsResponse?.data)
          ? returnsResponse.data
          : []
      );
    } catch (error: any) {
      console.error(
        "Failed to load purchase return data:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load purchase return data."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SUPPLIER ITEMS
  // =====================================================

  const supplierItems = useMemo(() => {
    if (!supplierId) {
      return [];
    }

    return inventory.filter(
      (item: any) =>
        item.supplierId === supplierId &&
        Number(item.quantity || 0) > 0
    );
  }, [inventory, supplierId]);

  // =====================================================
  // DIRECT ITEM SELECTION
  // =====================================================

  function handleInventorySelect(
    inventoryId: string
  ) {
    setSelectedInventoryId(
      inventoryId
    );

    const item =
      supplierItems.find(
        (row: any) =>
          row.id === inventoryId
      );

    if (item) {
      setInventorySearch(
        `${item.itemName} - ${item.itemCode}`
      );
    }
  }

  // =====================================================
  // ADD RETURN ITEM
  // =====================================================

  function addReturnItem() {
    if (!supplierId) {
      alert(
        "Please select a supplier first."
      );
      return;
    }

    if (!selectedInventoryId) {
      alert(
        "Please select an inventory item."
      );
      return;
    }

    if (
      !Number.isInteger(
        Number(quantity)
      ) ||
      Number(quantity) <= 0
    ) {
      alert(
        "Return quantity must be a whole number greater than zero."
      );
      return;
    }

    const item =
      supplierItems.find(
        (row: any) =>
          row.id ===
          selectedInventoryId
      );

    if (!item) {
      alert(
        "Inventory item not found for this supplier."
      );
      return;
    }

    const availableStock =
      Number(
        item.quantity || 0
      );

    const alreadyAdded =
      returnItems
        .filter(
          (returnItem: any) =>
            returnItem.inventoryId ===
            selectedInventoryId
        )
        .reduce(
          (
            sum: number,
            returnItem: any
          ) =>
            sum +
            Number(
              returnItem.quantity || 0
            ),
          0
        );

    const remainingAvailable =
      Math.max(
        0,
        availableStock -
          alreadyAdded
      );

    if (
      Number(quantity) >
      remainingAvailable
    ) {
      alert(
        `Return quantity cannot exceed available stock. Available: ${remainingAvailable}.`
      );
      return;
    }

    const purchasePrice =
      Number(
        item.purchasePrice || 0
      );

    const total =
      Number(quantity) *
      purchasePrice;

    setReturnItems(
      (previous) => [
        ...previous,
        {
          inventoryId:
            selectedInventoryId,

          itemName:
            item.itemName,

          itemCode:
            item.itemCode,

          availableStock,

          quantity:
            Number(quantity),

          purchasePrice,

          total,
        },
      ]
    );

    setSelectedInventoryId("");
    setInventorySearch("");
    setQuantity(1);
  }

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  function updateReturnItemQuantity(
    index: number,
    newQuantity: number
  ) {
    const item =
      returnItems[index];

    if (!item) {
      return;
    }

    const availableStock =
      Number(
        item.availableStock || 0
      );

    const otherQuantity =
      returnItems
        .filter(
          (
            returnItem: any,
            itemIndex: number
          ) =>
            itemIndex !== index &&
            returnItem.inventoryId ===
              item.inventoryId
        )
        .reduce(
          (
            sum: number,
            returnItem: any
          ) =>
            sum +
            Number(
              returnItem.quantity || 0
            ),
          0
        );

    const maxQuantity =
      Math.max(
        0,
        availableStock -
          otherQuantity
      );

    if (maxQuantity <= 0) {
      return;
    }

    const safeQuantity =
      Math.max(
        1,
        Math.min(
          Number(newQuantity) || 1,
          maxQuantity
        )
      );

    setReturnItems(
      (previous) =>
        previous.map(
          (
            returnItem,
            itemIndex
          ) => {
            if (
              itemIndex !== index
            ) {
              return returnItem;
            }

            return {
              ...returnItem,
              quantity:
                safeQuantity,
              total:
                safeQuantity *
                Number(
                  returnItem.purchasePrice ||
                    0
                ),
            };
          }
        )
    );
  }

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  function removeReturnItem(
    index: number
  ) {
    setReturnItems(
      (previous) =>
        previous.filter(
          (
            _item,
            itemIndex
          ) =>
            itemIndex !== index
        )
    );
  }

  // =====================================================
  // TOTAL
  // =====================================================

  const totalAmount =
    useMemo(() => {
      return returnItems.reduce(
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
    }, [returnItems]);

  // =====================================================
  // SAVE PURCHASE RETURN
  // =====================================================

  async function handleCreateReturn() {
    if (!supplierId) {
      alert(
        "Please select a supplier."
      );
      return;
    }

    if (
      returnItems.length === 0
    ) {
      alert(
        "Please add at least one return item."
      );
      return;
    }

    if (
      totalAmount <= 0
    ) {
      alert(
        "Purchase return amount must be greater than zero."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        supplierId,

        refundAmount:
          Number(totalAmount),

        refundMethod,

        reason:
          reason.trim() ||
          null,

        notes:
          notes.trim() ||
          null,

        items:
          returnItems.map(
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

              total:
                Number(
                  item.total
                ),
            })
          ),
      };

      const response =
        await createPurchaseReturn(
          payload
        );

      alert(
        response?.message ||
          "Purchase return created successfully."
      );

      setSupplierId("");
      setSupplierSearch("");
      setRefundMethod(
        "SUPPLIER_CREDIT"
      );
      setReason("");
      setNotes("");
      setSelectedInventoryId("");
      setInventorySearch("");
      setQuantity(1);
      setReturnItems([]);

      await loadData();
    } catch (error: any) {
      console.error(
        "Create purchase return error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create purchase return."
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
          Loading Purchase Returns...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  const useDirectSelect =
    supplierItems.length > 0 &&
    supplierItems.length <= 10;

  const filteredSearchItems =
    supplierItems.filter(
      (item: any) => {
        const search =
          inventorySearch
            .trim()
            .toLowerCase();

        if (!search) {
          return true;
        }

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
    );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Purchase Return
          </h1>

          <p className="text-gray-500 mt-1">
            Return goods to supplier and reduce inventory
          </p>
        </div>
      </div>

      {/* RETURN FORM */}

      <div className="bg-white rounded-xl shadow p-8 mb-8">

        <h2 className="text-2xl font-bold mb-6">
          New Purchase Return
        </h2>

        {/* SUPPLIER */}

        <div className="mb-8">

          <label className="text-sm font-medium">
            Supplier *
          </label>

          <div className="relative">

            <input
              type="text"
              value={
                supplierSearch ||
                suppliers.find(
                  (supplier: any) =>
                    supplier.id ===
                    supplierId
                )?.companyName ||
                ""
              }
              onChange={(event) => {
                setSupplierSearch(
                  event.target.value
                );

                setSupplierId("");

                setSelectedInventoryId("");
                setInventorySearch("");
                setReturnItems([]);
              }}
              placeholder="Type supplier name, phone or code..."
              className="border rounded-lg p-3 w-full mt-1"
            />

            {supplierSearch.trim() &&
              !supplierId && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">

                  {suppliers
                    .filter(
                      (supplier: any) => {
                        const search =
                          supplierSearch
                            .trim()
                            .toLowerCase();

                        return (
                          String(
                            supplier.companyName ||
                              ""
                          )
                            .toLowerCase()
                            .includes(
                              search
                            ) ||
                          String(
                            supplier.supplierCode ||
                              ""
                          )
                            .toLowerCase()
                            .includes(
                              search
                            ) ||
                          String(
                            supplier.phone ||
                              ""
                          )
                            .toLowerCase()
                            .includes(
                              search
                            ) ||
                          String(
                            supplier.contactPerson ||
                              ""
                          )
                            .toLowerCase()
                            .includes(
                              search
                            )
                        );
                      }
                    )
                    .slice(0, 50)
                    .map(
                      (
                        supplier: any
                      ) => (
                        <button
                          key={
                            supplier.id
                          }
                          type="button"
                          onMouseDown={(
                            event
                          ) => {
                            event.preventDefault();

                            setSupplierId(
                              supplier.id
                            );

                            setSupplierSearch(
                              supplier.companyName ||
                                ""
                            );

                            setSelectedInventoryId("");
                            setInventorySearch("");
                            setReturnItems([]);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                        >
                          <div className="font-semibold">
                            {
                              supplier.companyName
                            }
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
                      )
                    )}

                  {suppliers.filter(
                    (supplier: any) => {
                      const search =
                        supplierSearch
                          .trim()
                          .toLowerCase();

                      return (
                        String(
                          supplier.companyName ||
                            ""
                        )
                          .toLowerCase()
                          .includes(
                            search
                          ) ||
                        String(
                          supplier.supplierCode ||
                            ""
                        )
                          .toLowerCase()
                          .includes(
                            search
                          ) ||
                        String(
                          supplier.phone ||
                            ""
                        )
                          .toLowerCase()
                          .includes(
                            search
                          ) ||
                        String(
                          supplier.contactPerson ||
                            ""
                        )
                          .toLowerCase()
                          .includes(
                            search
                          )
                      );
                    }
                  ).length === 0 && (
                    <div className="px-4 py-3 text-gray-500">
                      No supplier found.
                    </div>
                  )}

                </div>
              )}

          </div>

          {!supplierSearch &&
            !supplierId && (
              <div className="text-xs text-gray-500 mt-1">
                Select supplier first
              </div>
            )}

        </div>

        {/* ITEM SELECTION */}

        {supplierId && (
          <div className="bg-gray-50 border rounded-xl p-6">

            <h3 className="text-lg font-bold mb-5">
              Select Item to Return
            </h3>

            {!supplierItems.length && (
              <div className="text-center py-6 text-gray-500">
                No available stock items found for this supplier.
              </div>
            )}

            {supplierItems.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-4">

                  <div className="col-span-2">

                    <label className="text-sm font-medium">
                      Inventory Item *
                    </label>

                    {useDirectSelect ? (
                      <select
                        value={
                          selectedInventoryId
                        }
                        onChange={(
                          event
                        ) =>
                          handleInventorySelect(
                            event.target.value
                          )
                        }
                        className="border rounded-lg p-3 w-full mt-1"
                      >
                        <option value="">
                          Select item
                        </option>

                        {supplierItems.map(
                          (
                            item: any
                          ) => (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.id
                              }
                            >
                              {item.itemName} -{" "}
                              {item.itemCode}{" "}
                              | Stock:{" "}
                              {Number(
                                item.quantity ||
                                  0
                              )}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <div className="relative">

                        <input
                          type="text"
                          value={
                            inventorySearch
                          }
                          onChange={(
                            event
                          ) => {
                            setInventorySearch(
                              event.target.value
                            );
                            setSelectedInventoryId(
                              ""
                            );
                          }}
                          placeholder="Type item name, code, brand or model..."
                          className="border rounded-lg p-3 w-full mt-1"
                        />

                        {inventorySearch.trim() &&
                          !selectedInventoryId && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">

                              {filteredSearchItems
                                .slice(
                                  0,
                                  50
                                )
                                .map(
                                  (
                                    item: any
                                  ) => (
                                    <button
                                      key={
                                        item.id
                                      }
                                      type="button"
                                      onMouseDown={(
                                        event
                                      ) => {
                                        event.preventDefault();

                                        handleInventorySelect(
                                          item.id
                                        );
                                      }}
                                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                                    >
                                      <div className="font-semibold">
                                        {
                                          item.itemName
                                        }
                                      </div>

                                      <div className="text-xs text-gray-500">
                                        Code:{" "}
                                        {item.itemCode ||
                                          "-"}

                                        {item.brand
                                          ? ` • Brand: ${item.brand}`
                                          : ""}

                                        {item.model
                                          ? ` • Model: ${item.model}`
                                          : ""}

                                        {` • Stock: ${
                                          Number(
                                            item.quantity ||
                                              0
                                          )
                                        }`}
                                      </div>
                                    </button>
                                  )
                                )}

                              {filteredSearchItems.length ===
                                0 && (
                                <div className="px-4 py-3 text-gray-500">
                                  No matching item found.
                                </div>
                              )}

                            </div>
                          )}

                      </div>
                    )}

                    {selectedInventoryId && (
                      <div className="text-xs text-gray-500 mt-1">
                        Available stock:{" "}
                        {Number(
                          supplierItems.find(
                            (item: any) =>
                              item.id ===
                              selectedInventoryId
                          )?.quantity || 0
                        )}
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
                      value={quantity}
                      onChange={(
                        event
                      ) =>
                        setQuantity(
                          Math.max(
                            1,
                            Number(
                              event.target.value
                            ) || 1
                          )
                        )
                      }
                      className="border rounded-lg p-3 w-full mt-1"
                    />

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    addReturnItem
                  }
                  className="mt-5 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                >
                  + Add Return Item
                </button>

                <div className="mt-3 text-xs text-gray-500">
                  {useDirectSelect
                    ? "Small item list: select the item directly."
                    : "Large item list: type the item name, code, brand or model to search."}
                </div>

              </>
            )}

          </div>
        )}

        {/* RETURN ITEMS */}

        <div className="mt-8">

          <h3 className="text-lg font-bold mb-4">
            Return Items
          </h3>

          <div className="overflow-x-auto">

            <table className="w-full border">

              <thead className="bg-gray-100">
                <tr>

                  <th className="border p-3 text-left">
                    Item
                  </th>

                  <th className="border p-3 text-center">
                    Available
                  </th>

                  <th className="border p-3 text-center">
                    Qty
                  </th>

                  <th className="border p-3 text-right">
                    Purchase Price
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

                {returnItems.map(
                  (
                    item: any,
                    index: number
                  ) => (
                    <tr
                      key={`${item.inventoryId}-${index}`}
                    >

                      <td className="border p-3">
                        <div className="font-semibold">
                          {
                            item.itemName
                          }
                        </div>

                        <div className="text-xs text-gray-500">
                          {
                            item.itemCode
                          }
                        </div>
                      </td>

                      <td className="border p-3 text-center">
                        {
                          item.availableStock
                        }
                      </td>

                      <td className="border p-3 text-center">

                        <input
                          type="number"
                          min={1}
                          max={
                            item.availableStock
                          }
                          value={
                            item.quantity
                          }
                          onChange={(
                            event
                          ) =>
                            updateReturnItemQuantity(
                              index,
                              Number(
                                event.target.value
                              )
                            )
                          }
                          className="border rounded px-2 py-1 w-20 text-center"
                        />

                      </td>

                      <td className="border p-3 text-right">
                        Rs.{" "}
                        {Number(
                          item.purchasePrice
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
                          type="button"
                          onClick={() =>
                            removeReturnItem(
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
                    Total Return Amount
                  </td>

                  <td className="border p-3 text-right font-bold">
                    Rs.{" "}
                    {totalAmount.toFixed(
                      2
                    )}
                  </td>

                  <td className="border p-3"></td>

                </tr>

              </tfoot>

            </table>

          </div>

          {!returnItems.length && (
            <div className="text-center py-6 text-gray-500">
              No return items added.
            </div>
          )}

        </div>

        {/* REFUND METHOD */}

        <div className="grid grid-cols-2 gap-5 mt-8">

          <div>

            <label className="text-sm font-medium">
              Refund Method
            </label>

            <select
              value={
                refundMethod
              }
              onChange={(event) =>
                setRefundMethod(
                  event.target.value
                )
              }
              className="border rounded-lg p-3 w-full mt-1"
            >
              <option value="SUPPLIER_CREDIT">
                Supplier Credit
              </option>

              <option value="CASH_REFUND">
                Cash Refund
              </option>
            </select>

          </div>

          <div>

            <label className="text-sm font-medium">
              Refund Amount
            </label>

            <input
              readOnly
              value={totalAmount.toFixed(
                2
              )}
              className="border rounded-lg p-3 w-full mt-1 bg-green-50 text-green-700 font-bold"
            />

          </div>

        </div>

        {/* REASON + NOTES */}

        <div className="grid grid-cols-2 gap-5 mt-5">

          <div>

            <label className="text-sm font-medium">
              Reason
            </label>

            <input
              type="text"
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              placeholder="Reason for return"
              className="border rounded-lg p-3 w-full mt-1"
            />

          </div>

          <div>

            <label className="text-sm font-medium">
              Notes
            </label>

            <input
              type="text"
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional notes"
              className="border rounded-lg p-3 w-full mt-1"
            />

          </div>

        </div>

        {/* ACTIONS */}

        <div className="flex gap-4 mt-8">

          <button
            type="button"
            onClick={
              handleCreateReturn
            }
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-lg font-semibold"
          >
            {saving
              ? "Saving..."
              : "Save Purchase Return"}
          </button>

        </div>

      </div>

      {/* RETURN HISTORY */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="text-xl font-bold">
            Purchase Return History
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-5 py-4 text-left">
                  Return No.
                </th>

                <th className="px-5 py-4 text-left">
                  Date
                </th>

                <th className="px-5 py-4 text-left">
                  Supplier
                </th>

                <th className="px-5 py-4 text-right">
                  Amount
                </th>

                <th className="px-5 py-4 text-left">
                  Refund Method
                </th>

              </tr>

            </thead>

            <tbody>

              {purchaseReturns.map(
                (
                  purchaseReturn: any
                ) => (
                  <tr
                    key={
                      purchaseReturn.id
                    }
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-5 py-4 font-semibold">
                      {
                        purchaseReturn.returnNumber
                      }
                    </td>

                    <td className="px-5 py-4">
                      {
                        purchaseReturn.returnDate
                          ? new Date(
                              purchaseReturn.returnDate
                            ).toLocaleDateString()
                          : "-"
                      }
                    </td>

                    <td className="px-5 py-4">
                      {
                        purchaseReturn
                          .supplier
                          ?.companyName ||
                        "-"
                      }
                    </td>

                    <td className="px-5 py-4 text-right font-bold">
                      Rs.{" "}
                      {Number(
                        purchaseReturn.totalAmount ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      {
                        purchaseReturn.refundMethod ===
                        "CASH_REFUND"
                          ? "Cash Refund"
                          : "Supplier Credit"
                      }
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {!purchaseReturns.length && (
          <div className="text-center py-10 text-gray-500">
            No purchase returns found.
          </div>
        )}

      </div>

    </div>
  );
}