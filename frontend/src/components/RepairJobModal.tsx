import { formatNepaliDate } from "../utils/nepaliDate";

type Props = {
  job: any;
  onClose: () => void;
};

export default function RepairJobModal({
  job,
  onClose,
}: Props) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-2xl w-[900px] max-h-[90vh] overflow-y-auto p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">

          <div>
            <h2 className="text-3xl font-bold text-blue-700">
              {job.jobNumber}
            </h2>

            <p className="text-gray-500">
              Repair Job Details
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-3xl text-red-600 hover:text-red-800"
          >
            ✖
          </button>

        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-10">

          {/* Left Side */}
          <div>

            <h3 className="text-xl font-bold mb-4 text-blue-700">
              👤 Customer Information
            </h3>

            <div className="space-y-3">

              <p>
                <b>Name :</b>{" "}
                {job.customer?.fullName || "-"}
              </p>

              <p>
                <b>Phone :</b>{" "}
                {job.customer?.phone || "-"}
              </p>

              <p>
                <b>Email :</b>{" "}
                {job.customer?.email || "-"}
              </p>

            </div>

            <hr className="my-6" />

            <h3 className="text-xl font-bold mb-4 text-blue-700">
              💻 Device Information
            </h3>

            <div className="space-y-3">

              <p>
                <b>Brand :</b> {job.brand}
              </p>

              <p>
                <b>Model :</b> {job.model}
              </p>

              <p>
                <b>Complaint :</b> {job.complaint}
              </p>

              <p>
                <b>Diagnosis :</b>{" "}
                {job.diagnosis || "Pending"}
              </p>

              <p>
                <b>Technician :</b>{" "}
                {job.technician?.fullName || "Not Assigned"}
              </p>

              <p>
                <b>Received Date :</b>{" "}
               {formatNepaliDate(job.receivedDate)}
               </p>

            </div>

          </div>

          {/* Right Side */}
          <div>

            <h3 className="text-xl font-bold mb-4 text-green-700">
              💰 Billing
            </h3>

            <div className="space-y-4">

              <div className="flex justify-between">

                <span>Estimate</span>

                <b>
                  Rs. {job.estimate ?? 0}
                </b>

              </div>

              <div className="flex justify-between">

                <span>Advance</span>

                <b className="text-green-600">
                  Rs. {job.advance ?? 0}
                </b>

              </div>

              <div className="flex justify-between">

                <span>Due Amount</span>

                <b className="text-red-600">
                  Rs. {Math.abs(job.dueAmount ?? 0)}
                </b>

              </div>

            </div>

            <hr className="my-6" />

            <h3 className="text-xl font-bold mb-4 text-purple-700">
              📌 Current Status
            </h3>

            <span className="inline-block px-5 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold">
              {job.status}
            </span>

            <hr className="my-6" />

            <h3 className="text-xl font-bold mb-4 text-orange-700">
              📝 Notes
            </h3>

            <textarea
              className="w-full border rounded-lg p-3 h-36"
              placeholder="Technician notes..."
              defaultValue={job.notes || ""}
              readOnly
            />

          </div>

        </div>

        {/* Buttons */}
        <hr className="my-8" />

        <div className="grid grid-cols-3 gap-4">

          <button className="bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700">
            ✏ Edit Job
          </button>

          <button className="bg-green-600 text-white rounded-lg py-3 hover:bg-green-700">
            💰 Receive Payment
          </button>

          <button className="bg-purple-600 text-white rounded-lg py-3 hover:bg-purple-700">
            📱 WhatsApp Customer
          </button>

          <button className="bg-orange-600 text-white rounded-lg py-3 hover:bg-orange-700">
            🖨 Print Job Sheet
          </button>

          <button className="bg-indigo-600 text-white rounded-lg py-3 hover:bg-indigo-700">
            📦 Deliver
          </button>

          <button
            onClick={onClose}
            className="bg-gray-700 text-white rounded-lg py-3 hover:bg-black"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

