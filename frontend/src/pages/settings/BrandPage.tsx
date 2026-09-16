import { useEffect, useState } from "react";

import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../api/brand";

import {
  getDeviceTypes,
} from "../../api/deviceType";

export default function BrandPage() {

  const [brands, setBrands] = useState<any[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [deviceTypeId, setDeviceTypeId] = useState("");
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    loadBrands();
    loadDeviceTypes();
  }, []);

  async function loadBrands() {
    try {
      const res = await getBrands();
      setBrands(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadDeviceTypes() {
    try {
      const res = await getDeviceTypes();
      setDeviceTypes(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function saveBrand() {

    if (!name.trim()) {
      alert("Brand Name is required.");
      return;
    }

    if (!deviceTypeId) {
      alert("Please select Device Type.");
      return;
    }

    try {

      if (editingId) {

        await updateBrand(editingId, {
          name,
          deviceTypeId,
        });

      } else {

        await createBrand({
          name,
          deviceTypeId,
        });

      }

      setName("");
      setDeviceTypeId("");
      setEditingId("");

      loadBrands();

    } catch (err) {
      console.error(err);
    }

  }

  function editBrand(item: any) {
    setEditingId(item.id);
    setName(item.name);
    setDeviceTypeId(item.deviceTypeId);
  }

  async function removeBrand(id: string) {

    if (!window.confirm("Delete this Brand?"))
      return;

    await deleteBrand(id);

    loadBrands();

  }

  return (
    <div>

      <h1 className="text-3xl font-bold mb-6">
        Brand Settings
      </h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">

        <div className="grid grid-cols-3 gap-4">

          <select
            value={deviceTypeId}
            onChange={(e) =>
              setDeviceTypeId(e.target.value)
            }
            className="border rounded-lg px-4 py-2"
          >

            <option value="">
              Select Device Type
            </option>

            {deviceTypes.map((item) => (

              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>

            ))}

          </select>

          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Brand Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <button
            onClick={saveBrand}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {editingId ? "Update" : "Add"}
          </button>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Device Type
              </th>

              <th className="text-left p-4">
                Brand
              </th>

              <th className="text-center p-4">
                Status
              </th>

              <th className="text-center p-4">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {brands.map((item) => (

              <tr
                key={item.id}
                className="border-t"
              >

                <td className="p-4">
                  {item.deviceType?.name}
                </td>

                <td className="p-4">
                  {item.name}
                </td>

                <td className="text-center">

                  {item.active ? (
                    <span className="text-green-600 font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold">
                      Inactive
                    </span>
                  )}

                </td>

                <td className="text-center">

                  <button
                    onClick={() =>
                      editBrand(item)
                    }
                    className="text-blue-600 mr-4"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      removeBrand(item.id)
                    }
                    className="text-red-600"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );

}

