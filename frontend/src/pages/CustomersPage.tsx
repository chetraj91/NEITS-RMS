import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCustomers,
  deleteCustomer,
} from "../api/customer";

export default function CustomersPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredCustomers(customers);
      return;
    }

    const keyword = search.toLowerCase();

    setFilteredCustomers(
      customers.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(keyword) ||
          c.phone?.includes(keyword) ||
          c.customerCode?.toLowerCase().includes(keyword) ||
          c.email?.toLowerCase().includes(keyword)
      )
    );
  }, [search, customers]);

  async function loadCustomers() {
    try {
      const res = await getCustomers();
      const data = res.data ?? [];
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Moved handleDelete inside the component so it can access loadCustomers
  async function handleDelete(customer: any) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.fullName}?`
    );

    if (!confirmed) return;

    try {
      await deleteCustomer(customer.id);
      alert("Customer deleted successfully.");
      await loadCustomers();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Unable to delete customer."
      );
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Customers
          </h1>
          <p className="text-gray-500 mt-1">
            Manage customer information
          </p>
        </div>

        <button
          onClick={() => navigate("/customers/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        </input>

        <div className="text-gray-600">
          Total Customers :
          <span className="font-bold text-blue-600 ml-2">
            {filteredCustomers.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading Customers...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-5 py-4 text-left">Code</th>
                <th className="px-5 py-4 text-left">Customer Name</th>
                <th className="px-5 py-4 text-left">Phone</th>
                <th className="px-5 py-4 text-left">Email</th>
                <th className="px-5 py-4 text-left">Address</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-5 py-4 font-semibold">
                    {customer.customerCode}
                  </td>
                  <td className="px-5 py-4">{customer.fullName}</td>
                  <td className="px-5 py-4">{customer.phone}</td>
                  <td className="px-5 py-4">{customer.email || "-"}</td>
                  <td className="px-5 py-4">{customer.address || "-"}</td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() =>
                        navigate(`/customers/view/${customer.id}`)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                    >
                      View
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/customers/edit/${customer.id}`)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(customer)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                  {/* Removed the extra duplicate </td> here */}
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredCustomers.length && (
            <div className="text-center py-10 text-gray-500">
              No customers found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}