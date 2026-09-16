import { useEffect, useMemo, useState } from "react";
import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  getInventory,
  updateInventory,
  getAllInventoryCategories,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
} from "../api/inventory";

import type {
  InventoryPayload,
  InventoryType,
} from "../api/inventory";

import {
  INVENTORY_FIELDS,
  getDefaultInventoryFieldVisibility,
  getInventoryFieldVisibility,
  resetInventoryFieldVisibility,
  saveInventoryFieldVisibility,
} from "../utils/inventoryFieldSettings";

import type {
  InventoryFieldKey,
} from "../utils/inventoryFieldSettings";


/* =========================================================
   TYPES
========================================================= */

const TYPE_OPTIONS: Array<{
  value: InventoryType;
  label: string;
}> = [
  {
    value: "PRODUCT",
    label: "Product",
  },
  {
    value: "SPARE_PART",
    label: "Spare Part",
  },
  {
    value: "CONSUMABLE",
    label: "Consumable",
  },
];


type GroupedInventory = {
  groupKey: string;
  itemName: string;
  itemType: string;
  category: string;
  unit: string;
  totalQuantity: number;
  minimumStock: number;
  items: any[];
};


/* =========================================================
   HELPERS
========================================================= */

function money(value: any) {
  const n = Number(value ?? 0);

  return Number.isFinite(n)
    ? n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
}


function displayType(value: any) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();

  return (
    TYPE_OPTIONS.find(
      (item) => item.value === normalized
    )?.label ||
    String(value || "-")
  );
}


function errorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Operation failed."
  );
}


function supplierName(item: any) {
  return (
    item?.supplier?.companyName ||
    item?.supplier?.supplierName ||
    item?.supplier?.name ||
    item?.supplierName ||
    (typeof item?.supplier === "string"
      ? item.supplier
      : "") ||
    "-"
  );
}

function latestPurchase(item: any) {
  const purchases =
    Array.isArray(
      item?.purchaseItems
    )
      ? item.purchaseItems
      : [];

  if (!purchases.length) {
    return null;
  }

  return purchases[0]?.purchase || null;
}

function purchaseDate(item: any) {
  const purchase =
    latestPurchase(item);

  if (!purchase?.purchaseDate) {
    return "-";
  }

  return new Date(
    purchase.purchaseDate
  ).toLocaleDateString();
}

function purchaseNumber(item: any) {
  const purchase =
    latestPurchase(item);

  return (
    purchase?.purchaseNumber ||
    "-"
  );
}

function normalizedItemName(item: any) {
  return String(item?.itemName || "")
    .trim()
    .toLowerCase();
}


function getStockStatus(
  quantity: number,
  minimumStock: number
) {
  if (quantity === 0) {
    return "OUT_OF_STOCK";
  }

  if (quantity <= minimumStock) {
    return "LOW_STOCK";
  }

  return "STOCK";
}


function stockStatusLabel(
  quantity: number,
  minimumStock: number
) {
  const status = getStockStatus(
    quantity,
    minimumStock
  );

  if (status === "OUT_OF_STOCK") {
    return "Out of Stock";
  }

  if (status === "LOW_STOCK") {
    return "Low Stock";
  }

  return "Stock";
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function InventoryPage() {
  const navigate = useNavigate();

  const [inventory, setInventory] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [stockFilter, setStockFilter] =
    useState("ALL");

  const [showSettings, setShowSettings] =
    useState(false);

// =====================================================
// INVENTORY CATEGORY MANAGEMENT
// =====================================================

const [
  categoryManagement,
  setCategoryManagement,
] = useState<any[]>([]);

const [
  loadingCategoryManagement,
  setLoadingCategoryManagement,
] = useState(false);

const [
  newCategoryName,
  setNewCategoryName,
] = useState("");

const [
  editingCategoryId,
  setEditingCategoryId,
] = useState<string | null>(null);

const [
  editingCategoryName,
  setEditingCategoryName,
] = useState("");

  const [visibility, setVisibility] =
    useState(
      getInventoryFieldVisibility()
    );

  const [editingItem, setEditingItem] =
    useState<any | null>(null);

    async function loadCategoryManagement() {
  try {
    setLoadingCategoryManagement(true);

    const response = await getAllInventoryCategories();

    const data =
      response?.data?.data ??
      response?.data;

    setCategoryManagement(
      Array.isArray(data) ? data : []
    );
  } catch (error: any) {
    console.error(
      "Failed to load category management:",
      error
    );

    alert(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load categories."
    );
  } finally {
    setLoadingCategoryManagement(false);
  }
}

async function handleAddCategory() {
  const name = newCategoryName.trim();

  if (!name) {
    alert("Category name is required.");
    return;
  }

  try {
    await createInventoryCategory(name);

    setNewCategoryName("");

    await loadCategoryManagement();

    alert("Category added successfully.");
  } catch (error: any) {
    alert(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to add category."
    );
  }
}

async function handleUpdateCategory(id: string) {
  const name = editingCategoryName.trim();

  if (!name) {
    alert("Category name is required.");
    return;
  }

  try {
    await updateInventoryCategory(id, {
      name,
    });

    setEditingCategoryId(null);
    setEditingCategoryName("");

    await loadCategoryManagement();

    alert("Category updated successfully.");
  } catch (error: any) {
    alert(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update category."
    );
  }
}

async function handleToggleCategory(category: any) {
  try {
    await updateInventoryCategory(
      String(category.id),
      {
        active: !category.active,
      }
    );

    await loadCategoryManagement();
  } catch (error: any) {
    alert(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update category status."
    );
  }
}

async function handleDeleteCategory(category: any) {
  const confirmed = window.confirm(
    `Delete category "${category.name}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteInventoryCategory(
      String(category.id)
    );

    await loadCategoryManagement();

    alert("Category deleted successfully.");
  } catch (error: any) {
    alert(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete category."
    );
  }
}

  const [savingEdit, setSavingEdit] =
    useState(false);

  /*
   * Stores which grouped rows are expanded.
   *
   * Example:
   * {
   *   "ssd 512gb": true
   * }
   */
  const [expandedGroups, setExpandedGroups] =
    useState<Record<string, boolean>>({});


  /* =========================================================
     LOAD INVENTORY
  ========================================================= */

  async function loadInventory() {
    try {
      setLoading(true);

      const response =
        await getInventory();

      const list =
        Array.isArray(response.data?.data)
          ? response.data.data
          : [];

      setInventory(list);
    } catch (error: any) {
      console.error(
        "Failed to load inventory:",
        error
      );

      alert(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }


useEffect(() => {
  loadInventory();
  loadCategoryManagement();

  const refreshSettings = () =>
    setVisibility(
      getInventoryFieldVisibility()
    );

    window.addEventListener(
      "neits-inventory-field-settings-changed",
      refreshSettings
    );

    return () =>
      window.removeEventListener(
        "neits-inventory-field-settings-changed",
        refreshSettings
      );
  }, []);


  /* =========================================================
     SEARCH / TYPE / STATUS FILTER
  ========================================================= */

  const filteredInventory =
    useMemo(() => {
      const q =
        search.trim().toLowerCase();

      return inventory.filter((item) => {
        const matchesSearch =
          !q ||
          [
            item.itemCode,
            item.itemName,
            item.itemType,
            item.category,
            item.brand,
            item.model,
            supplierName(item),
            item.location,
            item.barcode,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(q)
            );

        const matchesType =
          typeFilter === "ALL" ||
          String(
            item.itemType || ""
          ).toUpperCase() ===
            typeFilter;

        const matchesStatus =
          statusFilter === "ALL" ||
          String(
            item.status || "Active"
          ) === statusFilter;

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus
        );
      });
    }, [
      inventory,
      search,
      typeFilter,
      statusFilter,
    ]);


  /* =========================================================
     GROUP INVENTORY BY ITEM NAME
     
     Same item name = one row.
     
     Example:
     
     SSD 512GB  quantity 2
     SSD 512GB  quantity 5
     SSD 512GB  quantity 3
     
     becomes:
     
     SSD 512GB  quantity 10
  ========================================================= */

  const groupedInventory =
    useMemo<GroupedInventory[]>(() => {
      const groups =
        new Map<
          string,
          GroupedInventory
        >();

      filteredInventory.forEach(
        (item) => {
          const name =
            normalizedItemName(item);

          if (!name) {
            return;
          }

          if (!groups.has(name)) {
            groups.set(name, {
              groupKey: name,

              itemName:
                item.itemName || "-",

              itemType:
                item.itemType || "",

              category:
                item.category || "",

              unit:
                item.unit || "PCS",

              totalQuantity: 0,

              /*
               * For grouped items we use
               * the highest minimum stock.
               *
               * This avoids incorrectly adding
               * minimum stock from multiple records.
               */
              minimumStock: 0,

              items: [],
            });
          }

          const group =
            groups.get(name)!;

          group.items.push(item);

          group.totalQuantity +=
            Number(
              item.quantity ?? 0
            );

          group.minimumStock =
            Math.max(
              group.minimumStock,
              Number(
                item.minimumStock ?? 0
              )
            );
        }
      );

      return Array.from(
        groups.values()
      );
    }, [filteredInventory]);


  /* =========================================================
     STOCK FILTER
     
     IMPORTANT:
     Stock filtering happens AFTER grouping.
     
     Therefore:
     
     Item A = 2
     Item A = 5
     
     Total = 7
     
     Minimum = 5
     
     Result = STOCK
  ========================================================= */

  const stockFilteredGroups =
    useMemo(() => {
      if (stockFilter === "ALL") {
        return groupedInventory;
      }

      return groupedInventory.filter(
        (group) => {
          const status =
            getStockStatus(
              group.totalQuantity,
              group.minimumStock
            );

          return status ===
            stockFilter;
        }
      );
    }, [
      groupedInventory,
      stockFilter,
    ]);


  /* =========================================================
     EXPAND / COLLAPSE
  ========================================================= */

  function toggleGroup(
    groupKey: string
  ) {
    setExpandedGroups(
      (current) => ({
        ...current,
        [groupKey]:
          !current[groupKey],
      })
    );
  }


  /* =========================================================
     FIELD SETTINGS
  ========================================================= */

  function toggleField(
    key: InventoryFieldKey
  ) {
    setVisibility((current) => {
      const next = {
        ...current,
        [key]: !current[key],
      };

      saveInventoryFieldVisibility(
        next
      );

      return next;
    });
  }


  function resetFields() {
    const defaults =
      getDefaultInventoryFieldVisibility();

    setVisibility(defaults);

    resetInventoryFieldVisibility();
  }


  /* =========================================================
     EDIT
  ========================================================= */

  function openEdit(item: any) {
    setEditingItem({
      ...item,

      itemType:
        String(
          item.itemType ||
            "SPARE_PART"
        ).toUpperCase(),

      /*
       * Keep supplier name as string
       * for the edit form.
       */
      supplier:
        supplierName(item) === "-"
          ? ""
          : supplierName(item),
    });
  }


  async function saveEdit() {
    if (!editingItem) {
      return;
    }

    if (
      !String(
        editingItem.itemName || ""
      ).trim()
    ) {
      alert(
        "Item Name is required."
      );

      return;
    }

    if (
      !String(
        editingItem.category || ""
      ).trim()
    ) {
      alert(
        "Category is required."
      );

      return;
    }

    try {
      setSavingEdit(true);

      const payload:
        Partial<InventoryPayload> =
        {
          itemName:
            String(
              editingItem.itemName
            ).trim(),

          itemType:
            editingItem.itemType,

          category:
            String(
              editingItem.category
            ).trim(),

          brand:
            String(
              editingItem.brand || ""
            ).trim() ||
            undefined,

          model:
            String(
              editingItem.model || ""
            ).trim() ||
            undefined,

          purchasePrice:
            Math.max(
              0,
              Number(
                editingItem.purchasePrice ||
                  0
              )
            ),

          sellingPrice:
            Math.max(
              0,
              Number(
                editingItem.sellingPrice ||
                  0
              )
            ),

          quantity:
            Math.max(
              0,
              Math.floor(
                Number(
                  editingItem.quantity ||
                    0
                )
              )
            ),

          minimumStock:
            Math.max(
              0,
              Math.floor(
                Number(
                  editingItem.minimumStock ||
                    0
                )
              )
            ),

          supplier:
            String(
              editingItem.supplier || ""
            ).trim() ||
            undefined,

          location:
            String(
              editingItem.location || ""
            ).trim() ||
            undefined,

          barcode:
            String(
              editingItem.barcode || ""
            ).trim() ||
            undefined,

          unit:
            editingItem.unit ||
            "PCS",

          description:
            String(
              editingItem.description ||
                ""
            ).trim() ||
            undefined,

          status:
            editingItem.status ||
            "Active",
        };

      await updateInventory(
        editingItem.id,
        payload
      );

      alert(
        "Inventory item updated successfully."
      );

      setEditingItem(null);

      await loadInventory();
    } catch (error: any) {
      console.error(
        "Update inventory error:",
        error
      );

      alert(
        errorMessage(error)
      );
    } finally {
      setSavingEdit(false);
    }
  }


  /* =========================================================
     VISIBLE COLUMNS
  ========================================================= */

  const visibleColumns =
    INVENTORY_FIELDS.filter(
      (field) =>
        visibility[field.key]
    );


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalItems =
    inventory.length;

  const activeItems =
    inventory.filter(
      (item) =>
        String(
          item.status || "Active"
        ) === "Active"
    ).length;

  const lowStockItems =
    groupedInventory.filter(
      (group) =>
        getStockStatus(
          group.totalQuantity,
          group.minimumStock
        ) === "LOW_STOCK"
    ).length;

  const stockUnits =
    inventory.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity ?? 0
        ),
      0
    );


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      <div className="max-w-[1600px] mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Inventory
            </h1>

            <p className="text-gray-500 mt-1">
              Manage products, spare parts
              and consumables.
            </p>
          </div>


          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                setShowSettings(true)
              }
              className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
            >
              ⚙ Field Settings
            </button>


            <button
              onClick={() =>
                navigate(
                  "/inventory/new"
                )
              }
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
            >
              + Add Inventory
            </button>

          </div>

        </div>


        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="bg-white rounded-xl shadow p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

            {/* Search */}

            <input
              className="border rounded-lg p-3 xl:col-span-2"
              placeholder="Search item, code, brand, model, supplier..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />


            {/* Type */}

            <select
              className="border rounded-lg p-3"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All Types
              </option>

              {TYPE_OPTIONS.map(
                (type) => (
                  <option
                    key={
                      type.value
                    }
                    value={
                      type.value
                    }
                  >
                    {type.label}
                  </option>
                )
              )}
            </select>


            {/* Status */}

            <select
              className="border rounded-lg p-3"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>


            {/* Stock */}

            <select
              className="border rounded-lg p-3"
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(
                  e.target.value
                )
              }
            >
              <option value="ALL">
                All Stock
              </option>

              <option value="STOCK">
                Stock
              </option>

              <option value="LOW_STOCK">
                Low Stock
              </option>

              <option value="OUT_OF_STOCK">
                Out of Stock
              </option>
            </select>

          </div>

        </div>


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <StatCard
            title="Total Items"
            value={totalItems}
          />

          <StatCard
            title="Active Items"
            value={activeItems}
          />

          <StatCard
            title="Low Stock"
            value={lowStockItems}
          />

          <StatCard
            title="Stock Units"
            value={stockUnits}
          />

        </div>


        {/* =====================================================
            INVENTORY TABLE
        ===================================================== */}

        <div className="bg-white rounded-xl shadow overflow-hidden">

          {loading ? (

            <div className="p-10 text-center text-gray-500">
              Loading inventory...
            </div>

          ) : stockFilteredGroups.length === 0 ? (

            <div className="p-10 text-center text-gray-500">
              No inventory items found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px] border-collapse">

                <thead className="bg-gray-100">

                  <tr>

                    {visibleColumns.map(
                      (field) => (

                        <th
                          key={
                            field.key
                          }
                          className="border p-3 text-left whitespace-nowrap"
                        >
                          {field.label}
                        </th>

                      )
                    )}

                    <th className="border p-3 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {stockFilteredGroups.map(
                    (group) => {

                      const expanded =
                        !!expandedGroups[
                          group.groupKey
                        ];

                      const representative =
                        group.items[0];

                      const status =
                        getStockStatus(
                          group.totalQuantity,
                          group.minimumStock
                        );

                      const lowStock =
                        status ===
                        "LOW_STOCK";

                      const outOfStock =
                        status ===
                        "OUT_OF_STOCK";


                      return (
                        <GroupedInventoryRows
                          key={
                            group.groupKey
                          }
                          group={group}
                          representative={
                            representative
                          }
                          visibleColumns={
                            visibleColumns
                          }
                          expanded={
                            expanded
                          }
                          lowStock={
                            lowStock
                          }
                          outOfStock={
                            outOfStock
                          }
                          onToggle={() =>
                            toggleGroup(
                              group.groupKey
                            )
                          }
                          onEdit={
                            openEdit
                          }
                        />
                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* =======================================================
          FIELD SETTINGS
      ======================================================= */}

      {showSettings && (
  <FieldSettingsModal
    visibility={visibility}
    onClose={() =>
      setShowSettings(false)
    }
    onReset={resetFields}
    onToggle={toggleField}

    categoryManagement={
      categoryManagement
    }

    loadingCategoryManagement={
      loadingCategoryManagement
    }

    newCategoryName={
      newCategoryName
    }

    setNewCategoryName={
      setNewCategoryName
    }

    editingCategoryId={
      editingCategoryId
    }

    setEditingCategoryId={
      setEditingCategoryId
    }

    editingCategoryName={
      editingCategoryName
    }

    setEditingCategoryName={
      setEditingCategoryName
    }

    onAddCategory={
      handleAddCategory
    }

    onUpdateCategory={
      handleUpdateCategory
    }

    onToggleCategory={
      handleToggleCategory
    }

    onDeleteCategory={
      handleDeleteCategory
    }
   />
    )}


      {/* =======================================================
          EDIT INVENTORY ITEM
      ======================================================= */}

      {editingItem && (
        <EditInventoryModal
          item={editingItem}
          setItem={setEditingItem}
          saving={savingEdit}
          onSave={saveEdit}
          onClose={() =>
            setEditingItem(null)
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   GROUPED INVENTORY ROWS
========================================================= */

function GroupedInventoryRows({
  group,
  representative,
  visibleColumns,
  expanded,
  lowStock,
  outOfStock,
  onToggle,
  onEdit,
}: {
  group: GroupedInventory;
  representative: any;
  visibleColumns: Array<{
    key: InventoryFieldKey;
    label: string;
  }>;
  expanded: boolean;
  lowStock: boolean;
  outOfStock: boolean;
  onToggle: () => void;
  onEdit: (item: any) => void;
}) {

  return (
    <>
      {/* =====================================================
          GROUPED SUMMARY ROW
      ===================================================== */}

      <tr className="hover:bg-gray-50">

        {visibleColumns.map(
          (field) => (

            <td
              key={
                field.key
              }
              className="border p-3"
            >

              {renderGroupedCell(
                group,
                representative,
                field.key,
                lowStock,
                outOfStock
              )}

            </td>

          )
        )}


        {/* Actions */}

        <td className="border p-3">

          <div className="flex justify-center gap-2">

            <button
              onClick={
                onToggle
              }
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
            >
              {expanded
                ? "Hide"
                : "View"}
            </button>

          </div>

        </td>

      </tr>


      {/* =====================================================
          EXPANDED DETAILS
      ===================================================== */}

      {expanded && (

        <tr>

          <td
            colSpan={
              visibleColumns.length +
              1
            }
            className="border bg-gray-50 p-4"
          >

            <div className="border rounded-xl bg-white overflow-hidden">

              <div className="px-4 py-3 bg-gray-100 border-b">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                  <div>

                    <h3 className="font-bold text-gray-800">
                      {group.itemName}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {group.items.length} inventory record
                      {group.items.length !== 1
                        ? "s"
                        : ""}
                      {" • "}
                      Total Quantity:{" "}
                      <strong>
                        {
                          group.totalQuantity
                        }
                      </strong>
                    </p>

                  </div>

                  <span
                    className={`
                      inline-flex
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      w-fit
                      ${
                        outOfStock
                          ? "bg-red-100 text-red-700"
                          : lowStock
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                  >
                    {stockStatusLabel(
                      group.totalQuantity,
                      group.minimumStock
                    )}
                  </span>

                </div>

              </div>


              {/* Individual records */}

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="bg-white">

                      <th className="border p-3 text-left">
                        Item Code
                      </th>

                      <th className="border p-3 text-left">
                        Brand
                      </th>

                      <th className="border p-3 text-left">
                        Model
                      </th>

                      <th className="border p-3 text-left">
                        Supplier
                      </th>

                      <th className="border p-3 text-left">
                        Location
                      </th>

                      <th className="border p-3 text-center">
                        Quantity
                      </th>

                      <th className="border p-3 text-center">
                        Minimum
                      </th>

                      <th className="border p-3 text-left">
                        Purchase Price
                      </th>

                      <th className="border p-3 text-left">
                        Selling Price
                      </th>

                      <th className="border p-3 text-center">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {group.items.map(
                      (item) => {

                        const quantity =
                          Number(
                            item.quantity ??
                              0
                          );

                        const minimum =
                          Number(
                            item.minimumStock ??
                              0
                          );

                        const itemStatus =
                          getStockStatus(
                            quantity,
                            minimum
                          );

                        return (

                          <tr
                            key={
                              item.id
                            }
                            className="hover:bg-gray-50"
                          >

                            <td className="border p-3 font-mono text-sm">
                              {
                                item.itemCode ||
                                "-"
                              }
                            </td>

                            <td className="border p-3">
                              {
                                item.brand ||
                                "-"
                              }
                            </td>

                            <td className="border p-3">
                              {
                                item.model ||
                                "-"
                              }
                            </td>

                            <td className="border p-3">
                              {
                                supplierName(
                                  item
                                )
                              }
                            </td>

                            <td className="border p-3">
                              {
                                item.location ||
                                "-"
                              }
                            </td>

                            <td className="border p-3 text-center">

                              <span
                                className={`
                                  font-bold
                                  ${
                                    itemStatus ===
                                    "OUT_OF_STOCK"
                                      ? "text-red-600"
                                      : itemStatus ===
                                        "LOW_STOCK"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }
                                `}
                              >
                                {
                                  quantity
                                }
                              </span>

                            </td>

                            <td className="border p-3 text-center">
                              {
                                minimum
                              }
                            </td>

                            <td className="border p-3">
                              Rs.{" "}
                              {money(
                                item.purchasePrice
                              )}
                            </td>

                            <td className="border p-3">
                              Rs.{" "}
                              {money(
                                item.sellingPrice
                              )}
                            </td>

                            <td className="border p-3">

                              <div className="flex justify-center">

                                <button
                                  onClick={() =>
                                    onEdit(
                                      item
                                    )
                                  }
                                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  Edit
                                </button>

                              </div>

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </td>

        </tr>

      )}

    </>
  );
}


/* =========================================================
   GROUPED CELL
========================================================= */

function renderGroupedCell(
  group: GroupedInventory,
  representative: any,
  key: InventoryFieldKey,
  lowStock: boolean,
  outOfStock: boolean
) {

  switch (key) {

    case "itemCode":
      return (
        <div>
          <span className="font-mono text-sm">
            {group.items.length === 1
              ? representative.itemCode ||
                "-"
              : `${group.items.length} records`}
          </span>
        </div>
      );


    case "itemName":
      return (
        <div>
          <span className="font-semibold">
            {group.itemName}
          </span>

          {group.items.length > 1 && (
            <span className="block text-xs text-gray-500 mt-1">
              {group.items.length} records
            </span>
          )}
        </div>
      );


    case "itemType":
      return displayType(
        group.itemType
      );


    case "category":
      return (
        group.category ||
        "-"
      );


    case "brand":
      return getGroupedText(
        group.items,
        "brand"
      );


    case "model":
      return getGroupedText(
        group.items,
        "model"
      );


    case "purchasePrice":
      return group.items.length === 1
        ? `Rs. ${money(
            representative.purchasePrice
          )}`
        : "Multiple";


    case "sellingPrice":
      return group.items.length === 1
        ? `Rs. ${money(
            representative.sellingPrice
          )}`
        : "Multiple";


    case "quantity":
      return (
        <span
          className={`
            font-bold
            ${
              outOfStock
                ? "text-red-600"
                : lowStock
                ? "text-yellow-600"
                : "text-green-600"
            }
          `}
        >
          {group.totalQuantity}
        </span>
      );


    case "minimumStock":
      return group.minimumStock;


    case "supplier":
      return getGroupedSupplier(
        group.items
      );


    case "location":
      return getGroupedText(
        group.items,
        "location"
      );


    case "barcode":
      return group.items.length === 1
        ? representative.barcode ||
          "-"
        : "Multiple";


    case "unit":
      return group.unit;


    case "description":
      return (
        <span className="block max-w-[280px] truncate">
          {group.items.length === 1
            ? representative.description ||
              "-"
            : "Multiple records"}
        </span>
      );


  case "status":
  return (
    <span
      className={`
        px-2
        py-1
        rounded-full
        text-xs
        font-semibold
        ${
          String(
            representative.status ||
              "Active"
          ) === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
        }
      `}
    >
      {group.items.length === 1
        ? representative.status ||
          "Active"
        : "Mixed"}
    </span>
  );

case "purchaseDate":
  return group.items.length === 1
    ? purchaseDate(representative)
    : "Multiple";

case "supplierInvoiceNumber":
  return group.items.length === 1
    ? purchaseNumber(representative)
    : "Multiple";

case "paymentMethod":
  return group.items.length === 1
    ? latestPurchase(
        representative
      )?.paymentMethod || "-"
    : "Multiple";

case "paidAmount":
  return group.items.length === 1
    ? `Rs. ${money(
        latestPurchase(
          representative
        )?.paidAmount
      )}`
    : "Multiple";

case "purchaseRemarks":
  return group.items.length === 1
    ? latestPurchase(
        representative
      )?.notes || "-"
    : "Multiple";

default:
  return "-";
  }
}


/* =========================================================
   GROUPED TEXT HELPER
========================================================= */

function getGroupedText(
  items: any[],
  field: string
) {
  const values =
    Array.from(
      new Set(
        items
          .map((item) =>
            String(
              item?.[field] || ""
            ).trim()
          )
          .filter(Boolean)
      )
    );

  if (values.length === 0) {
    return "-";
  }

  if (values.length === 1) {
    return values[0];
  }

  return "Multiple";
}


/* =========================================================
   GROUPED SUPPLIER
========================================================= */

function getGroupedSupplier(
  items: any[]
) {
  const values =
    Array.from(
      new Set(
        items
          .map((item) =>
            supplierName(item)
          )
          .filter(
            (value) =>
              value !== "-"
          )
      )
    );

  if (values.length === 0) {
    return "-";
  }

  if (values.length === 1) {
    return values[0];
  }

  return "Multiple";
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-2xl font-bold text-gray-800 mt-1">
        {value.toLocaleString()}
      </p>

    </div>
  );
}


/* =========================================================
   FIELD SETTINGS MODAL
========================================================= */

function FieldSettingsModal({
  visibility,
  onClose,
  onReset,
  onToggle,
  categoryManagement,
  loadingCategoryManagement,
  newCategoryName,
  setNewCategoryName,
  editingCategoryId,
  setEditingCategoryId,
  editingCategoryName,
  setEditingCategoryName,
  onAddCategory,
  onUpdateCategory,
  onToggleCategory,
  onDeleteCategory,
}: {
  visibility: Record<InventoryFieldKey, boolean>;
  onClose: () => void;
  onReset: () => void;
  onToggle: (key: InventoryFieldKey) => void;

  categoryManagement: any[];
  loadingCategoryManagement: boolean;
  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  editingCategoryId: string | null;
  setEditingCategoryId: (value: string | null) => void;
  editingCategoryName: string;
  setEditingCategoryName: (value: string) => void;
  onAddCategory: () => void;
  onUpdateCategory: (id: string) => void;
  onToggleCategory: (category: any) => void;
  onDeleteCategory: (category: any) => void;
}) {

  return (

    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">

        <div className="flex justify-between items-center mb-5">

          <div>

            <h2 className="text-xl font-bold">
              Inventory Field Settings
            </h2>

            <p className="text-sm text-gray-500">
              Turn fields ON/OFF for the inventory form and table.
            </p>

          </div>


          <button
            onClick={
              onClose
            }
            className="text-2xl text-gray-500 hover:text-gray-800"
          >
            ×
          </button>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {INVENTORY_FIELDS.map(
            (field) => (

              <label
                key={
                  field.key
                }
                className="flex items-center justify-between border rounded-lg p-3 cursor-pointer"
              >

                <span className="font-medium">
                  {
                    field.label
                  }
                </span>

                <input
                  type="checkbox"
                  checked={
                    visibility[
                      field.key
                    ]
                  }
                  onChange={() =>
                    onToggle(
                      field.key
                    )
                  }
                  className="w-5 h-5"
                />

              </label>

            )
          )}

        </div>


        {/* =====================================================
            CATEGORY MANAGEMENT
        ===================================================== */}

        <div className="mt-8 border-t pt-5">

          <h3 className="text-lg font-bold mb-3">
            Inventory Categories
          </h3>

          <div className="flex gap-2 mb-4">

            <input
              className="border rounded-lg p-2 flex-1"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) =>
                setNewCategoryName(
                  e.target.value
                )
              }
            />

            <button
              onClick={onAddCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>

          </div>

          {loadingCategoryManagement ? (

            <p className="text-sm text-gray-500">
              Loading categories...
            </p>

          ) : categoryManagement.length === 0 ? (

            <p className="text-sm text-gray-500">
              No categories yet.
            </p>

          ) : (

            <div className="space-y-2">

              {categoryManagement.map(
                (category) => (

                  <div
                    key={category.id}
                    className="flex items-center justify-between border rounded-lg p-2"
                  >

                    {editingCategoryId ===
                    String(category.id) ? (

                      <input
                        className="border rounded p-1 flex-1 mr-2"
                        value={
                          editingCategoryName
                        }
                        onChange={(e) =>
                          setEditingCategoryName(
                            e.target.value
                          )
                        }
                        autoFocus
                      />

                    ) : (

                      <span
                        className={
                          category.active
                            ? ""
                            : "text-gray-400 line-through"
                        }
                      >
                        {category.name}
                      </span>

                    )}

                    <div className="flex gap-2">

                      {editingCategoryId ===
                      String(category.id) ? (

                        <button
                          onClick={() =>
                            onUpdateCategory(
                              String(
                                category.id
                              )
                            )
                          }
                          className="px-2 py-1 text-sm bg-green-600 text-white rounded"
                        >
                          Save
                        </button>

                      ) : (

                        <button
                          onClick={() => {
                            setEditingCategoryId(
                              String(
                                category.id
                              )
                            );
                            setEditingCategoryName(
                              category.name
                            );
                          }}
                          className="px-2 py-1 text-sm bg-gray-200 rounded"
                        >
                          Edit
                        </button>

                      )}

                      <button
                        onClick={() =>
                          onToggleCategory(
                            category
                          )
                        }
                        className="px-2 py-1 text-sm bg-yellow-100 text-yellow-700 rounded"
                      >
                        {category.active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        onClick={() =>
                          onDeleteCategory(
                            category
                          )
                        }
                        className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        <div className="mt-6 flex justify-between">

          <button
            onClick={
              onReset
            }
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Reset All Visible
          </button>


          <button
            onClick={
              onClose
            }
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>

        </div>

      </div>

    </div>

  );
}


/* =========================================================
   EDIT INVENTORY MODAL
========================================================= */

function EditInventoryModal({
  item,
  setItem,
  saving,
  onSave,
  onClose,
}: {
  item: any;

  setItem:
    Dispatch<
      SetStateAction<any | null>
    >;

  saving: boolean;

  onSave: () => void;

  onClose: () => void;
}) {

  const update = (
    key: string,
    value: any
  ) =>
    setItem(
      (current: any) => ({
        ...current,
        [key]: value,
      })
    );


  const input =
    "w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500";


  return (

    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6">

        {/* Header */}

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              Edit Inventory Item
            </h2>

            <p className="text-sm text-gray-500">
              {
                item.itemCode ||
                "Inventory item"
              }
            </p>

          </div>


          <button
            onClick={
              onClose
            }
            className="text-2xl text-gray-500 hover:text-gray-800"
          >
            ×
          </button>

        </div>


        {/* Form */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Item Code">

            <input
              className={`${input} bg-gray-100`}
              value={
                item.itemCode ||
                ""
              }
              readOnly
            />

          </Field>


          <Field label="Item Name">

            <input
              className={
                input
              }
              value={
                item.itemName ||
                ""
              }
              onChange={(e) =>
                update(
                  "itemName",
                  e.target.value
                )
              }
            />

          </Field>


          <Field label="Item Type">

            <select
              className={
                input
              }
              value={
                item.itemType ||
                "SPARE_PART"
              }
              onChange={(e) =>
                update(
                  "itemType",
                  e.target.value
                )
              }
            >

              {TYPE_OPTIONS.map(
                (type) => (

                  <option
                    key={
                      type.value
                    }
                    value={
                      type.value
                    }
                  >
                    {
                      type.label
                    }
                  </option>

                )
              )}

            </select>

          </Field>


          <Field label="Category">

            <input
              className={
                input
              }
              value={
                item.category ||
                ""
              }
              onChange={(e) =>
                update(
                  "category",
                  e.target.value
                )
              }
            />

          </Field>


          <Field label="Brand">

            <input
              className={
                input
              }
              value={
                item.brand ||
                ""
              }
              onChange={(e) =>
                update(
                  "brand",
                  e.target.value
                )
              }
            />

          </Field>


          <Field label="Model">

            <input
              className={
                input
              }
              value={
                item.model ||
                ""
              }
              onChange={(e) =>
                update(
                  "model",
                  e.target.value
                )
              }
            />

          </Field>


          <Field label="Purchase Price">

            <input
              type="number"
              min={0}
              className={
                input
              }
              value={
                item.purchasePrice ??
                0
              }
              onChange={(e) =>
                update(
                  "purchasePrice",
                  Number(
                    e.target.value
                  ) || 0
                )
              }
            />

          </Field>


          <Field label="Selling Price">

            <input
              type="number"
              min={0}
              className={
                input
              }
              value={
                item.sellingPrice ??
                0
              }
              onChange={(e) =>
                update(
                  "sellingPrice",
                  Number(
                    e.target.value
                  ) || 0
                )
              }
            />

          </Field>


          <Field label="Quantity">

            <input
              type="number"
              min={0}
              className={
                input
              }
              value={
                item.quantity ??
                0
              }
              onChange={(e) =>
                update(
                  "quantity",
                  Math.max(
                    0,
                    Math.floor(
                      Number(
                        e.target.value
                      ) || 0
                    )
                  )
                )
              }
            />

          </Field>


          <Field label="Minimum Stock">

            <input
              type="number"
              min={0}
              className={
                input
              }
              value={
                item.minimumStock ??
                0
              }
              onChange={(e) =>
                update(
                  "minimumStock",
                  Math.max(
                    0,
                    Math.floor(
                      Number(
                        e.target.value
                      ) || 0
                    )
                  )
                )
              }
            />

          </Field>


          <Field label="Supplier">

            <input
              className={
                input
              }
              value={
                item.supplier ||
                ""
              }
              onChange={(e) =>
                update(
                  "supplier",
                  e.target.value
                )
              }
            />

          </Field>


          <Field label="Location">

            <input
              className={
                input
              }
              value={
                item.location ||
                ""
              }
              onChange={(e) =>
                update(
                  "location",
                  e.target.value
                )
              }
            />

          </Field>


          <Field label="Barcode">

            <input
              className={
                input
              }
              value={
                item.barcode ||
                ""
              }
              onChange={(e) =>
                update(
                  "barcode",
                  e.target.value
                )
              }
            />

          </Field>


          <Field label="Unit">

            <select
              className={
                input
              }
              value={
                item.unit ||
                "PCS"
              }
              onChange={(e) =>
                update(
                  "unit",
                  e.target.value
                )
              }
            >

              <option value="PCS">
                PCS
              </option>

              <option value="SET">
                SET
              </option>

              <option value="BOX">
                BOX
              </option>

              <option value="PACK">
                PACK
              </option>

              <option value="METER">
                METER
              </option>

              <option value="KG">
                KG
              </option>

              <option value="LITER">
                LITER
              </option>

            </select>

          </Field>


          <Field label="Status">

            <select
              className={
                input
              }
              value={
                item.status ||
                "Active"
              }
              onChange={(e) =>
                update(
                  "status",
                  e.target.value
                )
              }
            >

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </Field>


          <div className="md:col-span-2">

            <Field label="Description">

              <textarea
                rows={4}
                className={
                  input
                }
                value={
                  item.description ||
                  ""
                }
                onChange={(e) =>
                  update(
                    "description",
                    e.target.value
                  )
                }
              />

            </Field>

          </div>

        </div>


        {/* Buttons */}

        <div className="mt-7 flex justify-end gap-3">

          <button
            onClick={
              onClose
            }
            className="px-5 py-3 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>


          <button
            onClick={
              onSave
            }
            disabled={
              saving
            }
            className={`px-6 py-3 rounded-lg text-white font-semibold ${
              saving
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {
              saving
                ? "Saving..."
                : "Save Changes"
            }
          </button>

        </div>

      </div>

    </div>

  );
}


/* =========================================================
   FORM FIELD
========================================================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {

  return (

    <div>

      <label className="block font-semibold mb-2">
        {label}
      </label>

      {children}

    </div>

  );
}
