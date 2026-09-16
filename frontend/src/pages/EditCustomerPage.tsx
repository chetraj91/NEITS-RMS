import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCustomer,
  updateCustomer,
} from "../api/customer";

export default function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    if (!id) return;

    try {
      setLoading(true);

      const res = await getCustomer(id);
      const customer = res.data;

      setForm({
        fullName: customer.fullName || "",
        companyName: customer.companyName || "",
        phone: customer.phone || "",
        alternatePhone: customer.alternatePhone || "",
        email: customer.email || "",
        address: customer.address || "",
        panVat: customer.panVat || "",
        notes: customer.notes || "",
      });
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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSave() {
    if (!id) return;

    if (!form.fullName.trim()) {
      alert("Customer Name is required.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Mobile Number is required.");
      return;
    }

    try {
      setSaving(true);

      const res = await updateCustomer(id, form);

      alert(
        res.message ||
          "Customer updated successfully."
      );

      navigate("/customers");
    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Unable to update customer."
      );
    } finally {
      setSaving(false);
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

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Edit Customer
          </h1>

          <p className="text-gray-500 mt-1">
            Update customer information
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
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
          >
            {saving ? "Saving..." : "Save Changes"}
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