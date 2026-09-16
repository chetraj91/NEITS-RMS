import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatNepaliDate } from "../utils/nepaliDate";
import { sendDueAmountReminder } from "../api/payment";
import { hasPermission } from "../utils/permissions";

type Props = {
  job: any;
};

export default function RepairJobCard({ job }: Props) {
  const navigate = useNavigate();

  const canEditRepairJob =
  hasPermission("repair-jobs.edit");

  const [sendingDueSms, setSendingDueSms] = useState(false);

    async function handleSendDueAmountSms() {
    if (Number(job.dueAmount ?? 0) <= 0) {
      alert("There is no outstanding due amount.");
      return;
    }

    if (sendingDueSms) return;

    try {
      setSendingDueSms(true);

      const response = await sendDueAmountReminder(job.id);

      alert(
        response?.message ||
          "Due amount reminder SMS sent successfully."
      );
    } catch (error: any) {
      console.error(
        "SEND DUE AMOUNT SMS ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to send due amount reminder SMS."
      );
    } finally {
      setSendingDueSms(false);
    }
  }

  let cardColor = "border-gray-200 bg-white";

  switch (job.status) {
    case "RECEIVED":
      cardColor = "border-slate-300 bg-slate-50";
      break;

    case "DIAGNOSING":
      cardColor = "border-yellow-300 bg-yellow-50";
      break;

    case "WAITING_APPROVAL":
      cardColor = "border-red-300 bg-red-50";
      break;

    case "REPAIRING":
      cardColor = "border-purple-300 bg-purple-50";
      break;

    case "READY":
      cardColor = "border-green-300 bg-green-50";
      break;

    case "DELIVERED":
      cardColor = "border-blue-300 bg-blue-50";
      break;
  }

  return (
    <div
      className={
        cardColor +
        " rounded-xl border-2 shadow hover:shadow-xl hover:scale-[1.02] transition-all duration-200 p-4"
      }
    >
      {/* Header */}

   <div className="flex justify-between items-start">

  <div>

    <h3 className="font-extrabold text-blue-700 text-xl">
      {job.jobNumber}
    </h3>

    <p className="text-gray-700 font-semibold mt-1">
      👤 {job.customer?.fullName}
    </p>

    <p className="text-xs text-gray-500">
      📞 {job.customer?.phone || "No Phone"}
    </p>

  </div>

  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
    {job.status}
  </span>

</div>


      <hr className="my-3" />

      {/* Customer */}

      <div className="space-y-2 text-sm">
       
        {/* Device */}

        <div>
          <span className="font-semibold">
            💻 Device
          </span>

          <div>
            {job.brand} {job.model}
          </div>
        </div>

        {/* Complaint */}

        <div>
          <span className="font-semibold">
            ⚠ Complaint
          </span>

          <div className="inline-block mt-1 bg-red-100 text-red-700 px-2 py-1 rounded-lg font-semibold text-xs">
            {job.complaint}
          </div>
        </div>

        {/* Technician */}

        <div>
          <span className="font-semibold">
            👨‍🔧 Technician
          </span>

          <div>
            {job.technician?.fullName || "Not Assigned"}
          </div>
        </div>

        {/* Received */}

        <div>
          <span className="font-semibold">
            📅 Received
          </span>

          <div>
           {formatNepaliDate(job.receivedDate)}
          </div>
        </div>
      </div>

      <hr className="my-3" />

    {/* Billing */}

<div className="space-y-1 text-sm">
  <div className="flex justify-between">
    <span>Estimate</span>

    <span className="font-semibold">
      Rs. {Number(job.estimate ?? 0).toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between">
    <span>Advance</span>

    <span className="text-green-600 font-semibold">
      Rs. {Number(job.advance ?? 0).toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between">
    <span>Paid</span>

    <span className="text-blue-600 font-semibold">
      Rs. {Number(job.paidAmount ?? 0).toFixed(2)}
    </span>
  </div>

  <div className="flex justify-between">
    <span>Due</span>

    <span className="text-red-600 font-bold">
      Rs. {Number(job.dueAmount ?? 0).toFixed(2)}
    </span>
  </div>
</div>

      <hr className="my-4" />

        {/* Edit Button */}

         {canEditRepairJob && (
         <button
         onClick={() =>
         navigate(`/repair-jobs/edit/${job.id}`)
         }
         className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200"
         >
        ✏ Edit Repair Job
         </button>
          )}

           <button
        onClick={() =>
          navigate(`/repair-jobs/${job.id}`)
        }
        className="w-full mt-2 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-semibold transition duration-200"
      >
        👁 Repair Job Details
      </button>

      {Number(job.dueAmount ?? 0) > 0 && (
  <button
    onClick={(event) => {
      event.stopPropagation();
      handleSendDueAmountSms();
    }}
    disabled={sendingDueSms}
    className="w-full mt-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition duration-200"
  >
    {sendingDueSms
      ? "Sending..."
      : "💰 Due Amount Reminder"}
  </button>
)}

    </div>
  );
}