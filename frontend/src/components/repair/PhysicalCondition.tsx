import type { ChangeEvent } from "react";

interface PhysicalField {
  deviceFieldId?: string;
  id?: string;
  name?: string;
  fieldType?: string;
  placeholder?: string;
  required?: boolean;
  visible?: boolean;
  displayOrder?: number;
}

interface Props {
  data: any;

  onChange: (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;

  fields: PhysicalField[];
}

// =====================================================
// CONVERT FIELD NAME TO FORM FIELD NAME
// =====================================================

function getFieldKey(name?: string) {
  if (!name) {
    return "";
  }

  return name
    .trim()
    .replace(
      /[^a-zA-Z0-9]+(.)/g,
      (_match, character) =>
        character.toUpperCase()
    )
    .replace(
      /^./,
      (character) =>
        character.toLowerCase()
    );
}

// =====================================================
// PHYSICAL CONDITION
// =====================================================

export default function PhysicalCondition({
  data,
  onChange,
  fields,
}: Props) {
  // ---------------------------------------------------
  // Safety check
  // ---------------------------------------------------

  const safeFields = Array.isArray(fields)
    ? fields
    : [];

  // ---------------------------------------------------
  // Only visible configured fields
  // ---------------------------------------------------

  const visibleFields = safeFields
    .filter(
      (field) =>
        field &&
        field.visible !== false &&
        typeof field.name === "string" &&
        field.name.trim() !== ""
    )
    .sort(
      (a, b) =>
        (a.displayOrder ?? 0) -
        (b.displayOrder ?? 0)
    );

  console.log(
    "PhysicalCondition fields:",
    safeFields
  );

  console.log(
    "PhysicalCondition valid fields:",
    visibleFields
  );

  // ===================================================
  // RENDER FIELD
  // ===================================================

  function renderField(field: PhysicalField) {
    const fieldName = getFieldKey(field.name);

    if (!fieldName) {
      return null;
    }

    const fieldType =
      field.fieldType?.toLowerCase() ||
      "text";

    const value =
      data?.[fieldName] ?? "";

    const required =
      field.required === true;

    const label =
      field.name || "Field";

    const placeholder =
      field.placeholder ||
      `Enter ${label}`;

    // -------------------------------------------------
    // SELECT
    // -------------------------------------------------

    if (fieldType === "select") {
      return (
        <div
          key={
            field.deviceFieldId ||
            field.id ||
            fieldName
          }
        >
          <label className="block mb-1 font-medium">
            {label}

            {required && (
              <span className="text-red-600 ml-1">
                *
              </span>
            )}
          </label>

          <select
            name={fieldName}
            value={value}
            onChange={onChange}
            required={required}
            className="border rounded-lg p-3 w-full"
          >
            <option value="">
              Select {label}
            </option>

            <option value="Good">
              Good
            </option>

            <option value="Normal">
              Normal
            </option>

            <option value="Damaged">
              Damaged
            </option>

            <option value="Missing">
              Missing
            </option>

            <option value="Not Applicable">
              Not Applicable
            </option>
          </select>
        </div>
      );
    }

    // -------------------------------------------------
    // NUMBER
    // -------------------------------------------------

    if (fieldType === "number") {
      return (
        <div
          key={
            field.deviceFieldId ||
            field.id ||
            fieldName
          }
        >
          <label className="block mb-1 font-medium">
            {label}

            {required && (
              <span className="text-red-600 ml-1">
                *
              </span>
            )}
          </label>

          <input
            type="number"
            name={fieldName}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="border rounded-lg p-3 w-full"
          />
        </div>
      );
    }

    // -------------------------------------------------
    // BOOLEAN / CHECKBOX
    // -------------------------------------------------

    if (
      fieldType === "boolean" ||
      fieldType === "checkbox"
    ) {
      return (
        <label
          key={
            field.deviceFieldId ||
            field.id ||
            fieldName
          }
          className="flex items-center gap-3 cursor-pointer"
        >
          <input
            type="checkbox"
            name={fieldName}
            checked={Boolean(value)}
            onChange={onChange}
            className="w-5 h-5 accent-blue-600"
          />

          <span className="font-medium">
            {label}

            {required && (
              <span className="text-red-600 ml-1">
                *
              </span>
            )}
          </span>
        </label>
      );
    }

    // -------------------------------------------------
    // TEXTAREA
    // -------------------------------------------------

    if (
      fieldType === "textarea" ||
      fieldType === "longtext"
    ) {
      return (
        <div
          key={
            field.deviceFieldId ||
            field.id ||
            fieldName
          }
        >
          <label className="block mb-1 font-medium">
            {label}

            {required && (
              <span className="text-red-600 ml-1">
                *
              </span>
            )}
          </label>

          <textarea
            name={fieldName}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={3}
            className="border rounded-lg p-3 w-full"
          />
        </div>
      );
    }

    // -------------------------------------------------
    // DEFAULT TEXT
    // -------------------------------------------------

    return (
      <div
        key={
          field.deviceFieldId ||
          field.id ||
          fieldName
        }
      >
        <label className="block mb-1 font-medium">
          {label}

          {required && (
            <span className="text-red-600 ml-1">
              *
            </span>
          )}
        </label>

        <input
          type="text"
          name={fieldName}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="border rounded-lg p-3 w-full"
        />
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-6">
        Physical Condition
      </h2>

      {visibleFields.length === 0 ? (
        <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 text-yellow-800">
          No physical condition fields have
          been configured for this device type.
          <div className="mt-1">
            Go to:
            <strong className="ml-1">
              Settings → Device Type Fields
            </strong>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleFields.map(
            (field) =>
              renderField(field)
          )}
        </div>
      )}
    </div>
  );
}

