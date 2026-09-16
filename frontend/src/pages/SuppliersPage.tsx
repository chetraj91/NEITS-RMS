
import { useEffect, useState } from "react";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../api/supplier";

interface Supplier {
  id: string;
  supplierCode: string;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  panVat?: string;
  notes?: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<Supplier | null>(null);

  // Supplier selected for View
  const [viewingSupplier, setViewingSupplier] =
    useState<Supplier | null>(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    supplierCode: "",
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    panVat: "",
    notes: "",
  });

  // ========================================
  // Load Suppliers
  // ========================================

  useEffect(() => {
    loadSuppliers();
  }, []);

  // ========================================
  // Search
  // ========================================

  useEffect(() => {
    if (!search.trim()) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const keyword = search.toLowerCase();

    setFilteredSuppliers(
      suppliers.filter(
        (supplier) =>
          supplier.companyName
            ?.toLowerCase()
            .includes(keyword) ||
          supplier.supplierCode
            ?.toLowerCase()
            .includes(keyword) ||
          supplier.contactPerson
            ?.toLowerCase()
            .includes(keyword) ||
          supplier.phone
            ?.toLowerCase()
            .includes(keyword) ||
          supplier.email
            ?.toLowerCase()
            .includes(keyword) ||
          supplier.panVat
            ?.toLowerCase()
            .includes(keyword)
      )
    );
  }, [search, suppliers]);

  // ========================================
  // Load
  // ========================================

  async function loadSuppliers() {
    try {
      setLoading(true);

      const res = await getSuppliers();

      const data = res.data ?? [];

      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // Form
  // ========================================

  function resetForm() {
    setForm({
      supplierCode: "",
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      panVat: "",
      notes: "",
    });

    setEditingSupplier(null);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(supplier: Supplier) {
    setEditingSupplier(supplier);

    setForm({
      supplierCode: supplier.supplierCode || "",
      companyName: supplier.companyName || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      panVat: supplier.panVat || "",
      notes: supplier.notes || "",
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  // ========================================
  // View Supplier
  // ========================================

  function openViewSupplier(supplier: Supplier) {
    setViewingSupplier(supplier);
  }

  function closeViewSupplier() {
    setViewingSupplier(null);
  }

  // ========================================
  // Handle Input
  // ========================================

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ========================================
  // Save Supplier
  // ========================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!form.supplierCode.trim()) {
      alert("Please enter Supplier Code.");
      return;
    }

    if (!form.companyName.trim()) {
      alert("Please enter Company Name.");
      return;
    }

    try {
      setSaving(true);

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, form);
        alert("Supplier updated successfully.");
      } else {
        await createSupplier(form);
        alert("Supplier created successfully.");
      }

      closeForm();
      await loadSuppliers();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to save supplier."
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // Delete Supplier
  // ========================================

  async function handleDelete(supplier: Supplier) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${supplier.companyName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSupplier(supplier.id);

      alert("Supplier deleted successfully.");

      await loadSuppliers();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete supplier."
      );
    }
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Suppliers
          </h1>

          <p className="text-gray-500 mt-1">
            Manage supplier information
          </p>

        </div>

        <button
          onClick={openAddForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Supplier
        </button>

      </div>

      {/* Search */}

      <div className="flex justify-between items-center mb-6">

        <input
          type="text"
          placeholder="Search supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="text-gray-600">

          Total Suppliers :

          <span className="font-bold text-blue-600 ml-2">
            {filteredSuppliers.length}
          </span>

        </div>

      </div>

      {/* Supplier Form */}

      {showForm && (

        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-xl font-bold text-gray-800">
              {editingSupplier
                ? "Edit Supplier"
                : "Add Supplier"}
            </h2>

            <button
              type="button"
              onClick={closeForm}
              className="text-gray-500 hover:text-gray-800 text-xl"
            >
              ×
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Supplier Code */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Code *
                </label>

                <input
                  name="supplierCode"
                  value={form.supplierCode}
                  onChange={handleChange}
                  placeholder="SUP-001"
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingSupplier}
                />

              </div>

              {/* Company */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>

                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Supplier company name"
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Contact Person */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>

                <input
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact person"
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Phone */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Email */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* PAN/VAT */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN / VAT
                </label>

                <input
                  name="panVat"
                  value={form.panVat}
                  onChange={handleChange}
                  placeholder="PAN / VAT number"
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Address */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>

                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Supplier address"
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Notes */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional notes"
                  rows={3}
                  className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={closeForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg"
              >
                {saving
                  ? "Saving..."
                  : editingSupplier
                    ? "Update Supplier"
                    : "Save Supplier"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* Supplier Table */}

      {loading ? (

        <div className="text-center py-12 text-gray-500">
          Loading Suppliers...
        </div>

      ) : (

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="px-5 py-4 text-left">
                  Code
                </th>

                <th className="px-5 py-4 text-left">
                  Company Name
                </th>

                <th className="px-5 py-4 text-left">
                  Contact Person
                </th>

                <th className="px-5 py-4 text-left">
                  Phone
                </th>

                <th className="px-5 py-4 text-left">
                  Email
                </th>

                <th className="px-5 py-4 text-left">
                  PAN/VAT
                </th>

                <th className="px-5 py-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredSuppliers.map((supplier) => (

                <tr
                  key={supplier.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-5 py-4 font-semibold">
                    {supplier.supplierCode}
                  </td>

                  <td className="px-5 py-4">
                    {supplier.companyName}
                  </td>

                  <td className="px-5 py-4">
                    {supplier.contactPerson || "-"}
                  </td>

                  <td className="px-5 py-4">
                    {supplier.phone || "-"}
                  </td>

                  <td className="px-5 py-4">
                    {supplier.email || "-"}
                  </td>

                  <td className="px-5 py-4">
                    {supplier.panVat || "-"}
                  </td>

                  {/* Actions */}

                  <td className="px-5 py-4 text-center">

                    <button
                      onClick={() =>
                        openViewSupplier(supplier)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                    >
                      View
                    </button>

                    <button
                      onClick={() =>
                        openEditForm(supplier)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(supplier)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {!filteredSuppliers.length && (

            <div className="text-center py-10 text-gray-500">
              No suppliers found.
            </div>

          )}

        </div>

      )}

      {/* ========================================
          View Supplier Details
          ======================================== */}

      {viewingSupplier && (

        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeViewSupplier}
        >

          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >

            {/* View Header */}

            <div className="flex justify-between items-center px-6 py-5 border-b">

              <div>

                <h2 className="text-2xl font-bold text-gray-800">
                  Supplier Details
                </h2>

                <p className="text-gray-500 mt-1">
                  Complete supplier information
                </p>

              </div>

              <button
                type="button"
                onClick={closeViewSupplier}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>

            </div>

            {/* Supplier Information */}

            <div className="p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Supplier Code */}

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500 mb-1">
                    Supplier Code
                  </p>

                  <p className="font-semibold text-gray-800">
                    {viewingSupplier.supplierCode || "-"}
                  </p>

                </div>

                {/* Company Name */}

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500 mb-1">
                    Company Name
                  </p>

                  <p className="font-semibold text-gray-800">
                    {viewingSupplier.companyName || "-"}
                  </p>

                </div>

                {/* Contact Person */}

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500 mb-1">
                    Contact Person
                  </p>

                  <p className="font-semibold text-gray-800">
                    {viewingSupplier.contactPerson || "-"}
                  </p>

                </div>

                {/* Phone */}

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500 mb-1">
                    Phone
                  </p>

                  <p className="font-semibold text-gray-800">
                    {viewingSupplier.phone || "-"}
                  </p>

                </div>

                {/* Email */}

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500 mb-1">
                    Email
                  </p>

                  <p className="font-semibold text-gray-800 break-words">
                    {viewingSupplier.email || "-"}
                  </p>

                </div>

                {/* PAN/VAT */}

                <div className="bg-gray-50 rounded-lg p-4">

                  <p className="text-sm text-gray-500 mb-1">
                    PAN / VAT
                  </p>

                  <p className="font-semibold text-gray-800">
                    {viewingSupplier.panVat || "-"}
                  </p>

                </div>

                {/* Address */}

                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">

                  <p className="text-sm text-gray-500 mb-1">
                    Address
                  </p>

                  <p className="font-semibold text-gray-800">
                    {viewingSupplier.address || "-"}
                  </p>

                </div>

                {/* Notes */}

                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">

                  <p className="text-sm text-gray-500 mb-1">
                    Notes
                  </p>

                  <p className="font-semibold text-gray-800 whitespace-pre-wrap">
                    {viewingSupplier.notes || "-"}
                  </p>

                </div>

              </div>

            </div>

            {/* View Footer */}

            <div className="flex justify-end gap-3 px-6 py-5 border-t bg-gray-50">

              <button
                type="button"
                onClick={closeViewSupplier}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  closeViewSupplier();
                  openEditForm(viewingSupplier);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                Edit Supplier
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

