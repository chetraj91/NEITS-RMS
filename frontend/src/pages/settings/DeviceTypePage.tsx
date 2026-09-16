import { useEffect, useState } from "react";
import {
  getDeviceTypes,
  createDeviceType,
  updateDeviceType,
  deleteDeviceType,
} from "../../api/deviceType";

export default function DeviceTypePage() {
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    loadDeviceTypes();
  }, []);

  async function loadDeviceTypes() {
    try {
      const res = await getDeviceTypes();
      setDeviceTypes(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function saveDeviceType() {
  if (!name.trim()) return;

  try {

    console.log("Saving Device Type:", name);

    let res;

    if (editingId) {

      res = await updateDeviceType(editingId, {
        name,
      });

    } else {

      res = await createDeviceType({
        name,
      });

    }

    console.log("API Response:", res.data);

    setName("");
    setEditingId("");

    loadDeviceTypes();

  } catch (err: any) {

    console.error(err);

    console.log(err.response);

    console.log(err.response?.data);

    alert(
      err.response?.data?.message ||
      err.message ||
      "Unable to save Device Type"
    );
  }
}

  async function editDeviceType(item: any) {
    setEditingId(item.id);
    setName(item.name);
  }

  async function removeDeviceType(id: string) {
    if (!window.confirm("Delete this Device Type?")) return;

    await deleteDeviceType(id);

    loadDeviceTypes();
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Device Types
      </h1>

      <div className="bg-white shadow rounded-xl p-6 mb-6">

        <div className="flex gap-4">

          <input
            className="border rounded-lg px-4 py-2 flex-1"
            placeholder="Enter Device Type"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={saveDeviceType}
            className="bg-blue-600 text-white px-6 rounded-lg"
          >
            {editingId ? "Update" : "Add"}
          </button>

        </div>

      </div>

      <div className="bg-white shadow rounded-xl">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Device Type
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

            {deviceTypes.map((item) => (

              <tr
                key={item.id}
                className="border-t"
              >

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
                    onClick={() => editDeviceType(item)}
                    className="text-blue-600 mr-4"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => removeDeviceType(item.id)}
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

