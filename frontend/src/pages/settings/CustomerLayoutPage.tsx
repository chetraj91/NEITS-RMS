import {
  useEffect,
  useState,
} from "react";

import {
  getCustomerLayout,
  saveCustomerLayout,
} from "../../api/customerLayout";

export default function CustomerLayoutPage() {
  const [
    fields,
    setFields,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  useEffect(() => {
    loadLayout();
  }, []);

  async function loadLayout() {
    try {
      setLoading(true);

      const response =
        await getCustomerLayout();

      const data =
        response?.data ?? [];

      setFields(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error: any) {
      console.error(
        "Unable to load customer layout:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          "Unable to load customer layout."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleVisible(
    index: number
  ) {
    setFields(
      (prev) => {
        const copy =
          [...prev];

        copy[index] = {
          ...copy[index],
          visible:
            !copy[index].visible,
        };

        return copy;
      }
    );
  }

  function changeOrder(
    index: number,
    value: string
  ) {
    const order =
      Number(value);

    if (
      !Number.isFinite(order)
    ) {
      return;
    }

    setFields(
      (prev) => {
        const copy =
          [...prev];

        copy[index] = {
          ...copy[index],
          displayOrder:
            order,
        };

        return copy;
      }
    );
  }

  function changeColumnSpan(
    index: number,
    value: string
  ) {
    const span =
      Number(value);

    if (
      !Number.isFinite(span) ||
      span < 1 ||
      span > 3
    ) {
      return;
    }

    setFields(
      (prev) => {
        const copy =
          [...prev];

        copy[index] = {
          ...copy[index],
          columnSpan:
            span,
        };

        return copy;
      }
    );
  }

  function moveUp(
    index: number
  ) {
    if (index <= 0) {
      return;
    }

    setFields(
      (prev) => {
        const copy =
          [...prev];

        const current =
          copy[index];

        copy[index] =
          copy[index - 1];

        copy[index - 1] =
          current;

        return copy.map(
          (
            item,
            position
          ) => ({
            ...item,
            displayOrder:
              position + 1,
          })
        );
      }
    );
  }

  function moveDown(
    index: number
  ) {
    if (
      index >=
      fields.length - 1
    ) {
      return;
    }

    setFields(
      (prev) => {
        const copy =
          [...prev];

        const current =
          copy[index];

        copy[index] =
          copy[index + 1];

        copy[index + 1] =
          current;

        return copy.map(
          (
            item,
            position
          ) => ({
            ...item,
            displayOrder:
              position + 1,
          })
        );
      }
    );
  }

  function normalize() {
    setFields(
      (prev) =>
        [...prev]
          .sort(
            (
              a,
              b
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
              item,
              index
            ) => ({
              ...item,
              displayOrder:
                index + 1,
            })
          )
    );
  }

  async function handleSave() {
    try {
      setSaving(true);

      const sorted =
        [...fields]
          .sort(
            (
              a,
              b
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
              item,
              index
            ) => ({
              fieldKey:
                item.fieldKey,

              fieldLabel:
                item.fieldLabel,

              visible:
                item.visible !==
                false,

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

      setFields(
        sorted
      );

      const response =
        await saveCustomerLayout(
          sorted
        );

      alert(
        response?.message ||
          "Customer layout saved successfully."
      );
    } catch (error: any) {
      console.error(
        "Unable to save customer layout:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          "Unable to save customer layout."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading Customer Layout...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Customer Information Layout
        </h1>

        <p className="text-gray-500 mt-2">
          Configure customer fields, visibility,
          order and width on Repair Job pages.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-6 border-b flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold">
              Customer Fields
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              These settings control the Customer
              Information section.
            </p>
          </div>

          <button
            type="button"
            onClick={normalize}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Normalize Order
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="text-center p-4">
                  Order
                </th>

                <th className="text-left p-4">
                  Field
                </th>

                <th className="text-center p-4">
                  Visible
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

              {fields.map(
                (
                  field,
                  index
                ) => (

                  <tr
                    key={
                      field.fieldKey
                    }
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4 text-center">

                      <input
                        type="number"
                        min={1}
                        value={
                          field.displayOrder
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

                    <td className="p-4">

                      <div className="font-medium">
                        {
                          field.fieldLabel
                        }
                      </div>

                      <div className="text-xs text-gray-500">
                        {
                          field.fieldKey
                        }
                      </div>

                    </td>

                    <td className="p-4 text-center">

                      <input
                        type="checkbox"
                        checked={
                          field.visible
                        }
                        onChange={() =>
                          toggleVisible(
                            index
                          )
                        }
                        className="w-5 h-5"
                      />

                    </td>

                    <td className="p-4 text-center">

                      <select
                        value={
                          field.columnSpan ||
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
                            fields.length -
                              1
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

        <div className="p-6 border-t bg-gray-50">

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              saving
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {saving
              ? "Saving..."
              : "Save Customer Layout"}
          </button>

        </div>

      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

        <h3 className="font-bold text-blue-800 mb-2">
          Column Width
        </h3>

        <p className="text-sm text-blue-700">
          1 = one third width
          {" · "}
          2 = two thirds width
          {" · "}
          3 = full row
        </p>

      </div>

    </div>
  );
}