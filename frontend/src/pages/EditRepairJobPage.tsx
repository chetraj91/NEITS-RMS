import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CustomerSearch from "../components/repairJob/CustomerSearch";
import DeviceInformation from "../components/repair/DeviceInformation";
import Accessories from "../components/repair/Accessories";
import PhysicalCondition from "../components/repair/PhysicalCondition";
import ComplaintSection from "../components/repair/ComplaintSection";
import FinancialSection from "../components/repair/FinancialSection";

import {
  getRepairJob,
  updateRepairJob,
} from "../api/repairJob";

import { getDeviceTypeFields } from "../api/deviceTypeField";
import { getDeviceTypes } from "../api/deviceType";


// =====================================================
// CONVERT DEVICE FIELD NAME TO FORM FIELD KEY
// =====================================================

function getFieldKey(name?: string) {
  if (!name) {
    return "";
  }

  const cleaned = name
    .trim()
    .replace(
      /[^a-zA-Z0-9]+(.)/g,
      (_match, character) =>
        character.toUpperCase()
    );

  return cleaned.replace(
    /^./,
    (character) =>
      character.toLowerCase()
  );
}


// =====================================================
// EDIT REPAIR JOB PAGE
// =====================================================

export default function EditRepairJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ===================================================
  // CUSTOMER
  // ===================================================

  const [customer, setCustomer] =
    useState<any>(null);

  // ===================================================
  // DEVICE TYPE
  // ===================================================

  const [deviceTypeId, setDeviceTypeId] =
    useState<string>("");

  const [
    deviceTypeFields,
    setDeviceTypeFields,
  ] = useState<any[]>([]);

  const [
    loadingDeviceTypeFields,
    setLoadingDeviceTypeFields,
  ] = useState(false);

  // ===================================================
  // JOB
  // ===================================================

  const [job, setJob] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // ===================================================
  // LOAD JOB
  // ===================================================

  useEffect(() => {
    if (!id) return;

    loadJob();
  }, [id]);

  // ===================================================
  // LOAD DEVICE TYPE FIELDS
  // ===================================================

  useEffect(() => {
    async function loadFields() {
      if (!deviceTypeId) {
        setDeviceTypeFields([]);
        return;
      }

      try {
        setLoadingDeviceTypeFields(true);

        const res =
          await getDeviceTypeFields(
            deviceTypeId
          );

        const rows =
          res.data?.data ||
          res.data ||
          [];

        setDeviceTypeFields(
          Array.isArray(rows)
            ? rows
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load device type fields:",
          err
        );

        setDeviceTypeFields([]);
      } finally {
        setLoadingDeviceTypeFields(false);
      }
    }

    loadFields();
  }, [deviceTypeId]);

  // ===================================================
  // LOAD REPAIR JOB
  // ===================================================

  async function loadJob() {
    if (!id) return;

    try {
      setLoading(true);

      const res =
        await getRepairJob(id);

      const data =
        res.data?.data ||
        res.data;

      if (!data) {
        alert(
          "Repair Job not found."
        );

        navigate("/repair-board");
        return;
      }

      console.log(
        "EDIT REPAIR JOB API RESPONSE:",
        res.data
      );

      // =================================================
      // CUSTOMER
      // =================================================

      setCustomer(
        data.customer || null
      );

      // =================================================
      // DYNAMIC DEVICE FIELDS
      // =================================================

      const dynamicValues =
        data.repairJobFieldValues ||
        [];

      const dynamicJobFields: any = {};

      for (
        const item of dynamicValues
      ) {
        const fieldName =
          item.deviceField?.name;

        const fieldKey =
          getFieldKey(fieldName);

        if (!fieldKey) {
          continue;
        }

        let value =
          item.value ?? "";

        // Boolean dynamic fields
        if (
          item.deviceField?.fieldType ===
          "BOOLEAN"
        ) {
          value =
            value === true ||
            value === "true";
        }

        dynamicJobFields[
          fieldKey
        ] = value;
      }

      // =================================================
      // ACCESSORIES
      // =================================================

      const accessories =
        Array.isArray(
          data.repairJobAccessories
        )
          ? data.repairJobAccessories
              .map(
                (item: any) =>
                  item.accessoryId
              )
              .filter(Boolean)
          : [];

      // =================================================
      // MAIN JOB DATA
      // =================================================

      const loadedJob = {
        // ===============================================
        // JOB INFORMATION
        // ===============================================

        id: data.id,
        jobNumber:
          data.jobNumber,

        customerId:
          data.customerId,

        status:
          data.status ||
          "RECEIVED",

        priority:
          data.priority ||
          "NORMAL",

        receivedDate:
          data.receivedDate || "",

        expectedDate:
          data.expectedDate
            ? new Date(
                data.expectedDate
              )
                .toISOString()
                .split("T")[0]
            : "",

        deliveryDate:
          data.deliveryDate || "",

        // ===============================================
        // DEVICE INFORMATION
        // ===============================================

        deviceType:
          data.deviceType || "",

        brand:
          data.brand || "",

        model:
          data.model || "",

        serialNumber:
          data.serialNumber || "",

        processor:
          data.processor || "",

        ram:
          data.ram || "",

        storage:
          data.storage || "",

        graphics:
          data.graphics || "",

        operatingSystem:
          data.operatingSystem || "",

        windowsPassword:
          data.windowsPassword || "",

        biosPassword:
          data.biosPassword || "",

        color:
          data.color || "",

        // ===============================================
        // ACCESSORIES
        // ===============================================

        accessories,

        charger:
          Boolean(data.charger),

        battery:
          Boolean(data.battery),

        bag:
          Boolean(data.bag),

        mouse:
          Boolean(data.mouse),

        keyboard:
          Boolean(data.keyboard),

        adapter:
          Boolean(data.adapter),

        box:
          Boolean(data.box),

        otherAccessories:
          data.otherAccessories || "",

        // ===============================================
        // PHYSICAL CONDITION
        // ===============================================

        screenCondition:
          data.screenCondition || "",

        bodyCondition:
          data.bodyCondition || "",

        liquidDamage:
          Boolean(data.liquidDamage),

        missingKeys:
          Boolean(data.missingKeys),

        hingeBroken:
          Boolean(data.hingeBroken),

        physicalRemarks:
          data.physicalRemarks || "",

        // ===============================================
        // COMPLAINT
        // ===============================================

        complaint:
          data.complaint || "",

        observation:
          data.observation || "",

        internalNotes:
          data.internalNotes || "",

        // ===============================================
        // DIAGNOSIS
        // ===============================================

        diagnosis:
          data.diagnosis || "",

        technicianId:
          data.technicianId || "",

        repairNotes:
          data.repairNotes || "",

        // ===============================================
        // FINANCIAL
        // ===============================================

        diagnosisFee:
          Number(
            data.diagnosisFee ?? 0
          ),

        estimatedCost:
          Number(
            data.estimatedCost ?? 0
          ),

        labourCharge:
          Number(
            data.labourCharge ?? 0
          ),

        advanceAmount:
          Number(
            data.advanceAmount ?? 0
          ),

        discount:
          Number(
            data.discount ?? 0
          ),

        totalAmount:
          Number(
            data.totalAmount ?? 0
          ),

        balanceAmount:
          Number(
            data.balanceAmount ?? 0
          ),

        // ===============================================
        // WARRANTY
        // ===============================================

        warrantyDays:
          Number(
            data.warrantyDays ?? 0
          ),

        warrantyExpiry:
          data.warrantyExpiry || "",

        // ===============================================
        // NOTES
        // ===============================================

        createdBy:
          data.createdBy || "",

        branch:
          data.branch || "",

        // ===============================================
        // DYNAMIC FIELDS
        // ===============================================

        ...dynamicJobFields,
      };

      setJob(loadedJob);

      // =================================================
      // FIND DEVICE TYPE ID
      // =================================================

      try {
        const typeResponse =
          await getDeviceTypes();

        const types =
          typeResponse.data?.data ||
          typeResponse.data ||
          [];

        const foundType =
          Array.isArray(types)
            ? types.find(
                (type: any) =>
                  type.name ===
                  data.deviceType
              )
            : null;

        if (foundType?.id) {
          setDeviceTypeId(
            foundType.id
          );
        }
      } catch (err) {
        console.error(
          "Failed to find device type ID:",
          err
        );
      }
    } catch (err: any) {
      console.error(
        "Failed to load repair job:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to load repair job."
      );

      navigate("/repair-board");
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // DEVICE TYPE CHANGE
  // ===================================================

  function handleDeviceTypeIdChange(
    selectedDeviceTypeId: string
  ) {
    setDeviceTypeId(
      selectedDeviceTypeId
    );

    // The selected device type ID is only
    // needed by the frontend components.
    // The actual job stores deviceType NAME.
  }

  // ===================================================
  // HANDLE FORM CHANGE
  // ===================================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {
    const {
      name,
      value,
      type,
    } = e.target;

    // ================================================
    // ACCESSORY
    // ================================================

    if (
      name.startsWith(
        "accessory_"
      )
    ) {
      const accessoryId =
        value;

      const checked =
        (
          e.target as
            HTMLInputElement
        ).checked;

      setJob(
        (prev: any) => {
          const current =
            prev.accessories ||
            [];

          if (checked) {
            if (
              current.includes(
                accessoryId
              )
            ) {
              return prev;
            }

            return {
              ...prev,
              accessories: [
                ...current,
                accessoryId,
              ],
            };
          }

          return {
            ...prev,
            accessories:
              current.filter(
                (item: string) =>
                  item !==
                  accessoryId
              ),
          };
        }
      );

      return;
    }

    // ================================================
    // NORMAL FIELD
    // ================================================

    setJob(
      (prev: any) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? (
                e.target as
                  HTMLInputElement
              ).checked
            : value,
      })
    );
  }

  // ===================================================
  // CHANGE CUSTOMER
  // ===================================================

  function handleChangeCustomer() {
    setCustomer(null);
  }

  // ===================================================
  // DEVICE INFORMATION FIELDS
  // ===================================================

  const deviceInformationFields =
    deviceTypeFields
      .filter(
        (item: any) =>
          item.deviceField
            ?.category ===
            "DEVICE_INFORMATION" &&
          item.visible !== false &&
          item.deviceField
            ?.active !== false
      )
      .map(
        (item: any) => ({
          deviceFieldId:
            item.deviceFieldId,

          id:
            item.deviceField?.id,

          name:
            item.deviceField?.name,

          fieldType:
            item.deviceField
              ?.fieldType,

          placeholder:
            item.deviceField
              ?.placeholder,

          required:
            item.required,

          visible:
            item.visible,

          displayOrder:
            Number(
              item.displayOrder
            ) || 0,
        })
      )
      .sort(
        (
          a: any,
          b: any
        ) =>
          a.displayOrder -
          b.displayOrder
      );

  // ===================================================
  // PHYSICAL CONDITION FIELDS
  // ===================================================

  const physicalConditionFields =
    deviceTypeFields
      .filter(
        (item: any) =>
          item.deviceField
            ?.category ===
            "PHYSICAL_CONDITION" &&
          item.visible !== false &&
          item.deviceField
            ?.active !== false
      )
      .map(
        (item: any) => ({
          deviceFieldId:
            item.deviceFieldId,

          id:
            item.deviceField?.id,

          name:
            item.deviceField?.name,

          fieldType:
            item.deviceField
              ?.fieldType,

          placeholder:
            item.deviceField
              ?.placeholder,

          required:
            item.required,

          visible:
            item.visible,

          displayOrder:
            Number(
              item.displayOrder
            ) || 0,
        })
      )
      .sort(
        (
          a: any,
          b: any
        ) =>
          a.displayOrder -
          b.displayOrder
      );

  // ===================================================
  // SAVE
  // ===================================================

  async function handleSave() {
    if (!id || !job) {
      return;
    }

    // =================================================
    // VALIDATION
    // =================================================

    if (!customer) {
      alert(
        "Please select a customer."
      );
      return;
    }

    if (!job.deviceType) {
      alert(
        "Device Type is required."
      );
      return;
    }

    if (!job.brand) {
      alert(
        "Brand is required."
      );
      return;
    }

    if (!job.complaint) {
      alert(
        "Complaint is required."
      );
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // REMOVE FRONTEND-ONLY FIELDS
      // =================================================

      const {
        id: _id,
        jobNumber: _jobNumber,
        customer: _customer,
        accessories,
        ...repairJobData
      } = job;

      // Silence TypeScript unused-variable warnings
      void _id;
      void _jobNumber;
      void _customer;

      // =================================================
      // BUILD PAYLOAD
      // =================================================

 const payload = {
  ...repairJobData,

  customerId:
    customer.id,

  technicianId:
    job.technicianId
      ? job.technicianId
      : null,

  diagnosisFee:
    Number(job.diagnosisFee ?? 0),

  estimatedCost:
    Number(job.estimatedCost ?? 0),

  labourCharge:
    Number(job.labourCharge ?? 0),

  advanceAmount:
    Number(job.advanceAmount ?? 0),

  discount:
    Number(job.discount ?? 0),

  totalAmount:
    Number(job.totalAmount ?? 0),

  balanceAmount:
    Number(job.balanceAmount ?? 0),

  warrantyDays:
    Number(job.warrantyDays ?? 0),

  expectedDate:
    job.expectedDate
      ? new Date(
          job.expectedDate
        ).toISOString()
      : null,

  deliveryDate:
    job.deliveryDate
      ? new Date(
          job.deliveryDate
        ).toISOString()
      : null,

  warrantyExpiry:
    job.warrantyExpiry
      ? new Date(
          job.warrantyExpiry
        ).toISOString()
      : null,

  receivedDate:
    job.receivedDate
      ? new Date(
          job.receivedDate
        ).toISOString()
      : null,

  accessories:
    Array.isArray(accessories)
      ? accessories
      : [],
};

      // =================================================
      // UPDATE
      // =================================================

      await updateRepairJob(
        id,
        payload
      );

      alert(
        "Repair Job Updated Successfully."
      );

      navigate(
        "/repair-board"
      );
    } catch (err: any) {
      console.error(
        "UPDATE REPAIR JOB ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
          err.message ||
          "Unable to update repair job."
      );
    } finally {
      setSaving(false);
    }
  }

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow p-8">
          <p className="text-lg text-gray-500">
            Loading Repair Job...
          </p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow p-8">
          <p className="text-lg text-red-600">
            Repair Job could not be loaded.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/repair-board"
              )
            }
            className="mt-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Repair Board
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="max-w-6xl mx-auto">

      {/* =================================================
          TITLE
      ================================================= */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Edit Repair Job
          </h1>

          <p className="text-gray-500 mt-1">
            Job #{job.jobNumber}
          </p>
        </div>

        <div>
          <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
            {job.status}
          </span>
        </div>

      </div>

      {/* =================================================
          CUSTOMER
      ================================================= */}

      {!customer && (
        <CustomerSearch
          onSelect={(c: any) =>
            setCustomer(c)
          }
        />
      )}

      {customer && (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

            <h2 className="text-xl font-bold mb-5">
              Customer Selected
            </h2>

            <div className="space-y-2 text-lg">

              <div>
                <b>Customer Code :</b>{" "}
                {customer.customerCode}
              </div>

              <div>
                <b>Name :</b>{" "}
                {customer.fullName}
              </div>

              <div>
                <b>Phone :</b>{" "}
                {customer.phone}
              </div>

              {customer.email && (
                <div>
                  <b>Email :</b>{" "}
                  {customer.email}
                </div>
              )}

            </div>

            <button
              type="button"
              className="mt-6 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg"
              onClick={
                handleChangeCustomer
              }
            >
              Change Customer
            </button>

          </div>

          {/* =============================================
              DEVICE INFORMATION
          ============================================= */}

          <DeviceInformation
            data={job}
            onChange={handleChange}
            onDeviceTypeIdChange={
              handleDeviceTypeIdChange
            }
            fields={
              deviceInformationFields
            }
          />

          {deviceTypeId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">

              <div className="text-sm text-blue-800">
                <strong>
                  Selected Device Type:
                </strong>{" "}
                {job.deviceType}
              </div>

              <div className="text-sm text-blue-800 mt-1">
                <strong>
                  Device Type ID:
                </strong>{" "}
                {deviceTypeId}
              </div>

              {loadingDeviceTypeFields && (
                <div className="text-sm text-blue-600 mt-2">
                  Loading device field configuration...
                </div>
              )}

            </div>
          )}

          {/* =============================================
              ACCESSORIES
          ============================================= */}

          <Accessories
            data={job}
            onChange={handleChange}
            deviceTypeId={
              deviceTypeId
            }
          />

          {/* =============================================
              PHYSICAL CONDITION
          ============================================= */}

          <PhysicalCondition
            data={job}
            onChange={handleChange}
            fields={
              physicalConditionFields
            }
          />

          {/* =============================================
              COMPLAINT
          ============================================= */}

          <ComplaintSection
            data={job}
            onChange={handleChange}
          />

          {/* =============================================
              FINANCIAL
          ============================================= */}

          <FinancialSection
            data={job}
            onChange={handleChange}
          />

          {/* =============================================
              SAVE
          ============================================= */}

          <div className="flex gap-4 mt-8 pb-10">

            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg shadow-lg"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/repair-board"
                )
              }
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg"
            >
              Cancel
            </button>

          </div>
        </>
      )}

    </div>
  );
}