import { useEffect, useState } from "react";
import { getAccessoriesByDeviceType } from "../../api/accessory";

interface Props {
  data: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deviceTypeId: string;
}

export default function Accessories({
  data,
  onChange,
  deviceTypeId,
}: Props) {
  const [accessories, setAccessories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccessories();
  }, [deviceTypeId]);

  async function loadAccessories() {
    console.log(
  "Accessories component deviceTypeId:",
  deviceTypeId
   );
    if (!deviceTypeId) {
      setAccessories([]);
      return;
    }

    try {
      setLoading(true);

      const res =
        await getAccessoriesByDeviceType(
          deviceTypeId
        );

      setAccessories(res.data.data || []);
    } catch (error) {
      console.error(
        "Failed to load accessories:",
        error
      );

      setAccessories([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

      <h2 className="text-xl font-bold mb-6">
        Accessories Received
      </h2>

      {!deviceTypeId && (
        <p className="text-gray-500">
          Select a device type to see available
          accessories.
        </p>
      )}

      {deviceTypeId && loading && (
        <p className="text-gray-500">
          Loading accessories...
        </p>
      )}

      {deviceTypeId &&
        !loading &&
        accessories.length === 0 && (
          <p className="text-gray-500">
            No accessories configured for this
            device type.
          </p>
        )}

      {deviceTypeId &&
        !loading &&
        accessories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {accessories.map((item) => {
              const accessory =
                item.accessory || item;

              /*
               * The database mapping contains:
               *
               * item.accessory
               * item.visible
               * item.required
               *
               * We use the actual accessory ID
               * as the checkbox field name.
               */

              const fieldName =
                `accessory_${accessory.id}`;

              return (
                <label
                  key={item.id || accessory.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name={fieldName}
                    checked={
                      data.accessories?.some(
                        (id: string) =>
                          id === accessory.id
                      ) || false
                    }
                    onChange={() =>
                      onChange({
                        target: {
                          name: fieldName,
                          value: accessory.id,
                          type: "checkbox",
                          checked:
                            !data.accessories?.some(
                              (id: string) =>
                                id === accessory.id
                            ),
                        },
                      } as React.ChangeEvent<HTMLInputElement>)
                    }
                    className="w-6 h-6 accent-blue-600 cursor-pointer"
                  />

                  <span>
                    {accessory.name}

                    {item.required && (
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    )}
                  </span>
                </label>
              );
            })}

          </div>
        )}

      {/* Other Accessories */}

      {deviceTypeId && (
        <div className="mt-5">

          <label className="block mb-2 font-medium">
            Other Accessories
          </label>

          <input
            type="text"
            name="otherAccessories"
            value={data.otherAccessories || ""}
            onChange={onChange}
            placeholder="Any additional accessories..."
            className="border rounded-lg p-3 w-full"
          />

        </div>
      )}

    </div>
  );
}

