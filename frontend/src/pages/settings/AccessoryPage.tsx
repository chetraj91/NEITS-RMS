import { useEffect, useState } from "react";

import {
  getAccessories,
  getDeviceTypeAccessoryConfiguration,
  saveDeviceTypeAccessories,
  createAccessory,
  updateAccessory,
  deleteAccessory,
} from "../../api/accessory";

import { getDeviceTypes } from "../../api/deviceType";

interface Accessory {
  id: string;
  name: string;
  active: boolean;
  displayOrder: number;
}

interface DeviceType {
  id: string;
  name: string;
  active?: boolean;
}

interface AccessoryConfiguration {
  accessoryId: string;
  visible: boolean;
  required: boolean;
  displayOrder: number;
}

export default function AccessoryPage() {
  // =====================================================
  // STATE
  // =====================================================

  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);

  const [selectedDeviceTypeId, setSelectedDeviceTypeId] =
    useState("");

  const [configuration, setConfiguration] = useState<
    Record<string, AccessoryConfiguration>
  >({});

  const [loading, setLoading] = useState(true);
  const [loadingConfiguration, setLoadingConfiguration] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [newAccessoryName, setNewAccessoryName] =
    useState("");

  const [addingAccessory, setAddingAccessory] =
    useState(false);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [editingName, setEditingName] = useState("");

  // =====================================================
  // LOAD INITIAL DATA
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      const [accessoryResponse, deviceTypeResponse] =
        await Promise.all([
          getAccessories(),
          getDeviceTypes(),
        ]);

      const accessoryData =
        accessoryResponse.data?.data ?? [];

      const deviceTypeData =
        deviceTypeResponse.data?.data ?? [];

      setAccessories(accessoryData);
      setDeviceTypes(deviceTypeData);

      // Select first active device type automatically
      if (deviceTypeData.length > 0) {
        const firstDeviceType =
          deviceTypeData.find(
            (item: DeviceType) =>
              item.active !== false
          ) ?? deviceTypeData[0];

        setSelectedDeviceTypeId(firstDeviceType.id);
      }
    } catch (error) {
      console.error(
        "Failed to load accessory settings:",
        error
      );

      alert(
        "Failed to load accessories or device types."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD CONFIGURATION WHEN DEVICE TYPE CHANGES
  // =====================================================

  useEffect(() => {
    if (!selectedDeviceTypeId) {
      setConfiguration({});
      return;
    }

    loadDeviceTypeConfiguration(
      selectedDeviceTypeId
    );
  }, [selectedDeviceTypeId]);

  async function loadDeviceTypeConfiguration(
    deviceTypeId: string
  ) {
    try {
      setLoadingConfiguration(true);

      const response =
        await getDeviceTypeAccessoryConfiguration(
          deviceTypeId
        );

      const data = response.data?.data ?? [];

      const newConfiguration: Record<
        string,
        AccessoryConfiguration
      > = {};

      data.forEach((item: any, index: number) => {
        const accessoryId =
          item.accessoryId ??
          item.accessory?.id;

        if (!accessoryId) return;

        newConfiguration[accessoryId] = {
          accessoryId,
          visible: item.visible ?? true,
          required: item.required ?? false,
          displayOrder:
            item.displayOrder ?? index,
        };
      });

      setConfiguration(newConfiguration);
    } catch (error) {
      console.error(
        "Failed to load device type accessory configuration:",
        error
      );

      alert(
        "Failed to load accessory configuration."
      );

      setConfiguration({});
    } finally {
      setLoadingConfiguration(false);
    }
  }

  // =====================================================
  // CHECK / UNCHECK ACCESSORY
  // =====================================================

  function toggleAccessory(
    accessoryId: string
  ) {
    setConfiguration((previous) => {
      const copy = { ...previous };

      if (copy[accessoryId]) {
        // Remove from device type
        delete copy[accessoryId];
      } else {
        // Add locally.
        // It will actually be saved when Save is clicked.
        copy[accessoryId] = {
          accessoryId,
          visible: true,
          required: false,
          displayOrder:
            Object.keys(copy).length,
        };
      }

      return copy;
    });
  }

  // =====================================================
  // CHANGE VISIBLE
  // =====================================================

  function changeVisible(
    accessoryId: string,
    visible: boolean
  ) {
    setConfiguration((previous) => {
      if (!previous[accessoryId]) {
        return previous;
      }

      return {
        ...previous,
        [accessoryId]: {
          ...previous[accessoryId],
          visible,
        },
      };
    });
  }

  // =====================================================
  // CHANGE REQUIRED
  // =====================================================

  function changeRequired(
    accessoryId: string,
    required: boolean
  ) {
    setConfiguration((previous) => {
      if (!previous[accessoryId]) {
        return previous;
      }

      return {
        ...previous,
        [accessoryId]: {
          ...previous[accessoryId],
          required,
        },
      };
    });
  }

  // =====================================================
  // SAVE COMPLETE DEVICE TYPE CONFIGURATION
  // =====================================================

  async function handleSaveConfiguration() {
    if (!selectedDeviceTypeId) {
      alert("Please select a device type.");
      return;
    }

    try {
      setSaving(true);

      const accessoryConfiguration =
        Object.values(configuration).map(
          (item, index) => ({
            accessoryId: item.accessoryId,
            visible: item.visible,
            required: item.required,
            displayOrder: index,
          })
        );

      await saveDeviceTypeAccessories(
        selectedDeviceTypeId,
        accessoryConfiguration
      );

      // Reload from database so UI reflects exactly
      // what was saved.
      await loadDeviceTypeConfiguration(
        selectedDeviceTypeId
      );

      alert(
        "Accessories configuration saved successfully."
      );
    } catch (error) {
      console.error(
        "Save accessory configuration error:",
        error
      );

      alert(
        "Failed to save accessory configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // ADD NEW ACCESSORY
  // =====================================================

  async function handleAddAccessory() {
    const name = newAccessoryName.trim();

    if (!name) {
      alert("Please enter an accessory name.");
      return;
    }

    try {
      setAddingAccessory(true);

      await createAccessory({
        name,
        displayOrder: accessories.length,
      });

      setNewAccessoryName("");

      const response = await getAccessories();

      setAccessories(
        response.data?.data ?? []
      );
    } catch (error) {
      console.error(
        "Create accessory error:",
        error
      );

      alert("Failed to create accessory.");
    } finally {
      setAddingAccessory(false);
    }
  }

  // =====================================================
  // START EDIT
  // =====================================================

  function startEdit(accessory: Accessory) {
    setEditingId(accessory.id);
    setEditingName(accessory.name);
  }

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  // =====================================================
  // SAVE ACCESSORY NAME
  // =====================================================

  async function handleSaveEdit(
    accessoryId: string
  ) {
    const name = editingName.trim();

    if (!name) {
      alert("Accessory name cannot be empty.");
      return;
    }

    try {
      await updateAccessory(accessoryId, {
        name,
      });

      setAccessories((previous) =>
        previous.map((item) =>
          item.id === accessoryId
            ? {
                ...item,
                name,
              }
            : item
        )
      );

      cancelEdit();
    } catch (error) {
      console.error(
        "Update accessory error:",
        error
      );

      alert("Failed to update accessory.");
    }
  }

  // =====================================================
  // DELETE ACCESSORY
  // =====================================================

  async function handleDeleteAccessory(
    accessoryId: string
  ) {
    const accessory = accessories.find(
      (item) => item.id === accessoryId
    );

    if (!accessory) return;

    const confirmed = window.confirm(
      `Delete "${accessory.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteAccessory(accessoryId);

      setAccessories((previous) =>
        previous.filter(
          (item) => item.id !== accessoryId
        )
      );

      // Remove from local configuration too
      setConfiguration((previous) => {
        const copy = { ...previous };
        delete copy[accessoryId];
        return copy;
      });
    } catch (error) {
      console.error(
        "Delete accessory error:",
        error
      );

      alert(
        "Failed to delete accessory. It may already be assigned to a device type."
      );
    }
  }

  // =====================================================
  // DEVICE TYPE NAME
  // =====================================================

  const selectedDeviceType = deviceTypes.find(
    (item) =>
      item.id === selectedDeviceTypeId
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">
          🔌 Accessories
        </h1>

        <div className="bg-white rounded-xl shadow p-8 text-center">
          Loading accessory settings...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-8">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          🔌 Accessories
        </h1>

        <p className="text-gray-500 mt-2">
          Manage accessories and assign them to
          individual device types.
        </p>
      </div>

      {/* ================================================= */}
      {/* ACCESSORY MASTER SETTINGS */}
      {/* ================================================= */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">
          Accessory Master List
        </h2>

        <p className="text-gray-500 mb-6">
          Create and manage the accessories available
          in the system.
        </p>

        {/* ADD ACCESSORY */}

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newAccessoryName}
            onChange={(e) =>
              setNewAccessoryName(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddAccessory();
              }
            }}
            placeholder="Enter accessory name"
            className="border rounded-lg px-4 py-3 flex-1"
          />

          <button
            type="button"
            onClick={handleAddAccessory}
            disabled={addingAccessory}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {addingAccessory
              ? "Adding..."
              : "+ Add Accessory"}
          </button>
        </div>

        {/* MASTER LIST */}

        {accessories.length === 0 ? (
          <div className="border rounded-lg p-6 text-center text-gray-500">
            No accessories created yet.
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">
                    Accessory
                  </th>

                  <th className="text-center p-3">
                    Status
                  </th>

                  <th className="text-right p-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {accessories.map((accessory) => (
                  <tr
                    key={accessory.id}
                    className="border-t"
                  >
                    <td className="p-3">
                      {editingId ===
                      accessory.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) =>
                            setEditingName(
                              e.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-full"
                        />
                      ) : (
                        <span className="font-medium">
                          {accessory.name}
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {accessory.active ? (
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {editingId ===
                      accessory.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveEdit(
                                accessory.id
                              )
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                accessory
                              )
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAccessory(
                                accessory.id
                              )
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* DEVICE TYPE CONFIGURATION */}
      {/* ================================================= */}

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold">
              Assign Accessories to Device Type
            </h2>

            <p className="text-gray-500 mt-1">
              Select which accessories should appear
              when creating a repair job for each
              device type.
            </p>
          </div>

          {/* DEVICE TYPE */}

          <div className="w-full md:w-72">
            <label className="block mb-2 font-medium">
              Device Type
            </label>

            <select
              value={selectedDeviceTypeId}
              onChange={(e) =>
                setSelectedDeviceTypeId(
                  e.target.value
                )
              }
              className="border rounded-lg px-4 py-3 w-full"
            >
              <option value="">
                Select Device Type
              </option>

              {deviceTypes
                .filter(
                  (deviceType) =>
                    deviceType.active !== false
                )
                .map((deviceType) => (
                  <option
                    key={deviceType.id}
                    value={deviceType.id}
                  >
                    {deviceType.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* SELECTED DEVICE TYPE */}

        {selectedDeviceType && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <span className="text-gray-600">
              Configuring accessories for:
            </span>

            <span className="font-bold text-blue-700 ml-2">
              {selectedDeviceType.name}
            </span>
          </div>
        )}

        {/* LOADING CONFIGURATION */}

        {loadingConfiguration ? (
          <div className="border rounded-lg p-8 text-center text-gray-500">
            Loading configuration...
          </div>
        ) : !selectedDeviceTypeId ? (
          <div className="border rounded-lg p-8 text-center text-gray-500">
            Please select a device type.
          </div>
        ) : accessories.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-gray-500">
            No accessories available. Create
            accessories above first.
          </div>
        ) : (
          <>
            {/* ================================================= */}
            {/* CONFIGURATION TABLE */}
            {/* ================================================= */}

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3">
                      Select
                    </th>

                    <th className="text-left p-3">
                      Accessory
                    </th>

                    <th className="text-center p-3">
                      Visible
                    </th>

                    <th className="text-center p-3">
                      Required
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {accessories.map(
                    (accessory) => {
                      const assigned =
                        !!configuration[
                          accessory.id
                        ];

                      const config =
                        configuration[
                          accessory.id
                        ];

                      return (
                        <tr
                          key={accessory.id}
                          className={`border-t ${
                            assigned
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          {/* SELECT */}

                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={assigned}
                              onChange={() =>
                                toggleAccessory(
                                  accessory.id
                                )
                              }
                              className="w-5 h-5 accent-blue-600 cursor-pointer"
                            />
                          </td>

                          {/* ACCESSORY NAME */}

                          <td className="p-3 font-medium">
                            {accessory.name}
                          </td>

                          {/* VISIBLE */}

                          <td className="p-3 text-center">
                            {assigned ? (
                              <input
                                type="checkbox"
                                checked={
                                  config?.visible ??
                                  true
                                }
                                onChange={(e) =>
                                  changeVisible(
                                    accessory.id,
                                    e.target.checked
                                  )
                                }
                                className="w-5 h-5 accent-blue-600 cursor-pointer"
                              />
                            ) : (
                              <span className="text-gray-300">
                                —
                              </span>
                            )}
                          </td>

                          {/* REQUIRED */}

                          <td className="p-3 text-center">
                            {assigned ? (
                              <input
                                type="checkbox"
                                checked={
                                  config?.required ??
                                  false
                                }
                                onChange={(e) =>
                                  changeRequired(
                                    accessory.id,
                                    e.target.checked
                                  )
                                }
                                className="w-5 h-5 accent-orange-600 cursor-pointer"
                              />
                            ) : (
                              <span className="text-gray-300">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* ================================================= */}
            {/* SUMMARY */}
            {/* ================================================= */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
              <div className="text-gray-600">
                <strong>
                  {Object.keys(configuration).length}
                </strong>{" "}
                accessory
                {Object.keys(configuration)
                  .length !== 1
                  ? "ies"
                  : ""}{" "}
                selected for{" "}
                <strong>
                  {selectedDeviceType?.name}
                </strong>
              </div>

              {/* ================================================= */}
              {/* SAVE BUTTON */}
              {/* ================================================= */}

              <button
                type="button"
                onClick={
                  handleSaveConfiguration
                }
                disabled={saving}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Accessories Configuration"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

