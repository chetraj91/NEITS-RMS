import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomer } from "../api/customer";

export default function CustomerViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    if (!id) return;

    try {
      setLoading(true);

      const res = await getCustomer(id);

      setCustomer(res.data);
    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Unable to load customer."
      );

      navigate("/customers");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-xl text-gray-500">
          Loading Customer...
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8">
        <div className="text-xl text-red-500">
          Customer not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Customer Details
          </h1>

          <p className="text-gray-500 mt-1">
            View customer information
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              `/customers/edit/${customer.id}`
            )
          }
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          Edit Customer
        </button>

      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="text-sm text-gray-500">
              Customer Code
            </label>

            <p className="text-lg font-semibold mt-1">
              {customer.customerCode || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Customer Name
            </label>

            <p className="text-lg font-semibold mt-1">
              {customer.fullName || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Company Name
            </label>

            <p className="text-lg mt-1">
              {customer.companyName || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Mobile Number
            </label>

            <p className="text-lg mt-1">
              {customer.phone || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Alternate Phone
            </label>

            <p className="text-lg mt-1">
              {customer.alternatePhone || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Email
            </label>

            <p className="text-lg mt-1">
              {customer.email || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              PAN / VAT
            </label>

            <p className="text-lg mt-1">
              {customer.panVat || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Address
            </label>

            <p className="text-lg mt-1">
              {customer.address || "-"}
            </p>
          </div>

        </div>

        <div className="mt-6">
          <label className="text-sm text-gray-500">
            Notes
          </label>

          <p className="mt-1 whitespace-pre-wrap">
            {customer.notes || "-"}
          </p>
        </div>

        <div className="flex gap-4 mt-8">

          <button
            onClick={() => navigate("/customers")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Customers
          </button>

        </div>

      </div>

    </div>
  );
}