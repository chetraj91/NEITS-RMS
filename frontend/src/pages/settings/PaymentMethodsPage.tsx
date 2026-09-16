import {
  useEffect,
  useState,
} from "react";

import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
} from "../../api/paymentMethod";

type PaymentMethod = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
};

export default function PaymentMethodsPage() {
  const [methods, setMethods] =
    useState<PaymentMethod[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [name, setName] =
    useState("");

  const [code, setCode] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState(0);

  const [active, setActive] =
    useState(true);

  useEffect(() => {
    loadMethods();
  }, []);

  async function loadMethods() {
    try {
      setLoading(true);

      const response =
        await getPaymentMethods();

      const data =
        Array.isArray(response)
          ? response
          : response?.data ?? [];

      setMethods(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to load payment methods."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setCode("");
    setSortOrder(0);
    setActive(true);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(
    method: PaymentMethod
  ) {
    setEditingId(method.id);
    setName(method.name);
    setCode(method.code);
    setSortOrder(
      method.sortOrder
    );
    setActive(method.active);
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  }

  async function handleSave() {
    if (!name.trim()) {
      alert(
        "Payment method name is required."
      );
      return;
    }

    if (!code.trim()) {
      alert(
        "Payment method code is required."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        sortOrder:
          Number(sortOrder) || 0,
        active,
      };

      const response =
        editingId
          ? await updatePaymentMethod(
              editingId,
              payload
            )
          : await createPaymentMethod(
              payload
            );

      alert(
        response?.message ||
          "Payment method saved successfully."
      );

      setShowForm(false);
      resetForm();

      await loadMethods();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to save payment method."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    method: PaymentMethod
  ) {
    const confirmed =
      window.confirm(
        `Delete payment method "${method.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deletePaymentMethod(
        method.id
      );

      alert(
        "Payment method deleted successfully."
      );

      await loadMethods();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to delete payment method."
      );
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Payment Methods
            </h1>

            <p className="text-gray-500 mt-1">
              Manage payment methods used throughout NEITS RMS.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            + Add Payment Method
          </button>

        </div>

        <div className="bg-white rounded-2xl shadow border overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-4 text-left">
                  Method
                </th>

                <th className="border p-4 text-left">
                  Code
                </th>

                <th className="border p-4 text-center">
                  Order
                </th>

                <th className="border p-4 text-center">
                  Status
                </th>

                <th className="border p-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center text-gray-500"
                  >
                    Loading payment methods...
                  </td>
                </tr>
              ) : methods.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center text-gray-500"
                  >
                    No payment methods found.
                  </td>
                </tr>
              ) : (
                methods.map(
                  (method) => (
                    <tr
                      key={method.id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4 font-semibold">
                        {method.name}
                      </td>

                      <td className="p-4">
                        {method.code}
                      </td>

                      <td className="p-4 text-center">
                        {method.sortOrder}
                      </td>

                      <td className="p-4 text-center">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            method.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {method.active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      <td className="p-4 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              method
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              method
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7">

              <div className="flex justify-between items-center mb-6">

                <div>
                  <h2 className="text-2xl font-bold">
                    {editingId
                      ? "Edit Payment Method"
                      : "Add Payment Method"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="text-2xl text-gray-500"
                >
                  ×
                </button>

              </div>

              <div className="space-y-5">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Method Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Cash"
                    className="border rounded-lg p-3 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Code
                  </label>

                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(
                        e.target.value
                      )
                    }
                    placeholder="e.g. CASH"
                    className="border rounded-lg p-3 w-full uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(
                        Number(
                          e.target.value
                        ) || 0
                      )
                    }
                    className="border rounded-lg p-3 w-full"
                  />
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) =>
                      setActive(
                        e.target.checked
                      )
                    }
                    className="w-5 h-5"
                  />

                  <span className="font-medium">
                    Active
                  </span>
                </label>

              </div>

              <div className="flex justify-end gap-3 mt-7">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update"
                    : "Save"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}