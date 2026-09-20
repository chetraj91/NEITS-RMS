import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

import { getDeviceTypes } from "../../api/deviceType";
import { getBrandsByDeviceType } from "../../api/brand";

interface Props {
  data: any;

  onChange: (
    e: ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) => void;

  onDeviceTypeIdChange?: (
    deviceTypeId: string
  ) => void;

  fields?: DeviceField[];
}

interface DeviceField {
  id: string;
  deviceFieldId?: string;
  name: string;
  fieldType: string;
  placeholder?: string;
  required: boolean;
  active?: boolean;
  visible?: boolean;
  displayOrder: number;

  // 1 = 1/3 width
  // 2 = 2/3 width
  // 3 = full row
  columnSpan?: number;
}

export default function DeviceInformation({
  data,
  onChange,
  onDeviceTypeIdChange,
  fields = [],
}: Props) {
  // =====================================================
  // DEVICE TYPES
  // =====================================================

  const [deviceTypes, setDeviceTypes] =
    useState<any[]>([]);

  // =====================================================
  // BRANDS
  // =====================================================

  const [brands, setBrands] =
    useState<any[]>([]);

  // =====================================================
  // LOAD DEVICE TYPES
  // =====================================================

  useEffect(() => {
    loadDeviceTypes();
  }, []);

  // =====================================================
  // DEVICE TYPE CHANGE
  // =====================================================

  useEffect(() => {
    if (!data.deviceType) {
      setBrands([]);
      return;
    }

    const selectedType =
      deviceTypes.find(
        (item: any) =>
          item.name === data.deviceType
      );

    if (!selectedType) {
      console.log(
        "Device Type not found:",
        data.deviceType
      );

      setBrands([]);
      return;
    }

    console.log(
      "Selected Device Type:",
      selectedType
    );

    loadBrands(selectedType.id);
  }, [
    data.deviceType,
    deviceTypes,
  ]);

  // =====================================================
  // LOAD DEVICE TYPES
  // =====================================================

  async function loadDeviceTypes() {
    try {
      const res =
        await getDeviceTypes();

      console.log(
        "Device Types:",
        res.data?.data
      );

      setDeviceTypes(
        res.data?.data || []
      );
    } catch (error) {
      console.error(
        "Unable to load device types:",
        error
      );

      setDeviceTypes([]);
    }
  }

  // =====================================================
  // LOAD BRANDS
  // =====================================================

  async function loadBrands(
    deviceTypeId: string
  ) {
    try {

      const res =
  await getBrandsByDeviceType(
    deviceTypeId
  );

const brandsForDeviceType =
  res.data?.data || [];

console.log(
  "Brands for Device Type:",
  brandsForDeviceType
);

setBrands(
  brandsForDeviceType
);
    } catch (error) {
      console.error(
        "Unable to load brands:",
        error
      );

      setBrands([]);
    }
  }

  // =====================================================
  // DEVICE TYPE CHANGE
  // =====================================================

  function handleDeviceTypeChange(
    e: ChangeEvent<HTMLSelectElement>
  ) {
    const selectedId =
      e.target.value;

    const selectedType =
      deviceTypes.find(
        (item: any) =>
          item.id === selectedId
      );

    const deviceTypeName =
      selectedType?.name || "";

    console.log(
      "Selected Device Type ID:",
      selectedId
    );

    console.log(
      "Selected Device Type Name:",
      deviceTypeName
    );

    // Send actual Device Type ID
    // to NewRepairJobPage
    if (onDeviceTypeIdChange) {
      onDeviceTypeIdChange(
        selectedId
      );
    }

    // Store device type NAME
    // in job.deviceType
    const deviceTypeEvent = {
      target: {
        name: "deviceType",
        value: deviceTypeName,
        type: "select-one",
      },
    } as ChangeEvent<HTMLSelectElement>;

    onChange(
      deviceTypeEvent
    );

    // Clear old brand
    const brandEvent = {
      target: {
        name: "brand",
        value: "",
        type: "select-one",
      },
    } as ChangeEvent<HTMLSelectElement>;

    onChange(
      brandEvent
    );
  }

  // =====================================================
  // DEVICE INFORMATION FIELDS
  // =====================================================

  const visibleFields =
    fields
      .filter(
        (field: DeviceField) =>
          field.visible !== false &&
          field.active !== false
      )
      .sort(
        (
          a: DeviceField,
          b: DeviceField
        ) =>
          a.displayOrder -
          b.displayOrder
      );

  // =====================================================
  // GET COLUMN CLASS
  // =====================================================

  function getColumnClass(
    columnSpan?: number
  ) {
    const span =
      Number(
        columnSpan || 1
      );

    if (span === 3) {
      return "md:col-span-3";
    }

    if (span === 2) {
      return "md:col-span-2";
    }

    return "md:col-span-1";
  }

  // =====================================================
  // CONVERT FIELD NAME TO FORM NAME
  // =====================================================

  function convertFieldName(
    name: string
  ) {
    return name
      .trim()
      .replace(
        /[^a-zA-Z0-9]+(.)/g,
        (
          _match,
          character
        ) =>
          character.toUpperCase()
      )
      .replace(
        /^./,
        (character) =>
          character.toLowerCase()
      );
  }

  // =====================================================
  // FIELD WRAPPER
  // =====================================================

  function wrapField(
    field: DeviceField,
    content: React.ReactNode
  ) {
    const key =
      field.deviceFieldId ||
      field.id;

    return (
      <div
        key={key}
        className={getColumnClass(
          field.columnSpan
        )}
      >
        {content}
      </div>
    );
  }

  // =====================================================
  // RENDER DYNAMIC FIELD
  // =====================================================

  function renderField(
    field: DeviceField
  ) {
    const inputName =
      convertFieldName(
        field.name
      );

    const value =
      data[inputName] ?? "";

    const required =
      field.required;

    const fieldType =
      field.fieldType
        ?.toLowerCase() ||
      "text";

    // ===================================================
    // NUMBER
    // ===================================================

    if (
      fieldType === "number"
    ) {
      return wrapField(
        field,
        <>
          <label className="block mb-1 font-medium">
            {field.name}

            {required && (
              <span className="text-red-600 ml-1">
                *
              </span>
            )}
          </label>

          <input
            type="number"
            name={inputName}
            value={value}
            onChange={onChange}
            required={
              required
            }
            placeholder={
              field.placeholder ||
              field.name
            }
            className="border rounded-lg p-3 w-full"
          />
        </>
      );
    }

    // ===================================================
    // SELECT
    // ===================================================

    if (
      fieldType === "select" ||
      fieldType === "boolean"
    ) {
      return wrapField(
        field,
        <>
          <label className="block mb-1 font-medium">
            {field.name}

            {required && (
              <span className="text-red-600 ml-1">
                *
              </span>
            )}
          </label>

          <select
            name={inputName}
            value={value}
            onChange={onChange}
            required={
              required
            }
            className="border rounded-lg p-3 w-full"
          >
            <option value="">
              Select {field.name}
            </option>

            <option value="Yes">
              Yes
            </option>

            <option value="No">
              No
            </option>
          </select>
        </>
      );
    }

    // ===================================================
    // DATE
    // ===================================================

    if (
      fieldType === "date"
    ) {
      return wrapField(
        field,
        <>
          <label className="block mb-1 font-medium">
            {field.name}

            {required && (
              <span className="text-red-600 ml-1">
                *
              </span>
            )}
          </label>

          <input
            type="date"
            name={inputName}
            value={value}
            onChange={onChange}
            required={
              required
            }
            className="border rounded-lg p-3 w-full"
          />
        </>
      );
    }

    // ===================================================
    // TEXTAREA
    // ===================================================

    if (
      fieldType === "textarea"
    ) {
      return wrapField(
        field,
        <>
          <label className="block mb-1 font-medium">
            {field.name}

            {required && (
              <span className="text-red-600 ml-1">
                *
              </span>
            )}
          </label>

          <textarea
            name={inputName}
            value={value}
            onChange={onChange}
            required={
              required
            }
            placeholder={
              field.placeholder ||
              field.name
            }
            rows={4}
            className="border rounded-lg p-3 w-full"
          />
        </>
      );
    }

    // ===================================================
    // TEXT
    // ===================================================

    return wrapField(
      field,
      <>
        <label className="block mb-1 font-medium">
          {field.name}

          {required && (
            <span className="text-red-600 ml-1">
              *
            </span>
          )}
        </label>

        <input
          type="text"
          name={inputName}
          value={value}
          onChange={onChange}
          required={
            required
          }
          placeholder={
            field.placeholder ||
            field.name
          }
          className="border rounded-lg p-3 w-full"
        />
      </>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

      {/* =================================================
          TITLE
      ================================================= */}

      <h2 className="text-xl font-bold mb-6">
        Device Information
      </h2>

      {/* =================================================
          DEVICE TYPE
      ================================================= */}

      <div className="mb-5">

        <label className="block mb-1 font-medium">
          Device Type

          <span className="text-red-600 ml-1">
            *
          </span>
        </label>

        <select
          name="deviceType"
          value={
            deviceTypes.find(
              (item: any) =>
                item.name ===
                data.deviceType
            )?.id || ""
          }
          onChange={
            handleDeviceTypeChange
          }
          className="border rounded-lg p-3 w-full"
          required
        >
          <option value="">
            Select Device Type
          </option>

          {deviceTypes.map(
            (item: any) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            )
          )}
        </select>

      </div>

      {/* =================================================
          BRAND
      ================================================= */}

      {data.deviceType && (
        <div className="mb-5">

          <label className="block mb-1 font-medium">
            Brand

            <span className="text-red-600 ml-1">
              *
            </span>
          </label>

          <select
            name="brand"
            value={
              data.brand
            }
            onChange={onChange}
            className="border rounded-lg p-3 w-full"
            required
          >
            <option value="">
              Select Brand
            </option>

            {brands.map(
              (
                brand: any
              ) => (
                <option
                  key={
                    brand.id
                  }
                  value={
                    brand.name
                  }
                >
                  {
                    brand.name
                  }
                </option>
              )
            )}
          </select>

        </div>
      )}

      {/* =================================================
          DYNAMIC DEVICE INFORMATION FIELDS
      ================================================= */}

      {data.deviceType &&
        visibleFields.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {visibleFields.map(
              (field) =>
                renderField(
                  field
                )
            )}

          </div>

        )}

      {/* =================================================
          NO DEVICE INFORMATION FIELDS
      ================================================= */}

      {data.deviceType &&
        visibleFields.length === 0 && (

          <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 text-yellow-800 mt-4">

            No additional device information
            fields have been configured for
            this Device Type.

            <div className="mt-1">

              Go to:

              <strong className="ml-1">
                Settings → Device Type Fields
              </strong>

            </div>

          </div>

        )}

    </div>
  );
}