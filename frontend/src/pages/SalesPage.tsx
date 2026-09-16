import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getSales,
  createSale,
  receiveSalePayment,
} from "../api/sale";

import { getInventory } from "../api/inventory";

import { getCustomers } from "../api/customer";

import {
  getPaymentMethods,
} from "../api/paymentMethod";

export default function SalesPage() {
  const navigate = useNavigate();

  // =====================================================
  // DATA
  // =====================================================

  const [sales, setSales] =
    useState<any[]>([]);

  const [inventory, setInventory] =
    useState<any[]>([]);

  const [customers, setCustomers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showNewSale, setShowNewSale] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // NEW SALE
  // =====================================================

 const [customerId, setCustomerId] =
  useState("");

const [customerSearch, setCustomerSearch] =
  useState("");

const [
  selectedInventoryId,
  setSelectedInventoryId,
] = useState("");

const [inventorySearch, setInventorySearch] =
  useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [sellingPrice, setSellingPrice] =
    useState(0);

  const [discount, setDiscount] =
    useState(0);

  const [saleItems, setSaleItems] =
    useState<any[]>([]);

  // =====================================================
  // PAYMENT
  // =====================================================

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

    const [
  paymentMethods,
  setPaymentMethods,
] = useState<any[]>([]);

  const [paidAmount, setPaidAmount] =
    useState(0);

  // =====================================================
  // RECEIVE PAYMENT
  // =====================================================

  const [
    showReceivePayment,
    setShowReceivePayment,
  ] = useState(false);

  const [
    selectedSale,
    setSelectedSale,
  ] = useState<any | null>(null);

  const [
    receiveAmount,
    setReceiveAmount,
  ] = useState(0);

  const [
    receiveMethod,
    setReceiveMethod,
  ] = useState("CASH");

  const [
    receiveRemarks,
    setReceiveRemarks,
  ] = useState("");

  const [
    receivingPayment,
    setReceivingPayment,
  ] = useState(false);

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
if (
  methods.length > 0 &&
  !methods.some(
   (method: any) =>
      method.code ===
      paymentMethod
  )
) {
  setPaymentMethod(
    methods[0].code
  );
}

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
      ] = await Promise.all([
        getSales(),
        getInventory(),
        getCustomers(),
      ]);

      const salesData =
        salesResponse?.data ??
        [];

      const inventoryData =
        inventoryResponse?.data?.data ??
        inventoryResponse?.data ??
        [];

      const customerData =
        customerResponse?.data ??
        [];

      setSales(
        Array.isArray(
          salesData
        )
          ? salesData
          : []
      );

      setInventory(
        Array.isArray(
          inventoryData
        )
          ? inventoryData
          : []
      );

      setCustomers(
        Array.isArray(
          customerData
        )
          ? customerData
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load sales data:",
        err
      );

      alert(
        "Unable to load sales data."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SELECT INVENTORY
  // =====================================================

  function handleInventoryChange(
    value: string
  ) {
    setSelectedInventoryId(
      value
    );

    const item =
      inventory.find(
        (inventoryItem: any) =>
          inventoryItem.id ===
          value
      );

    if (item) {
      setSellingPrice(
        Number(
          item.sellingPrice ??
            0
        )
      );
    } else {
      setSellingPrice(0);
    }
  }

  // =====================================================
  // ADD ITEM
  // =====================================================

  function addItem() {
    if (
      !selectedInventoryId
    ) {
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

    const total =
      Number(quantity) *
      Number(sellingPrice);

    setSaleItems((prev) => [
      ...prev,
      {
        inventoryId:
          selectedInventoryId,

        itemName:
          inventoryItem.itemName,

        quantity:
          Number(quantity),

        sellingPrice:
          Number(sellingPrice),

        total,
      },
    ]);

    setSelectedInventoryId("");
    setInventorySearch("");
    setQuantity(1);
    setSellingPrice(0);
  }

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  function removeItem(
    index: number
  ) {
    setSaleItems((prev) =>
      prev.filter(
        (_item, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  // =====================================================
  // TOTALS
  // =====================================================

  const totalAmount =
    useMemo(() => {
      return saleItems.reduce(
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
    }, [saleItems]);

  const grandTotal =
    Math.max(
      0,
      totalAmount -
        Number(discount || 0)
    );

  const newSaleDueAmount =
    Math.max(
      0,
      grandTotal -
        Number(paidAmount || 0)
    );

  // =====================================================
  // CREATE SALE
  // =====================================================

  async function handleCreateSale() {
    if (
      saleItems.length === 0
    ) {
      alert(
        "Please add at least one item."
      );
      return;
    }

    const safePaidAmount =
      Math.max(
        0,
        Math.min(
          Number(
            paidAmount || 0
          ),
          grandTotal
        )
      );

    if (
      Number(
        paidAmount || 0
      ) >
      grandTotal
    ) {
      alert(
        "Paid amount cannot be greater than the grand total."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        customerId:
          customerId || null,

        totalAmount:
          Number(totalAmount),

        discount:
          Number(
            discount || 0
          ),

        grandTotal:
          Number(grandTotal),

        paymentMethod:
          paymentMethod,

        paidAmount:
          safePaidAmount,

        dueAmount:
          Math.max(
            0,
            grandTotal -
              safePaidAmount
          ),

        items:
          saleItems.map(
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
        await createSale(
          payload
        );

      alert(
        response?.message ||
          "Sale created successfully."
      );

      // Reset
     setCustomerId("");
setCustomerSearch("");
setSelectedInventoryId("");
setInventorySearch("");
setQuantity(1);
      setSellingPrice(0);
      setDiscount(0);
      setSaleItems([]);

      setPaymentMethod(
        "CASH"
      );

      setPaidAmount(0);

      setShowNewSale(false);

      await loadAll();
    } catch (err: any) {
      console.error(
        "Create sale error:",
        err
      );

      alert(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Unable to create sale."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // OPEN NEW SALE
  // =====================================================

  function openNewSale() {
  setCustomerId("");
setCustomerSearch("");
setSelectedInventoryId("");
setInventorySearch("");
setQuantity(1);
    setSellingPrice(0);
    setDiscount(0);
    setSaleItems([]);

    setPaymentMethod(
      "CASH"
    );

    setPaidAmount(0);

    setShowNewSale(true);
  }

  function closeNewSale() {
    setShowNewSale(false);
  }

  // =====================================================
  // OPEN RECEIVE PAYMENT
  // =====================================================

  function closeReceivePayment() {
    if (
      receivingPayment
    ) {
      return;
    }

    setShowReceivePayment(
      false
    );

    setSelectedSale(
      null
    );

    setReceiveAmount(0);

    setReceiveMethod(
      "CASH"
    );

    setReceiveRemarks("");
  }

  // =====================================================
  // RECEIVE PAYMENT
  // =====================================================

  async function handleReceivePayment() {
    if (
      !selectedSale
    ) {
      return;
    }

    const currentDue =
      Math.max(
        0,
        Number(
          selectedSale.dueAmount ??
            (
              Number(
                selectedSale.grandTotal ||
                  0
              ) -
              Number(
                selectedSale.paidAmount ||
                  0
              )
            )
        )
      );

    const amount =
      Number(
        receiveAmount || 0
      );

    if (amount <= 0) {
      alert(
        "Payment amount must be greater than zero."
      );
      return;
    }

    if (
      amount >
      currentDue
    ) {
      alert(
        `Payment cannot exceed the outstanding amount of Rs. ${currentDue.toFixed(
          2
        )}.`
      );
      return;
    }

    try {
      setReceivingPayment(
        true
      );

      const response =
        await receiveSalePayment(
          selectedSale.id,
          {
            amount,
            method:
              receiveMethod,
            remarks:
              receiveRemarks.trim() ||
              undefined,
          }
        );

      alert(
        response?.message ||
          "Payment received successfully."
      );

      closeReceivePayment();

      await loadAll();
    } catch (err: any) {
      console.error(
        "Receive sale payment error:",
        err
      );

      alert(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Unable to receive payment."
      );
    } finally {
      setReceivingPayment(
        false
      );
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">
          Loading Sales...
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
            Sales
          </h1>

          <p className="text-gray-500 mt-1">
            Manage product sales and customer payments
          </p>
        </div>

        <button
          onClick={
            openNewSale
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + New Sale
        </button>

      </div>

      {/* =================================================
          SALES LIST
      ================================================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-5 py-4 text-left">
                  Invoice
                </th>

                <th className="px-5 py-4 text-left">
                  Date
                </th>

                <th className="px-5 py-4 text-left">
                  Customer
                </th>

                <th className="px-5 py-4 text-right">
                  Total
                </th>

                <th className="px-5 py-4 text-right">
                  Discount
                </th>

                <th className="px-5 py-4 text-right">
                  Grand Total
                </th>

                <th className="px-5 py-4 text-right">
                  Paid
                </th>

                <th className="px-5 py-4 text-right">
                  Due
                </th>

                <th className="px-5 py-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {sales.map(
                (sale: any) => {

                  const saleGrandTotal =
                    Number(
                      sale.grandTotal ||
                        0
                    );

                  const salePaid =
                    Number(
                      sale.paidAmount ||
                        0
                    );

                  const saleDue =
                    Math.max(
                      0,
                      Number(
                        sale.dueAmount ??
                          (
                            saleGrandTotal -
                            salePaid
                          )
                      )
                    );

                  return (
                    <tr
                      key={
                        sale.id
                      }
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="px-5 py-4 font-semibold">
                        {
                          sale.invoiceNumber
                        }
                      </td>

                      <td className="px-5 py-4">
                        {
                          sale.saleDate
                            ? new Date(
                                sale.saleDate
                              ).toLocaleDateString()
                            : "-"
                        }
                      </td>

                      <td className="px-5 py-4">
                        {
                          sale.customer
                            ?.fullName ||
                          "Walk-in Customer"
                        }
                      </td>

                      <td className="px-5 py-4 text-right">
                        Rs.{" "}
                        {Number(
                          sale.totalAmount ||
                            0
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        Rs.{" "}
                        {Number(
                          sale.discount ||
                            0
                        ).toFixed(
                          2
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-bold">
                        Rs.{" "}
                        {saleGrandTotal.toFixed(
                          2
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-green-700 font-semibold">
                        Rs.{" "}
                        {salePaid.toFixed(
                          2
                        )}
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-semibold ${
                          saleDue > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        Rs.{" "}
                        {saleDue.toFixed(
                          2
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">

                        <button
                          onClick={() =>
                            navigate(
                              `/invoice/sale/${sale.id}`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                        >
                          View
                        </button>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

        {!sales.length && (
          <div className="text-center py-10 text-gray-500">
            No sales found.
          </div>
        )}

      </div>

      {/* =================================================
          NEW SALE MODAL
      ================================================= */}

      {showNewSale && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8">

            <div className="flex justify-between items-center mb-8">

              <div>
                <h2 className="text-2xl font-bold">
                  New Sale
                </h2>

                <p className="text-gray-500 mt-1">
                  Create a new product sale
                </p>
              </div>

              <button
                onClick={
                  closeNewSale
                }
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>

            </div>

            {/* =========================================
                CUSTOMER
            ========================================= */}

            <div className="grid grid-cols-2 gap-5 mb-8">

              <div>

                <label className="text-sm font-medium">
                  Customer
                </label>

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
          customer.id === customerId
      )?.fullName ||
      ""
    }
    onChange={(e) => {
      setCustomerSearch(e.target.value);
      setCustomerId("");
    }}
    placeholder="Type customer name or phone..."
    className="border rounded-lg p-3 w-full mt-1"
  />

  {customerSearch.trim() && !customerId && (
    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {customers
        .filter((customer: any) => {
          const search =
            customerSearch
              .trim()
              .toLowerCase();

          return (
            String(
              customer.fullName || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              customer.phone || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              customer.contactNumber || ""
            )
              .toLowerCase()
              .includes(search)
          );
        })
        .slice(0, 50)
        .map((customer: any) => (
          <button
            key={customer.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();

              setCustomerId(
                customer.id
              );

              setCustomerSearch(
                customer.fullName || ""
              );
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
          >
            <div className="font-semibold">
              {customer.fullName}
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
        ))}

      {customers.filter((customer: any) => {
        const search =
          customerSearch
            .trim()
            .toLowerCase();

        return (
          String(
            customer.fullName || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            customer.phone || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            customer.contactNumber || ""
          )
            .toLowerCase()
            .includes(search)
        );
      }).length === 0 && (
        <div className="px-4 py-3 text-gray-500">
          No customer found.
        </div>
      )}
    </div>
  )}

  {!customerSearch && !customerId && (
    <div className="text-xs text-gray-500 mt-1">
      Type to search customer
    </div>
  )}
</div>

              </div>

            </div>

            {/* =========================================
    ADD ITEM
========================================= */}

<div className="bg-gray-50 border rounded-xl p-6">

  <h3 className="text-lg font-bold mb-4">
    Add Item
  </h3>

  <div className="grid grid-cols-4 gap-4">

    {/* INVENTORY ITEM */}
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
              item.id === selectedInventoryId
          )?.itemName ||
          ""
        }
        onChange={(e) => {
          setInventorySearch(e.target.value);
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

                    {` • Stock: ${
                      Number(
                        item.quantity || 0
                      )
                    }`}
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

    {/* SELLING PRICE */}
    <div>

      <label className="text-sm font-medium">
        Selling Price
      </label>

      <input
        type="number"
        min={0}
        value={sellingPrice}
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

  <div className="mt-4">
    <button
      type="button"
      onClick={addItem}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
    >
      + Add Item
    </button>
  </div>

</div>

            {/* =========================================
                ITEMS
            ========================================= */}

            <div className="mt-8">

              <h3 className="text-lg font-bold mb-4">
                Sale Items
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

                    {saleItems.map(
                      (
                        item: any,
                        index: number
                      ) => (
                        <tr
                          key={`${item.inventoryId}-${index}`}
                        >

                          <td className="border p-3">
                            {
                              item.itemName
                            }
                          </td>

                          <td className="border p-3 text-center">
                            {
                              item.quantity
                            }
                          </td>

                          <td className="border p-3 text-right">
                            Rs.{" "}
                            {Number(
                              item.sellingPrice
                            ).toFixed(
                              2
                            )}
                          </td>

                          <td className="border p-3 text-right font-semibold">
                            Rs.{" "}
                            {Number(
                              item.total
                            ).toFixed(
                              2
                            )}
                          </td>

                          <td className="border p-3 text-center">

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
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
                        Total Amount
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

            </div>

            {/* =========================================
                DISCOUNT + PAYMENT
            ========================================= */}

            <div className="grid grid-cols-2 gap-5 mt-8">

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
                  Grand Total
                </label>

                <input
                  readOnly
                  value={grandTotal.toFixed(
                    2
                  )}
                  className="border rounded-lg p-3 w-full mt-1 bg-green-50 text-green-700 font-bold"
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Payment Method
                </label>

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="border rounded-lg p-3 w-full mt-1"
                >

                     {paymentMethods.map(
          (method) => (
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

              <div>

                <label className="text-sm font-medium">
                  Paid Amount
                </label>

                <input
                  type="number"
                  min={0}
                  max={grandTotal}
                  value={
                    paidAmount
                  }
                  onChange={(e) =>
                    setPaidAmount(
                      Math.max(
                        0,
                        Math.min(
                          Number(
                            e.target.value
                          ) || 0,
                          grandTotal
                        )
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
                  value={newSaleDueAmount.toFixed(
                    2
                  )}
                  className={`border rounded-lg p-3 w-full mt-1 font-bold ${
                    newSaleDueAmount >
                    0
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-700"
                  }`}
                />

              </div>

            </div>

            {/* =========================================
                ACTIONS
            ========================================= */}

            <div className="flex gap-4 mt-8">

              <button
                type="button"
                onClick={
                  handleCreateSale
                }
                disabled={
                  saving
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-lg font-semibold"
              >
                {saving
                  ? "Saving..."
                  : "Save Sale"}
              </button>

              <button
                type="button"
                onClick={
                  closeNewSale
                }
                className="bg-gray-400 hover:bg-gray-500 text-white px-7 py-3 rounded-lg"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          RECEIVE PAYMENT MODAL
      ================================================= */}

      {showReceivePayment &&
        selectedSale && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7">

              <div className="flex justify-between items-center mb-6">

                <div>

                  <h2 className="text-2xl font-bold">
                    Receive Payment
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {
                      selectedSale.invoiceNumber
                    }
                    {" "}
                    •{" "}
                    {
                      selectedSale.customer
                        ?.fullName ||
                      "Walk-in Customer"
                    }
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeReceivePayment
                  }
                  disabled={
                    receivingPayment
                  }
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  ×
                </button>

              </div>

              {(() => {
                const currentDue =
                  Math.max(
                    0,
                    Number(
                      selectedSale.dueAmount ??
                        (
                          Number(
                            selectedSale.grandTotal ||
                              0
                          ) -
                          Number(
                            selectedSale.paidAmount ||
                              0
                          )
                        )
                    )
                  );

                return (
                  <>

                    <div className="grid grid-cols-2 gap-4 mb-6">

                      <div className="bg-gray-100 rounded-lg p-4">

                        <p className="text-sm text-gray-500">
                          Grand Total
                        </p>

                        <p className="text-xl font-bold">
                          Rs.{" "}
                          {Number(
                            selectedSale.grandTotal ||
                              0
                          ).toFixed(
                            2
                          )}
                        </p>

                      </div>

                      <div className="bg-red-50 rounded-lg p-4">

                        <p className="text-sm text-red-600">
                          Outstanding
                        </p>

                        <p className="text-xl font-bold text-red-600">
                          Rs.{" "}
                          {currentDue.toFixed(
                            2
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="mb-5">

                      <label className="text-sm font-medium">
                        Payment Amount
                      </label>

                      <input
                        type="number"
                        min={0}
                        max={
                          currentDue
                        }
                        value={
                          receiveAmount
                        }
                        onChange={(e) =>
                          setReceiveAmount(
                            Math.max(
                              0,
                              Math.min(
                                Number(
                                  e.target.value
                                ) || 0,
                                currentDue
                              )
                            )
                          )
                        }
                        className="border rounded-lg p-3 w-full mt-1"
                      />

                    </div>

                    <div className="mb-5">

                      <label className="text-sm font-medium">
                        Payment Method
                      </label>
        <select
        value={receiveMethod}
        onChange={(e) =>
       setReceiveMethod(
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

                    <div className="mb-6">

                      <label className="text-sm font-medium">
                        Remarks
                      </label>

                      <textarea
                        rows={3}
                        value={
                          receiveRemarks
                        }
                        onChange={(e) =>
                          setReceiveRemarks(
                            e.target.value
                          )
                        }
                        className="border rounded-lg p-3 w-full mt-1"
                        placeholder="Optional remarks"
                      />

                    </div>

                    <div className="flex justify-end gap-3">

                      <button
                        type="button"
                        onClick={
                          closeReceivePayment
                        }
                        disabled={
                          receivingPayment
                        }
                        className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleReceivePayment
                        }
                        disabled={
                          receivingPayment
                        }
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold"
                      >
                        {receivingPayment
                          ? "Processing..."
                          : "Receive Payment"}
                      </button>

                    </div>

                  </>
                );
              })()}

            </div>

          </div>

        )}

    </div>
  );
}