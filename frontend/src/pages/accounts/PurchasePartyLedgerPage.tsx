import { useEffect, useMemo, useState } from "react";
import { getPurchasePartyLedger } from "../../api/purchaseLedger";
import { getSuppliers } from "../../api/supplier";

export default function PurchasePartyLedgerPage() {
 const [purchases, setPurchases] =
  useState<any[]>([]);

const [suppliers, setSuppliers] =
  useState<any[]>([]);

const [loading, setLoading] =
  useState(true);

  const [search, setSearch] =
    useState("");

    const [supplierFilter, setSupplierFilter] =
  useState("");

  const [selectedItem, setSelectedItem] =
    useState<any>(null);

  useEffect(() => {
    loadLedger();
  }, []);
async function loadLedger() {
  try {
    setLoading(true);

    const [
      ledgerResponse,
      supplierResponse,
    ] = await Promise.all([
      getPurchasePartyLedger(),
      getSuppliers(),
    ]);

    const purchaseData =
      ledgerResponse.data ?? [];

    const supplierData =
      supplierResponse.data ?? [];

    setPurchases(
      Array.isArray(purchaseData)
        ? purchaseData
        : []
    );

    setSuppliers(
      Array.isArray(supplierData)
        ? supplierData
        : []
    );
    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Unable to load purchase ledger."
      );
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    const result: any[] = [];

    purchases.forEach(
      (purchase: any) => {
        (purchase.items || []).forEach(
          (purchaseItem: any) => {
            const inventory =
              purchaseItem.inventory || {};

            result.push({
              purchaseId:
                purchase.id,

              purchaseNumber:
                purchase.purchaseNumber,

              purchaseDate:
                purchase.purchaseDate,

              supplierId:
              purchase.supplier?.id || "",

              supplier:
              purchase.supplier
             ?.companyName || "-",

              inventoryId:
                inventory.id,

              itemCode:
                inventory.itemCode,

              itemName:
              inventory.itemName,

              brand:
              inventory.brand || "",

              model:
              inventory.model || "",

             quantity:
              Number(
             purchaseItem.quantity || 0
             ),

              purchasePrice:
                Number(
                  purchaseItem.purchasePrice || 0
                ),

              currentStock:
                Number(
                  inventory.quantity || 0
                ),

              sales:
                inventory.saleItems || [],

              repairs:
                inventory.repairParts || [],
            });
          }
        );
      }
    );

    return result;
  }, [purchases]);

const filteredRows = useMemo(() => {
  const keyword =
    search.trim().toLowerCase();

  return rows.filter((row: any) => {
   const matchesSupplier =
  !supplierFilter ||
  row.supplierId === supplierFilter;

   const matchesSearch =
  !keyword ||
  row.itemName
    ?.toLowerCase()
    .includes(keyword) ||
  row.itemCode
    ?.toLowerCase()
    .includes(keyword) ||
  row.brand
    ?.toLowerCase()
    .includes(keyword) ||
  row.model
    ?.toLowerCase()
    .includes(keyword) ||
  row.purchaseNumber
    ?.toLowerCase()
    .includes(keyword);

    return (
      matchesSupplier &&
      matchesSearch
    );
  });
}, [
  rows,
  search,
  supplierFilter,
]);

  function openDetails(row: any) {
    setSelectedItem(row);
  }

  function closeDetails() {
    setSelectedItem(null);
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow p-8 text-gray-500">
          Loading Purchase Party Ledger...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Purchase Party Ledger
          </h1>

          <p className="text-gray-500 mt-1">
            Track purchased goods, stock, sales and repair usage.
          </p>
        </div>

      </div>

      {/* SEARCH */}

     <div className="bg-white rounded-xl shadow p-5 mb-6">

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* SUPPLIER SEARCH */}

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Search Supplier
      </label>
<select
  value={supplierFilter}
  onChange={(e) =>
    setSupplierFilter(e.target.value)
  }
  className="border rounded-lg px-4 py-3 w-full"
>
  <option value="">
    All Suppliers
  </option>

  {suppliers.map((supplier: any) => (
    <option
      key={supplier.id}
      value={supplier.id}
    >
      {supplier.companyName}
    </option>
  ))}
</select>
    </div>

    {/* GENERAL SEARCH */}

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Search Item / Purchase No.
      </label>

      <input
        type="text"
        placeholder="Item name, code or purchase number..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="border rounded-lg px-4 py-3 w-full"
      />
    </div>

  </div>

  <div className="mt-4 flex gap-3">

    <button
      type="button"
      onClick={() => {
        setSupplierFilter("");
        setSearch("");
      }}
      className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
    >
      Clear Filters
    </button>

  </div>

</div>

      {/* MAIN TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-4 py-4 text-left">
                  Purchase Date
                </th>

                <th className="px-4 py-4 text-left">
                  Supplier
                </th>

                <th className="px-4 py-4 text-left">
                  Purchase No.
                </th>

                <th className="px-4 py-4 text-left">
                  Item
                </th>

                <th className="px-4 py-4 text-center">
                  Qty
                </th>

                <th className="px-4 py-4 text-right">
                  Purchase Price
                </th>

                <th className="px-4 py-4 text-center">
                  Current Stock
                </th>

                <th className="px-4 py-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredRows.map(
                (row: any) => (
                  <tr
                    key={`${row.purchaseId}-${row.inventoryId}`}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-4 py-4">
                      {new Date(
                        row.purchaseDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {row.supplier}
                    </td>

                    <td className="px-4 py-4">
                      {row.purchaseNumber}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold">
                        {row.itemName}
                      </div>

                      <div className="text-xs text-gray-500">
                        {row.itemCode}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      {row.quantity}
                    </td>

                    <td className="px-4 py-4 text-right">
                      Rs.{" "}
                      {row.purchasePrice.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-center font-semibold text-blue-700">
                      {row.currentStock}
                    </td>

                    <td className="px-4 py-4 text-center">

                      <button
                        onClick={() =>
                          openDetails(row)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        View
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {!filteredRows.length && (
          <div className="text-center py-10 text-gray-500">
            No purchase records found.
          </div>
        )}

      </div>

      {/* DETAILS */}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">

            <div className="p-8">

              {/* TITLE */}

              <div className="flex justify-between items-start mb-8">

                <div>

                  <h2 className="text-2xl font-bold">
                    Purchase Movement Details
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {selectedItem.itemName}
                  </p>

                </div>

                <button
                  onClick={
                    closeDetails
                  }
                  className="text-gray-500 hover:text-gray-900 text-2xl"
                >
                  ×
                </button>

              </div>

              {/* PURCHASE SUMMARY */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Supplier
                  </p>

                  <p className="font-bold mt-1">
                    {selectedItem.supplier}
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Purchase No.
                  </p>

                  <p className="font-bold mt-1">
                    {selectedItem.purchaseNumber}
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">
                    Purchased Qty
                  </p>

                  <p className="font-bold mt-1">
                    {selectedItem.quantity}
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50">
                  <p className="text-sm text-gray-500">
                    Current Stock
                  </p>

                  <p className="font-bold text-blue-700 mt-1">
                    {selectedItem.currentStock}
                  </p>
                </div>

              </div>

              {/* PURCHASE INFORMATION */}

              <div className="mb-8">

                <h3 className="text-lg font-bold mb-4">
                  Purchase Information
                </h3>

                <div className="border rounded-xl overflow-hidden">

                  <table className="w-full">

                    <thead className="bg-gray-100">

                      <tr>

                        <th className="p-3 text-left">
                        Date
                        </th>

                         <th className="p-3 text-left">
                          Item Name
                           </th>

                           <th className="p-3 text-left">
                            Movement
                            </th>

                        <th className="p-3 text-center">
                          Qty
                        </th>

                        <th className="p-3 text-right">
                          Purchase Price
                        </th>

                        <th className="p-3 text-right">
                          Sales/Charge Price
                        </th>

                        <th className="p-3 text-left">
                          Reference
                        </th>

                        <th className="p-3 text-left">
                          Customer
                        </th>

                        <th className="p-3 text-right">
                          Profit
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      <tr>

                        <td className="p-3 border-t">
                          {new Date(
                            selectedItem.purchaseDate
                          ).toLocaleDateString()}
                        </td>

                        <td className="p-3 border-t font-semibold">
                        {selectedItem.itemName}
                         </td>

                        <td className="p-3 border-t">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                            PURCHASE
                          </span>
                        </td>

                        <td className="p-3 border-t text-center">
                          {selectedItem.quantity}
                        </td>

                        <td className="p-3 border-t text-right">
                          Rs.{" "}
                          {selectedItem.purchasePrice.toFixed(2)}
                        </td>

                        <td className="p-3 border-t text-right">
                          -
                        </td>

                        <td className="p-3 border-t">
                          {selectedItem.purchaseNumber}
                        </td>

                        <td className="p-3 border-t">
                          -
                        </td>

                        <td className="p-3 border-t text-right">
                          -
                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

              </div>

              {/* SALES */}

              <div className="mb-8">

                <h3 className="text-lg font-bold mb-4">
                  Sales
                </h3>

                {selectedItem.sales.length > 0 ? (

                  <div className="border rounded-xl overflow-hidden">

                    <table className="w-full">

                      <thead className="bg-green-50">

                        <tr>

                          <th className="p-3 text-left">
                            Date
                          </th>

                          <th className="p-3 text-left">
                            Bill No.
                          </th>

                          <th className="p-3 text-left">
                            Customer
                          </th>

                          <th className="p-3 text-center">
                            Qty
                          </th>

                          <th className="p-3 text-right">
                            Purchase Price
                          </th>

                          <th className="p-3 text-right">
                            Sales Price
                          </th>

                          <th className="p-3 text-right">
                            Profit
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {selectedItem.sales.map(
                          (saleItem: any) => {

                            const cost =
                              Number(
                                selectedItem.purchasePrice
                              );

                            const salePrice =
                              Number(
                                saleItem.sellingPrice ||
                                  0
                              );

                            const qty =
                              Number(
                                saleItem.quantity ||
                                  0
                              );

                            const profit =
                              (
                                salePrice -
                                cost
                              ) * qty;

                            return (
                              <tr
                                key={
                                  saleItem.id
                                }
                              >

                                <td className="p-3 border-t">
                                  {new Date(
                                    saleItem.sale
                                      ?.saleDate
                                  ).toLocaleDateString()}
                                </td>

                                <td className="p-3 border-t font-semibold">
                                  {
                                    saleItem.sale
                                      ?.invoiceNumber
                                  }
                                </td>

                                <td className="p-3 border-t">
                                  {saleItem.sale
                                    ?.customer
                                    ?.fullName ||
                                    "Walk-in Customer"}
                                </td>

                                <td className="p-3 border-t text-center">
                                  {qty}
                                </td>

                                <td className="p-3 border-t text-right">
                                  Rs.{" "}
                                  {cost.toFixed(2)}
                                </td>

                                <td className="p-3 border-t text-right">
                                  Rs.{" "}
                                  {salePrice.toFixed(2)}
                                </td>

                                <td className="p-3 border-t text-right font-semibold text-green-700">
                                  Rs.{" "}
                                  {profit.toFixed(2)}
                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                ) : (
                  <p className="text-gray-500">
                    No sales found for this item.
                  </p>
                )}

              </div>

              {/* REPAIR USAGE */}

              <div className="mb-8">

                <h3 className="text-lg font-bold mb-4">
                  Used in Repair
                </h3>

                {selectedItem.repairs.length > 0 ? (

                  <div className="border rounded-xl overflow-hidden">

                    <table className="w-full">

                      <thead className="bg-orange-50">

                        <tr>

                          <th className="p-3 text-left">
                            Date
                          </th>

                          <th className="p-3 text-left">
                            Job No.
                          </th>

                          <th className="p-3 text-left">
                            Customer
                          </th>

                          <th className="p-3 text-center">
                            Qty
                          </th>

                          <th className="p-3 text-right">
                            Purchase Price
                          </th>

                          <th className="p-3 text-right">
                            Repair Charge
                          </th>

                          <th className="p-3 text-right">
                            Profit
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {selectedItem.repairs.map(
                          (repairPart: any) => {

                            const cost =
                              Number(
                                selectedItem.purchasePrice
                              );

                            const charge =
                              Number(
                                repairPart.price ||
                                  0
                              );

                            const qty =
                              Number(
                                repairPart.quantity ||
                                  0
                              );

                            const profit =
                              (
                                charge -
                                cost
                              ) * qty;

                            return (
                              <tr
                                key={
                                  repairPart.id
                                }
                              >

                                <td className="p-3 border-t">
                                  {new Date(
                                    repairPart.createdAt
                                  ).toLocaleDateString()}
                                </td>

                                <td className="p-3 border-t font-semibold">
                                  {
                                    repairPart
                                      .repairJob
                                      ?.jobNumber
                                  }
                                </td>

                                <td className="p-3 border-t">
                                  {
                                    repairPart
                                      .repairJob
                                      ?.customer
                                      ?.fullName
                                  }
                                </td>

                                <td className="p-3 border-t text-center">
                                  {qty}
                                </td>

                                <td className="p-3 border-t text-right">
                                  Rs.{" "}
                                  {cost.toFixed(2)}
                                </td>

                                <td className="p-3 border-t text-right">
                                  Rs.{" "}
                                  {charge.toFixed(2)}
                                </td>

                                <td className="p-3 border-t text-right font-semibold text-green-700">
                                  Rs.{" "}
                                  {profit.toFixed(2)}
                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                ) : (
                  <p className="text-gray-500">
                    This item has not been used in any repair.
                  </p>
                )}

              </div>

              <div className="flex justify-end">

                <button
                  onClick={
                    closeDetails
                  }
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}