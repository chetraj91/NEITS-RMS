import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NepaliDate from "nepali-date-converter";

import {
  getRepairJobs,
} from "../api/repairJob";

export default function RepairJobsPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const res = await getRepairJobs();

      console.log("Repair Jobs:", res.data);

      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "RECEIVED":
        return "bg-blue-100 text-blue-700";

      case "DIAGNOSIS":
        return "bg-yellow-100 text-yellow-700";

      case "WAITING_APPROVAL":
        return "bg-orange-100 text-orange-700";

      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-700";

      case "READY":
        return "bg-green-100 text-green-700";

      case "DELIVERED":
        return "bg-gray-200 text-gray-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // ============================================================
  // FORMAT AD DATE/TIME INTO NEPALI BS DATE/TIME
  // Example:
  // 12/08/2026, 11:33 pm
  // becomes:
  // 27 Shrawan 2083, 11:33 pm
  // ============================================================

  function formatNepaliDateTime(
    date: string | null | undefined
  ): string {
    if (!date) {
      return "-";
    }

    try {
      const jsDate = new Date(date);

      if (isNaN(jsDate.getTime())) {
        return "-";
      }

      // Convert AD date to Nepali BS date
      const nepaliDate = new NepaliDate(jsDate);

      // Nepali date
      const bsDate = nepaliDate.format(
        "DD MMMM YYYY",
        "en"
      );

      // Nepal time
      const time = jsDate.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kathmandu",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return `${bsDate}, ${time}`;
    } catch (error) {
      console.error(
        "Nepali date conversion error:",
        error
      );

      return "-";
    }
  }

  return (
    <div className="p-8 space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            Repair Jobs
          </h1>

          <p className="text-gray-500">
            Manage all repair jobs
          </p>
        </div>

        <button
          onClick={() => navigate("/repair-jobs/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow"
        >
          + New Repair Job
        </button>

      </div>

      {/* ================= TABLE ================= */}

      {loading ? (

        <div className="text-center py-10 text-lg">
          Loading Repair Jobs...
        </div>

      ) : (

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="p-4 text-left whitespace-nowrap">
                    Job No
                  </th>

                  <th className="p-4 text-left whitespace-nowrap">
                    Customer
                  </th>

                  <th className="p-4 text-left whitespace-nowrap">
                    Device Type
                  </th>

                  <th className="p-4 text-left whitespace-nowrap">
                    Brand
                  </th>

                  <th className="p-4 text-left whitespace-nowrap">
                    Model
                  </th>

                  <th className="p-4 text-left whitespace-nowrap">
                    Complaint
                  </th>

                  <th className="p-4 text-center whitespace-nowrap">
                    Status
                  </th>

                  <th className="p-4 text-center whitespace-nowrap">
                    Received
                  </th>

                  <th className="p-4 text-center whitespace-nowrap">
                    Delivered
                  </th>

                </tr>

              </thead>

              <tbody>

                {jobs.length === 0 ? (

                  <tr>

                    <td
                      colSpan={9}
                      className="text-center p-10 text-gray-500"
                    >
                      No Repair Jobs Found
                    </td>

                  </tr>

                ) : (

                  jobs.map((job) => (

                    <tr
                      key={job.id}
                      onClick={() =>
                        navigate(`/repair-jobs/${job.id}`)
                      }
                      className="border-t hover:bg-blue-50 cursor-pointer transition"
                    >

                      {/* Job Number */}

                      <td className="p-4 font-semibold whitespace-nowrap">
                        {job.jobNumber}
                      </td>

                      {/* Customer */}

                      <td className="p-4 whitespace-nowrap">
                        {job.customer?.fullName || "-"}
                      </td>

                      {/* Device Type */}

                      <td className="p-4 whitespace-nowrap">
                        {job.deviceType || "-"}
                      </td>

                      {/* Brand */}

                      <td className="p-4 whitespace-nowrap">
                        {job.brand || "-"}
                      </td>

                      {/* Model */}

                      <td className="p-4 whitespace-nowrap">
                        {job.model || "-"}
                      </td>

                      {/* Complaint */}

                      <td className="p-4">
                        {job.complaint || "-"}
                      </td>

                      {/* Status */}

                      <td className="p-4 text-center">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>

                      </td>

                      {/* ================= RECEIVED DATE ================= */}

                      <td className="p-4 text-center whitespace-nowrap">

                        {job.receivedDate
                          ? formatNepaliDateTime(
                              job.receivedDate
                            )
                          : "-"}

                      </td>

                      {/* ================= DELIVERED DATE ================= */}

                      <td className="p-4 text-center whitespace-nowrap">

                        {job.status === "DELIVERED" &&
                        job.deliveryDate ? (

                          <span className="font-semibold text-green-600">

                            {formatNepaliDateTime(
                              job.deliveryDate
                            )}

                          </span>

                        ) : (

                          <span className="text-gray-400">
                            -
                          </span>

                        )}

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}