import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  getExpenses,
  createExpense,
} from "../../api/expense";

import {
  getPaymentMethods,
} from "../../api/paymentMethod";

type Expense = {
  id: string;
  expenseDate: string;
  category?: string;
  amount: number;
  paymentMethod?: string;
  remarks?: string;
  title: string;
};

const EXPENSE_CATEGORIES = [
  "Rent",
  "Electricity",
  "Internet",
  "Salary",
  "Transport",
  "Office",
  "Maintenance",
  "Repair",
  "Purchase",
  "Food",
  "Bank Charges",
  "Other",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  // =====================================================
  // FORM
  // =====================================================

  const [expenseDate, setExpenseDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [title, setTitle] =
    useState("");

  const [category, setCategory] =
    useState("Other");

  const [amount, setAmount] =
    useState(0);

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

    const [
  paymentMethods,
  setPaymentMethods,
] = useState<any[]>([]);

  const [remarks, setRemarks] =
    useState("");

  // =====================================================
  // FILTERS
  // =====================================================

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [filterCategory, setFilterCategory] =
    useState("");

  // =====================================================
  // LOAD
  // =====================================================

 useEffect(() => {
  loadExpenses();
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
  } catch (error) {
    console.error(
      "Failed to load payment methods:",
      error
    );
  }
}

  async function loadExpenses() {
    try {
      setLoading(true);

      const response =
        await getExpenses();

      const data =
        Array.isArray(response)
          ? response
          : Array.isArray(
              response?.data
            )
          ? response.data
          : [];

      setExpenses(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load expenses:",
        error
      );

      alert(
        "Unable to load expenses."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // RESET FORM
  // =====================================================

  function resetForm() {
    setExpenseDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setTitle("");
    setCategory("Other");
    setAmount(0);
    setPaymentMethod("CASH");
    setRemarks("");
  }

  // =====================================================
  // CREATE EXPENSE
  // =====================================================

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    const numericAmount =
      Number(amount);

    if (!title.trim()) {
      alert(
        "Expense title is required."
      );
      return;
    }

    if (!expenseDate) {
      alert(
        "Expense date is required."
      );
      return;
    }

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      alert(
        "Expense amount must be greater than zero."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await createExpense({
          title:
            title.trim(),

          expenseDate,

          category:
            category.trim(),

          amount:
            numericAmount,

          paymentMethod,

          remarks:
            remarks.trim() ||
            null,
        });

      alert(
        response?.message ||
          "Expense created successfully."
      );

      resetForm();
      setShowForm(false);

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
  // FILTERED EXPENSES
  // =====================================================

  const filteredExpenses =
    useMemo(() => {
      return expenses.filter(
        (expense) => {
          if (
            fromDate &&
            new Date(
              expense.expenseDate
            ) <
              new Date(
                `${fromDate}T00:00:00`
              )
          ) {
            return false;
          }

          if (
            toDate &&
            new Date(
              expense.expenseDate
            ) >
              new Date(
                `${toDate}T23:59:59`
              )
          ) {
            return false;
          }

          if (
            filterCategory &&
            expense.category !==
              filterCategory
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      expenses,
      fromDate,
      toDate,
      filterCategory,
    ]);

  // =====================================================
  // TOTALS
  // =====================================================

  const filteredTotal =
    filteredExpenses.reduce(
      (
        sum,
        expense
      ) =>
        sum +
        Number(
          expense.amount || 0
        ),
      0
    );

  const todayString =
    new Date()
      .toISOString()
      .split("T")[0];

  const todayExpenses =
    expenses
      .filter(
        (expense) =>
          expense.expenseDate &&
          new Date(
            expense.expenseDate
          )
            .toISOString()
            .split("T")[0] ===
            todayString
      )
      .reduce(
        (
          sum,
          expense
        ) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );

  // =====================================================
  // FORMAT
  // =====================================================

  function money(
    value: number
  ) {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  function formatDate(
    value: string
  ) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString();
  }

  function clearFilters() {
    setFromDate("");
    setToDate("");
    setFilterCategory("");
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Expenses
          </h1>

          <p className="text-gray-500 mt-1">
            Record and manage business expenses
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow font-semibold"
        >
          + Add Expense
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-gray-500">
            Today's Expenses
          </p>

          <h2 className="text-3xl font-bold text-orange-600 mt-1">
            Rs.{" "}
            {money(
              todayExpenses
            )}
          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-gray-500">
            Filtered Total
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-1">
            Rs.{" "}
            {money(
              filteredTotal
            )}
          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-gray-500">
            Entries
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-1">
            {
              filteredExpenses.length
            }
          </h2>

        </div>

      </div>

      {/* FILTERS */}

      <div className="bg-white rounded-xl shadow p-5 mb-8">

        <div className="flex flex-wrap items-end gap-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Category
            </label>

            <select
              value={
                filterCategory
              }
              onChange={(e) =>
                setFilterCategory(
                  e.target.value
                )
              }
              className="border rounded-lg p-3 min-w-[180px]"
            >
              <option value="">
                All Categories
              </option>

              {EXPENSE_CATEGORIES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>
          </div>

          <button
            type="button"
            onClick={
              clearFilters
            }
            className="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded-lg"
          >
            Clear Filters
          </button>

        </div>

      </div>

      {/* EXPENSE LEDGER */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-5 border-b">

          <h2 className="text-xl font-bold">
            Expense Ledger
          </h2>

        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading expenses...
          </div>
        ) : (
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
                    Payment Method
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

                {filteredExpenses.map(
                  (expense) => (
                    <tr
                      key={
                        expense.id
                      }
                      className="hover:bg-gray-50"
                    >

                      <td className="border p-3">
                        {formatDate(
                          expense.expenseDate
                        )}
                      </td>

                      <td className="border p-3 font-semibold">
                        {
                          expense.title
                        }
                      </td>

                      <td className="border p-3">
                        {
                          expense.category ||
                          "-"
                        }
                      </td>

                      <td className="border p-3">
                        {
                          expense.paymentMethod ||
                          "CASH"
                        }
                      </td>

                      <td className="border p-3 text-right text-red-600 font-semibold">
                        Rs.{" "}
                        {money(
                          Number(
                            expense.amount
                          )
                        )}
                      </td>

                      <td className="border p-3">
                        {
                          expense.remarks ||
                          "-"
                        }
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

        {!loading &&
          !filteredExpenses.length && (
            <div className="py-12 text-center text-gray-500">
              No expenses match the selected filters.
            </div>
          )}

      </div>

      {/* =================================================
          ADD EXPENSE MODAL
      ================================================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-7">

            <div className="flex justify-between items-center mb-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Add Expense
                </h2>

                <p className="text-gray-500 mt-1">
                  Record a business expense
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                disabled={saving}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              {/* DATE */}

              <div className="mb-5">

                <label className="block text-sm font-medium">
                  Expense Date
                </label>

                <input
                  type="date"
                  value={
                    expenseDate
                  }
                  onChange={(e) =>
                    setExpenseDate(
                      e.target.value
                    )
                  }
                  className="border rounded-lg p-3 w-full mt-1"
                  required
                />

              </div>

              {/* TITLE */}

              <div className="mb-5">

                <label className="block text-sm font-medium">
                  Expense Title
                </label>

                <input
                  type="text"
                  value={
                    title
                  }
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Electricity Bill"
                  className="border rounded-lg p-3 w-full mt-1"
                  required
                />

              </div>

              {/* CATEGORY */}

              <div className="mb-5">

                <label className="block text-sm font-medium">
                  Category
                </label>

                <select
                  value={
                    category
                  }
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="border rounded-lg p-3 w-full mt-1"
                >

                  {EXPENSE_CATEGORIES.map(
                    (item) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PAYMENT METHOD */}

              <div className="mb-5">

                <label className="block text-sm font-medium">
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

              {/* AMOUNT */}

              <div className="mb-5">

                <label className="block text-sm font-medium">
                  Amount (Rs.)
                </label>

                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={
                    amount
                  }
                  onChange={(e) =>
                    setAmount(
                      Math.max(
                        0,
                        Number(
                          e.target.value
                        ) || 0
                      )
                    )
                  }
                  className="border rounded-lg p-3 w-full mt-1"
                  required
                />

              </div>

              {/* REMARKS */}

              <div className="mb-6">

                <label className="block text-sm font-medium">
                  Remarks
                </label>

                <textarea
                  rows={4}
                  value={
                    remarks
                  }
                  onChange={(e) =>
                    setRemarks(
                      e.target.value
                    )
                  }
                  placeholder="Optional remarks"
                  className="border rounded-lg p-3 w-full mt-1"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  disabled={saving}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  {saving
                    ? "Saving..."
                    : "Save Expense"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}