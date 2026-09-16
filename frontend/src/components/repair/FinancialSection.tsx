import type { ChangeEvent } from "react";

interface Props {
  data: any;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export default function FinancialSection({
  data,
  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

      <h2 className="text-xl font-bold mb-6">
        Financial Information
      </h2>

      <div className="grid grid-cols-2 gap-5">

        <div>
          <label className="block mb-2 font-semibold">
            Diagnosis Fee
          </label>

          <input
            type="number"
            name="diagnosisFee"
            value={data.diagnosisFee}
            onChange={onChange}
            className="border rounded-lg p-3 w-full"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Advance Amount
          </label>

          <input
            type="number"
            name="advanceAmount"
            value={data.advanceAmount}
            onChange={onChange}
            className="border rounded-lg p-3 w-full"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Priority
          </label>

          <select
            name="priority"
            value={data.priority}
            onChange={onChange}
            className="border rounded-lg p-3 w-full"
          >
            <option>LOW</option>
            <option>NORMAL</option>
            <option>HIGH</option>
            <option>URGENT</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Expected Delivery
          </label>

          <input
            type="date"
            name="expectedDate"
            value={data.expectedDate}
            onChange={onChange}
            className="border rounded-lg p-3 w-full"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Warranty (Days)
          </label>

          <input
            type="number"
            name="warrantyDays"
            value={data.warrantyDays}
            onChange={onChange}
            className="border rounded-lg p-3 w-full"
          />
        </div>

      </div>

    </div>
  );
}

