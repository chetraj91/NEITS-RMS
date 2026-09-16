import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSales,
  getSalesReturns,
  createSalesReturn,
} from "../api/sale";

import { getInventory } from "../api/inventory";

import { getCustomers } from "../api/customer";

import {
  getPaymentMethods,
} from "../api/paymentMethod";

export default function SalesReturnPage() {
  // =====================================================
  // DATA
  // =====================================================

  const [sales, setSales] =
    useState<any[]>([]);

  const [inventory, setInventory] =
    useState<any[]>([]);

  const [customers, setCustomers] =
    useState<any[]>([]);

  const [salesReturns, setSalesReturns] =
    useState<any[]>([]);

 const [, setPaymentMethods] =
  useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // RETURN INFORMATION
  // =====================================================

  const [saleId, setSaleId] =
    useState("");

  const [saleSearch, setSaleSearch] =
    useState("");

  const [customerId, setCustomerId] =
    useState("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [refundMethod, setRefundMethod] =
    useState("CUSTOMER_CREDIT");

  // =====================================================
  // ITEM
  // =====================================================

  const [
    selectedInventoryId,
    setSelectedInventoryId,
  ] = useState("");

  const [
    inventorySearch,
    setInventorySearch,
  ] = useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [sellingPrice, setSellingPrice] =
    useState(0);

  const [returnItems, setReturnItems] =
    useState<any[]>([]);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadAll();
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

  async function loadAll() {
    try {
      setLoading(true);

      const [
        salesResponse,
        inventoryResponse,
        customerResponse,
        returnsResponse,
      ] = await Promise.all([
        getSales(),
        getInventory(),
        getCustomers(),
        getSalesReturns(),
      ]);

      const salesData =
        salesResponse?.data ?? [];

      const inventoryData =
        inventoryResponse?.data?.data ??
        inventoryResponse?.data ??
        [];

      const customerData =
        customerResponse?.data ?? [];

      const returnsData =
        returnsResponse?.data ?? [];

      setSales(
        Array.isArray(salesData)
          ? salesData
          : []
      );

      setInventory(
        Array.isArray(inventoryData)
          ? inventoryData
          : []
      );

      setCustomers(
        Array.isArray(customerData)
          ? customerData
          : []
      );

      setSalesReturns(
        Array.isArray(returnsData)
          ? returnsData
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load sales return data:",
        error
      );

      alert(
        "Unable to load sales return data."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SELECT ORIGINAL SALE
  // =====================================================

function handleSaleSelect(
  sale: any
) {
  setSaleId(sale.id);

  setSaleSearch(
    `${sale.invoiceNumber} - ${
      sale.customer?.fullName ||
      "Walk-in Customer"
    }`
  );

  if (sale.customerId) {
    setCustomerId(
      sale.customerId
    );

    setCustomerSearch(
      sale.customer?.fullName ||
      ""
    );
  }

  // =====================================================
  // LOAD ALL ITEMS FROM ORIGINAL BILL
  // =====================================================

  const saleItems =
    Array.isArray(sale.items)
      ? sale.items
      : [];

  const billReturnItems =
    saleItems
      .map((saleItem: any) => {
        const inventoryItem =
          inventory.find(
            (item: any) =>
              item.id ===
              saleItem.inventoryId
          );

        const availableQuantity =
          getAvailableReturnQuantityForSale(
            sale,
            saleItem.inventoryId
          );

        if (availableQuantity <= 0) {
          return null;
        }

        const returnPrice =
          Number(
            saleItem.sellingPrice ?? 0
          );

        const returnQuantity =
          availableQuantity;

        return {
          inventoryId:
            saleItem.inventoryId,

          itemName:
            inventoryItem?.itemName ||
            saleItem.inventory?.itemName ||
            "Unknown Item",

          itemCode:
            inventoryItem?.itemCode ||
            saleItem.inventory?.itemCode ||
            "",

          quantity:
            returnQuantity,

          sellingPrice:
            returnPrice,

          total:
            returnQuantity *
            returnPrice,
        };
      })
      .filter(Boolean);

  setReturnItems(
    billReturnItems
  );

  // Clear manual item selection
  // because bill items are already loaded.
  setSelectedInventoryId("");
  setInventorySearch("");
  setQuantity(1);
  setSellingPrice(0);
}
  function clearOriginalSale() {
    setSaleId("");
    setSaleSearch("");
    setReturnItems([]);
    setSelectedInventoryId("");
    setInventorySearch("");
    setQuantity(1);
    setSellingPrice(0);
  }

  // =====================================================
  // SELECT CUSTOMER
  // =====================================================

  function handleCustomerSelect(
    customer: any
  ) {
    setCustomerId(
      customer.id
    );

    setCustomerSearch(
      customer.fullName || ""
    );
  }

  // =====================================================
  // SELECT INVENTORY
  // =====================================================

  function handleInventoryChange(
    inventoryId: string
  ) {
    setSelectedInventoryId(
      inventoryId
    );

    const item =
      inventory.find(
        (inventoryItem: any) =>
          inventoryItem.id ===
          inventoryId
      );

    if (item) {
      setSellingPrice(
        Number(
          item.sellingPrice ?? 0
        )
      );
    } else {
      setSellingPrice(0);
    }
  }

  // =====================================================
  // AVAILABLE QUANTITY FROM ORIGINAL SALE
  // =====================================================

  function getAvailableReturnQuantityForSale(
  sale: any,
  inventoryId: string
) {
  const saleItem =
    sale.items?.find(
      (item: any) =>
        item.inventoryId ===
        inventoryId
    );

  if (!saleItem) {
    return 0;
  }

  const alreadyReturned =
    salesReturns.reduce(
      (
        total: number,
        salesReturn: any
      ) => {
        if (
          salesReturn.saleId !==
          sale.id
        ) {
          return total;
        }

        return (
          total +
          (
            salesReturn.items || []
          )
            .filter(
              (returnItem: any) =>
                returnItem.inventoryId ===
                inventoryId
            )
            .reduce(
              (
                itemTotal: number,
                returnItem: any
              ) =>
                itemTotal +
                Number(
                  returnItem.quantity || 0
                ),
              0
            )
        );
      },
      0
    );

  return Math.max(
    0,
    Number(
      saleItem.quantity || 0
    ) -
      alreadyReturned
  );
}

  function getAvailableReturnQuantity(
    inventoryId: string
  ) {
    if (!saleId) {
      return null;
    }

    const selectedSale =
      sales.find(
        (sale: any) =>
          sale.id === saleId
      );

    if (!selectedSale) {
      return null;
    }

    const saleItem =
      selectedSale.items?.find(
        (item: any) =>
          item.inventoryId ===
          inventoryId
      );

    if (!saleItem) {
      return 0;
    }

    const alreadyReturned =
      salesReturns.reduce(
        (
          total: number,
          salesReturn: any
        ) => {
          if (
            salesReturn.saleId !==
            saleId
          ) {
            return total;
          }

          return (
            total +
            (
              salesReturn.items || []
            )
              .filter(
                (returnItem: any) =>
                  returnItem.inventoryId ===
                  inventoryId
              )
              .reduce(
                (
                  itemTotal: number,
                  returnItem: any
                ) =>
                  itemTotal +
                  Number(
                    returnItem.quantity ||
                      0
                  ),
                0
              )
          );
        },
        0
      );

    return Math.max(
      0,
      Number(
        saleItem.quantity || 0
      ) - alreadyReturned
    );
  }

  // =====================================================
  // ADD RETURN ITEM
  // =====================================================

  function addReturnItem() {
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

    const inventoryItem =
      inventory.find(
        (item: any) =>
          item.id ===
          selectedInventoryId
      );

    if (!inventoryItem) {
      alert(
        "Inventory item not found."
      );
      return;
    }

    const available =
      getAvailableReturnQuantity(
        selectedInventoryId
      );

    if (
      saleId &&
      available !== null &&
      quantity > available
    ) {
      alert(
        `Return quantity cannot exceed the available quantity. Available: ${available}.`
      );
      return;
    }

    const total =
      Number(quantity) *
      Number(sellingPrice);

    setReturnItems(
      (previous) => [
        ...previous,
        {
          inventoryId:
            selectedInventoryId,

          itemName:
            inventoryItem.itemName,

          itemCode:
            inventoryItem.itemCode,

          quantity:
            Number(quantity),

          sellingPrice:
            Number(sellingPrice),

          total,
        },
      ]
    );

    setSelectedInventoryId("");
    setInventorySearch("");
    setQuantity(1);
    setSellingPrice(0);
  }

    // =====================================================
// UPDATE RETURN ITEM QUANTITY
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

 const available =
  getAvailableReturnQuantity(
    item.inventoryId
  );

const maxQuantity =
  available === null
    ? Number.MAX_SAFE_INTEGER
    : available;

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
        (returnItem, itemIndex) => {
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
                returnItem.sellingPrice || 0
              ),
          };
        }
      )
  );
}

  // =====================================================
  // REMOVE RETURN ITEM
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
  // SAVE SALES RETURN
  // =====================================================

  async function handleCreateReturn() {
    if (
      returnItems.length === 0
    ) {
      alert(
        "Please add at least one return item."
      );
      return;
    }

    if (
      refundMethod ===
        "CASH_REFUND" &&
      totalAmount <= 0
    ) {
      alert(
        "Cash refund amount must be greater than zero."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        saleId:
          saleId || null,

        customerId:
          customerId || null,

        totalAmount:
          Number(totalAmount),

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

              sellingPrice:
                Number(
                  item.sellingPrice
                ),

              total:
                Number(
                  item.total
                ),
            })
          ),
      };

      const response =
        await createSalesReturn(
          payload
        );

      alert(
        response?.message ||
          "Sales return created successfully."
      );

      // Reset
      setSaleId("");
      setSaleSearch("");
      setCustomerId("");
      setCustomerSearch("");
      setReason("");
      setNotes("");
      setRefundMethod(
        "CUSTOMER_CREDIT"
      );

      setSelectedInventoryId("");
      setInventorySearch("");
      setQuantity(1);
      setSellingPrice(0);
      setReturnItems([]);

      await loadAll();
    } catch (error: any) {
      console.error(
        "Create sales return error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to create sales return."
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
        <div className="text-center py-12 text-gray-500">
          Loading Sales Returns...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Sales Return
          </h1>

          <p className="text-gray-500 mt-1">
            Manage returned sales and restore inventory
          </p>
        </div>

      </div>

      {/* =================================================
          RETURN FORM
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-8 mb-8">

        <h2 className="text-xl font-bold mb-6">
          New Sales Return
        </h2>

        {/* =================================================
            ORIGINAL BILL + CUSTOMER
        ================================================= */}

        <div className="grid grid-cols-2 gap-5 mb-8">

          {/* ORIGINAL BILL */}

          <div className="relative">

            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                Original Bill
              </label>

              {saleId && (
                <button
                  type="button"
                  onClick={
                    clearOriginalSale
                  }
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear Bill
                </button>
              )}
            </div>

            <input
              type="text"
              value={saleSearch}
              onChange={(event) => {
                setSaleSearch(
                  event.target.value
                );
                setSaleId("");
              }}
              placeholder="Optional: search invoice number or customer..."
              className="border rounded-lg p-3 w-full mt-1"
            />

            {saleSearch.trim() &&
              !saleId && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">

                  {sales
                    .filter(
                      (sale: any) => {
                        const search =
                          saleSearch
                            .trim()
                            .toLowerCase();

                        return (
                          String(
                            sale.invoiceNumber ||
                              ""
                          )
                            .toLowerCase()
                            .includes(
                              search
                            ) ||
                          String(
                            sale.customer
                              ?.fullName ||
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
                        sale: any
                      ) => (
                        <button
                          key={sale.id}
                          type="button"
                          onMouseDown={(
                            event
                          ) => {
                            event.preventDefault();

                            handleSaleSelect(
                              sale
                            );
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                        >
                          <div className="font-semibold">
                            {
                              sale.invoiceNumber
                            }
                          </div>

                          <div className="text-xs text-gray-500">
                            {
                              sale.customer
                                ?.fullName ||
                              "Walk-in Customer"
                            }
                            {" • "}
                            Rs.{" "}
                            {Number(
                              sale.grandTotal ||
                                0
                            ).toFixed(2)}
                          </div>
                        </button>
                      )
                    )}

                  {sales.filter(
                    (sale: any) => {
                      const search =
                        saleSearch
                          .trim()
                          .toLowerCase();

                      return (
                        String(
                          sale.invoiceNumber ||
                            ""
                        )
                          .toLowerCase()
                          .includes(
                            search
                          ) ||
                        String(
                          sale.customer
                            ?.fullName ||
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
                      No sale found.
                    </div>
                  )}

                </div>
              )}

            {!saleSearch &&
              !saleId && (
                <div className="text-xs text-gray-500 mt-1">
                  Leave blank for a return without an original bill.
                </div>
              )}

          </div>

          {/* CUSTOMER */}

          <div className="relative">

            <label className="text-sm font-medium">
              Customer
            </label>

            <input
              type="text"
              value={
                customerSearch ||
                customers.find(
                  (customer: any) =>
                    customer.id ===
                    customerId
                )?.fullName ||
                ""
              }
              onChange={(event) => {
                setCustomerSearch(
                  event.target.value
                );

                setCustomerId("");
              }}
              placeholder="Type customer name or phone..."
              className="border rounded-lg p-3 w-full mt-1"
            />

            {customerSearch.trim() &&
              !customerId && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">

                  {customers
                    .filter(
                      (customer: any) => {
                        const search =
                          customerSearch
                            .trim()
                            .toLowerCase();

                        return (
                          String(
                            customer.fullName ||
                              ""
                          )
                            .toLowerCase()
                            .includes(
                              search
                            ) ||
                          String(
                            customer.phone ||
                              ""
                          )
                            .toLowerCase()
                            .includes(
                              search
                            ) ||
                          String(
                            customer.contactNumber ||
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
                        customer: any
                      ) => (
                        <button
                          key={
                            customer.id
                          }
                          type="button"
                          onMouseDown={(
                            event
                          ) => {
                            event.preventDefault();

                            handleCustomerSelect(
                              customer
                            );
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                        >
                          <div className="font-semibold">
                            {
                              customer.fullName
                            }
                          </div>

                          <div className="text-xs text-gray-500">
                            {customer.phone ||
                              customer.contactNumber
                              ? `Phone: ${
                                  customer.phone ||
                                  customer.contactNumber
                                }`
                              : ""}
                          </div>
                        </button>
                      )
                    )}

                </div>
              )}

          </div>

        </div>

        {/* =================================================
            ADD ITEM
        ================================================= */}

        <div className="bg-gray-50 border rounded-xl p-6">

          <h3 className="text-lg font-bold mb-4">
            Add Return Item
          </h3>

          <div className="grid grid-cols-4 gap-4">

            {/* INVENTORY */}

            <div className="col-span-2 relative">

              <label className="text-sm font-medium">
                Inventory Item
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
                onChange={(event) => {
                  setInventorySearch(
                    event.target.value
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
                      .filter(
                        (item: any) => {
                          const search =
                            inventorySearch
                              .trim()
                              .toLowerCase();

                          return (
                            String(
                              item.itemName ||
                                ""
                            )
                              .toLowerCase()
                              .includes(
                                search
                              ) ||
                            String(
                              item.itemCode ||
                                ""
                            )
                              .toLowerCase()
                              .includes(
                                search
                              ) ||
                            String(
                              item.brand ||
                                ""
                            )
                              .toLowerCase()
                              .includes(
                                search
                              ) ||
                            String(
                              item.model ||
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
                          item: any
                        ) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={(
                              event
                            ) => {
                              event.preventDefault();

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

                  </div>
                )}

            </div>

            {/* QUANTITY */}

            <div>

              <label className="text-sm font-medium">
                Quantity
              </label>

              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) =>
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

              {saleId &&
                selectedInventoryId && (
                  <div className="text-xs text-gray-500 mt-1">
                    Available to return:{" "}
                    {getAvailableReturnQuantity(
                      selectedInventoryId
                    )}
                  </div>
                )}

            </div>

            {/* RETURN PRICE */}

            <div>

              <label className="text-sm font-medium">
                Return Price
              </label>

              <input
                type="number"
                min={0}
                value={sellingPrice}
                onChange={(event) =>
                  setSellingPrice(
                    Math.max(
                      0,
                      Number(
                        event.target.value
                      ) || 0
                    )
                  )
                }
                className="border rounded-lg p-3 w-full mt-1"
              />

            </div>

          </div>

          <div className="mt-4">

            <button
              type="button"
              onClick={
                addReturnItem
              }
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              + Add Return Item
            </button>

          </div>

        </div>

        {/* =================================================
            RETURN ITEMS
        ================================================= */}

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
                    Qty
                  </th>

                  <th className="border p-3 text-right">
                    Return Price
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
                        {item.itemName}
                        {item.itemCode
                          ? ` (${item.itemCode})`
                          : ""}
                      </td>

                      <td className="border p-3 text-center">
  <input
    type="number"
    min={1}
   max={
  saleId
    ? (
        getAvailableReturnQuantity(
          item.inventoryId
        ) ?? undefined
      )
    : undefined
}
    value={item.quantity}
    onChange={(event) =>
      updateReturnItemQuantity(
        index,
        Number(event.target.value)
      )
    }
    className="border rounded px-2 py-1 w-20 text-center"
  />
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
                    colSpan={3}
                    className="border p-3 text-right font-semibold"
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

        {/* =================================================
            REFUND
        ================================================= */}

        <div className="grid grid-cols-2 gap-5 mt-8">

          <div>

            <label className="text-sm font-medium">
              Refund Method
            </label>

            <select
              value={refundMethod}
              onChange={(event) =>
                setRefundMethod(
                  event.target.value
                )
              }
              className="border rounded-lg p-3 w-full mt-1"
            >

              <option value="CUSTOMER_CREDIT">
                Customer Credit
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

        {/* =================================================
            REASON + NOTES
        ================================================= */}

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

        {/* =================================================
            ACTIONS
        ================================================= */}

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
              : "Save Sales Return"}
          </button>

        </div>

      </div>

      {/* =================================================
          RETURN HISTORY
      ================================================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="text-xl font-bold">
            Sales Return History
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
                  Original Bill
                </th>

                <th className="px-5 py-4 text-left">
                  Customer
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

              {salesReturns.map(
                (
                  salesReturn: any
                ) => (
                  <tr
                    key={
                      salesReturn.id
                    }
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-5 py-4 font-semibold">
                      {
                        salesReturn.returnNumber
                      }
                    </td>

                    <td className="px-5 py-4">
                      {
                        salesReturn.returnDate
                          ? new Date(
                              salesReturn.returnDate
                            ).toLocaleDateString()
                          : "-"
                      }
                    </td>

                    <td className="px-5 py-4">
                      {
                        salesReturn.sale
                          ?.invoiceNumber ||
                        "-"
                      }
                    </td>

                    <td className="px-5 py-4">
                      {
                        salesReturn.customer
                          ?.fullName ||
                        "Walk-in Customer"
                      }
                    </td>

                    <td className="px-5 py-4 text-right font-bold">
                      Rs.{" "}
                      {Number(
                        salesReturn.totalAmount ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      {
                        salesReturn.refundMethod ===
                        "CASH_REFUND"
                          ? "Cash Refund"
                          : "Customer Credit"
                      }
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {!salesReturns.length && (
          <div className="text-center py-10 text-gray-500">
            No sales returns found.
          </div>
        )}

      </div>

    </div>
  );
}