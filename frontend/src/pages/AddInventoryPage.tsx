import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  createInventory,
  deleteInventory,
  getInventoryCategories,
  getAllInventoryCategories,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
} from "../api/inventory";

import type {
  InventoryPayload,
  InventoryType,
} from "../api/inventory";

import { createPurchase } from "../api/purchase";

import {
  getSuppliers,
} from "../api/supplier";

import {
  INVENTORY_FIELDS,
  getDefaultInventoryFieldSettings,
  getInventoryFieldSettings,
  saveInventoryFieldSettings,
  type InventoryFieldKey,
  type InventoryFieldSettings,
} from "../utils/inventoryFieldSettings";

// =====================================================
// INITIAL FORM
// =====================================================

const INITIAL_FORM: InventoryPayload = {
  itemName: "",
  itemType: "SPARE_PART",
  category: "",
  brand: "",
  model: "",
  purchasePrice: 0,
  sellingPrice: 0,
  quantity: 0,
  minimumStock: 0,
  supplier: "",
  location: "",
  barcode: "",
  unit: "PCS",
  description: "",
  status: "Active",
};

// =====================================================
// INVENTORY TYPES
// =====================================================

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

// =====================================================
// HELPERS
// =====================================================

function numberValue(value: string) {
  const n = Number(value);

  return Number.isFinite(n) && n >= 0
    ? n
    : 0;
}

function errorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Failed to save inventory."
  );
}

function getSupplierId(
  supplier: any
) {
  return (
    supplier?.id ??
    supplier?._id ??
    ""
  );
}

function getSupplierName(
  supplier: any
) {
  return (
    supplier?.name ||
    supplier?.supplierName ||
    supplier?.companyName ||
    supplier?.businessName ||
    supplier?.fullName ||
    supplier?.contactPerson ||
    `Supplier ${supplier?.id ?? ""}`
  );
}

// =====================================================
// PAGE
// =====================================================

export default function AddInventoryPage() {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const returnTo =
    searchParams.get("returnTo");

  const returnPath =
    returnTo &&
    returnTo.startsWith("/")
      ? returnTo
      : "/inventory";

  const [form, setForm] =
    useState<InventoryPayload>(
      INITIAL_FORM
    );

  const [saving, setSaving] =
    useState(false);

  const [suppliers, setSuppliers] =
  useState<any[]>([]);

const [loadingSuppliers, setLoadingSuppliers] =
  useState(true);

  const [categories, setCategories] =
  useState<any[]>([]);

const [loadingCategories, setLoadingCategories] =
  useState(true);

  const [categoryManagement, setCategoryManagement] =
  useState<any[]>([]);

const [loadingCategoryManagement, setLoadingCategoryManagement] =
  useState(false);

const [newCategoryName, setNewCategoryName] =
  useState("");

const [editingCategoryId, setEditingCategoryId] =
  useState<string | null>(null);

const [editingCategoryName, setEditingCategoryName] =
  useState("");

const [supplierSearch, setSupplierSearch] =
  useState("");

  const [
    showSettings,
    setShowSettings,
  ] = useState(false);

    const [
    fieldSettings,
    setFieldSettings,
  ] =
    useState<InventoryFieldSettings>(
      getInventoryFieldSettings()
    );

  // =====================================================
  // PURCHASE DATA
  // =====================================================

  const [purchaseDate, setPurchaseDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [
    supplierInvoiceNumber,
    setSupplierInvoiceNumber,
  ] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [paidAmount, setPaidAmount] =
    useState(0);

  const [
    purchaseRemarks,
    setPurchaseRemarks,
  ] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  // =====================================================
  // INVENTORY CATEGORY MANAGEMENT
  // =====================================================

useEffect(() => {
  loadCategoryManagement();
  loadSuppliers();
  loadCategories();

  const refreshSettings = () => {

      setFieldSettings(
        getInventoryFieldSettings()
      );
    };

    window.addEventListener(
      "neits-inventory-field-settings-changed",
      refreshSettings
    );

    return () => {
      window.removeEventListener(
        "neits-inventory-field-settings-changed",
        refreshSettings
      );
    };
  }, []);

  async function loadSuppliers() {
    try {
      setLoadingSuppliers(true);

      const data =
        await getSuppliers();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(
            data?.data
          )
        ? data.data
        : Array.isArray(
            data?.suppliers
          )
        ? data.suppliers
        : [];

      setSuppliers(list);
    } catch (error: any) {
      console.error(
        "Failed to load suppliers:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load suppliers."
      );
    } finally {
      setLoadingSuppliers(false);
    }
  }

  async function loadCategories() {
  try {
    setLoadingCategories(true);

    const response =
      await getInventoryCategories();

    const data =
      response?.data?.data ??
      response?.data;

    const list = Array.isArray(data)
      ? data
      : [];

    setCategories(list);
  } catch (error: any) {
    console.error(
      "Failed to load inventory categories:",
      error
    );

    alert(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load inventory categories."
    );
  } finally {
    setLoadingCategories(false);
  }
}

async function loadCategoryManagement() {
  try {
    setLoadingCategoryManagement(true);

    const response =
      await getAllInventoryCategories();

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
    await loadCategories();

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

async function handleUpdateCategory(
  id: string
) {
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
    await loadCategories();

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

async function handleToggleCategory(
  category: any
) {
  try {
    await updateInventoryCategory(
      String(category.id),
      {
        active: !category.active,
      }
    );

    await loadCategoryManagement();
    await loadCategories();
  } catch (error: any) {
    alert(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update category status."
    );
  }
}

async function handleDeleteCategory(
  category: any
) {
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
    await loadCategories();

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

  // =====================================================
  // FORM UPDATE
  // =====================================================

  function update<K extends keyof InventoryPayload>(
    key: K,
    value: InventoryPayload[K]
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  }

  // =====================================================
  // ORDERED / VISIBLE FIELDS
  // =====================================================

  const orderedFields =
    useMemo(() => {
      const fieldsByKey =
        new Map(
          INVENTORY_FIELDS.map(
            (field) => [
              field.key,
              field,
            ]
          )
        );

      return fieldSettings.order
        .map(
          (key) =>
            fieldsByKey.get(
              key
            )
        )
        .filter(
          (
            field
          ): field is NonNullable<typeof field> =>
            Boolean(field)
        )
        .filter(
          (field) =>
            fieldSettings
              .visibility[
              field.key
            ]
        );
    }, [fieldSettings]);

  // =====================================================
  // SAVE INVENTORY + PURCHASE
  // =====================================================

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!form.itemName?.trim()) {
      alert(
        "Item Name is required."
      );
      return;
    }

    if (!form.category?.trim()) {
      alert(
        "Category is required."
      );
      return;
    }

    if (
      (form.purchasePrice ?? 0) < 0
    ) {
      alert(
        "Purchase Price cannot be negative."
      );
      return;
    }

    if (
      (form.sellingPrice ?? 0) < 0
    ) {
      alert(
        "Selling Price cannot be negative."
      );
      return;
    }

    if (
      (form.quantity ?? 0) < 0
    ) {
      alert(
        "Quantity cannot be negative."
      );
      return;
    }

    if (
      (form.minimumStock ?? 0) < 0
    ) {
      alert(
        "Minimum Stock cannot be negative."
      );
      return;
    }

    const quantityToPurchase =
      Math.floor(
        Number(
          form.quantity ?? 0
        )
      );

    if (
      quantityToPurchase > 0
    ) {
      if (!form.supplier?.trim()) {
        alert(
          "Please select a Supplier."
        );
        return;
      }

      if (!purchaseDate) {
        alert(
          "Purchase Date is required."
        );
        return;
      }
    }

    try {
      setSaving(true);

      // =================================================
      // SUPPLIER ID
      // =================================================

      const selectedSupplier =
        suppliers.find(
          (supplier: any) =>
            getSupplierName(
              supplier
            ) ===
            form.supplier
        );

      const selectedSupplierId =
        selectedSupplier
          ? getSupplierId(
              selectedSupplier
            )
          : "";

      if (
        quantityToPurchase > 0 &&
        !selectedSupplierId
      ) {
        alert(
          "Selected supplier could not be found."
        );
        return;
      }

      // =================================================
      // CREATE INVENTORY MASTER
      // =================================================

      const inventoryResponse =
        await createInventory({
          ...form,

          // IMPORTANT:
          // Purchase transaction adds
          // the actual quantity.
          quantity: 0,

          itemName:
            form.itemName.trim(),

          category:
            form.category.trim(),

          brand:
            form.brand?.trim() ||
            undefined,

          model:
            form.model?.trim() ||
            undefined,

          supplier:
            form.supplier?.trim() ||
            undefined,

          location:
            form.location?.trim() ||
            undefined,

          barcode:
            form.barcode?.trim() ||
            undefined,

          description:
            form.description?.trim() ||
            undefined,
        });

      const createdInventory =
        inventoryResponse?.data?.data ??
        inventoryResponse?.data;

      const createdInventoryId =
        createdInventory?.id;

      if (!createdInventoryId) {
        throw new Error(
          "Inventory was created but its ID could not be obtained."
        );
      }

      // =================================================
      // CREATE PURCHASE
      // =================================================

      if (
        quantityToPurchase > 0
      ) {
        try {
          await createPurchase({
            supplierId:
              selectedSupplierId,

            purchaseDate,

            invoiceNumber:
              supplierInvoiceNumber.trim() ||
              null,

            paymentMethod,

            remarks:
              purchaseRemarks.trim() ||
              null,

            paidAmount:
              Number(
                paidAmount || 0
              ),

            items: [
              {
                inventoryId:
                  createdInventoryId,

                quantity:
                  quantityToPurchase,

                purchasePrice:
                  Number(
                    form.purchasePrice ??
                      0
                  ),

                sellingPrice:
                  Number(
                    form.sellingPrice ??
                      0
                  ),

                total:
                  Number(
                    form.purchasePrice ??
                      0
                  ) *
                  quantityToPurchase,
              },
            ],
          });
        } catch (
          purchaseError
        ) {
          // Roll back inventory
          // if purchase fails.
          try {
            await deleteInventory(
              createdInventoryId
            );
          } catch (
            rollbackError
          ) {
            console.error(
              "Inventory rollback failed:",
              rollbackError
            );
          }

          throw purchaseError;
        }
      }

      alert(
      quantityToPurchase > 0
      ? "Inventory item and purchase created successfully."
     : "Inventory item created successfully."
     );

      navigate(returnPath);

    } catch (error: any) {
      console.error(
        "Create inventory/purchase error:",
        error
      );

      alert(
        errorMessage(
          error
        )
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // FIELD SETTINGS
  // =====================================================

  function toggleField(
    key: InventoryFieldKey
  ) {
    setFieldSettings(
      (current) => {
        const next = {
          ...current,
          visibility: {
            ...current.visibility,
            [key]:
              !current.visibility[
                key
              ],
          },
        };

        saveInventoryFieldSettings(
          next
        );

        return next;
      }
    );
  }

  function moveField(
    key: InventoryFieldKey,
    direction:
      | "up"
      | "down"
  ) {
    setFieldSettings(
      (current) => {
        const order = [
          ...current.order,
        ];

        const index =
          order.indexOf(key);

        if (index === -1) {
          return current;
        }

        const newIndex =
          direction === "up"
            ? index - 1
            : index + 1;

        if (
          newIndex < 0 ||
          newIndex >=
            order.length
        ) {
          return current;
        }

        [
          order[index],
          order[newIndex],
        ] = [
          order[newIndex],
          order[index],
        ];

        const next = {
          ...current,
          order,
        };

        saveInventoryFieldSettings(
          next
        );

        return next;
      }
    );
  }

  function resetFields() {
    const defaults =
      getDefaultInventoryFieldSettings();

    setFieldSettings(
      defaults
    );

    saveInventoryFieldSettings(
      defaults
    );
  }

  // =====================================================
  // FIELD RENDERING
  // =====================================================

  function renderField(
    key: InventoryFieldKey
  ) {
    const common =
      "w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500";

    switch (key) {
      case "itemCode":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Item Code
            </label>

            <input
              className={`${common} bg-gray-100`}
              value="AUTO GENERATED"
              readOnly
            />

            <p className="text-xs text-gray-500 mt-1">
              The system generates
              the unique inventory
              code automatically.
            </p>
          </div>
        );

      case "itemName":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Item Name{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              className={common}
              value={
                form.itemName
              }
              onChange={(e) =>
                update(
                  "itemName",
                  e.target.value
                )
              }
              placeholder="e.g. SSD 512GB NVMe"
              required
            />
          </div>
        );

      case "itemType":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Item Type{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              className={common}
              value={
                form.itemType
              }
              onChange={(e) =>
                update(
                  "itemType",
                  e.target
                    .value as InventoryType
                )
              }
            >
              {TYPE_OPTIONS.map(
                (
                  option
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>
        );

   case "category":
  return (
    <div>
      <label className="block font-semibold mb-2">
        Category{" "}
        <span className="text-red-500">
          *
        </span>
      </label>

      <select
        className={common}
        value={form.category}
        onChange={(e) =>
          update(
            "category",
            e.target.value
          )
        }
        required
        disabled={loadingCategories}
      >
        <option value="">
          {loadingCategories
            ? "Loading categories..."
            : "Select Category"}
        </option>

        {categories.map(
          (category: any) => (
            <option
              key={category.id}
              value={category.name}
            >
              {category.name}
            </option>
          )
        )}
      </select>
    </div>
  );
      case "brand":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Brand
            </label>

            <input
              className={common}
              value={
                form.brand || ""
              }
              onChange={(e) =>
                update(
                  "brand",
                  e.target.value
                )
              }
              placeholder="e.g. Dell, HP, Lenovo"
            />
          </div>
        );

      case "model":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Model
            </label>

            <input
              className={common}
              value={
                form.model || ""
              }
              onChange={(e) =>
                update(
                  "model",
                  e.target.value
                )
              }
            />
          </div>
        );

      case "purchasePrice":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Purchase Price (Rs.)
            </label>

            <input
              type="number"
              min={0}
              className={common}
              value={
                form.purchasePrice ??
                0
              }
              onChange={(e) =>
                update(
                  "purchasePrice",
                  numberValue(
                    e.target.value
                  )
                )
              }
            />
          </div>
        );

      case "sellingPrice":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Selling Price (Rs.)
            </label>

            <input
              type="number"
              min={0}
              className={common}
              value={
                form.sellingPrice ??
                0
              }
              onChange={(e) =>
                update(
                  "sellingPrice",
                  numberValue(
                    e.target.value
                  )
                )
              }
            />
          </div>
        );

      case "quantity":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Quantity
            </label>

            <input
              type="number"
              min={0}
              className={common}
              value={
                form.quantity ?? 0
              }
              onChange={(e) =>
                update(
                  "quantity",
                  Math.floor(
                    numberValue(
                      e.target.value
                    )
                  )
                )
              }
            />

            <p className="text-xs text-gray-500 mt-1">
              Quantity greater than 0
              creates a Purchase
              transaction.
            </p>
          </div>
        );

      case "minimumStock":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Minimum Stock
            </label>

            <input
              type="number"
              min={0}
              className={common}
              value={
                form.minimumStock ??
                0
              }
              onChange={(e) =>
                update(
                  "minimumStock",
                  Math.floor(
                    numberValue(
                      e.target.value
                    )
                  )
                )
              }
            />
          </div>
        );

      case "supplier":
  return (
    <div className="relative">
      <label className="block font-semibold mb-2">
        Supplier
        {Number(form.quantity ?? 0) > 0 && (
          <span className="text-red-500">
            {" "}*
          </span>
        )}
      </label>

      <input
        type="text"
        className={common}
        value={supplierSearch || form.supplier || ""}
        onChange={(e) => {
          setSupplierSearch(e.target.value);
          update(
            "supplier",
            e.target.value
          );
        }}
        placeholder={
          loadingSuppliers
            ? "Loading suppliers..."
            : "Type supplier name, code, phone or contact person..."
        }
        disabled={loadingSuppliers}
      />

      {supplierSearch.trim() && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suppliers
            .filter((supplier: any) => {
              const search =
                supplierSearch
                  .trim()
                  .toLowerCase();

              const name =
                getSupplierName(
                  supplier
                );

              return (
                String(name || "")
                  .toLowerCase()
                  .includes(search) ||

                String(
                  supplier.supplierCode ||
                    ""
                )
                  .toLowerCase()
                  .includes(search) ||

                String(
                  supplier.phone || ""
                )
                  .toLowerCase()
                  .includes(search) ||

                String(
                  supplier.contactPerson ||
                    ""
                )
                  .toLowerCase()
                  .includes(search)
              );
            })
            .slice(0, 50)
            .map((supplier: any) => {
              const name =
                getSupplierName(
                  supplier
                );

              return (
                <button
                  key={String(
                    getSupplierId(
                      supplier
                    )
                  )}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();

                    update(
                      "supplier",
                      name
                    );

                    setSupplierSearch(
                      name
                    );
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                >
                  <div className="font-semibold">
                    {name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {supplier.supplierCode
                      ? `Code: ${supplier.supplierCode}`
                      : ""}
                    {supplier.phone
                      ? ` • Phone: ${supplier.phone}`
                      : ""}
                    {supplier.contactPerson
                      ? ` • Contact: ${supplier.contactPerson}`
                      : ""}
                  </div>
                </button>
              );
            })}

          {suppliers.filter(
            (supplier: any) => {
              const search =
                supplierSearch
                  .trim()
                  .toLowerCase();

              const name =
                getSupplierName(
                  supplier
                );

              return (
                String(name || "")
                  .toLowerCase()
                  .includes(search) ||
                String(
                  supplier.supplierCode ||
                    ""
                )
                  .toLowerCase()
                  .includes(search) ||
                String(
                  supplier.phone || ""
                )
                  .toLowerCase()
                  .includes(search) ||
                String(
                  supplier.contactPerson ||
                    ""
                )
                  .toLowerCase()
                  .includes(search)
              );
            }
          ).length === 0 && (
            <div className="px-4 py-3 text-gray-500">
              No supplier found.
            </div>
          )}
        </div>
      )}

      {!supplierSearch &&
        !form.supplier && (
          <div className="text-xs text-gray-500 mt-1">
            Type to search supplier
          </div>
        )}
    </div>
  );

      case "location":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Location
            </label>

            <input
              className={common}
              value={
                form.location ||
                ""
              }
              onChange={(e) =>
                update(
                  "location",
                  e.target.value
                )
              }
              placeholder="Rack / shelf / store"
            />
          </div>
        );

      case "barcode":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Barcode
            </label>

            <input
              className={common}
              value={
                form.barcode ||
                ""
              }
              onChange={(e) =>
                update(
                  "barcode",
                  e.target.value
                )
              }
            />
          </div>
        );

      case "unit":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Unit
            </label>

            <select
              className={common}
              value={
                form.unit || "PCS"
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
          </div>
        );

      case "description":
        return (
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">
              Description
            </label>

            <textarea
              rows={4}
              className={common}
              value={
                form.description ||
                ""
              }
              onChange={(e) =>
                update(
                  "description",
                  e.target.value
                )
              }
              placeholder="Additional information about this item"
            />
          </div>
        );

      case "status":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Status
            </label>

            <select
              className={common}
              value={
                form.status ||
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
          </div>
        );

      // =================================================
      // PURCHASE FIELDS
      // =================================================

      case "purchaseDate":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Purchase Date
              {Number(
                form.quantity ?? 0
              ) > 0 && (
                <span className="text-red-500">
                  {" "}*
                </span>
              )}
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
              className={common}
            />
          </div>
        );

      case "supplierInvoiceNumber":
        return (
          <div>
            <label className="block font-semibold mb-2">
              Supplier Invoice No.
            </label>

            <input
              type="text"
              value={
                supplierInvoiceNumber
              }
              onChange={(e) =>
                setSupplierInvoiceNumber(
                  e.target.value
                )
              }
              placeholder="Supplier invoice / bill number"
              className={common}
            />
          </div>
        );

      case "paymentMethod":
        return (
          <div>
            <label className="block font-semibold mb-2">
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
              className={common}
            >
              <option value="CASH">
                CASH
              </option>

              <option value="BANK">
                BANK
              </option>

              <option value="CREDIT">
                CREDIT
              </option>
            </select>
          </div>
        );

      case "paidAmount":
        return (
          <div>
            <label className="block font-semibold mb-2">
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
              className={common}
            />

            <p className="text-xs text-gray-500 mt-1">
              Purchase amount: Rs.{" "}
              {(
                Number(
                  form.purchasePrice ??
                    0
                ) *
                Math.floor(
                  Number(
                    form.quantity ??
                      0
                  )
                )
              ).toFixed(2)}
            </p>
          </div>
        );

      case "purchaseRemarks":
        return (
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">
              Purchase Remarks
            </label>

            <textarea
              rows={4}
              value={
                purchaseRemarks
              }
              onChange={(e) =>
                setPurchaseRemarks(
                  e.target.value
                )
              }
              placeholder="Optional purchase remarks"
              className={common}
            />
          </div>
        );

      default:
        return null;
    }
  }

  // =====================================================
  // PAGE UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Add Inventory Item
            </h1>

            <p className="text-gray-500 mt-1">
              Add products, spare parts
              and consumables to
              inventory.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() =>
                setShowSettings(
                  true
                )
              }
              className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
            >
              Field Settings
            </button>

              <button
              type="button"
              onClick={() =>
              navigate(returnPath)
              }
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Back
            </button>

          </div>

        </div>

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="bg-white rounded-xl shadow p-6 md:p-8"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {orderedFields.map(
              (field) => (
                <div
                  key={
                    field.key
                  }
                >
                  {renderField(
                    field.key
                  )}
                </div>
              )
            )}

          </div>

          {/* ACTIONS */}

          <div className="mt-8 flex gap-3">

            <button
              type="submit"
              disabled={
                saving
              }
              className={`px-6 py-3 rounded-lg text-white font-semibold ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving
                ? "Saving..."
                : "Save Item & Purchase"}
            </button>

              <button
              type="button"
              onClick={() =>
              navigate(returnPath)
             }
              className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

   {/* =================================================
    FIELD SETTINGS
================================================= */}

  {showSettings && (
  <FieldSettingsModal
    settings={fieldSettings}
    onChange={setFieldSettings}
    onClose={() => setShowSettings(false)}
    onReset={resetFields}
    onToggle={toggleField}
    onMove={moveField}

    categoryManagement={categoryManagement}
    loadingCategoryManagement={
      loadingCategoryManagement
    }

    newCategoryName={newCategoryName}
    setNewCategoryName={
      setNewCategoryName
    }

    editingCategoryId={editingCategoryId}
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

    </div>
  );
}

// =======================================================
// FIELD SETTINGS MODAL
// =======================================================

function FieldSettingsModal({
  settings,
  onChange,
  onClose,
  onReset,
  onToggle,
  onMove,
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
  settings: InventoryFieldSettings;

  onChange: Dispatch<
    SetStateAction<InventoryFieldSettings>
  >;

  onClose: () => void;

  onReset: () => void;

  onToggle: (
    key: InventoryFieldKey
  ) => void;

  onMove: (
    key: InventoryFieldKey,
    direction:
      | "up"
      | "down"
  ) => void;

  categoryManagement: any[];

  loadingCategoryManagement: boolean;

  newCategoryName: string;

  setNewCategoryName: (
    value: string
  ) => void;

  editingCategoryId: string | null;

  setEditingCategoryId: (
    value: string | null
  ) => void;

  editingCategoryName: string;

  setEditingCategoryName: (
    value: string
  ) => void;

  onAddCategory: () => void;

  onUpdateCategory: (
    id: string
  ) => void;

  onToggleCategory: (
    category: any
  ) => void;

  onDeleteCategory: (
    category: any
  ) => void;
}) {

  function saveAndClose() {
    saveInventoryFieldSettings(
      settings
    );

    onChange({
      ...settings,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">

        {/* TITLE */}

        <div className="flex justify-between items-center mb-5">

          <div>
            <h2 className="text-xl font-bold">
              Field Settings
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Show/hide fields and move
              them up or down.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="text-2xl text-gray-500 hover:text-gray-800"
          >
            ×
          </button>

        </div>

        {/* FIELDS */}

        <div className="space-y-2">

          {settings.order.map(
            (
              key,
              index
            ) => {

              const field =
                INVENTORY_FIELDS.find(
                  (
                    item
                  ) =>
                    item.key ===
                    key
                );

              if (!field) {
                return null;
              }

              return (
                <div
                  key={key}
                  className="border rounded-lg p-3 flex items-center gap-3 bg-gray-50"
                >

                  {/* VISIBILITY */}

                  <input
                    type="checkbox"
                    checked={
                      settings
                        .visibility[
                        key
                      ]
                    }
                    onChange={() =>
                      onToggle(
                        key
                      )
                    }
                    className="w-5 h-5"
                  />

                  {/* ORDER NUMBER */}

                  <div className="w-8 text-center text-sm text-gray-500 font-semibold">
                    {index + 1}
                  </div>

                  {/* NAME */}

                  <div className="flex-1 font-medium">
                    {field.label}
                  </div>

                  {/* MOVE UP */}

                  <button
                    type="button"
                    onClick={() =>
                      onMove(
                        key,
                        "up"
                      )
                    }
                    disabled={
                      index === 0
                    }
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
                    title="Move Up"
                  >
                    ↑
                  </button>

                  {/* MOVE DOWN */}

                  <button
                    type="button"
                    onClick={() =>
                      onMove(
                        key,
                        "down"
                      )
                    }
                    disabled={
                      index ===
                      settings
                        .order
                        .length -
                        1
                    }
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
                    title="Move Down"
                  >
                    ↓
                  </button>

                </div>
              );
            }
          )}

        </div>

        {/* LEGEND */}

        <div className="mt-4 text-sm text-gray-500">
          Checked = visible. Unchecked =
          hidden. Use ↑ and ↓ to change the
          field position.
        </div>

        {/* =================================================
    CATEGORY MANAGEMENT
================================================= */}

<div className="mt-6 border-t pt-6">

  <h3 className="text-lg font-bold text-gray-800">
    Category Management
  </h3>

  <p className="text-sm text-gray-500 mt-1 mb-4">
    Add, rename, activate/deactivate, or delete
    inventory categories.
  </p>

  {/* ADD CATEGORY */}

  <div className="flex flex-col sm:flex-row gap-2 mb-5">

    <input
      type="text"
      value={newCategoryName}
      onChange={(e) =>
        setNewCategoryName(
          e.target.value
        )
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onAddCategory();
        }
      }}
      placeholder="Enter new category name"
      className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <button
      type="button"
      onClick={onAddCategory}
      className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
    >
      + Add Category
    </button>

  </div>

  {/* CATEGORY LIST */}

  {loadingCategoryManagement ? (
    <div className="text-sm text-gray-500 py-4">
      Loading categories...
    </div>
  ) : categoryManagement.length === 0 ? (
    <div className="text-sm text-gray-500 border rounded-lg p-4">
      No categories found. Add your first category above.
    </div>
  ) : (
    <div className="space-y-2">

      {categoryManagement.map(
        (category: any) => {

          const isEditing =
            editingCategoryId ===
            category.id;

          return (
            <div
              key={category.id}
              className="border rounded-lg p-3 bg-gray-50"
            >

              <div className="flex flex-col md:flex-row md:items-center gap-3">

                {/* NAME */}

                <div className="flex-1">

                  {isEditing ? (
                    <input
                      type="text"
                      value={
                        editingCategoryName
                      }
                      onChange={(e) =>
                        setEditingCategoryName(
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <div className="font-semibold">
                      {category.name}
                    </div>
                  )}

                </div>

                {/* STATUS */}

                <div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      category.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {category.active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-2">

                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCategory(
                            String(
                              category.id
                            )
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(
                            null
                          );
                          setEditingCategoryName(
                            ""
                          );
                        }}
                        className="px-3 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
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
                        className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onToggleCategory(
                            category
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                      >
                        {category.active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDeleteCategory(
                            category
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </>
                  )}

                </div>

              </div>

            </div>
          );
        }
      )}

    </div>
  )}

</div>

        {/* BUTTONS */}

        <div className="mt-6 flex justify-between">

          <button
            type="button"
            onClick={
              onReset
            }
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Reset to Default
          </button>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={
                onClose
              }
              className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                saveAndClose
              }
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Settings
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}