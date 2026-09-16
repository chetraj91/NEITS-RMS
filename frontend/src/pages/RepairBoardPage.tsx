import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import RepairJobCard from "../components/RepairJobCard";
import RepairJobModal from "../components/RepairJobModal";

import {
  getRepairBoard,
  updateRepairStatus,
} from "../api/repairBoard";

export default function RepairBoardPage() {

 const [jobs, setJobs] = useState<any[]>([]);
const [selectedJob, setSelectedJob] = useState<any>(null);

const [paymentFilter, setPaymentFilter] =
  useState<"ALL" | "DELIVERED_DUE">("ALL");

const [visibleStatuses, setVisibleStatuses] =
  useState<string[]>([
    "RECEIVED",
    "DIAGNOSIS",
    "WAITING_APPROVAL",
    "IN_PROGRESS",
    "READY",
    "DELIVERED",
  ]);

  const columns = [
    {
      title: "Received",
      status: "RECEIVED",
      color: "bg-slate-100",
      text: "text-slate-700",
    },
    {
      title: "DIAGNOSIS",
      status: "DIAGNOSIS",
      color: "bg-yellow-100",
      text: "text-yellow-700",
    },
    {
      title: "Waiting Approval",
      status: "WAITING_APPROVAL",
      color: "bg-orange-100",
      text: "text-orange-700",
    },
    {
      title: "Repairing",
      status: "IN_PROGRESS",
      color: "bg-purple-100",
      text: "text-purple-700",
    },
    {
      title: "Ready",
      status: "READY",
      color: "bg-green-100",
      text: "text-green-700",
    },
    {
      title: "Delivered",
      status: "DELIVERED",
      color: "bg-blue-100",
      text: "text-blue-700",
    },
  ];

  useEffect(() => {
    loadRepairBoard();
  }, []);

  async function loadRepairBoard() {
    try {
      const res = await getRepairBoard();

      // Backend returns:
      // { success:true, data:[...] }

      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function onDragEnd(result: any) {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const draggedJob = jobs.find(
      (job) => job.id === result.draggableId
    );

    if (!draggedJob) return;

    try {
      await updateRepairStatus(
        draggedJob.id,
        destination.droppableId
      );

      await loadRepairBoard();
    } catch (err) {
      console.error(err);
      alert("Unable to update repair status.");
    }
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-4xl font-bold text-slate-800 mb-8">
        Repair Board
      </h1>

            <div className="mb-6 flex items-center gap-3">
        <label
          htmlFor="payment-filter"
          className="font-semibold text-slate-700"
        >
          Payment Filter:
        </label>

        <select
          id="payment-filter"
          value={paymentFilter}
          onChange={(e) =>
            setPaymentFilter(
              e.target.value as
                | "ALL"
                | "DELIVERED_DUE"
            )
          }
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm"
        >
          <option value="ALL">
            All Jobs
          </option>

          <option value="DELIVERED_DUE">
            Delivered + Payment Due
          </option>
        </select>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4 bg-white border rounded-lg p-4 shadow-sm">

  <span className="font-semibold text-slate-700">
    Show States:
  </span>

  {columns.map((column) => (
    <label
      key={column.status}
      className="flex items-center gap-2 cursor-pointer text-sm font-medium"
    >
      <input
        type="checkbox"
        checked={visibleStatuses.includes(
          column.status
        )}
        onChange={() => {
          setVisibleStatuses((current) =>
            current.includes(column.status)
              ? current.filter(
                  (status) =>
                    status !== column.status
                )
              : [
                  ...current,
                  column.status,
                ]
          );
        }}
        className="w-4 h-4"
      />

      <span>
        {column.title}
      </span>
    </label>
  ))}

</div>

      <DragDropContext onDragEnd={onDragEnd}>

      <div
      className="grid gap-6"
      style={{
     gridTemplateColumns: `repeat(${Math.max(
      visibleStatuses.length,
      1
      )}, minmax(0, 1fr))`,
      }}
       >

         {columns
        .filter((column) =>
         visibleStatuses.includes(
        column.status
        )
        )
        .map((column) => (

            <Droppable
              key={column.status}
              droppableId={column.status}
            >

              {(provided) => (

                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white rounded-2xl shadow-lg border"
                >

                  <div
                    className={`${column.color} rounded-t-2xl p-4 border-b`}
                  >

                    <div className="flex justify-between items-center">

                      <h2
                        className={`text-lg font-bold ${column.text}`}
                      >
                        {column.title}
                      </h2>

                      <span className="bg-white px-2 py-1 rounded-full text-xs font-bold shadow">

                        {
                          jobs
                         .filter(
                         (job) =>
                        job.status === column.status
                       )
                      .filter((job) => {
                      // Payment filter affects ONLY the Delivered column
                      if (column.status !== "DELIVERED") {
                      return true;
                      }

                     if (paymentFilter === "ALL") {
                     return true;
                     }

                     return (
                     Math.abs(Number(job.dueAmount ?? 0)) > 0
                      );
                      })
                      .length

                        }

                      </span>

                    </div>

                  </div>

                  <div className="p-4 min-h-[600px] space-y-3">

                    {jobs
                 .filter(
                  (job) =>
                   job.status === column.status
                    )

                 .filter((job) => {
                  // Payment filter affects ONLY the Delivered column
                  if (column.status !== "DELIVERED") {
                  return true;
                 }

                 if (paymentFilter === "ALL") {
                 return true;
                }

                return (
                Math.abs(Number(job.dueAmount ?? 0)) > 0
               );
              })
              .map((job, index) => (

                        <Draggable
                          key={job.id}
                          draggableId={job.id}
                          index={index}
                        >

                          {(provided) => (

                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >

                              <div
                                onClick={() =>
                                  setSelectedJob(job)
                                }
                              >
                                <RepairJobCard job={job} />
                              </div>

                            </div>

                          )}

                        </Draggable>

                      ))}

                    {provided.placeholder}

                  </div>

                </div>

              )}

            </Droppable>

          ))}

        </div>

      </DragDropContext>

      {selectedJob && (

        <RepairJobModal
          job={selectedJob}
          onClose={() =>
            setSelectedJob(null)
          }
        />

      )}

    </div>
  );
}

