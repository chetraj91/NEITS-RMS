import {
  useEffect,
  useState,
} from "react";

import {
  getReceivingPrintLayout,
  saveReceivingPrintLayout,
  getReceivingPrintSize,
  saveReceivingPrintSize,
} from "../../api/receivingPrintLayout";

// =====================================================
// DOCUMENT TYPES
// =====================================================

const DOCUMENTS = [
  {
    key: "CUSTOMER_VOUCHER",
    label: "Customer Voucher",
  },
  {
    key: "RECEIVING_JOB_STICKER",
    label: "Receiving Job Sticker",
  },
  {
    key: "JOB_STICKER",
    label: "Repair Job Details Sticker",
  },
  {
    key: "ACCESSORY_STICKER",
    label: "Accessory Sticker",
  },
];

// =====================================================
// CUSTOMER VOUCHER REQUIRED FIELDS
// =====================================================

const CUSTOMER_VOUCHER_EXTRA_FIELDS = [
  {
    fieldKey: "complaint",
    fieldLabel: "Customer Complaint",
    displayOrder: 8,
    columnSpan: 3,
    visible: true,
    fontSize: 11,
    marginMm: 1.5,
  },
  {
    fieldKey: "observation",
    fieldLabel: "Initial Observation",
    displayOrder: 9,
    columnSpan: 3,
    visible: false,
    fontSize: 11,
    marginMm: 1.5,
  },
  {
    fieldKey: "receivedDate",
    fieldLabel: "Received Date",
    displayOrder: 10,
    columnSpan: 1,
    visible: true,
    fontSize: 11,
    marginMm: 1.5,
  },
  {
    fieldKey: "accessories",
    fieldLabel: "Accessories Received",
    displayOrder: 11,
    columnSpan: 3,
    visible: true,
    fontSize: 11,
    marginMm: 1.5,
  },
];

// =====================================================
// DEFAULT CUSTOMER VOUCHER FIELDS
// Used only when old database layout does not contain
// the new fields.
// =====================================================

const CUSTOMER_VOUCHER_DEFAULT_FIELDS = [
  {
    fieldKey: "jobNumber",
    fieldLabel: "Job Number",
    displayOrder: 1,
    columnSpan: 1,
    visible: true,
    fontSize: 11,
    marginMm: 1.5,
  },
  {
    fieldKey: "customerName",
    fieldLabel: "Customer Name",
    displayOrder: 2,
    columnSpan: 1,
    visible: true,
    fontSize: 11,
    marginMm: 1.5,
  },
  {
    fieldKey: "phone",
    fieldLabel: "Contact Number",
    displayOrder: 3,
    columnSpan: 1,
    visible: true,
    fontSize: 11,
    marginMm: 1.5,
  },
  {
    fieldKey: "deviceType",
    fieldLabel: "Device Type",
    displayOrder: 4,
    columnSpan: 1,
    visible: false,
    fontSize: 11,
    marginMm: 1.5,
  },
  {
    fieldKey: "brand",
    fieldLabel: "Brand",
    displayOrder: 5,
    columnSpan: 1,
    visible: false,
    fontSize: 11,
    marginMm: 1.5,
  },
  {
    fieldKey: "model",
    fieldLabel: "Model",
    displayOrder: 6,
    columnSpan: 1,
    visible: false,
    fontSize: 11,
    marginMm: 1.5,
  },
  {
    fieldKey: "serialNumber",
    fieldLabel: "Serial Number",
    displayOrder: 7,
    columnSpan: 1,
    visible: false,
    fontSize: 11,
    marginMm: 1.5,
  },
  ...CUSTOMER_VOUCHER_EXTRA_FIELDS,
];

// =====================================================
// PAGE
// =====================================================

export default function ReceivingPrintLayoutPage() {
  const [documentType, setDocumentType] =
    useState("CUSTOMER_VOUCHER");

  const [mapping, setMapping] =
    useState<any[]>([]);

  const [widthMm, setWidthMm] =
    useState(210);

  const [heightMm, setHeightMm] =
    useState(148);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    loadLayout(documentType);
  }, [documentType]);

  async function loadLayout(type: string) {
    try {
      const [
        layoutRes,
        sizeRes,
      ] = await Promise.all([
        getReceivingPrintLayout(type),
        getReceivingPrintSize(type),
      ]);

      let fields =
        Array.isArray(layoutRes?.data)
          ? layoutRes.data
          : [];

      // =================================================
      // IMPORTANT
      // Add new Customer Voucher fields if they do not
      // already exist in the saved database layout.
      // =================================================

      if (type === "CUSTOMER_VOUCHER") {
        const existingKeys =
          new Set(
            fields.map(
              (item: any) =>
                item.fieldKey
            )
          );

        const missingFields =
          CUSTOMER_VOUCHER_DEFAULT_FIELDS.filter(
            (item) =>
              !existingKeys.has(
                item.fieldKey
              )
          );

        if (missingFields.length > 0) {
          fields = [
            ...fields,
            ...missingFields,
          ];
        }
      }

      const size =
        sizeRes?.data || {};

      const normalized =
        [...fields]
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

              fontSize:
                Number.isFinite(
                  Number(
                    item.fontSize
                  )
                )
                  ? Number(
                      item.fontSize
                    )
                  : 11,

              marginMm:
                Number.isFinite(
                  Number(
                    item.marginMm
                  )
                )
                  ? Number(
                      item.marginMm
                    )
                  : 1.5,

              visible:
                item.visible !== false,
            })
          );

      setMapping(
        normalized
      );

      // =================================================
      // SIZE
      // =================================================

      setWidthMm(
        Number(
          size.widthMm ||
            (type ===
            "CUSTOMER_VOUCHER"
              ? 210
              : 70)
        )
      );

      setHeightMm(
        Number(
          size.heightMm ||
            (type ===
            "CUSTOMER_VOUCHER"
              ? 148
              : 35)
        )
      );

    } catch (error) {
      console.error(
        "Unable to load receiving print layout:",
        error
      );

      setMapping([]);
    }
  }

  // =====================================================
  // VISIBLE
  // =====================================================

  function toggleVisible(
    index: number
  ) {
    setMapping(
      (prev) => {
        const temp = [
          ...prev,
        ];

        temp[index] = {
          ...temp[index],

          visible:
            !temp[index]
              .visible,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // ORDER
  // =====================================================

  function changeOrder(
    index: number,
    value: string
  ) {
    const order =
      Number(value);

    if (
      !Number.isFinite(order) ||
      order < 1
    ) {
      return;
    }

    setMapping(
      (prev) => {
        const temp = [
          ...prev,
        ];

        temp[index] = {
          ...temp[index],

          displayOrder:
            order,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // COLUMN SPAN
  // =====================================================

  function changeColumnSpan(
    index: number,
    value: string
  ) {
    const span =
      Number(value);

    if (
      span < 1 ||
      span > 3 ||
      !Number.isFinite(span)
    ) {
      return;
    }

    setMapping(
      (prev) => {
        const temp = [
          ...prev,
        ];

        temp[index] = {
          ...temp[index],

          columnSpan:
            span,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // LABEL
  // =====================================================

  function changeLabel(
    index: number,
    value: string
  ) {
    setMapping(
      (prev) => {
        const temp = [
          ...prev,
        ];

        temp[index] = {
          ...temp[index],

          fieldLabel:
            value,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // FONT SIZE
  // =====================================================

  function changeFontSize(
    index: number,
    value: string
  ) {
    const fontSize =
      Number(value);

    if (
      !Number.isFinite(
        fontSize
      ) ||
      fontSize < 5 ||
      fontSize > 40
    ) {
      return;
    }

    setMapping(
      (prev) => {
        const temp = [
          ...prev,
        ];

        temp[index] = {
          ...temp[index],

          fontSize,
        };

        return temp;
      }
    );
  }

  // =====================================================
  // MARGIN
  // =====================================================

  function changeMargin(
    index: number,
    value: string
  ) {
    const marginMm =
      Number(value);

    if (
      !Number.isFinite(
        marginMm
      ) ||
      marginMm < 0 ||
      marginMm > 20
    ) {
      return;
    }

    setMapping(
      (prev) => {
        const temp = [
          ...prev,
        ];

        temp[index] = {
          ...temp[index],

          marginMm,
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
        const temp = [
          ...prev,
        ];

        [
          temp[index - 1],
          temp[index],
        ] = [
          temp[index],
          temp[index - 1],
        ];

        return temp.map(
          (
            item,
            i
          ) => ({
            ...item,

            displayOrder:
              i + 1,
          })
        );
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
        const temp = [
          ...prev,
        ];

        [
          temp[index],
          temp[index + 1],
        ] = [
          temp[index + 1],
          temp[index],
        ];

        return temp.map(
          (
            item,
            i
          ) => ({
            ...item,

            displayOrder:
              i + 1,
          })
        );
      }
    );
  }

  // =====================================================
  // SAVE
  // =====================================================

  async function save() {
    try {
      setSaving(true);

      const sorted =
        [...mapping]
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

              fontSize:
                Number.isFinite(
                  Number(
                    item.fontSize
                  )
                )
                  ? Number(
                      item.fontSize
                    )
                  : 11,

              marginMm:
                Number.isFinite(
                  Number(
                    item.marginMm
                  )
                )
                  ? Number(
                      item.marginMm
                    )
                  : 1.5,

              visible:
                item.visible !== false,
            })
          );

      setMapping(
        sorted
      );

      await Promise.all([
        saveReceivingPrintLayout(
          documentType,
          sorted
        ),

        saveReceivingPrintSize(
          documentType,
          Number(widthMm),
          Number(heightMm)
        ),
      ]);

      alert(
        "Receiving Print Layout Saved Successfully."
      );

      await loadLayout(
        documentType
      );

    } catch (error: any) {
      console.error(
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to save receiving print layout."
      );

    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // SELECTED DOCUMENT
  // =====================================================

  const selectedDocument =
    DOCUMENTS.find(
      (item) =>
        item.key ===
        documentType
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          TITLE
      ================================================= */}

      <div>
        <h1 className="text-3xl font-bold">
          Receiving Print Layout
        </h1>

        <p className="text-gray-500 mt-2">
          Configure the fields, order and size
          of receiving documents and stickers.
        </p>
      </div>

      {/* =================================================
          DOCUMENT SELECT
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-6">

        <label className="block font-semibold mb-2">
          Document Type
        </label>

        <select
          value={documentType}
          onChange={(e) =>
            setDocumentType(
              e.target.value
            )
          }
          className="border rounded-lg p-3 w-80"
        >

          {DOCUMENTS.map(
            (item) => (
              <option
                key={item.key}
                value={item.key}
              >
                {item.label}
              </option>
            )
          )}

        </select>

        <p className="text-sm text-gray-500 mt-2">
          Configuring:

          <strong className="ml-1">
            {
              selectedDocument?.label
            }
          </strong>
        </p>

      </div>

      {/* =================================================
          PRINT SIZE
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          Print Size
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-xl">

          {/* WIDTH */}

          <div>

            <label className="block font-semibold mb-2">
              Width (mm)
            </label>

            <input
              type="number"
              min={1}
              value={widthMm}
              onChange={(e) =>
                setWidthMm(
                  Number(
                    e.target.value
                  )
                )
              }
              className="border rounded-lg p-3 w-full"
            />

          </div>

          {/* HEIGHT */}

          <div>

            <label className="block font-semibold mb-2">
              Height (mm)
            </label>

            <input
              type="number"
              min={1}
              value={heightMm}
              onChange={(e) =>
                setHeightMm(
                  Number(
                    e.target.value
                  )
                )
              }
              className="border rounded-lg p-3 w-full"
            />

          </div>

        </div>

        <p className="text-sm text-gray-500 mt-3">
          For sticker printers, use the actual
          physical sticker width and height.
        </p>

      </div>

      {/* =================================================
          FIELD CONFIGURATION
      ================================================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="text-xl font-bold">
            Field Configuration
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Control which fields appear on the
            selected document and their order.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-center">
                  Order
                </th>

                <th className="p-4 text-left">
                  Field
                </th>

                <th className="p-4 text-left">
                  Label
                </th>

                <th className="p-4 text-center">
                  Visible
                </th>

                <th className="p-4 text-center">
                  Columns
                </th>

                <th className="p-4 text-center">
                  Font Size
                </th>

                <th className="p-4 text-center">
                  Margin (mm)
                </th>

                <th className="p-4 text-center">
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
                      item.fieldKey
                    }
                    className="border-t hover:bg-gray-50"
                  >

                    {/* ORDER */}

                    <td className="p-4 text-center">

                      <input
                        type="number"
                        min={1}
                        value={
                          item.displayOrder
                        }
                        onChange={(e) =>
                          changeOrder(
                            index,
                            e.target.value
                          )
                        }
                        className="border rounded-lg p-2 w-20 text-center"
                      />

                    </td>

                    {/* FIELD */}

                    <td className="p-4">

                      <div className="font-medium">
                        {
                          item.fieldKey
                        }
                      </div>

                    </td>

                    {/* LABEL */}

                    <td className="p-4">

                      <input
                        type="text"
                        value={
                          item.fieldLabel ||
                          ""
                        }
                        onChange={(e) =>
                          changeLabel(
                            index,
                            e.target.value
                          )
                        }
                        className="border rounded-lg p-2 w-full min-w-[240px]"
                      />

                    </td>

                    {/* VISIBLE */}

                    <td className="p-4 text-center">

                      <input
                        type="checkbox"
                        checked={
                          item.visible !==
                          false
                        }
                        onChange={() =>
                          toggleVisible(
                            index
                          )
                        }
                        className="w-5 h-5"
                      />

                    </td>

                    {/* COLUMNS */}

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

                    {/* FONT SIZE */}

                    <td className="p-4 text-center">

                      <input
                        type="number"
                        min={5}
                        max={40}
                        step={0.5}
                        value={
                          item.fontSize ??
                          11
                        }
                        onChange={(e) =>
                          changeFontSize(
                            index,
                            e.target.value
                          )
                        }
                        className="border rounded-lg p-2 w-24 text-center"
                      />

                    </td>

                    {/* MARGIN */}

                    <td className="p-4 text-center">

                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.1}
                        value={
                          item.marginMm ??
                          1.5
                        }
                        onChange={(e) =>
                          changeMargin(
                            index,
                            e.target.value
                          )
                        }
                        className="border rounded-lg p-2 w-24 text-center"
                      />

                    </td>

                    {/* MOVE */}

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
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          disabled={
                            index ===
                            mapping.length - 1
                          }
                          onClick={() =>
                            moveDown(
                              index
                            )
                          }
                          className="bg-gray-200 hover:bg-gray-300 disabled:opacity-30 px-3 py-1 rounded font-bold"
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
            onClick={save}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {saving
              ? "Saving..."
              : "Save Layout"}
          </button>

        </div>

      </div>

      {/* =================================================
          HELP
      ================================================= */}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

        <h3 className="font-bold text-blue-800 mb-2">
          Layout Information
        </h3>

        <p className="text-sm text-blue-700">
          1 = one column, 2 = two columns,
          3 = full width.
        </p>

        {documentType ===
          "CUSTOMER_VOUCHER" && (
          <p className="text-sm text-blue-700 mt-2">
            Customer Voucher supports Customer
            Complaint, Initial Observation,
            Received Date and Accessories Received.
          </p>
        )}

        {documentType ===
          "ACCESSORY_STICKER" && (
          <p className="text-sm text-blue-700 mt-2">
            One sticker will be generated
            automatically for every accessory
            received with the repair job.
          </p>
        )}

      </div>

    </div>
  );
}