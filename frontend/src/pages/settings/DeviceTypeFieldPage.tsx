import {
  useEffect,
  useState,
} from "react";

import {
  getDeviceTypes,
} from "../../api/deviceType";

import {
  getDeviceFields,
} from "../../api/deviceField";

import {
  getDeviceTypeFields,
  saveDeviceTypeFields,
} from "../../api/deviceTypeField";

import {
  getDeviceTypeLayout,
  saveDeviceTypeLayout,
} from "../../api/deviceTypeLayout";

export default function DeviceTypeFieldPage() {
  const [deviceTypes, setDeviceTypes] =
    useState<any[]>([]);

  const [deviceFields, setDeviceFields] =
    useState<any[]>([]);

  const [deviceTypeId, setDeviceTypeId] =
    useState("");

  const [mapping, setMapping] =
    useState<any[]>([]);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    initialize();
  }, []);

  // =====================================================
  // LOAD MAPPING WHEN DEVICE TYPE CHANGES
  // =====================================================

  useEffect(() => {
    if (
      deviceTypeId &&
      deviceFields.length > 0
    ) {
      loadMapping(
        deviceTypeId
      );
    } else {
      setMapping([]);
    }
  }, [
    deviceTypeId,
    deviceFields,
  ]);

  // =====================================================
  // INITIALIZE
  // =====================================================

  async function initialize() {
    try {
      const [
        typesRes,
        fieldsRes,
      ] = await Promise.all([
        getDeviceTypes(),
        getDeviceFields(),
      ]);

      setDeviceTypes(
        typesRes.data?.data || []
      );

      setDeviceFields(
        fieldsRes.data?.data || []
      );
    } catch (err) {
      console.error(
        "Unable to load device types/fields:",
        err
      );

      setDeviceTypes([]);
      setDeviceFields([]);
    }
  }

  // =====================================================
  // LOAD MAPPING
  // =====================================================

  async function loadMapping(
    id: string
  ) {
    try {
      const [
        fieldsResponse,
        layoutResponse,
      ] = await Promise.all([
        getDeviceTypeFields(id),
        getDeviceTypeLayout(id),
      ]);

      const currentFields =
        fieldsResponse.data?.data || [];

      const currentLayout =
        layoutResponse?.data || [];

      // =================================================
      // BUILT-IN FIELDS
      // DEVICE TYPE + BRAND
      // =================================================

      const builtInRows =
        [
          {
            fieldKey:
              "DEVICE_TYPE",

            fieldLabel:
              "Device Type",

            fieldType:
              "SELECT",

            category:
              "DEVICE_INFORMATION",

            isBuiltIn:
              true,

            visible:
              true,

            required:
              true,

            displayOrder:
              1,

            columnSpan:
              1,
          },

          {
            fieldKey:
              "BRAND",

            fieldLabel:
              "Brand",

            fieldType:
              "SELECT",

            category:
              "DEVICE_INFORMATION",

            isBuiltIn:
              true,

            visible:
              true,

            required:
              true,

            displayOrder:
              2,

            columnSpan:
              1,
          },
        ].map(
          (
            builtIn: any
          ) => {
            const found =
              currentLayout.find(
                (item: any) =>
                  item.fieldKey ===
                  builtIn.fieldKey
              );

            return {
              ...builtIn,

              id:
                found?.id ||
                builtIn.fieldKey,

              visible:
                found
                  ? found.visible
                  : builtIn.visible,

              required:
                found
                  ? found.required
                  : builtIn.required,

              displayOrder:
                found &&
                found.displayOrder !==
                  undefined
                  ? Number(
                      found.displayOrder
                    )
                  : builtIn.displayOrder,

              columnSpan:
                found &&
                found.columnSpan !==
                  undefined
                  ? Number(
                      found.columnSpan
                    )
                  : builtIn.columnSpan,
            };
          }
        );

      // =================================================
      // DYNAMIC DEVICE FIELDS
      // =================================================

      const dynamicRows =
        deviceFields.map(
          (
            field: any,
            index: number
          ) => {
            const found =
              currentFields.find(
                (x: any) =>
                  x.deviceFieldId ===
                  field.id
              );

            return {
              id:
                found?.id ||
                field.id,

              deviceFieldId:
                field.id,

              fieldKey:
                field.name,

              fieldLabel:
                field.name,

              name:
                field.name,

              fieldType:
                field.fieldType,

              category:
                field.category,

              isBuiltIn:
                false,

              visible:
                found
                  ? found.visible
                  : false,

              required:
                found
                  ? found.required
                  : false,

              displayOrder:
                found &&
                found.displayOrder !==
                  undefined
                  ? Number(
                      found.displayOrder
                    )
                  : index + 3,

              columnSpan:
                found &&
                found.columnSpan !==
                  undefined
                  ? Number(
                      found.columnSpan
                    )
                  : 1,
            };
          }
        );

      // =================================================
      // COMBINE ALL FIELDS
      // =================================================

      const rows = [
        ...builtInRows,
        ...dynamicRows,
      ];

      // =================================================
      // SORT
      // =================================================

      rows.sort(
        (
          a: any,
          b: any
        ) =>
          Number(
            a.displayOrder
          ) -
          Number(
            b.displayOrder
          )
      );

      // =================================================
      // NORMALIZE
      // =================================================

      const normalized =
        rows.map(
          (
            item: any,
            index: number
          ) => ({
            ...item,

            displayOrder:
              index + 1,

            columnSpan:
              Number(
                item.columnSpan
              ) >= 1 &&
              Number(
                item.columnSpan
              ) <= 3
                ? Number(
                    item.columnSpan
                  )
                : 1,
          })
        );

      setMapping(
        normalized
      );
    } catch (err) {
      console.error(
        "Unable to load device type field/layout:",
        err
      );

      setMapping([]);
    }
  }

  // =====================================================
  // TOGGLE VISIBLE
  // =====================================================

  function toggleVisible(
    index: number
  ) {
    setMapping(
      (prev) => {
        const temp =
          [...prev];

        temp[index] = {
          ...temp[index],

          visible:
            !temp[index]
              .visible,

          required:
            !temp[index]
              .visible
              ? temp[index]
                  .required
              : false,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // TOGGLE REQUIRED
  // =====================================================

  function toggleRequired(
    index: number
  ) {
    setMapping(
      (prev) => {
        const temp =
          [...prev];

        if (
          !temp[index]
            .visible
        ) {
          return prev;
        }

        temp[index] = {
          ...temp[index],

          required:
            !temp[index]
              .required,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // CHANGE DISPLAY ORDER
  // =====================================================

  function changeDisplayOrder(
    index: number,
    value: string
  ) {
    const newOrder =
      Number(value);

    if (
      !Number.isFinite(
        newOrder
      )
    ) {
      return;
    }

    setMapping(
      (prev) => {
        const temp =
          [...prev];

        temp[index] = {
          ...temp[index],

          displayOrder:
            newOrder,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // CHANGE COLUMN SPAN
  // =====================================================

  function changeColumnSpan(
    index: number,
    value: string
  ) {
    const newSpan =
      Number(value);

    if (
      !Number.isFinite(
        newSpan
      ) ||
      newSpan < 1 ||
      newSpan > 3
    ) {
      return;
    }

    setMapping(
      (prev) => {
        const temp =
          [...prev];

        temp[index] = {
          ...temp[index],

          columnSpan:
            newSpan,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // MOVE UP
  // =====================================================

  function moveUp(
    index: number
  ) {
    if (index <= 0) {
      return;
    }

    setMapping(
      (prev) => {
        const temp =
          [...prev];

        const current =
          temp[index];

        const previous =
          temp[index - 1];

        temp[index - 1] = {
          ...current,

          displayOrder:
            index,
        };

        temp[index] = {
          ...previous,

          displayOrder:
            index + 1,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // MOVE DOWN
  // =====================================================

  function moveDown(
    index: number
  ) {
    if (
      index >=
      mapping.length - 1
    ) {
      return;
    }

    setMapping(
      (prev) => {
        const temp =
          [...prev];

        const current =
          temp[index];

        const next =
          temp[index + 1];

        temp[index] = {
          ...next,

          displayOrder:
            index + 1,
        };

        temp[index + 1] = {
          ...current,

          displayOrder:
            index + 2,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // NORMALIZE ORDER
  // =====================================================

  function normalizeMapping(
    source: any[]
  ) {
    return [...source]
      .sort(
        (
          a: any,
          b: any
        ) =>
          Number(
            a.displayOrder
          ) -
          Number(
            b.displayOrder
          )
      )
      .map(
        (
          item: any,
          index: number
        ) => ({
          ...item,

          displayOrder:
            index + 1,

          columnSpan:
            Number(
              item.columnSpan
            ) >= 1 &&
            Number(
              item.columnSpan
            ) <= 3
              ? Number(
                  item.columnSpan
                )
              : 1,
        })
      );
  }

  // =====================================================
  // SORT BUTTON
  // =====================================================

  function sortMapping() {
    setMapping(
      (
        prev
      ) =>
        normalizeMapping(
          prev
        )
    );
  }

  // =====================================================
  // SAVE
  // =====================================================

  async function save() {
    if (!deviceTypeId) {
      alert(
        "Select Device Type"
      );

      return;
    }

    try {
      setSaving(true);

      // =================================================
      // NORMALIZE FIRST
      // =================================================

      const sorted =
        normalizeMapping(
          mapping
        );

      setMapping(
        sorted
      );

      // =================================================
      // BUILT-IN LAYOUT
      // DEVICE TYPE + BRAND
      // =================================================

      const builtInFields =
        sorted
          .filter(
            (item: any) =>
              item.isBuiltIn ===
              true
          )
          .map(
            (
              item: any
            ) => ({
              fieldKey:
                item.fieldKey,

              fieldLabel:
                item.fieldLabel,

              visible:
                item.visible !==
                false,

              required:
                item.required !==
                false,

              displayOrder:
                item.displayOrder,

              columnSpan:
                item.columnSpan,
            })
          );

      // =================================================
      // DYNAMIC DEVICE FIELDS
      // =================================================

      const dynamicFields =
        sorted
          .filter(
            (item: any) =>
              item.isBuiltIn !==
              true
          )
          .map(
            (
              item: any
            ) => ({
              deviceFieldId:
                item.deviceFieldId,

              visible:
                item.visible !==
                false,

              required:
                item.required !==
                false,

              displayOrder:
                item.displayOrder,

              columnSpan:
                item.columnSpan,
            })
          );

      console.log(
        "Saving built-in layout:",
        builtInFields
      );

      console.log(
        "Saving dynamic fields:",
        dynamicFields
      );

      // =================================================
      // SAVE BOTH
      // =================================================

      await Promise.all([
        saveDeviceTypeLayout(
          deviceTypeId,
          builtInFields
        ),

        saveDeviceTypeFields(
          deviceTypeId,
          dynamicFields
        ),
      ]);

      alert(
        "Device Type Fields and Layout Saved Successfully."
      );

      // Reload from database
      await loadMapping(
        deviceTypeId
      );
    } catch (err: any) {
      console.error(
        "Unable to save device type fields/layout:",
        err
      );

      alert(
        err?.response?.data
          ?.message ||
        err?.message ||
        "Unable to save Device Type Fields."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // GET SELECTED DEVICE TYPE
  // =====================================================

  const selectedDeviceType =
    deviceTypes.find(
      (item: any) =>
        item.id ===
        deviceTypeId
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <div>

        <h1 className="text-3xl font-bold">
          Device Type Fields
        </h1>

        <p className="text-gray-500 mt-2">
          Configure Device Type, Brand and
          dynamic fields, including order,
          visibility, required status and width.
        </p>

      </div>

      {/* =================================================
          DEVICE TYPE SELECT
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-6">

        <label className="block font-semibold mb-2">
          Device Type
        </label>

        <select
          value={
            deviceTypeId
          }
          onChange={(e) =>
            setDeviceTypeId(
              e.target.value
            )
          }
          className="border rounded-lg p-3 w-80"
        >

          <option value="">
            Select Device Type
          </option>

          {deviceTypes.map(
            (
              d: any
            ) => (
              <option
                key={d.id}
                value={d.id}
              >
                {d.name}
              </option>
            )
          )}

        </select>

        {selectedDeviceType && (
          <div className="mt-3 text-sm text-gray-600">

            Configuring fields for:

            <strong className="ml-1">
              {
                selectedDeviceType.name
              }
            </strong>

          </div>
        )}

      </div>

      {/* =================================================
          MAPPING TABLE
      ================================================= */}

      {deviceTypeId && (
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="p-6 border-b">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Field Configuration
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Configure Device Type, Brand and
                  all dynamic fields on the
                  New Repair Job page.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  sortMapping
                }
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Normalize Order
              </button>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-center p-4 w-20">
                    Order
                  </th>

                  <th className="text-left p-4">
                    Field
                  </th>

                  <th className="text-left p-4">
                    Category
                  </th>

                  <th className="text-left p-4">
                    Type
                  </th>

                  <th className="text-center p-4">
                    Visible
                  </th>

                  <th className="text-center p-4">
                    Required
                  </th>

                  <th className="text-center p-4">
                    Columns
                  </th>

                  <th className="text-center p-4">
                    Move
                  </th>

                </tr>

              </thead>

              <tbody>

                {mapping.map(
                  (
                    item: any,
                    index: number
                  ) => (

                    <tr
                      key={
                        item.isBuiltIn
                          ? item.fieldKey
                          : item.deviceFieldId
                      }
                      className="border-t hover:bg-gray-50"
                    >

                      {/* =================================
                          DISPLAY ORDER
                      ================================= */}

                      <td className="p-4 text-center">

                        <input
                          type="number"
                          min={1}
                          value={
                            item.displayOrder
                          }
                          onChange={(
                            e
                          ) =>
                            changeDisplayOrder(
                              index,
                              e.target.value
                            )
                          }
                          className="border rounded-lg p-2 w-20 text-center"
                        />

                      </td>

                      {/* =================================
                          FIELD NAME
                      ================================= */}

                      <td className="p-4">

                        <div className="font-medium">
                          {
                            item.fieldLabel ||
                            item.name
                          }
                        </div>

                        {item.isBuiltIn && (
                          <div className="text-xs text-gray-500 mt-1">
                            Built-in field
                          </div>
                        )}

                      </td>

                      {/* =================================
                          CATEGORY
                      ================================= */}

                      <td className="p-4">

                        <span
                          className={
                            item.category ===
                            "PHYSICAL_CONDITION"
                              ? "px-2 py-1 rounded bg-orange-100 text-orange-700 text-sm"
                              : "px-2 py-1 rounded bg-blue-100 text-blue-700 text-sm"
                          }
                        >
                          {
                            item.category ||
                            "DEVICE_INFORMATION"
                          }
                        </span>

                      </td>

                      {/* =================================
                          FIELD TYPE
                      ================================= */}

                      <td className="p-4 text-gray-600">

                        {
                          item.fieldType ||
                          "SELECT"
                        }

                      </td>

                      {/* =================================
                          VISIBLE
                      ================================= */}

                      <td className="p-4 text-center">

                        <input
                          type="checkbox"
                          checked={
                            item.visible
                          }
                          onChange={() =>
                            toggleVisible(
                              index
                            )
                          }
                          className="w-5 h-5"
                        />

                      </td>

                      {/* =================================
                          REQUIRED
                      ================================= */}

                      <td className="p-4 text-center">

                        <input
                          type="checkbox"
                          disabled={
                            !item.visible
                          }
                          checked={
                            item.required
                          }
                          onChange={() =>
                            toggleRequired(
                              index
                            )
                          }
                          className="w-5 h-5"
                        />

                      </td>

                      {/* =================================
                          COLUMN SPAN
                      ================================= */}

                      <td className="p-4 text-center">

                        <select
                          value={
                            item.columnSpan ||
                            1
                          }
                          onChange={(e) =>
                            changeColumnSpan(
                              index,
                              e.target.value
                            )
                          }
                          className="border rounded-lg p-2 w-20"
                        >

                          <option value={1}>
                            1
                          </option>

                          <option value={2}>
                            2
                          </option>

                          <option value={3}>
                            3
                          </option>

                        </select>

                      </td>

                      {/* =================================
                          MOVE
                      ================================= */}

                      <td className="p-4">

                        <div className="flex justify-center gap-2">

                          <button
                            type="button"
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              moveUp(
                                index
                              )
                            }
                            className="bg-gray-200 hover:bg-gray-300 disabled:opacity-30 px-3 py-1 rounded font-bold"
                            title="Move Up"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={
                              index ===
                              mapping.length -
                                1
                            }
                            onClick={() =>
                              moveDown(
                                index
                              )
                            }
                            className="bg-gray-200 hover:bg-gray-300 disabled:opacity-30 px-3 py-1 rounded font-bold"
                            title="Move Down"
                          >
                            ↓
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              SAVE
          ================================================= */}

          <div className="p-6 border-t bg-gray-50">

            <button
              type="button"
              onClick={
                save
              }
              disabled={
                saving
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {saving
                ? "Saving..."
                : "Save Mapping"}
            </button>

          </div>

        </div>
      )}

      {/* =================================================
          HELP
      ================================================= */}

      {deviceTypeId && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

          <h3 className="font-bold text-blue-800 mb-2">
            How Columns Work
          </h3>

          <p className="text-blue-700 text-sm">
            1 = one third width,
            2 = two thirds width,
            3 = full row.
          </p>

          <p className="text-blue-700 text-sm mt-2">
            Device Type and Brand are now
            configurable along with the other
            Device Information fields.
          </p>

        </div>
      )}

    </div>
  );
}