import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "../api/customer";

export default function NewCustomerPage() {
  const navigate = useNavigate();
 
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    panVat: "",
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSave() {
  if (!form.fullName.trim()) {
    alert("Customer Name is required.");
    return;
  }

  if (!form.phone.trim()) {
    alert("Mobile Number is required.");
    return;
  }

  try {
    setLoading(true);

    const res =
      await createCustomer(form);

    alert(
      res.message ||
        "Customer created successfully."
    );

    const newCustomer =
      res.data;

    if (newCustomer?.id) {
      navigate(
        `/repair-jobs/new?customerId=${newCustomer.id}`
      );
    } else {
      navigate("/customers");
    }
  } catch (err: any) {
    alert(
      err?.response?.data
        ?.message ||
        "Unable to create customer."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Add New Customer
          </h1>

          <p className="text-gray-500 mt-1">
            Customer information
          </p>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">

        <div className="grid grid-cols-2 gap-5">

          <div>
            <label className="text-sm font-medium">
              Customer Name *
            </label>

            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Company Name
            </label>

            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Mobile Number *
            </label>

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Alternate Phone
            </label>

            <input
              name="alternatePhone"
              value={form.alternatePhone}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Email
            </label>

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              PAN / VAT
            </label>

            <input
              name="panVat"
              value={form.panVat}
              onChange={handleChange}
              className="border rounded-lg p-3 w-full mt-1"
            />
          </div>

        </div>

        <div className="mt-5">

          <label className="text-sm font-medium">
            Address
          </label>

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="border rounded-lg p-3 w-full mt-1"
          />

        </div>

        <div className="mt-5">

          <label className="text-sm font-medium">
            Notes
          </label>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="border rounded-lg p-3 w-full mt-1"
          />

        </div>

        <div className="flex gap-4 mt-8">

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
          >
            {loading ? "Saving..." : "Save Customer"}
          </button>

          <button
            onClick={() => navigate("/customers")}
            className="bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}

