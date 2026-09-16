import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
interface Props {
  onSelect: (customer: any) => void;
}

export default function CustomerSearch({ onSelect }: Props) {
    const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setCustomers([]);
      return;
    }

    const timer = setTimeout(() => {
      searchCustomer();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  async function searchCustomer() {
    try {
      setLoading(true);

      const res = await api.get(
        `/customers/search?q=${encodeURIComponent(query)}`
      );

      setCustomers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-4">
        Search Customer
      </h2>

      <input
        className="w-full border rounded-lg p-3"
        placeholder="Search by Name / Phone / Customer Code"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && (
        <p className="mt-3 text-gray-500">
          Searching...
        </p>
      )}

      {!loading && customers.length > 0 && (

        <div className="mt-5 space-y-3">

          {customers.map((customer) => (

            <div
              key={customer.id}
              className="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer"
              onClick={() => onSelect(customer)}
            >

              <div className="font-bold">
                {customer.fullName}
              </div>

              <div className="text-sm text-gray-500">
                {customer.customerCode}
              </div>

              <div className="text-sm">
                {customer.phone}
              </div>

            </div>

          ))}

        </div>

      )}

      {!loading &&
        query.length >= 2 &&
        customers.length === 0 && (

          <div className="mt-5">

            <p>No customer found.</p>

            <button
            type="button"
          onClick={() =>
          navigate("/customers/new")
         }
         className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
         >
          + Create New Customer
           </button>

          </div>

        )}

    </div>
  );
}

