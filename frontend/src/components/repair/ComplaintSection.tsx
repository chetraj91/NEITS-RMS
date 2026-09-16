import type { ChangeEvent } from "react";

interface Props {
  data: any;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export default function ComplaintSection({
  data,
  onChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

      <h2 className="text-xl font-bold mb-6">
        Complaint & Initial Observation
      </h2>

      <div className="space-y-6">

        <div>
          <label className="block font-semibold mb-2">
            Customer Complaint
          </label>

          <textarea
            rows={5}
            name="complaint"
            value={data.complaint}
            onChange={onChange}
            placeholder="Example:
Laptop is slow
Battery not charging
No display
Blue Screen
Keyboard not working"
            className="border rounded-lg p-4 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Reception Initial Observation
          </label>

          <textarea
            rows={4}
            name="observation"
            value={data.observation}
            onChange={onChange}
            placeholder="Example:
Laptop powers on
Fan noisy
Dust inside
Display working"
            className="border rounded-lg p-4 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Internal Reception Notes
          </label>

          <textarea
            rows={4}
            name="internalNotes"
            value={data.internalNotes}
            onChange={onChange}
            placeholder="Visible only to staff"
            className="border rounded-lg p-4 w-full bg-yellow-50"
          />
        </div>

      </div>

    </div>
  );
}

