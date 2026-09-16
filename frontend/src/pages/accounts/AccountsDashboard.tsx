import { Link } from "react-router-dom";

export default function AccountsDashboard() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-8">
        Accounts Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-6 mb-10">

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Today's Cash In</h3>
          <p className="text-2xl font-bold text-green-600">
            Rs. 0
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Today's Cash Out</h3>
          <p className="text-2xl font-bold text-red-600">
            Rs. 0
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Repair Income</h3>
          <p className="text-2xl font-bold">
            Rs. 0
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Outstanding</h3>
          <p className="text-2xl font-bold text-orange-600">
            Rs. 0
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Customers Due</h3>
          <p className="text-2xl font-bold">
            0
          </p>
        </div>

      </div>

 {/* Menu Cards */}

<div className="grid grid-cols-6 gap-3">

  <Link
    to="/accounts/customer-ledger"
    className="bg-blue-600 text-white rounded-xl shadow p-5 text-center hover:bg-blue-700"
  >
    <h2 className="text-lg font-bold">
      Customer Ledger
    </h2>
  </Link>

  <Link
  to="/accounts/supplier-ledger"
  className="bg-orange-700 text-white rounded-xl shadow p-6 text-center hover:bg-orange-800"
>
  <h2 className="text-lg font-bold">
    Supplier Ledger
  </h2>
</Link>

  <Link
    to="/accounts/purchase-party-ledger"
    className="bg-orange-600 text-white rounded-xl shadow p-5 text-center hover:bg-orange-700"
  >
    <h2 className="text-lg font-bold">
      Purchase Party Ledger
    </h2>
  </Link>

  <Link
    to="/accounts/cash-book"
    className="bg-green-600 text-white rounded-xl shadow p-5 text-center hover:bg-green-700"
  >
    <h2 className="text-lg font-bold">
      Cash Book
    </h2>
  </Link>

  <Link
    to="/accounts/expenses"
    className="bg-red-600 text-white rounded-xl shadow p-5 text-center hover:bg-red-700"
  >
    <h2 className="text-lg font-bold">
      Expenses
    </h2>
  </Link>

  <Link
    to="/accounts/reports"
    className="bg-purple-600 text-white rounded-xl shadow p-5 text-center hover:bg-purple-700"
  >
    <h2 className="text-lg font-bold">
      Reports
    </h2>
  </Link>

</div>

    </div>
  );
}

