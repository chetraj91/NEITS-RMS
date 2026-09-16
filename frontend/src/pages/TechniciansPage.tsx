import { useEffect, useState } from "react";

import {
  getTechnicians,
  createTechnician,
  deleteTechnician,
} from "../api/technician";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    specialization: "",
  });

  useEffect(() => {
    loadTechnicians();
  }, []);

  async function loadTechnicians() {
    try {
      const res = await getTechnicians();

      console.log("Technicians:", res.data);

      setTechnicians(res.data.data ?? []);
    } catch (err) {
      console.error(err);
      setTechnicians([]);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      alert("Technician Name is required.");
      return;
    }

    try {
      await createTechnician(form);

      alert("Technician Added Successfully");

      setForm({
        name: "",
        phone: "",
        email: "",
        specialization: "",
      });

      loadTechnicians();
    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Unable to Save Technician"
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete Technician?")) return;

    try {
      await deleteTechnician(id);
      loadTechnicians();
    } catch (err) {
      console.error(err);
      alert("Unable to delete technician.");
    }
  }

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        👨‍🔧 Technician Management
      </h1>

      {/* Add Technician */}

      <div className="bg-white rounded-xl shadow p-6">

        <div className="grid grid-cols-2 gap-5">

          <input
            placeholder="Full Name"
            className="border rounded-lg p-3"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            placeholder="Phone"
            className="border rounded-lg p-3"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          <input
            placeholder="Email"
            className="border rounded-lg p-3"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            placeholder="Specialization"
            className="border rounded-lg p-3"
            value={form.specialization}
            onChange={(e) =>
              setForm({
                ...form,
                specialization: e.target.value,
              })
            }
          />

        </div>

        <button
          onClick={handleSave}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          + Add Technician
        </button>

      </div>

      {/* Technician Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Specialization</th>
              <th className="p-4 text-center">Action</th>
            </tr>

          </thead>

          <tbody>

            {technicians.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="text-center p-8 text-gray-500"
                >
                  No technicians found.
                </td>

              </tr>

            ) : (

              technicians.map((tech) => (

                <tr
                  key={tech.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-4 font-medium">
                    {tech.name}
                  </td>

                  <td className="p-4">
                    {tech.phone || "-"}
                  </td>

                  <td className="p-4">
                    {tech.email || "-"}
                  </td>

                  <td className="p-4">
                    {tech.specialization || "-"}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      onClick={() => handleDelete(tech.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

