export type InventoryFieldKey =
  | "itemCode"
  | "itemName"
  | "itemType"
  | "category"
  | "brand"
  | "model"
  | "purchasePrice"
  | "sellingPrice"
  | "quantity"
  | "minimumStock"
  | "supplier"
  | "location"
  | "barcode"
  | "unit"
  | "description"
  | "status"
  | "purchaseDate"
  | "supplierInvoiceNumber"
  | "paymentMethod"
  | "paidAmount"
  | "purchaseRemarks";

export interface InventoryFieldDefinition {
  key: InventoryFieldKey;
  label: string;
  defaultVisible: boolean;
}

export const INVENTORY_FIELDS: InventoryFieldDefinition[] = [
  {
    key: "itemCode",
    label: "Item Code",
    defaultVisible: true,
  },
  {
    key: "itemName",
    label: "Item Name",
    defaultVisible: true,
  },
  {
    key: "itemType",
    label: "Item Type",
    defaultVisible: true,
  },
  {
    key: "category",
    label: "Category",
    defaultVisible: true,
  },
  {
    key: "brand",
    label: "Brand",
    defaultVisible: true,
  },
  {
    key: "model",
    label: "Model",
    defaultVisible: true,
  },
  {
    key: "purchasePrice",
    label: "Purchase Price",
    defaultVisible: true,
  },
  {
    key: "sellingPrice",
    label: "Selling Price",
    defaultVisible: true,
  },
  {
    key: "quantity",
    label: "Quantity",
    defaultVisible: true,
  },
  {
    key: "minimumStock",
    label: "Minimum Stock",
    defaultVisible: true,
  },
  {
    key: "supplier",
    label: "Supplier",
    defaultVisible: true,
  },
  {
    key: "location",
    label: "Location",
    defaultVisible: true,
  },
  {
    key: "barcode",
    label: "Barcode",
    defaultVisible: true,
  },
  {
    key: "unit",
    label: "Unit",
    defaultVisible: true,
  },
  {
    key: "description",
    label: "Description",
    defaultVisible: true,
  },
  {
    key: "status",
    label: "Status",
    defaultVisible: true,
  },

  // =====================================================
  // PURCHASE INFORMATION
  // =====================================================

  {
    key: "purchaseDate",
    label: "Purchase Date",
    defaultVisible: true,
  },
  {
    key: "supplierInvoiceNumber",
    label: "Supplier Invoice No.",
    defaultVisible: true,
  },
  {
    key: "paymentMethod",
    label: "Payment Method",
    defaultVisible: true,
  },
  {
    key: "paidAmount",
    label: "Paid Amount",
    defaultVisible: true,
  },
  {
    key: "purchaseRemarks",
    label: "Purchase Remarks",
    defaultVisible: true,
  },
];

const STORAGE_KEY =
  "neits_rms_inventory_field_settings";

export type InventoryFieldVisibility =
  Record<InventoryFieldKey, boolean>;

export type InventoryFieldOrder =
  InventoryFieldKey[];

export interface InventoryFieldSettings {
  visibility: InventoryFieldVisibility;
  order: InventoryFieldOrder;
}

export function getDefaultInventoryFieldVisibility(): InventoryFieldVisibility {
  return INVENTORY_FIELDS.reduce(
    (result, field) => {
      result[field.key] =
        field.defaultVisible;

      return result;
    },
    {} as InventoryFieldVisibility
  );
}

export function getDefaultInventoryFieldOrder(): InventoryFieldOrder {
  return INVENTORY_FIELDS.map(
    (field) => field.key
  );
}

export function getDefaultInventoryFieldSettings(): InventoryFieldSettings {
  return {
    visibility:
      getDefaultInventoryFieldVisibility(),

    order:
      getDefaultInventoryFieldOrder(),
  };
}

export function getInventoryFieldSettings(): InventoryFieldSettings {
  const defaults =
    getDefaultInventoryFieldSettings();

  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return defaults;
    }

    const saved =
      JSON.parse(
        raw
      ) as Partial<InventoryFieldSettings>;

    const savedVisibility =
      saved.visibility || {};

    const savedOrder =
      Array.isArray(saved.order)
        ? saved.order
        : [];

    const validKeys = new Set(
      INVENTORY_FIELDS.map(
        (field) => field.key
      )
    );

    const cleanedOrder =
      savedOrder.filter(
        (key): key is InventoryFieldKey =>
          validKeys.has(key as InventoryFieldKey)
      );

    // Add any new fields that were
    // not present in old settings.
    for (const field of INVENTORY_FIELDS) {
      if (
        !cleanedOrder.includes(
          field.key
        )
      ) {
        cleanedOrder.push(
          field.key
        );
      }
    }

    return {
      visibility: {
        ...defaults.visibility,
        ...savedVisibility,
      },

      order: cleanedOrder,
    };
  } catch {
    return defaults;
  }
}

export function saveInventoryFieldSettings(
  settings: InventoryFieldSettings
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(settings)
  );

  window.dispatchEvent(
    new CustomEvent(
      "neits-inventory-field-settings-changed"
    )
  );
}

// =====================================================
// BACKWARD-COMPATIBILITY HELPERS
// =====================================================

export function getInventoryFieldVisibility(): InventoryFieldVisibility {
  return getInventoryFieldSettings()
    .visibility;
}

export function saveInventoryFieldVisibility(
  visibility: InventoryFieldVisibility
) {
  const current =
    getInventoryFieldSettings();

  saveInventoryFieldSettings({
    visibility,
    order: current.order,
  });
}

export function resetInventoryFieldVisibility() {
  saveInventoryFieldSettings(
    getDefaultInventoryFieldSettings()
  );
}