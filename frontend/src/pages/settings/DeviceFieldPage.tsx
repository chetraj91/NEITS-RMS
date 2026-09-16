import { useEffect, useState } from "react";

import {
  getDeviceFields,
  createDeviceField,
  updateDeviceField,
  deleteDeviceField,
} from "../../api/deviceField";

export default function DeviceFieldPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [editingId, setEditingId] = useState("");

  const [form, setForm] = useState({
    name: "",
    fieldType: "TEXT",
    category: "DEVICE_INFORMATION",
    placeholder: "",
    required: false,
    active: true,
  });

  // =================================
  // LOAD FIELDS
  // =================================

  useEffect(() => {
    loadFields();
  }, []);

  async function loadFields() {
    try {
      const res = await getDeviceFields();

      console.log("Device Fields:", res.data);

      setFields(res.data.data || []);
    } catch (err) {
      console.error("Unable to load device fields:", err);
    }
  }

  // =================================
  // SAVE FIELD
  // =================================

  async function saveField() {
    if (!form.name.trim()) {
      alert("Field Name is required");
      return;
    }

    try {
      console.log("Saving Device Field:", form);

      if (editingId) {
        await updateDeviceField(
          editingId,
          form
        );
      } else {
        await createDeviceField(form);
      }

      alert(
        editingId
          ? "Device Field updated successfully."
          : "Device Field created successfully."
      );

      resetForm();

      await loadFields();
    } catch (err: any) {
      console.error(
        "Unable to save device field:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
          "Unable to save field."
      );
    }
  }

  // =================================
  // EDIT FIELD
  // =================================

  function editField(item: any) {
    console.log("Editing Device Field:", item);

    setEditingId(item.id);

    setForm({
      name: item.name || "",
      fieldType: item.fieldType || "TEXT",

      // IMPORTANT:
      // Preserve the existing category.
      category:
        item.category ||
        "DEVICE_INFORMATION",

      placeholder:
        item.placeholder || "",

      required:
        Boolean(item.required),

      active:
        item.active !== false,
    });
  }

  // =================================
  // DELETE FIELD
  // =================================

  async function removeField(id: string) {
    if (
      !window.confirm(
        "Delete this field?"
      )
    ) {
      return;
    }

    try {
      await deleteDeviceField(id);

      alert(
        "Device Field deleted successfully."
      );

      await loadFields();
    } catch (err: any) {
      console.error(
        "Unable to delete field:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete field."
      );
    }
  }

  // =================================
  // RESET FORM
  // =================================

  function resetForm() {
    setEditingId("");

    setForm({
      name: "",
      fieldType: "TEXT",
      category: "DEVICE_INFORMATION",
      placeholder: "",
      required: false,
      active: true,
    });
  }

  // =================================
  // UI
  // =================================

  return (
    <div className="space-y-6">

      {/* PAGE TITLE */}

      <h1 className="text-3xl font-bold">
        Device Fields
      </h1>

      {/* =================================
          FORM
      ================================= */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold mb-5">
          {editingId
            ? "Edit Device Field"
            : "Add Device Field"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* FIELD NAME */}

          <div>
            <label className="block mb-1 font-medium">
              Field Name
            </label>

            <input
              className="border rounded-lg p-3 w-full"
              placeholder="Example: Hinges Broken"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </div>

          {/* FIELD TYPE */}

          <div>
            <label className="block mb-1 font-medium">
              Field Type
            </label>

            <select
              className="border rounded-lg p-3 w-full"
              value={form.fieldType}
              onChange={(e) =>
                setForm({
                  ...form,
                  fieldType:
                    e.target.value,
                })
              }
            >
              <option value="TEXT">
                TEXT
              </option>

              <option value="NUMBER">
                NUMBER
              </option>

              <option value="DATE">
                DATE
              </option>

              <option value="BOOLEAN">
                YES / NO
              </option>
            </select>
          </div>

          {/* CATEGORY */}

          <div>
            <label className="block mb-1 font-medium">
              Category
            </label>

            <select
              className="border rounded-lg p-3 w-full"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
            >
              <option value="DEVICE_INFORMATION">
                Device Information
              </option>

              <option value="PHYSICAL_CONDITION">
                Physical Condition
              </option>
            </select>
          </div>

          {/* PLACEHOLDER */}

          <div>
            <label className="block mb-1 font-medium">
              Placeholder
            </label>

            <input
              className="border rounded-lg p-3 w-full"
              placeholder="Example: Enter condition"
              value={form.placeholder}
              onChange={(e) =>
                setForm({
                  ...form,
                  placeholder:
                    e.target.value,
                })
              }
            />
          </div>

          {/* REQUIRED / ACTIVE */}

          <div className="flex gap-6 items-center">

            <label className="flex items-center gap-2 cursor-pointer">

              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) =>
                  setForm({
                    ...form,
                    required:
                      e.target.checked,
                  })
                }
              />

              Required
            </label>

            <label className="flex items-center gap-2 cursor-pointer">

              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    active:
                      e.target.checked,
                  })
                }
              />

              Active
            </label>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="mt-5 flex gap-3">

          <button
            type="button"
            onClick={saveField}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {editingId
              ? "Update"
              : "Add Field"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
          )}

        </div>

      </div>

      {/* =================================
          TABLE
      ================================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Field
              </th>

              <th className="text-left p-4">
                Type
              </th>

              <th className="text-left p-4">
                Category
              </th>

              <th className="text-left p-4">
                Placeholder
              </th>

              <th className="text-center p-4">
                Required
              </th>

              <th className="text-center p-4">
                Active
              </th>

              <th className="text-center p-4">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {fields.map((item) => (

              <tr
                key={item.id}
                className="border-t"
              >

                <td className="p-4">
                  {item.name}
                </td>

                <td className="p-4">
                  {item.fieldType}
                </td>

                <td className="p-4">

                  {item.category ===
                  "PHYSICAL_CONDITION"
                    ? "Physical Condition"
                    : "Device Information"}

                </td>

                <td className="p-4">
                  {item.placeholder || "-"}
                </td>

                <td className="text-center">
                  {item.required
                    ? "✓"
                    : ""}
                </td>

                <td className="text-center">
                  {item.active
                    ? "✓"
                    : ""}
                </td>

                <td className="text-center">

                  <button
                    type="button"
                    onClick={() =>
                      editField(item)
                    }
                    className="text-blue-600 mr-4"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeField(item.id)
                    }
                    className="text-red-600"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

