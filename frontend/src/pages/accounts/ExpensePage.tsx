import {
  useEffect,
  useState,
} from "react";

import {
  createExpense,
  getExpenses,
} from "../../api/expense";

import {
  getPaymentMethods,
} from "../../api/paymentMethod";

type Expense = {
  id: string;
  expenseDate: string;
  category?: string | null;
  amount: number;
  paymentMethod?: string | null;
  remarks?: string | null;
  title: string;
  createdAt?: string;
};

export default function ExpensePage() {
  // =====================================================
  // DATA
  // =====================================================

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [
    paymentMethods,
    setPaymentMethods,
  ] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] =
    useState({
      expenseDate:
        new Date()
          .toISOString()
          .split("T")[0],

      title: "",

      category: "",

      amount: "",

      paymentMethod: "CASH",

      remarks: "",
    });

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    loadExpenses();
    loadPaymentMethods();
  }, []);

  async function loadExpenses() {
    try {
      setLoading(true);

      const res =
        await getExpenses();

      const data =
        Array.isArray(
          res?.data
        )
          ? res.data
          : [];

      setExpenses(data);
    } catch (error: any) {
      console.error(
        "Load expenses error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to load expenses."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPaymentMethods() {
    try {
      const response =
        await getPaymentMethods(true);

      const methods =
        Array.isArray(response)
          ? response
          : response?.data ?? [];

      const activeMethods =
        Array.isArray(methods)
          ? methods
          : [];

      setPaymentMethods(
        activeMethods
      );

      // Select the first active method
      // if the current one is not available.
      if (
        activeMethods.length > 0 &&
        !activeMethods.some(
          (method: any) =>
            method.code ===
            form.paymentMethod
        )
      ) {
        setForm(
          (current) => ({
            ...current,
            paymentMethod:
              activeMethods[0]
                .code,
          })
        );
      }
    } catch (error) {
      console.error(
        "Load payment methods error:",
        error
      );
    }
  }

  // =====================================================
  // FORM CHANGE
  // =====================================================

  function updateForm(
    field: string,
    value: string
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  // =====================================================
  // RESET FORM
  // =====================================================

  function resetForm() {
    setForm({
      expenseDate:
        new Date()
          .toISOString()
          .split("T")[0],

      title: "",

      category: "",

      amount: "",

      paymentMethod:
        paymentMethods.length > 0
          ? paymentMethods[0]
              .code
          : "CASH",

      remarks: "",
    });
  }

  // =====================================================
  // SAVE EXPENSE
  // =====================================================

  async function saveExpense() {
    const title =
      form.title.trim();

    const category =
      form.category.trim();

    const amount =
      Number(
        form.amount
      );

    const remarks =
      form.remarks.trim();

    if (!title) {
      alert(
        "Expense title is required."
      );
      return;
    }

    if (!form.expenseDate) {
      alert(
        "Expense date is required."
      );
      return;
    }

    if (!category) {
      alert(
        "Expense category is required."
      );
      return;
    }

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      alert(
        "Enter a valid expense amount."
      );
      return;
    }

    if (
      !form.paymentMethod
    ) {
      alert(
        "Please select a payment method."
      );
      return;
    }

    try {
      setSaving(true);

      await createExpense({
        title,

        expenseDate:
          form.expenseDate,

        category,

        amount,

        paymentMethod:
          form.paymentMethod,

        remarks:
          remarks || null,
      });

      alert(
        "Expense created successfully."
      );

      resetForm();

      await loadExpenses();
    } catch (error: any) {
      console.error(
        "Create expense error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to create expense."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // CURRENCY
  // =====================================================

  function formatAmount(
    value: number
  ) {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="max-w-7xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-800">
            Expenses
          </h1>

          <p className="text-gray-500 mt-1">
            Record and review business expenses.
          </p>

        </div>

        {/* =================================================
            EXPENSE FORM
        ================================================= */}

        <div className="bg-white rounded-2xl shadow border p-6 mb-8">

          <h2 className="text-xl font-bold text-slate-800 mb-6">
            Add Expense
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* DATE */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Expense Date
              </label>

              <input
                type="date"
                value={
                  form.expenseDate
                }
                onChange={(e) =>
                  updateForm(
                    "expenseDate",
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
              />
            </div>

            {/* TITLE */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Expense Title
              </label>

              <input
                type="text"
                placeholder="e.g. Office Rent"
                value={form.title}
                onChange={(e) =>
                  updateForm(
                    "title",
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>

              <input
                type="text"
                placeholder="e.g. Rent, Electricity, Salary"
                value={form.category}
                onChange={(e) =>
                  updateForm(
                    "category",
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
              />
            </div>

            {/* AMOUNT */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                  updateForm(
                    "amount",
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
              />
            </div>

            {/* PAYMENT METHOD */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>

              <select
                value={
                  form.paymentMethod
                }
                onChange={(e) =>
                  updateForm(
                    "paymentMethod",
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
              >
                {paymentMethods.length ===
                0 ? (
                  <option value="">
                    No payment methods configured
                  </option>
                ) : (
                  paymentMethods.map(
                    (
                      method: any
                    ) => (
                      <option
                        key={
                          method.id
                        }
                        value={
                          method.code
                        }
                      >
                        {
                          method.name
                        }
                      </option>
                    )
                  )
                )}
              </select>
            </div>

            {/* REMARKS */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Remarks
              </label>

              <input
                type="text"
                placeholder="Optional remarks"
                value={
                  form.remarks
                }
                onChange={(e) =>
                  updateForm(
                    "remarks",
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full"
              />
            </div>

          </div>

          {/* BUTTON */}

          <div className="flex justify-end mt-6">

            <button
              type="button"
              onClick={
                saveExpense
              }
              disabled={
                saving
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-lg font-semibold"
            >
              {saving
                ? "Saving..."
                : "Save Expense"}
            </button>

          </div>

        </div>

        {/* =================================================
            EXPENSE LIST
        ================================================= */}

        <div className="bg-white rounded-2xl shadow border overflow-hidden">

          <div className="p-5 border-b">

            <h2 className="text-xl font-bold text-slate-800">
              Expense History
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="border p-3 text-left">
                    Date
                  </th>

                  <th className="border p-3 text-left">
                    Title
                  </th>

                  <th className="border p-3 text-left">
                    Category
                  </th>

                  <th className="border p-3 text-left">
                    Payment
                  </th>

                  <th className="border p-3 text-right">
                    Amount
                  </th>

                  <th className="border p-3 text-left">
                    Remarks
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500"
                    >
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenses.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500"
                    >
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  expenses.map(
                    (expense) => (
                      <tr
                        key={
                          expense.id
                        }
                        className="border-t hover:bg-gray-50"
                      >

                        <td className="p-3 border">
                          {expense.expenseDate
                            ? new Date(
                                expense.expenseDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="p-3 border font-medium">
                          {
                            expense.title
                          }
                        </td>

                        <td className="p-3 border">
                          {
                            expense.category ||
                            "-"
                          }
                        </td>

                        <td className="p-3 border">
                          {
                            expense.paymentMethod ||
                            "-"
                          }
                        </td>

                        <td className="p-3 border text-right font-semibold text-red-600">
                          Rs.{" "}
                          {formatAmount(
                            expense.amount
                          )}
                        </td>

                        <td className="p-3 border">
                          {
                            expense.remarks ||
                            "-"
                          }
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}