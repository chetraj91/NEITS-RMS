import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getCustomer,
} from "../api/customer";

import {
  getCustomerLayout,
} from "../api/customerLayout";

import CustomerSearch from "../components/repairJob/CustomerSearch";
import DeviceInformation from "../components/repair/DeviceInformation";
import Accessories from "../components/repair/Accessories";
import PhysicalCondition from "../components/repair/PhysicalCondition";
import ComplaintSection from "../components/repair/ComplaintSection";
import FinancialSection from "../components/repair/FinancialSection";

import {
  createRepairJob,
  getRepairJob,
} from "../api/repairJob";

import {
  getReceivingPrintLayout,
  getReceivingPrintSize,
} from "../api/receivingPrintLayout";

import {
  getReceivingPrinterSettings,
} from "../api/receivingPrinterSetting";

import { getDeviceTypeFields } from "../api/deviceTypeField";

import {
  getSystemSettings,
} from "../api/systemSettings";

import {
  getCompanySettings,
} from "../api/companySettings";

import {
  sendHtmlToPrintAgent,
} from "../utils/repairJobReprint";

export default function NewRepairJobPage() {
  const navigate = useNavigate();
  const [
  searchParams,
] = useSearchParams();

const customerId =
  searchParams.get(
    "customerId"
  );

  // =====================================================
  // CUSTOMER
  // =====================================================

  const [customer, setCustomer] = useState<any>(null);
  const [
  customerLayoutFields,
  setCustomerLayoutFields,
] = useState<any[]>([]);

// =====================================================
// RECEIVING PRINT OPTIONS
// =====================================================

const [
  showPrintOptions,
  setShowPrintOptions,
] = useState(false);

const [
  printVoucher,
  setPrintVoucher,
] = useState(false);

const [
  showVoucherPreview,
  setShowVoucherPreview,
] = useState(false);

const [
  voucherPreviewHtml,
  setVoucherPreviewHtml,
] = useState("");

const [
  neitsVoucherHtml,
  setNeitsVoucherHtml,
] = useState("");

const [
  showNeitsCopyPrompt,
  setShowNeitsCopyPrompt,
] = useState(false);

const [
  voucherPreviewPrinter,
  setVoucherPreviewPrinter,
] = useState("");

const [
  voucherPreviewWidth,
  setVoucherPreviewWidth,
] = useState(297);

const [
  voucherPreviewHeight,
  setVoucherPreviewHeight,
] = useState(210);

const [
  printingPreview,
  setPrintingPreview,
] = useState(false);

const [
  printStickers,
  setPrintStickers,
] = useState(false);

const [
  savedRepairJobId,
  setSavedRepairJobId,
] = useState<string | null>(null);

  // =====================================================
  // DEVICE TYPE ID
  // =====================================================
  //
  // job.deviceType = Device Type NAME
  //
  // deviceTypeId = actual database ID
  //
  // Example:
  //
  // job.deviceType = "Laptop"
  // deviceTypeId = "cmsib8kp70002v87okmj7ftaw"
  //
  // =====================================================

  const [deviceTypeId, setDeviceTypeId] =
    useState<string>("");

  // =====================================================
  // JOB DATA
  // =====================================================

  const [job, setJob] = useState<any>({
    // ---------------------------------------------------
    // DEVICE INFORMATION
    // ---------------------------------------------------

    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    processor: "",
    ram: "",
    storage: "",
    graphics: "",
    operatingSystem: "",
    windowsPassword: "",
    biosPassword: "",

    // ---------------------------------------------------
    // ACCESSORIES
    // ---------------------------------------------------

    accessories: [],
    otherAccessories: "",

    // ---------------------------------------------------
    // PHYSICAL CONDITION
    // ---------------------------------------------------

    screenCondition: "",
    bodyCondition: "",
    liquidDamage: false,
    missingKeys: false,
    hingeBroken: false,
    physicalRemarks: "",

    // ---------------------------------------------------
    // COMPLAINT
    // ---------------------------------------------------

    complaint: "",
    observation: "",
    internalNotes: "",
    importantNoticeAccepted: false,

    // ---------------------------------------------------
    // FINANCIAL
    // ---------------------------------------------------

    diagnosisFee: 0,
    advanceAmount: 0,

    // ---------------------------------------------------
    // OTHER
    // ---------------------------------------------------

    priority: "NORMAL",
    expectedDate: "",
    warrantyDays: 0,
  });

  // =====================================================
  // DEVICE TYPE FIELDS
  // =====================================================

  const [
    deviceTypeFields,
    setDeviceTypeFields,
  ] = useState<any[]>([]);

  const [
    loadingDeviceTypeFields,
    setLoadingDeviceTypeFields,
  ] = useState(false);

  // =====================================================
  // LOAD DEVICE TYPE FIELDS
  // =====================================================

  useEffect(() => {
    async function loadDeviceTypeFields() {
      if (!deviceTypeId) {
        setDeviceTypeFields([]);
        return;
      }

      try {
        setLoadingDeviceTypeFields(true);

        console.log(
          "======================================"
        );

        console.log(
          "NewRepairJobPage - Loading fields"
        );

        console.log(
          "Device Type ID:",
          deviceTypeId
        );

        const res =
          await getDeviceTypeFields(
            deviceTypeId
          );

        console.log(
          "Device Type Fields API Response:",
          res.data
        );

        const rows =
          res.data?.data || [];

        console.log(
          "Device Type Fields:",
          rows
        );

        setDeviceTypeFields(rows);
      } catch (error) {
        console.error(
          "Failed to load device type fields:",
          error
        );

        setDeviceTypeFields([]);
      } finally {
        setLoadingDeviceTypeFields(false);
      }
    }

    loadDeviceTypeFields();
  }, [deviceTypeId]);

    // =====================================================
  // LOAD SYSTEM SETTINGS
  // =====================================================

useEffect(() => {
  async function loadSelectedCustomer() {
    if (!customerId) {
      return;
    }

    try {
      const response =
        await getCustomer(
          customerId
        );

      const selectedCustomer =
        response?.data;

      if (selectedCustomer) {
        setCustomer(
          selectedCustomer
        );
      }
    } catch (error) {
      console.error(
        "Failed to load selected customer:",
        error
      );
    }
  }

  loadSelectedCustomer();
}, [customerId]);

// =====================================================
// LOAD CUSTOMER LAYOUT
// =====================================================

useEffect(() => {
  async function loadCustomerLayout() {
    try {
      const response =
        await getCustomerLayout();

      const fields =
        response?.data ?? [];

      setCustomerLayoutFields(
        Array.isArray(fields)
          ? fields
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load customer layout:",
        error
      );

      setCustomerLayoutFields([]);
    }
  }

  loadCustomerLayout();
}, []);


  useEffect(() => {
    async function loadSystemSettings() {
      try {
        const response =
          await getSystemSettings();

        const settings =
          response?.data ?? {};

        const warrantyDays =
          Number(
            settings.defaultWarrantyDays
          ) || 0;

        setJob(
          (currentJob: any) => ({
            ...currentJob,
            warrantyDays,
          })
        );
      } catch (error) {
        console.error(
          "Failed to load system settings:",
          error
        );
      }
    }

    loadSystemSettings();
  }, []);

  // =====================================================
  // DEVICE TYPE ID CHANGE
  // =====================================================

  function handleDeviceTypeIdChange(
    selectedDeviceTypeId: string
  ) {
    console.log(
      "======================================"
    );

    console.log(
      "Selected Device Type ID:",
      selectedDeviceTypeId
    );

    setDeviceTypeId(
      selectedDeviceTypeId
    );

    // ---------------------------------------------------
    // Clear accessories when device type changes
    // ---------------------------------------------------

    setJob((prev: any) => ({
      ...prev,
      accessories: [],
      otherAccessories: "",
    }));
  }

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

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

    // ===================================================
    // ACCESSORY CHECKBOX
    // ===================================================

    if (
      name.startsWith(
        "accessory_"
      )
    ) {
      const accessoryId =
        value;

      const checked =
        (
          e.target as HTMLInputElement
        ).checked;

      setJob((prev: any) => {
        const current =
          prev.accessories || [];

        // -----------------------------------------------
        // ADD ACCESSORY
        // -----------------------------------------------

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

        // -----------------------------------------------
        // REMOVE ACCESSORY
        // -----------------------------------------------

        return {
          ...prev,

          accessories:
            current.filter(
              (id: string) =>
                id !== accessoryId
            ),
        };
      });

      return;
    }

    // ===================================================
    // NORMAL FORM FIELD
    // ===================================================

    setJob((prev: any) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? (
              e.target as HTMLInputElement
            ).checked
          : value,
    }));
  }

  // =====================================================
  // PREPARE DEVICE INFORMATION FIELDS
  // =====================================================
  //
  // IMPORTANT:
  //
  // Only DEVICE_INFORMATION fields are sent to
  // DeviceInformation component.
  //
  // displayOrder comes from DeviceTypeField mapping.
  //
  // Therefore:
  //
  // Settings → Device Type Fields
  //
  // controls the order here.
  //
  // =====================================================

  const deviceInformationFields =
    deviceTypeFields
      .filter(
        (item: any) =>
          item.deviceField?.category ===
            "DEVICE_INFORMATION" &&
          item.visible !== false &&
          item.deviceField?.active !== false
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
            item.deviceField?.fieldType,

          placeholder:
            item.deviceField?.placeholder,

          required:
            item.required,

          visible:
            item.visible,

          // =============================================
          // IMPORTANT
          // =============================================
          //
          // Use displayOrder from DeviceTypeField.
          //
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

  // =====================================================
  // PREPARE PHYSICAL CONDITION FIELDS
  // =====================================================

  const physicalConditionFields =
    deviceTypeFields
      .filter(
        (item: any) =>
          item.deviceField?.category ===
            "PHYSICAL_CONDITION" &&
          item.visible !== false &&
          item.deviceField?.active !== false
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
            item.deviceField?.fieldType,

          placeholder:
            item.deviceField?.placeholder,

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

  // =====================================================
  // DEBUG
  // =====================================================

  useEffect(() => {
    if (!deviceTypeId) {
      return;
    }

    console.log(
      "======================================"
    );

    console.log(
      "DEVICE INFORMATION FIELDS"
    );

    console.table(
      deviceInformationFields.map(
        (field: any) => ({
          name:
            field.name,

          displayOrder:
            field.displayOrder,

          fieldType:
            field.fieldType,

          required:
            field.required,
        })
      )
    );

    console.log(
      "PHYSICAL CONDITION FIELDS"
    );

    console.table(
      physicalConditionFields.map(
        (field: any) => ({
          name:
            field.name,

          displayOrder:
            field.displayOrder,

          fieldType:
            field.fieldType,

          required:
            field.required,
        })
      )
    );

    console.log(
      "======================================"
    );
  }, [
    deviceTypeId,
    deviceTypeFields,
  ]);

  // =====================================================
  // SAVE REPAIR JOB
  // =====================================================

  async function handleSave() {
    try {
      // =================================================
      // CUSTOMER VALIDATION
      // =================================================

      if (!customer) {
        alert(
          "Please select a customer."
        );

        return;
      }

      // =================================================
      // DEVICE TYPE VALIDATION
      // =================================================

      if (!job.deviceType) {
        alert(
          "Device Type is required."
        );

        return;
      }

      // =================================================
      // DEVICE TYPE ID VALIDATION
      // =================================================

      if (!deviceTypeId) {
        alert(
          "Device Type ID is missing. Please select the Device Type again."
        );

        return;
      }

      // =================================================
      // BRAND VALIDATION
      // =================================================

      if (!job.brand) {
        alert(
          "Brand is required."
        );

        return;
      }

      // =================================================
      // COMPLAINT VALIDATION
      // =================================================

      if (!job.complaint) {
        alert(
          "Complaint is required."
        );

        return;
      }

      // =================================================
      // PREPARE PAYLOAD
      // =================================================
      //
      // IMPORTANT:
      //
      // We DO NOT send:
      //
      // deviceTypeId
      //
      // because RepairJob Prisma model does not contain
      // deviceTypeId.
      //
      // We also DO NOT send:
      //
      // accessories
      //
      // directly to prisma.repairJob.create()
      //
      // because RepairJob has a relation:
      //
      // repairJobAccessories
      //
      // instead of an accessories array column.
      //
      // =================================================

     const {
  accessories,
  ...repairJobData
} = job;

const payload = {
  customerId:
    customer.id,

  ...repairJobData,

  // ===============================================
  // ACCESSORIES
  // ===============================================

  accessories:
    Array.isArray(
      accessories
    )
      ? accessories
      : [],

  diagnosisFee:
    Number(
      job.diagnosisFee
    ) || 0,

  advanceAmount:
    Number(
      job.advanceAmount
    ) || 0,

  warrantyDays:
    Number(
      job.warrantyDays
    ) || 0,

  expectedDate:
    job.expectedDate
      ? new Date(
          job.expectedDate
        ).toISOString()
      : null,
};

      // =================================================
      // DEBUG PAYLOAD
      // =================================================

      console.log(
        "======================================"
      );

      console.log(
        "CREATE REPAIR JOB"
      );

      console.log(
        "Customer:",
        customer
      );

      console.log(
        "Customer ID:",
        customer.id
      );

      console.log(
        "Device Type:",
        job.deviceType
      );

      console.log(
        "Device Type ID:",
        deviceTypeId
      );

      console.log(
        "Accessories:",
        accessories
      );

      console.log(
        "Repair Job Payload:",
        payload
      );

      console.log(
        "======================================"
      );

      // =================================================
      // CREATE REPAIR JOB
      // =================================================

      const res =
        await createRepairJob(
          payload
        );

      console.log(
        "Repair Job Response:",
        res.data
      );

      // =================================================
      // CREATE REPAIR JOB ACCESSORIES
      // =================================================
      //
      // At the moment your existing createRepairJob API
      // saves only RepairJob.
      //
      // The selected accessory IDs are therefore logged
      // here but are NOT sent into RepairJob.create().
      //
      // If your backend createRepairJob service later
      // supports creating RepairJobAccessory records,
      // this is the place to add it.
      //
      // =================================================

      console.log(
        "Selected Accessories:",
        accessories
      );

// =================================================
// SUCCESS
// =================================================

const createdJobId =
  res.data?.data?.id ||
  res.data?.id ||
  null;

setSavedRepairJobId(
  createdJobId
);

setPrintVoucher(false);
setPrintStickers(false);

setShowPrintOptions(true);

    } catch (err: any) {
      console.error(
        "======================================"
      );

      console.error(
        "REPAIR JOB ERROR"
      );

      console.error(
        err
      );

      console.error(
        "Backend Response:",
        err.response?.data
      );

      console.error(
        "======================================"
      );

      alert(
        err.response?.data?.message ||
        err.message ||
        "Unable to save repair job."
      );
    }
  }

  // =====================================================
  // CHANGE CUSTOMER
  // =====================================================

  function handleChangeCustomer() {
    setCustomer(null);

    setDeviceTypeId("");

    setDeviceTypeFields([]);

    setJob({
      deviceType: "",
      brand: "",
      model: "",
      serialNumber: "",
      processor: "",
      ram: "",
      storage: "",
      graphics: "",
      operatingSystem: "",
      windowsPassword: "",
      biosPassword: "",

      accessories: [],
      otherAccessories: "",

      screenCondition: "",
      bodyCondition: "",
      liquidDamage: false,
      missingKeys: false,
      hingeBroken: false,
      physicalRemarks: "",

      complaint: "",
      observation: "",
      internalNotes: "",
      importantNoticeAccepted: false,

      diagnosisFee: 0,
      advanceAmount: 0,

      priority: "NORMAL",
      expectedDate: "",
      warrantyDays: 0,
    });
  }

// =====================================================
// PRINT RECEIVING DOCUMENTS
// =====================================================

 // =================================================
    // SEND HTML TO LOCAL PRINT AGENT
    // =================================================

    async function sendToPrinter(
      html: string,
      printer: string,
      widthMm: number,
      heightMm: number
    ) {

      const response =
        await fetch(
          "http://127.0.0.1:9123/print/html",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              html,
              printer,
              widthMm,
              heightMm,
            }),
          }
        );

      let result: any =
        null;

      try {
        result =
          await response.json();
      } catch {
        // ignore invalid JSON
      }

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
          `Print Agent failed for printer "${printer}".`
        );
      }

            return result;
    }

// =====================================================
// PRINT CUSTOMER COPY
// =====================================================

async function handlePrintPreviewedVoucher() {

  if (!voucherPreviewHtml) {
    alert(
      "Customer voucher preview is not available."
    );
    return;
  }

  if (!voucherPreviewPrinter) {
    alert(
      "Voucher Printer is not configured."
    );
    return;
  }

  try {

    setPrintingPreview(true);

    // -----------------------------------------------
    // PRINT CUSTOMER COPY ONLY
    // -----------------------------------------------

    await sendToPrinter(
      voucherPreviewHtml,
      voucherPreviewPrinter,
      voucherPreviewWidth,
      voucherPreviewHeight
    );

    // -----------------------------------------------
    // CUSTOMER COPY PRINTED SUCCESSFULLY
    // -----------------------------------------------

    setShowVoucherPreview(false);

    setVoucherPreviewHtml("");

    // -----------------------------------------------
    // ASK FOR NEITS COPY
    // -----------------------------------------------

    setShowNeitsCopyPrompt(true);

  } catch (error: any) {

    console.error(
      "Customer voucher printing failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to print customer voucher."
    );

  } finally {

    setPrintingPreview(false);

  }
}


// =====================================================
// CONTINUE WITH STICKERS
// =====================================================

async function showStickerPreviewForCurrentJob() {

 console.log(
    "======================================"
  );

  console.log(
    "STICKER FUNCTION STARTED"
  );

  console.log(
    "savedRepairJobId:",
    savedRepairJobId
  );

  try {
    if (!savedRepairJobId) {
      alert("Repair Job ID is missing.");
      return;
    }

    const printerResponse =
      await getReceivingPrinterSettings();

    const printerSettings =
      printerResponse?.data || {};

    const stickerPrinter =
      printerSettings.stickerPrinter || "";

    if (!stickerPrinter) {
      alert(
        "Sticker Printer is not configured.\n\nPlease go to:\nSettings → Receiving Print Settings"
      );
      return;
    }

    const response =
      await getRepairJob(savedRepairJobId);

    const jobData =
      response?.data?.data ??
      response?.data ??
      response;

      console.log(
  "NEW REPAIR JOB - SAVED JOB FOR STICKER:",
  jobData
);

console.log(
  "JOB NUMBER:",
  jobData?.jobNumber
);

console.log(
  "CUSTOMER:",
  jobData?.customer
);

console.log(
  "COMPLAINT:",
  jobData?.complaint
);

      console.log(
      "NEW REPAIR JOB - SAVED JOB FOR STICKER:",
       jobData
       );

    if (!jobData) {
      alert(
        "Unable to load the saved repair job."
      );
      return;
    }

    const accessories =
      Array.isArray(
        jobData.repairJobAccessories
      )
        ? jobData.repairJobAccessories
        : [];
const [
  jobStickerLayoutRes,
  accessoryLayoutRes,
  jobStickerSizeRes,
  accessorySizeRes,
  companySettingsRes,
  ] = await Promise.all([
 getReceivingPrintLayout("RECEIVING_JOB_STICKER"),
getReceivingPrintLayout("ACCESSORY_STICKER"),
getReceivingPrintSize("RECEIVING_JOB_STICKER"),
getReceivingPrintSize("ACCESSORY_STICKER"),
  getCompanySettings(),
  ]);

  const jobStickerFields =
  jobStickerLayoutRes?.data || [];

  const accessoryFields =
  accessoryLayoutRes?.data || [];

 const jobStickerSize =
  jobStickerSizeRes?.data || {};

 const accessorySize =
  accessorySizeRes?.data || {};

 const company =
  companySettingsRes?.data?.data ??
  companySettingsRes?.data ??
  {};

const companyName =
  String(
    company.companyName || ""
  ).trim();

const companyAddress =
  String(
    company.address ||
    company.companyAddress ||
    ""
  ).trim();

const companyPhone =
  String(
    company.phone ||
    company.contact ||
    company.contactNumber ||
    ""
  ).trim();

    function escapeHtml(value: any) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function getFieldValue(
      fieldKey: string,
      accessoryItem?: any,
      accessoryIndex?: number
    ) {
      const customer =
        jobData.customer || {};

            switch (fieldKey) {

        // =================================================
        // COMPANY INFORMATION — JOB STICKER
        // =================================================

        case "companyName":
          return company?.companyName || "";

        case "companyAddress":
          return (
            company?.address ||
            company?.companyAddress ||
            ""
          );

        case "companyPhone":
          return (
            company?.phone ||
            company?.contact ||
            company?.contactNumber ||
            ""
          );

        // =================================================
        // JOB INFORMATION
        // =================================================

        case "jobNumber":
          return jobData.jobNumber;

        case "receivedDate": {
          const date =
            jobData.receivedDate ||
            jobData.createdAt;

          return date
            ? new Date(date).toLocaleDateString("en-GB")
            : "";
        }

        case "customerName":
          return customer.fullName;

        case "phone":
          return customer.phone;

        case "complaint":
          return jobData.complaint;

        case "deviceType":
          return jobData.deviceType;

        case "brand":
          return jobData.brand;

        case "model":
          return jobData.model;

        case "serialNumber":
          return jobData.serialNumber;

        case "accessoryName":
          return (
            accessoryItem?.accessory?.name ||
            accessoryItem?.accessoryId ||
            ""
          );

        case "itemNumber":
          return `${(accessoryIndex ?? 0) + 1} / ${accessories.length}`;

        case "accessoryCount":
          return accessories.length;

        default:
          return (
            accessoryItem?.[fieldKey] ??
            jobData?.[fieldKey] ??
            customer?.[fieldKey] ??
            ""
          );
      }
    }

    function renderFields(
      fields: any[],
      accessoryItem?: any,
      accessoryIndex?: number
    ) {
      return fields
        .filter(
          (field: any) =>
            field.visible !== false
        )
        .sort(
          (a: any, b: any) =>
            Number(a.displayOrder || 0) -
            Number(b.displayOrder || 0)
        )
        .map((field: any) => {
          const value =
            getFieldValue(
              field.fieldKey,
              accessoryItem,
              accessoryIndex
            );

          if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
          ) {
            return "";
          }

          const span = Math.min(
            Math.max(
              Number(field.columnSpan) || 1,
              1
            ),
            2
          );

          return `
            <div
              style="
                grid-column: span ${span};
                min-width:0;
                word-break:break-word;
                overflow-wrap:anywhere;
                font-size:8px;
                line-height:1.15;
              "
            >
              <strong>
                ${escapeHtml(field.fieldLabel || field.fieldKey)}:
              </strong>
              ${escapeHtml(String(value))}
            </div>
          `;
        })
        .join("");
    }

// =====================================================
// DYNAMIC JOB STICKER FIELDS
// Uses Receiving Print Layout settings
//
// COMPANY FIELDS are excluded here because they
// are printed separately in the sticker header.
// =====================================================

function renderJobStickerFields(
  fields: any[]
) {
  return fields
    .filter(
      (field: any) =>
        field.visible !== false &&
        field.fieldKey !== "companyName" &&
        field.fieldKey !== "companyAddress" &&
        field.fieldKey !== "companyPhone"
    )
    .sort(
      (a: any, b: any) =>
        Number(a.displayOrder || 0) -
        Number(b.displayOrder || 0)
    )
    .map(
      (field: any) => {

        const value =
          getFieldValue(
            field.fieldKey
          );

        // Do not print empty fields
        if (
          value === null ||
          value === undefined ||
          String(value).trim() === ""
        ) {
          return "";
        }

        const fontSize =
          Math.min(
            Math.max(
              Number(
                field.fontSize || 9
              ),
              5
            ),
            40
          );

        const marginMm =
          Math.max(
            Number(
              field.marginMm || 1.5
            ),
            0
          );

        const label =
          field.fieldLabel ||
          field.fieldKey;

        return `
          <div
            class="sticker-row"
            style="
              font-size:${fontSize}px;
              margin-bottom:${marginMm}mm;
            "
          >

            <div class="sticker-label">
              ${escapeHtml(label)} :
            </div>

            <div class="sticker-value">
              ${escapeHtml(
                String(value)
              )}
            </div>

          </div>
        `;
      }
    )
    .join("");
}

// =====================================================
// CREATE STICKER HTML
// =====================================================

    function createStickerHtml(
      body: string,
      widthMm: number,
      heightMm: number,
      title: string
    ) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${escapeHtml(title)}</title>
          <style>
            * { box-sizing: border-box; }
            @page {
              size: ${widthMm}mm ${heightMm}mm;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: ${widthMm}mm;
              height: ${heightMm}mm;
              overflow: hidden;
              font-family: Arial, Helvetica, sans-serif;
              color: #111;
              background: white;
            }
        .document {
  width: ${widthMm}mm;
  height: ${heightMm}mm;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.sticker {
  width: 100%;
  height: 100%;
  border: 1px dashed #555;
  border-radius: 4mm;
  padding: 3mm;
  margin: -2mm 0 0 0;
  overflow: hidden;
  background: #fff;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.company-info {
  width: 100%;
  text-align: center;
  margin: 0 0 2mm 0;
}

.company-name {
  font-size: 11px;
  font-weight: 800;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-details {
  font-size: 7px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-info {
  width: 100%;
  margin-top: 1mm;

  display: flex;
  flex-direction: column;
  flex: none;
  justify-content: space-around;
}

.sticker-row {
  display: flex;
  align-items: baseline;
  width: 100%;
  margin-bottom: 0;
  font-size: 8.5px;
  line-height: 1.15;
}

.sticker-label {
  flex: 0 0 auto;
  font-weight: 700;
  white-space: nowrap;
  margin-right: 2mm;
}

.sticker-value {
  flex: 1;
  min-width: 0;
  border-bottom: 0.5px solid #111;
  padding: 0 1mm 0.6mm 1mm;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.complaint-row {
  margin-bottom: 0;
}

.complaint-row .sticker-value {
  min-height: 4mm;
}
            .grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 1.5mm;
            }
          </style>
        </head>
        <body>${body}</body>
        </html>
      `;
    }

const jobBody = `
  <div class="document">

    <div class="sticker">

          <div class="company-info">

        <div
          class="company-name"
          style="
            font-size:${Math.min(
              Math.max(
                Number(
                  jobStickerFields.find(
                    (f: any) =>
                      f.fieldKey === "companyName"
                  )?.fontSize || 11
              ),
              5
            ),
            40
          )}px;

            margin-bottom:${Math.max(
              Number(
                jobStickerFields.find(
                  (f: any) =>
                    f.fieldKey === "companyName"
                )?.marginMm || 0
              ),
              0
            )}mm;
          "
        >
          ${escapeHtml(
            companyName ||
            "NEPAL ELECTRONICS & IT SOLUTION"
          )}
        </div>


        <div
          class="company-details"
          style="
            font-size:${Math.min(
              Math.max(
                Number(
                  jobStickerFields.find(
                    (f: any) =>
                      f.fieldKey === "companyAddress"
                  )?.fontSize || 7
                ),
                5
              ),
              40
            )}px;
          "
        >
          ${
            companyAddress
              ? escapeHtml(
                  companyAddress
                )
              : ""
          }

          ${
            companyAddress &&
            companyPhone
              ? " | "
              : ""
          }

          ${
            companyPhone
              ? `Contact: ${escapeHtml(
                  companyPhone
                )}`
              : ""
          }
        </div>

      </div>


            <div class="job-info">

        ${renderJobStickerFields(
          jobStickerFields
          )}

         </div>

         </div>

         </div>
`         ;
    await sendHtmlToPrintAgent(
    createStickerHtml(
    jobBody,
    Number(
      jobStickerSize.widthMm || 100
    ),
    Number(
      jobStickerSize.heightMm || 50
    ),
    "Job Sticker"
   ),
   stickerPrinter,
    Number(
    jobStickerSize.widthMm || 100
    ),
    Number(
    jobStickerSize.heightMm || 50
    )
    );
   
   // -----------------------------
// ASK BEFORE PRINTING ACCESSORY STICKERS
// -----------------------------
if (accessories.length > 0) {
  const printAccessories = window.confirm(
    `Job sticker printed successfully.\n\n` +
    `There are ${accessories.length} accessory sticker(s).\n\n` +
    `Do you want to print the accessory sticker(s)?`
  );

  if (printAccessories) {
    for (
      let index = 0;
      index < accessories.length;
      index++
    ) {
      const item = accessories[index];

      const accessoryBody = `
        <div class="document">
          <div class="sticker">
            <div class="header">
              ${escapeHtml(
                companyName ||
                "NEPAL ELECTRONICS & IT SOLUTION"
              )}
            </div>

            <div class="grid">
              ${renderFields(
                accessoryFields,
                item,
                index
              )}
            </div>
          </div>
        </div>
      `;

      const width =
        Number(
          accessorySize.widthMm || 70
        );

      const height =
        Number(
          accessorySize.heightMm || 35
        );

      await sendHtmlToPrintAgent(
        createStickerHtml(
          accessoryBody,
          width,
          height,
          `Accessory Sticker ${
            index + 1
          } of ${
            accessories.length
          }`
        ),
        stickerPrinter,
        width,
        height
      );
    }
  }
}

    setShowPrintOptions(false);

    navigate(
      savedRepairJobId
        ? `/repair-jobs/${savedRepairJobId}`
        : "/repair-jobs"
    );
  } catch (error: any) {
    console.error(
      "Sticker printing failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to print stickers."
    );
  }
}

// =====================================================
// PRINT NEITS COPY
// =====================================================

async function handlePrintNeitsCopy() {

  if (!neitsVoucherHtml) {
    alert(
      "NEITS voucher is not available."
    );
    return;
  }

  if (!voucherPreviewPrinter) {
    alert(
      "Voucher Printer is not configured."
    );
    return;
  }

  try {

    setPrintingPreview(true);

    // -----------------------------------------------
    // PRINT NEITS COPY
    // -----------------------------------------------

    await sendToPrinter(
      neitsVoucherHtml,
      voucherPreviewPrinter,
      voucherPreviewWidth,
      voucherPreviewHeight
    );

    // -----------------------------------------------
    // CLOSE PROMPT
    // -----------------------------------------------

    setShowNeitsCopyPrompt(false);

    setNeitsVoucherHtml("");

    // -----------------------------------------------
    // CONTINUE NEXT PRINTING STEP
    // -----------------------------------------------

    if (printStickers) {

      await showStickerPreviewForCurrentJob();

      return;
    }

    setShowPrintOptions(false);

    navigate(
      savedRepairJobId
        ? `/repair-jobs/${savedRepairJobId}`
        : "/repair-jobs"
    );

  } catch (error: any) {

    console.error(
      "NEITS voucher printing failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to print NEITS copy."
    );

  } finally {

    setPrintingPreview(false);

  }
}

// =====================================================
// SKIP NEITS COPY
// =====================================================

async function handleSkipNeitsCopy() {

  setShowNeitsCopyPrompt(false);

  setNeitsVoucherHtml("");

  // -----------------------------------------------
  // CONTINUE TO STICKERS
  // -----------------------------------------------

  if (printStickers) {

    await showStickerPreviewForCurrentJob();

    return;
  }

  // -----------------------------------------------
  // FINISH
  // -----------------------------------------------

  setShowPrintOptions(false);

  navigate(
    savedRepairJobId
      ? `/repair-jobs/${savedRepairJobId}`
      : "/repair-jobs"
  );
}

async function handlePrintReceivingDocuments() {
  try {
    if (!savedRepairJobId) {
      alert(
        "Repair Job ID is missing."
      );
      return;
    }

    // =================================================
// CHECK WHAT USER WANTS TO PRINT
// =================================================

// NOTHING SELECTED
if (
  !printVoucher &&
  !printStickers
) {
  setShowPrintOptions(false);

  navigate(
    "/repair-jobs"
  );

  return;
}

// =================================================
// STICKERS ONLY
// =================================================

// If user selected ONLY stickers,
// skip the voucher preview completely.
// showStickerPreviewForCurrentJob()
// loads the saved job and prints the
// populated job + accessory stickers.

if (
  !printVoucher &&
  printStickers
) {
  setShowPrintOptions(false);

  await showStickerPreviewForCurrentJob();

  return;
}

    // =================================================
    // GET SAVED PRINTER SETTINGS
    // =================================================

    const printerResponse =
      await getReceivingPrinterSettings();

    const printerSettings =
      printerResponse?.data || {};

    const voucherPrinter =
      printerSettings
        .voucherPrinter ||
      "";

    const stickerPrinter =
      printerSettings
        .stickerPrinter ||
      "";

    // =================================================
    // VALIDATE REQUIRED PRINTERS
    // =================================================

    if (
      printVoucher &&
      !voucherPrinter
    ) {
      alert(
        "Voucher Printer is not configured.\n\nPlease go to:\nSettings → Receiving Print Settings"
      );

      return;
    }

    if (
      printStickers &&
      !stickerPrinter
    ) {
      alert(
        "Sticker Printer is not configured.\n\nPlease go to:\nSettings → Receiving Print Settings"
      );

      return;
    }

    // =================================================
    // LOAD SAVED REPAIR JOB
    // =================================================

    const response =
      await getRepairJob(
        savedRepairJobId
      );

    const jobData =
      response?.data?.data ??
      response?.data ??
      response;

    if (!jobData) {
      alert(
        "Unable to load the saved repair job."
      );

      return;
    }

    const customer =
      jobData.customer || {};

    const accessories =
      Array.isArray(
        jobData.repairJobAccessories
      )
        ? jobData.repairJobAccessories
        : [];

    // =================================================
    // LOAD REQUIRED PRINT LAYOUTS
    // =================================================

 const [
  voucherLayoutRes,
  jobStickerLayoutRes,
  accessoryLayoutRes,
  jobStickerSizeRes,
  accessorySizeRes,
  companySettingsRes,
] = await Promise.all([

  printVoucher
    ? getReceivingPrintLayout(
        "CUSTOMER_VOUCHER"
      )
    : Promise.resolve(null),

  printStickers
    ? getReceivingPrintLayout(
        "JOB_STICKER"
      )
    : Promise.resolve(null),

  printStickers
    ? getReceivingPrintLayout(
        "ACCESSORY_STICKER"
      )
    : Promise.resolve(null),

  printStickers
    ? getReceivingPrintSize(
        "JOB_STICKER"
      )
    : Promise.resolve(null),

  printStickers
    ? getReceivingPrintSize(
        "ACCESSORY_STICKER"
      )
    : Promise.resolve(null),

  getCompanySettings(),
]);

const voucherFields =
  voucherLayoutRes?.data || [];

const jobStickerFields =
  jobStickerLayoutRes?.data || [];

const accessoryFields =
  accessoryLayoutRes?.data || [];

const jobStickerSize =
  jobStickerSizeRes?.data || {};

const accessorySize =
  accessorySizeRes?.data || {};

const company =
  companySettingsRes?.data?.data ??
  companySettingsRes?.data ??
  {};

    // =================================================
    // HTML ESCAPE
    // =================================================

    function escapeHtml(value: any) {
    return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
    }
    
    // =================================================
    // RECEIVED DATE
    // =================================================

    function getReceivedDate() {
      const date =
        jobData.receivedDate ||
        jobData.createdAt;

      if (!date) {
        return "-";
      }

      return new Date(
        date
      ).toLocaleDateString(
        "en-GB"
      );
    }

    // =================================================
    // FIELD VALUE
    // =================================================

  function getFieldValue(
  fieldKey: string,
  accessoryItem?: any,
  accessoryIndex?: number 
  ): any {

  switch (fieldKey) {

    case "jobNumber":
      return jobData.jobNumber;

    case "receivedDate":
      return getReceivedDate();

    case "customerName":
      return customer.fullName;

    case "phone":
      return customer.phone;

    case "email":
      return customer.email;

    case "address":
      return customer.address;

    // =================================================
    // DEVICE INFORMATION
    // =================================================

    case "deviceType":
      return jobData.deviceType;

    case "brand":
      return jobData.brand;

    case "model":
      return jobData.model;

    case "serialNumber":
      return jobData.serialNumber;

    case "processor":
      return jobData.processor;

    case "ram":
      return jobData.ram;

    case "storage":
      return jobData.storage;

    case "graphics":
      return jobData.graphics;

    case "operatingSystem":
      return jobData.operatingSystem;

    case "color":
      return jobData.color;

    // =================================================
    // COMPLAINT
    // =================================================

    case "complaint":
      return jobData.complaint;

    case "observation":
      return jobData.observation;

    // =================================================
    // PHYSICAL CONDITION
    // =================================================

    case "screenCondition":
      return jobData.screenCondition;

    case "bodyCondition":
      return jobData.bodyCondition;

    case "liquidDamage":
      return jobData.liquidDamage
        ? "Yes"
        : "";

    case "missingKeys":
      return jobData.missingKeys
        ? "Yes"
        : "";

    case "hingeBroken":
      return jobData.hingeBroken
        ? "Yes"
        : "";

    case "physicalRemarks":
      return jobData.physicalRemarks;

    // =================================================
    // ACCESSORIES
    // =================================================

      case "accessoryName":
      return (
      accessoryItem?.accessory?.name ||
      accessoryItem?.accessoryId ||
      ""
      );

        case "itemNumber":
       return `${(
       (accessoryIndex ?? 0) + 1
        )} / ${accessories.length}`;

        case "accessoryCount":
         return accessories.length;

      case "accessories": {
       const accessoryNames = accessories
       .map(
       (item: any) =>
        item.accessory?.name ||
        item.accessoryId ||
        ""
        )
       .filter(
       (name: string) =>
        String(name).trim() !== ""
        );

     const otherAccessories =
    String(
      jobData.otherAccessories || ""
    ).trim();

  if (
    accessoryNames.length === 0 &&
    !otherAccessories
  ) {
    return "";
  }

  const parts: string[] = [];

  if (accessoryNames.length > 0) {
    parts.push(
      ...accessoryNames
        .map(
          (name: string) =>
            `✓ ${escapeHtml(name)}`
        )
    );
  }

  if (otherAccessories) {
    parts.push(
      `✓ ${escapeHtml(otherAccessories)}`
    );
  }

  return parts.join("<br>");
}
    // =================================================
    // FINANCIAL
    // =================================================

    case "advanceAmount": {
      const amount =
        Number(
          jobData.advanceAmount
        ) || 0;

      return amount > 0
        ? `Rs. ${amount.toFixed(2)}`
        : "";
    }

    default:
      return "";
  }
}

    // =================================================
    // FIELD HTML
    // =================================================

    function fieldHtml(
      field: any,
      accessoryItem?: any,
      accessoryIndex?: number
    ) {

      const key =
        field.fieldKey;

      // =================================================
      // SIGNATURE
      // =================================================

      if (
        key ===
          "customerSignature" ||
        key ===
          "companySignature"
      ) {

        return `
          <div class="signature-box">

            <div class="signature-line"></div>

            <div class="signature-label">
              ${escapeHtml(
                field.fieldLabel
              )}
            </div>

          </div>
        `;
      }

    const rawValue =
    getFieldValue(
    key,
    accessoryItem,
    accessoryIndex
    );

// =================================================
// DO NOT PRINT EMPTY FIELDS
// =================================================

if (
  rawValue === null ||
  rawValue === undefined ||
  String(rawValue).trim() === ""
) {
  return "";
}

const value =
  typeof rawValue ===
  "string"
    ? rawValue
    : escapeHtml(
        rawValue
      );

      const span =
        Number(
          field.columnSpan || 1
        );

      const columnClass =
        span === 3
          ? "span-3"
          : span === 2
          ? "span-2"
          : "span-1";

      return `
        <div class="field ${columnClass}">

          <div class="field-label">
            ${escapeHtml(
              field.fieldLabel
            )}
          </div>

          <div class="field-value">
            ${value}
          </div>

        </div>
      `;
    }

    // =================================================
    // CREATE PRINT DOCUMENT
    // =================================================

    function createDocumentHtml(
      bodyHtml: string,
      widthMm: number,
      heightMm: number,
      title: string,
      type:
        | "voucher"
        | "sticker"
    ) {

      const voucher =
        type === "voucher";

      return `
        <!DOCTYPE html>

        <html>

        <head>

          <meta charset="UTF-8">

          <title>
            ${escapeHtml(
              title
            )}
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

           @page {
           size: 210mm 297mm;
           margin: 0;
          }

            html,
            body {
              margin: 0;
              padding: 0;

              width:
                ${widthMm}mm;

              height:
                ${heightMm}mm;

              overflow: hidden;

              font-family:
                Arial,
                Helvetica,
                sans-serif;

              color: #111;
            }

            body {
              background: white;
            }

          .document {
          width: ${widthMm}mm;

         height: ${voucher
        ? "auto"
        : `${heightMm}mm`};

        padding: ${voucher
       ? "0"
       : "4mm"};

       overflow: ${voucher
       ? "visible"
      : "hidden"};

        position: relative;
        }

  /* =========================================
   VOUCHER - A4 PORTRAIT / TWO SEPARATE PAGES
  ========================================= */

  .voucher-sheet {
  width: 210mm;
  display: block;
  overflow: visible;
  }

  .voucher-copy {
  width: 210mm;
  height: 297mm;

  padding: 10mm 12mm 12mm 12mm;

  position: relative;
  overflow: hidden;

    background: #fff;

  page-break-after: always;
  break-after: page;
 }

 .voucher-copy:last-child {
  page-break-after: auto;
  break-after: auto;
}

.copy-title {
  text-align: center;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 2mm;
}

.company-header {
  text-align: center;
  border-bottom: 0.8px solid #222;

  padding-bottom: 3mm;

  /* IMPORTANT:
     Extra space between JOB RECEIVED VOUCHER
     and CUSTOMER INFORMATION */
  margin-bottom: 5mm;
}

.company-name {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.15;
}

.company-details {
  display: block;

  font-size: 10px;
  line-height: 1.45;

  margin-top: 1.5mm;
}

.company-details span {
  margin-right: 3mm;
}

.document-title {
  font-size: 11px;
  font-weight: 800;

  margin-top: 2mm;

  letter-spacing: 0.5px;
}

.voucher-section {
  width: 100%;
  margin-bottom: 3mm;
  border: 0.7px solid #111;
  overflow: hidden;
  display: block;
}

.voucher-section-title {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;

  border-bottom: 0.7px solid #111;

  padding: 1.5mm 2mm;

  margin: 0;

  line-height: 1.15;
}

.voucher-fields {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  column-gap: 5mm;

  row-gap: 2mm;

  padding: 2.5mm;
}

.voucher-field {
  min-width: 0;

  font-size: 10px;

  line-height: 1.45;

  word-break: break-word;
  overflow-wrap: anywhere;
}

.voucher-long-value {
  font-size: 10px;

  line-height: 1.45;

  padding: 2.5mm;

  min-height: 8mm;

  word-break: break-word;
  overflow-wrap: anywhere;
}

.physical-value {
  line-height: 1.35;
}

.physical-separator {
  margin-left: 1mm;
  margin-right: 1mm;
}
.important-notice {
  width: 100%;

  margin-top: 3mm;
  margin-bottom: 3mm;

  padding: 3mm 3.5mm;

  border: 0.8px solid #111;

  font-size: 10px;

  line-height: 1.5;

  page-break-inside: avoid;
  break-inside: avoid;
}

.important-notice-title {
  font-size: 11px;

  font-weight: 800;

  margin-bottom: 2mm;

  text-transform: uppercase;
}

.important-notice-text {
  font-size: 10px;

  font-weight: 400;

  line-height: 1.5;
}
.voucher-signatures {
  position: absolute;

  left: 12mm;
  right: 12mm;

  bottom: 38mm;

  display: grid;
  grid-template-columns: 1fr 1fr;

  column-gap: 35mm;

  z-index: 20;
}

.signature-area {
  text-align: center;
}

.signature-line {
  border-top: 0.8px solid #111;
  margin-bottom: 2mm;
}

.signature-title {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.signature-name {
  font-size: 8px;
  margin-top: 1mm;
}

/* =========================================
   VOUCHER FOOTER
========================================= */

.voucher-footer {
  position: absolute;

  left: 8mm;
  right: 8mm;
  bottom: 5mm;

  min-height: 22mm;

  padding: 3mm 4mm 2mm 4mm;

  border: 0.8px solid #111;

  text-align: center;

  font-size: 8px;

  line-height: 1.35;

  color: #111;

  z-index: 10;
}

.voucher-footer-line {
  display: none;
}

.voucher-footer-content {
  display: flex;

  justify-content: center;
  align-items: center;

  flex-wrap: wrap;

  gap: 1.5mm;

  font-size: 8px;

  font-weight: 600;
}

.voucher-footer-content span {
  white-space: nowrap;
}

.footer-separator {
  font-weight: 700;
  margin: 0 1mm;
}

.voucher-footer-thanks {
  margin-top: 2mm;
  padding-top: 1.5mm;

  border-top: 0.5px dashed #555;

  font-size: 8px;

  font-weight: 700;
}

          /* =========================================
               STICKER
            ========================================= */
.sticker-container {
  width: 100%;
  height: 100%;

  box-sizing: border-box;

  border: 1px dashed #555;

  padding: 3mm;

  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

            .sticker-header {
              text-align: center;
              font-size: 12px;
              font-weight: 800;
              border-bottom: 1px solid #222;
              padding-bottom: 2mm;
              margin-bottom: 2mm;
            }

            .sticker-grid {
              display: grid;
              grid-template-columns:
                repeat(2, minmax(0, 1fr));

              gap: 1.5mm;
            }

            .sticker-grid .span-1 {
              grid-column: span 1;
            }

            .sticker-grid .span-2 {
              grid-column: span 2;
            }

            .sticker-grid .span-3 {
              grid-column: span 2;
            }

            .sticker-grid .field {
              margin-bottom: 1mm;
            }

            .sticker-grid .field-label {
              font-size: 7px;
              font-weight: 700;
            }

            .sticker-grid .field-value {
              font-size: 8.5px;
              line-height: 1.1;
              margin-top: 0.5mm;
            }

            @media print {

              html,
              body {
                width:
                  ${widthMm}mm !important;

                height:
                  ${heightMm}mm !important;

                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
              }

              .document {
                width:
                  ${widthMm}mm !important;

                height:
                  ${heightMm}mm !important;

                page-break-after: always;
                break-after: page;
              }

            }

          </style>

        </head>

        <body>

          ${bodyHtml}

        </body>

        </html>
      `;
    }

   // =================================================
// 1. PRINT CUSTOMER VOUCHER
// =================================================

if (printVoucher) {

  // -------------------------------------------------
  // VISIBLE FIELDS
  // -------------------------------------------------

  const visibleFields =
    voucherFields
      .filter(
        (field: any) =>
          field.visible !== false
      )
      .sort(
        (
          a: any,
          b: any
        ) =>
          Number(a.displayOrder) -
          Number(b.displayOrder)
      );

  // -------------------------------------------------
  // COMPANY INFORMATION
  // -------------------------------------------------

  const companyName =
    String(
      company.companyName || ""
    ).trim();

  const companyAddress =
    String(
      company.address || ""
    ).trim();

  const companyPhone =
    String(
      company.phone || ""
    ).trim();

  // IMPORTANT:
  // Company Settings uses panVat
  const companyPan =
    String(
      company.panVat || ""
    ).trim();

    const companyEmail =
    String(
    company.email ||
    company.companyEmail ||
    ""
    ).trim();

  // -------------------------------------------------
  // CUSTOMER INFORMATION
  // -------------------------------------------------

  const customerName =
    String(
      customer.fullName || ""
    ).trim();

  // -------------------------------------------------
  // HELPER: CHECK WHETHER FIELD HAS VALUE
  // -------------------------------------------------

  function hasFieldValue(
    field: any
  ) {
    const value =
      getFieldValue(
        field.fieldKey
      );

    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    );
  }

  // -------------------------------------------------
  // HELPER: RENDER FIELD
  // -------------------------------------------------

  function renderVoucherField(
    field: any
  ) {

    if (
      !field ||
      !hasFieldValue(field)
    ) {
      return "";
    }

    const rawValue =
      getFieldValue(
        field.fieldKey
      );

    if (
      rawValue === null ||
      rawValue === undefined ||
      String(rawValue).trim() === ""
    ) {
      return "";
    }

    const value =
      escapeHtml(
        String(rawValue)
      );

    const label =
      escapeHtml(
        field.fieldLabel || ""
      );

    const span =
      Math.min(
        Math.max(
          Number(
            field.columnSpan || 1
          ),
          1
        ),
        3
      );

    return `
      <div
        class="voucher-field"
        style="grid-column: span ${span};"
      >
        <span class="voucher-label">
          ${label}:
        </span>

        <span class="voucher-value">
          ${value}
        </span>
      </div>
    `;
  }

  // -------------------------------------------------
  // HELPER: RENDER SECTION
  // -------------------------------------------------

  function renderVoucherSection(
    title: string,
    fieldKeys: string[]
  ) {

    const fields =
      visibleFields.filter(
        (field: any) =>
          fieldKeys.includes(
            field.fieldKey
          ) &&
          hasFieldValue(field)
      );

    // Don't print the section if
    // there is no data in it.
    if (
      fields.length === 0
    ) {
      return "";
    }

    return `
      <div class="voucher-section">

        <div class="voucher-section-title">
          ${escapeHtml(title)}
        </div>

        <div class="voucher-fields">
          ${fields
            .map(
              (field: any) =>
                renderVoucherField(field)
            )
            .join("")}
        </div>

      </div>
    `;
  }

  // -------------------------------------------------
  // ACCESSORIES
  // -------------------------------------------------

  const accessoryField =
    visibleFields.find(
      (field: any) =>
        field.fieldKey ===
        "accessories"
    );

  const accessoryValue =
    accessoryField
      ? getFieldValue(
          "accessories"
        )
      : "";

  // -------------------------------------------------
  // ADVANCE PAYMENT
  // -------------------------------------------------

  const advanceField =
    visibleFields.find(
      (field: any) =>
        field.fieldKey ===
        "advanceAmount"
    );

  const advanceValue =
    advanceField
      ? getFieldValue(
          "advanceAmount"
        )
      : "";

  // -------------------------------------------------
  // CUSTOMER SECTION
  // -------------------------------------------------

  function renderCustomerSection() {

    const customerKeys = [
      "jobNumber",
      "customerName",
      "phone",
      "email",
      "address",
      "receivedDate",
    ];

    return renderVoucherSection(
      "Customer Information",
      customerKeys
    );
  }

  // -------------------------------------------------
  // DEVICE SECTION
  // -------------------------------------------------

  function renderDeviceSection() {

    const deviceKeys = [
      "deviceType",
      "brand",
      "model",
      "serialNumber",
      "processor",
      "ram",
      "storage",
      "graphics",
      "operatingSystem",
      "color",
    ];

    return renderVoucherSection(
      "Device Information",
      deviceKeys
    );
  }

  // -------------------------------------------------
  // COMPLAINT SECTION
  // -------------------------------------------------

  function renderComplaintSection() {

    return renderVoucherSection(
      "Complaint & Initial Observation",
      [
        "complaint",
        "observation",
      ]
    );
  }

  // -------------------------------------------------
  // ACCESSORIES SECTION
  // -------------------------------------------------

  function renderAccessoriesSection() {

    if (
      !accessoryField ||
      !accessoryValue ||
      String(
        accessoryValue
      ).trim() === ""
    ) {
      return "";
    }

    return `
      <div class="voucher-section">

        <div class="voucher-section-title">
          Accessories Received
        </div>

        <div class="voucher-long-value">
          ${accessoryValue}
        </div>

      </div>
    `;
  }

  // -------------------------------------------------
  // PHYSICAL CONDITION
  // -------------------------------------------------

  function renderPhysicalSection() {

    const physicalKeys = [
      "screenCondition",
      "bodyCondition",
      "liquidDamage",
      "missingKeys",
      "hingeBroken",
      "physicalRemarks",
    ];

    const fields = visibleFields
      .filter(
        (field: any) =>
          physicalKeys.includes(field.fieldKey) &&
          hasFieldValue(field)
      )
      .sort(
        (a: any, b: any) =>
          Number(a.displayOrder || 0) -
          Number(b.displayOrder || 0)
      );

    if (fields.length === 0) {
      return "";
    }

    return `
      <div class="voucher-section">
        <div class="voucher-section-title">
          Physical Condition
        </div>
        <div class="voucher-fields">
          ${fields
            .map((field: any) => renderVoucherField(field))
            .join("")}
        </div>
      </div>
    `;
  }

  // -------------------------------------------------
  // ADVANCE PAYMENT
  // -------------------------------------------------

  function renderAdvanceSection() {

    if (
      !advanceField ||
      !advanceValue ||
      String(
        advanceValue
      ).trim() === ""
    ) {
      return "";
    }

    return `
      <div class="voucher-section">

        <div class="voucher-section-title">
          Advance Payment
        </div>

        <div class="voucher-long-value">
          ${escapeHtml(
            String(
              advanceValue
            )
          )}
        </div>

      </div>
    `;
  }

  // -------------------------------------------------
  // IMPORTANT NOTICE
  // -------------------------------------------------

  function renderImportantNotice() {

    if (jobData.importantNoticeAccepted !== true) {
      return "";
    }

    const notice =
      "Important Notice: No warranty/responsibility for software, passwords, BitLocker/encryption, data loss or corruption. No warranty for physical, liquid/water, burn, short-circuit or accidental damage. Devices previously disassembled, repaired, modified or tampered with are accepted without warranty for related issues. Customer is advised to back up all important data before service. By signing, the customer confirms acceptance of these terms.";

    return `
      <div class="important-notice">
        <div class="important-notice-title">
          Important Notice
        </div>
        <div class="important-notice-text">
          ${escapeHtml(notice.replace(/^Important Notice:\s*/, ""))}
        </div>
      </div>
    `;
  }

  // -------------------------------------------------
  // SIGNATURES
  // -------------------------------------------------

function renderSignatures() {
  return `
    <div class="voucher-signatures">

      <!-- CUSTOMER SIGNATURE - LEFT -->

      <div class="signature-area">

        <div class="signature-line"></div>

        <div class="signature-title">
          Customer Signature
        </div>

        ${
          customerName
            ? `
              <div class="signature-name">
                ${escapeHtml(
                  customerName
                )}
              </div>
            `
            : ""
        }

      </div>


      <!-- COMPANY SIGNATURE - RIGHT -->

      <div class="signature-area">

        <div class="signature-line"></div>

        <div class="signature-title">
          Company Signature
        </div>

        ${
          companyName
            ? `
              <div class="signature-name">
                ${escapeHtml(
                  companyName
                )}
              </div>
            `
            : ""
        }

      </div>

    </div>
  `;
}

// -------------------------------------------------
// FOOTER
// -------------------------------------------------

function renderVoucherFooter() {
  const footerParts: string[] = [];

  if (companyName) {
    footerParts.push(
      escapeHtml(companyName)
    );
  }

  if (companyAddress) {
    footerParts.push(
      escapeHtml(companyAddress)
    );
  }

  if (companyPhone) {
    footerParts.push(
      `Contact: ${escapeHtml(companyPhone)}`
    );
  }

  if (companyPan) {
    footerParts.push(
      `PAN: ${escapeHtml(companyPan)}`
    );
  }

  if (companyEmail) {
    footerParts.push(
      escapeHtml(companyEmail)
    );
  }

  if (footerParts.length === 0) {
    return "";
  }

  return `
    <div class="voucher-footer">
      <div class="voucher-footer-line"></div>

      <div class="voucher-footer-content">
        ${footerParts
          .map(
            (item) =>
              `<span>${item}</span>`
          )
          .join(
            `<span class="footer-separator">|</span>`
          )}
      </div>

      <div class="voucher-footer-thanks">
        Thank you for choosing our service.
      </div>
    </div>
  `;
}

  // =================================================
  // ONE COMPLETE COPY
  // =================================================

  function renderVoucherCopy(
    copyTitle: string
  ) {

    return `
      <div class="voucher-copy">

        <!-- COPY TITLE -->

        <div class="copy-title">
          ${escapeHtml(
            copyTitle
          )}
        </div>

        <!-- COMPANY HEADER -->

        <div class="company-header">

          ${
            companyName
              ? `
                <div class="company-name">
                  ${escapeHtml(
                    companyName
                  )}
                </div>
              `
              : ""
          }

          <div class="company-details">

            ${
              companyAddress
                ? `
                  <span>
                    ${escapeHtml(
                      companyAddress
                    )}
                  </span>
                `
                : ""
            }

            ${
              companyPhone
                ? `
                  <span>
                    Contact:
                    ${escapeHtml(
                      companyPhone
                    )}
                  </span>
                `
                : ""
            }

            ${
              companyPan
                ? `
                  <span>
                    PAN:
                    ${escapeHtml(
                      companyPan
                    )}
                  </span>
                `
                : ""
            }

          </div>

          <div class="document-title">
            JOB RECEIVED VOUCHER
          </div>

        </div>

        <!-- CUSTOMER -->

        ${renderCustomerSection()}

        <!-- DEVICE -->

        ${renderDeviceSection()}

        <!-- COMPLAINT -->

        ${renderComplaintSection()}

        <!-- ACCESSORIES -->

        ${renderAccessoriesSection()}

        <!-- PHYSICAL CONDITION -->

        ${renderPhysicalSection()}

        <!-- ADVANCE -->

        ${renderAdvanceSection()}

        <!-- IMPORTANT NOTICE -->

        ${renderImportantNotice()}

       <!-- SIGNATURES -->

      ${renderSignatures()}

      <!-- FOOTER -->

       ${renderVoucherFooter()}

        </div>
      `;
        }

  // =================================================
  // ONE A4 PORTRAIT SHEET
  // =================================================

// =================================================
// CUSTOMER COPY HTML
// =================================================

const customerBodyHtml = `
  <div class="document">

    <div class="voucher-sheet">

      ${renderVoucherCopy(
        "CUSTOMER COPY"
      )}

    </div>

  </div>
`;

// =================================================
// NEITS COPY HTML
// =================================================

const neitsBodyHtml = `
  <div class="document">

    <div class="voucher-sheet">

      ${renderVoucherCopy(
        "NEITS COPY"
      )}

    </div>

  </div>
`;

// =================================================
// A4 PORTRAIT
// =================================================

const voucherWidthMm = 210;
const voucherHeightMm = 297;

// =================================================
// CREATE CUSTOMER COPY HTML
// =================================================

const customerHtml =
  createDocumentHtml(
    customerBodyHtml,
    voucherWidthMm,
    voucherHeightMm,
    "Customer Copy",
    "voucher"
  );

// =================================================
// CREATE NEITS COPY HTML
// =================================================

const neitsHtml =
  createDocumentHtml(
    neitsBodyHtml,
    voucherWidthMm,
    voucherHeightMm,
    "NEITS Copy",
    "voucher"
  );

// =================================================
// STORE BOTH COPIES
// =================================================

setVoucherPreviewHtml(
  customerHtml
);

setNeitsVoucherHtml(
  neitsHtml
);

setVoucherPreviewPrinter(
  voucherPrinter
);

setVoucherPreviewWidth(
  voucherWidthMm
);

setVoucherPreviewHeight(
  voucherHeightMm
);

setShowVoucherPreview(
  true
);
// Stop here and wait for the user
// to press "Print Voucher" in preview.
return;

} // CLOSE if (printVoucher)


// =================================================
// 2. PRINT JOB STICKER
// =================================================

if (printStickers) {

  const visibleFields =
    jobStickerFields
      .filter(
        (field: any) =>
          field.visible !== false
      )
      .sort(
        (
          a: any,
          b: any
        ) =>
          Number(a.displayOrder) -
          Number(b.displayOrder)
      );

      const bodyHtml = `

        <div class="document">

          <div class="sticker-container">

            <div class="sticker-header">
              NEPAL ELECTRONICS & IT SOLUTION
            </div>

            <div class="sticker-grid">

              ${visibleFields
                .map(
                  (
                    field: any
                  ) =>
                    fieldHtml(
                      field
                    )
                )
                .join("")}

            </div>

          </div>

        </div>
      `;

      const html =
        createDocumentHtml(
          bodyHtml,
          Number(
            jobStickerSize.widthMm ||
            100
          ),
          Number(
            jobStickerSize.heightMm ||
            50
          ),
          "Job Sticker",
          "sticker"
        );

      await sendToPrinter(
        html,
        stickerPrinter,
        Number(
          jobStickerSize.widthMm ||
          100
        ),
        Number(
          jobStickerSize.heightMm ||
          50
        )
      );

      // =================================================
      // 3. PRINT ACCESSORY STICKERS
      // =================================================

      const visibleAccessoryFields =
        accessoryFields
          .filter(
            (field: any) =>
              field.visible !==
              false
          )
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
          );

      // -----------------------------------------------
      // ONE PRINT JOB PER ACCESSORY
      // -----------------------------------------------

      for (
        let index = 0;
        index <
        accessories.length;
        index++
      ) {

        const item =
          accessories[index];

        const fields =
          visibleAccessoryFields
            .map(
              (
                field: any
              ) =>
                fieldHtml(
                  field,
                  item,
                  index
                )
            )
            .join("");

        const bodyHtml = `

          <div class="document">

            <div class="sticker-container">

              <div class="sticker-header">
                ACCESSORY STICKER
              </div>

              <div class="sticker-grid">

                ${fields}

              </div>

            </div>

          </div>
        `;

        const html =
          createDocumentHtml(
            bodyHtml,
            Number(
              accessorySize.widthMm ||
              70
            ),
            Number(
              accessorySize.heightMm ||
              35
            ),
            `Accessory Sticker ${
              index + 1
            } of ${
              accessories.length
            }`,
            "sticker"
          );

        // ---------------------------------------------
        // WAIT FOR EACH ACCESSORY TO FINISH
        // BEFORE PRINTING THE NEXT ONE
        // ---------------------------------------------

        await sendToPrinter(
          html,
          stickerPrinter,
          Number(
            accessorySize.widthMm ||
            70
          ),
          Number(
            accessorySize.heightMm ||
            35
          )
        );
      }
    }

    // =================================================
    // FINISH
    // =================================================

    setShowPrintOptions(
      false
    );

    navigate(
      "/repair-jobs"
    );

  } catch (error: any) {

    console.error(
      "Receiving print failed:",
      error
    );

    alert(
      error?.message ||
      "Unable to print receiving documents."
    );
  }
}

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="max-w-6xl mx-auto">

      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <h1 className="text-3xl font-bold mb-8">
        New Repair Job
      </h1>

      {/* =================================================
          CUSTOMER SEARCH
      ================================================= */}

      {!customer && (
        <CustomerSearch
          onSelect={(c: any) =>
            setCustomer(c)
          }
        />
      )}

   {/* =================================================
    CUSTOMER SELECTED
================================================= */}

{customer && (
  <>
    {/* =============================================
        CUSTOMER INFORMATION
    ============================================= */}

    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

      <h2 className="text-xl font-bold mb-5">
        Customer Selected
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

       {customerLayoutFields
  .filter(
    (field: any) => {
      const value =
        customer[
          field.fieldKey
        ];

        return (
        field.visible !== false &&
        value !== null &&
        value !== undefined &&
        String(value).trim() !== "" &&
        value !== "-"
       );
       }
      )
     .sort(

            (
              a: any,
              b: any
            ) =>
              Number(
                a.displayOrder || 0
              ) -
              Number(
                b.displayOrder || 0
              )
          )
          .map(
            (field: any) => {

              const value =
                customer[
                  field.fieldKey
                ];

              const span =
                Number(
                  field.columnSpan || 1
                );

              const columnClass =
                span === 3
                  ? "md:col-span-3"
                  : span === 2
                  ? "md:col-span-2"
                  : "md:col-span-1";

              return (
                <div
                  key={
                    field.id ||
                    field.fieldKey
                  }
                  className={
                    columnClass
                  }
                >

                  <label className="font-semibold text-gray-700">
                    {
                      field.fieldLabel
                    }
                  </label>

                  <p className="mt-1">
                    {value ||
                      "-"}
                  </p>

                </div>
              );
            }
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

    {/* =============================================
        DEBUG INFORMATION
    ============================================= */}

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
      deviceTypeId={deviceTypeId}
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
        IMPORTANT NOTICE / VOUCHER TERMS
    ============================================= */}

    <div className="mt-8 mb-6 rounded-lg border border-amber-300 bg-amber-50 p-5">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="importantNoticeAccepted"
          checked={job.importantNoticeAccepted === true}
          onChange={handleChange}
          className="mt-1 h-5 w-5"
        />

        <div>
          <div className="font-semibold text-gray-900">
            Include Important Notice on Voucher
          </div>

          <p className="mt-2 text-sm leading-6 text-gray-700">
            Important Notice: No warranty/responsibility for software, passwords, BitLocker/encryption, data loss or corruption. No warranty for physical, liquid/water, burn, short-circuit or accidental damage. Devices previously disassembled, repaired, modified or tampered with are accepted without warranty for related issues. Customer is advised to back up all important data before service. By signing, the customer confirms acceptance of these terms.
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Check this box if this notice should be printed on the customer/company voucher.
          </p>
        </div>
      </label>
    </div>

    {/* =============================================
        SAVE
    ============================================= */}

    <div className="mt-8 pb-10">

      <button
        type="button"
        onClick={handleSave}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg"
      >
        Save Repair Job
      </button>

     </div>
    </>
       )}

{/* =====================================================
    RECEIVING PRINT OPTIONS
===================================================== */}

{showPrintOptions && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">

      <h2 className="text-2xl font-bold mb-2">
        Repair Job Created Successfully
      </h2>

      <p className="text-gray-500 mb-6">
        Job has been received successfully.
        Choose what you want to print.
      </p>

      <div className="space-y-4">

        {/* CUSTOMER VOUCHER */}

        <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">

          <input
            type="checkbox"
            checked={printVoucher}
            onChange={(e) =>
              setPrintVoucher(
                e.target.checked
              )
            }
            className="w-5 h-5"
          />

          <div>
            <div className="font-semibold">
              Print Customer Voucher
            </div>

            <div className="text-sm text-gray-500">
              Voucher to give to the customer
            </div>
          </div>

        </label>

      {/* STICKERS */}

<label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">

  <input
    type="checkbox"
    checked={printStickers}
    onChange={(e) =>
      setPrintStickers(
        e.target.checked
      )
    }
    className="w-5 h-5"
  />

  <div>

    <div className="font-semibold">
      Print Stickers
    </div>

    <div className="text-sm text-gray-500">
      Job sticker + all received accessory stickers
    </div>

  </div>

</label>

      </div>

      <div className="flex justify-end gap-3 mt-8">

        <button
          type="button"
          onClick={() => {
            setShowPrintOptions(false);

            navigate(
              "/repair-jobs"
            );
          }}
          className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
        >
          Skip
        </button>

        <button
      type="button"
     onClick={
      handlePrintReceivingDocuments
     }
     className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
     >
    Continue to Preview / Print
     </button>

      </div>

    </div>

  </div>
)}
{/* =====================================================
    NEITS COPY PROMPT
===================================================== */}

{showNeitsCopyPrompt && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[65]">
    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-2">
        Customer Copy Printed
      </h2>

      <p className="text-gray-600 mb-6">
        Would you like to print the NEITS copy?
      </p>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSkipNeitsCopy}
          className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          No / Skip
        </button>

        <button
          type="button"
          onClick={handlePrintNeitsCopy}
          disabled={printingPreview}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold"
        >
          {printingPreview
            ? "Printing..."
            : "Print NEITS Copy"}
        </button>
      </div>
    </div>
  </div>
)}

{/* =====================================================
    VOUCHER PREVIEW
===================================================== */}

{showVoucherPreview && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">

    <div className="bg-white rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col">

      {/* HEADER */}

      <div className="flex items-center justify-between px-6 py-4 border-b">

        <div>
          <h2 className="text-xl font-bold">
            Voucher Preview
          </h2>

          <p className="text-sm text-gray-500">
            Check the voucher before printing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowVoucherPreview(false);
          }}
          className="text-gray-500 hover:text-gray-900 text-2xl"
        >
          ×
        </button>

      </div>


      {/* PREVIEW */}

      <div className="flex-1 bg-gray-100 overflow-auto p-6">

        <div className="flex justify-center">

          <iframe
            title="Voucher Preview"
            srcDoc={voucherPreviewHtml}
            className="bg-white shadow-xl border"
            style={{
              width: `${voucherPreviewWidth}mm`,
              height: `${voucherPreviewHeight}mm`,
              maxWidth: "100%",
            }}
          />

        </div>

      </div>

      {/* FOOTER */}

      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">

        <button
          type="button"
          onClick={() => {
            setShowVoucherPreview(false);
          }}
          disabled={printingPreview}
          className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Close
        </button>


        <button
          type="button"
          onClick={
            handlePrintPreviewedVoucher
          }
          disabled={
            printingPreview
          }
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold"
        >
          {printingPreview
            ? "Printing..."
            : "Print Voucher"}
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
}

