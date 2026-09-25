
import { useEffect, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { formatNepaliDateTime } from "../utils/nepaliDate";

import { getInventory } from "../api/inventory";

import {
  getRepairParts,
  addRepairPart,
  deleteRepairPart,
} from "../api/repairPart";

import {
  getRepairJob,
  updateRepairJob,
  updateRepairStatus,
} from "../api/repairJob";

import {
  getPaymentMethods,
} from "../api/paymentMethod";

import {
  receivePayment,
  getPayments,
  sendDueAmountReminder,
  sendRepairDelayedSms,
   sendPartsRequired,
   sendCustomerApprovalRequired,
} from "../api/payment";

import {
  sendFeedbackRequestSms,
  getFeedbackRequestStatus,
} from "../api/sms";

import {
  getReceivingPrintLayout,
  getReceivingPrintSize,
} from "../api/receivingPrintLayout";
import {
  getReceivingPrinterSettings,
} from "../api/receivingPrinterSetting";
import {
  getCompanySettings,
} from "../api/companySettings";
import {
  buildPortraitReceivingVoucherHtml,
  buildDetailJobStickerHtml,
  sendHtmlToPrintAgent,
} from "../utils/repairJobReprint";

export default function RepairJobDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showPrintDocuments, setShowPrintDocuments] = useState(false);
  const [printingReceivingDocument, setPrintingReceivingDocument] = useState(false);

  const [showVoucherPreview, setShowVoucherPreview] = useState(false);
  const [voucherPreviewHtml, setVoucherPreviewHtml] = useState("");
  const [neitsVoucherHtml, setNeitsVoucherHtml] = useState("");
  const [showNeitsCopyPrompt, setShowNeitsCopyPrompt] = useState(false);
  const [voucherPreviewPrinter, setVoucherPreviewPrinter] = useState("");
  const [voucherPreviewWidth, setVoucherPreviewWidth] = useState(210);
  const [voucherPreviewHeight, setVoucherPreviewHeight] = useState(297);
  const [printingVoucherPreview, setPrintingVoucherPreview] = useState(false);
  const [pendingStickerAfterVoucher, setPendingStickerAfterVoucher] = useState(false);

  // =========================================================
  // DIAGNOSIS
  // =========================================================

  const [diagnosis, setDiagnosis] = useState("");

  // =========================================================
  // ESTIMATE / COSTING
  // =========================================================

  const [labourCharge, setLabourCharge] = useState(0);
  const [discount, setDiscount] = useState(0);

  // =========================================================
  // INVENTORY / PARTS
  // =========================================================

  const [inventory, setInventory] = useState<any[]>([]);
  const [repairParts, setRepairParts] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState("");

  // =========================================================
  // PAYMENTS
  // =========================================================

  const [payments, setPayments] = useState<any[]>([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [sendingDueSms, setSendingDueSms] = useState(false);
  const [sendingPartsSms, setSendingPartsSms] =
  useState(false);

  const [
  sendingApprovalSms,
  setSendingApprovalSms,
] = useState(false);

const [
  sendingFeedbackRequest,
  setSendingFeedbackRequest,
] = useState(false);

const [
  feedbackRequestSent,
  setFeedbackRequestSent,
] = useState(false);

const [
  paymentMethods,
  setPaymentMethods,
] = useState<any[]>([]);

  const [paymentRemarks, setPaymentRemarks] = useState("");

  // =========================================================
  // DELIVERY CONFIRMATION
  // =========================================================

  const [showDeliveryConfirm, setShowDeliveryConfirm] =
    useState(false);

    // =========================================================
// FINAL ACCESSORY CONFIRMATION
// =========================================================

const [
  confirmedAccessories,
  setConfirmedAccessories,
] = useState<Record<string, boolean>>({});

// =========================================================
// LOAD DATA
// =========================================================

useEffect(() => {
  if (!id) return;

  loadJob();
  loadInventory();
  loadRepairParts();
  loadPayments();
  loadPaymentMethods();

  getFeedbackRequestStatus(id)
    .then((response) => {
      setFeedbackRequestSent(
        Boolean(response?.alreadySent)
      );
    })
    .catch((error) => {
      console.error(
        "Failed to load feedback request status:",
        error
      );
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

// =========================================================
// SCROLL TO PARTS USED WHEN RETURNING FROM INVENTORY
// =========================================================

useEffect(() => {
  if (loading) return;

  if (window.location.hash !== "#parts-used") return;

  const timer = window.setTimeout(() => {
    const partsSection =
      document.getElementById("parts-used");

    if (partsSection) {
      partsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Remove the hash after the one-time scroll.
      // This prevents payment/reload from scrolling
      // back to Parts Used again.
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, 150);

  return () => {
    window.clearTimeout(timer);
  };
}, [loading, id]);

// =========================================================
// RESET ACCESSORY CONFIRMATIONS WHEN JOB CHANGES
// =========================================================

useEffect(() => {
  setConfirmedAccessories({});
}, [id]);

// =========================================================
// LOAD PAYMENT METHODS
// =========================================================

async function loadPaymentMethods() {
    try {
    const response =
      await getPaymentMethods(true);

    const methods =
      Array.isArray(response)
        ? response
        : response?.data ?? [];

      setPaymentMethods(
      Array.isArray(methods)
        ? methods
        : []
      );
      } catch (error) {
      console.error(
      "Failed to load payment methods:",
      error
    );
  }
}

// =========================================================
// LOAD JOB WITHOUT CHANGING MAIN CONTENT SCROLL POSITION
// =========================================================

async function reloadJobPreserveScroll() {
  const main =
    document.querySelector(
      "main"
    ) as HTMLElement | null;

  const scrollTop =
    main?.scrollTop || 0;

  await loadJob();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (main) {
        main.scrollTop =
          scrollTop;
      }
    });
  });
}

  // =========================================================
  // LOAD REPAIR JOB
  // =========================================================

  async function loadJob() {
    try {
      setLoading(true);

      const res = await getRepairJob(id!);
      const data = res.data?.data ?? res.data;

      console.log("Repair Job API Response:", res.data);
      console.log("Actual Repair Job:", data);

      setJob(data);

      setDiagnosis(data.diagnosis || "");

      setLabourCharge(
        Number(data.labourCharge ?? 0)
      );
      setDiscount(
     Number(data.discount ?? 0)
      );
    } catch (err) {
      console.error("Failed to load repair job:", err);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // LOAD INVENTORY
  // =========================================================
// =========================================================
// LOAD INVENTORY
// =========================================================

async function loadInventory() {
  try {
    const res = await getInventory();

    console.log("========== INVENTORY RESPONSE ==========");
    console.log("Full response:", res);
    console.log(
  "INVENTORY JSON:",
  JSON.stringify(res.data, null, 2)
);

    const data = res.data;

    let inventoryList: any[] = [];

    // API returns array directly
    if (Array.isArray(data)) {
      inventoryList = data;
    }

    // Common API format: { data: [...] }
    else if (Array.isArray(data?.data)) {
      inventoryList = data.data;
    }

    // Common API format: { items: [...] }
    else if (Array.isArray(data?.items)) {
      inventoryList = data.items;
    }

    // Common API format: { inventory: [...] }
    else if (Array.isArray(data?.inventory)) {
      inventoryList = data.inventory;
    }

    console.log("Final inventory list:", inventoryList);
    console.log("Final inventory count:", inventoryList.length);

    setInventory(inventoryList);

  } catch (err) {
    console.error("Failed to load inventory:", err);
    setInventory([]);
  }
}
  // =========================================================
  // LOAD REPAIR PARTS
  // =========================================================

  async function loadRepairParts() {
    try {
      const res = await getRepairParts(id!);

      setRepairParts(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load repair parts:",
        err
      );
    }
  }

  // =========================================================
  // LOAD PAYMENTS
  // =========================================================

  async function loadPayments() {
    try {
      const res = await getPayments(id!);

      console.log("Payments API:", res);

      setPayments(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load payments:",
        err
      );
    }
  }

  // =========================================================
  // MONEY HELPERS
  // =========================================================

  function getPartUnitPrice(part: any): number {
    return Number(
      part?.price ??
        part?.unitPrice ??
        part?.sellingPrice ??
        part?.inventory?.sellingPrice ??
        part?.inventory?.price ??
        0
    );
  }

  function getPartQuantity(part: any): number {
    return Number(
      part?.quantity ?? 0
    );
  }

  // =========================================================
  // PARTS TOTAL
  // =========================================================

  const partsTotal = useMemo(() => {
    return repairParts.reduce(
      (sum: number, part: any) => {
        const quantity =
          getPartQuantity(part);

        const unitPrice =
          getPartUnitPrice(part);

        return (
          sum +
          Math.max(0, quantity) *
            Math.max(0, unitPrice)
        );
      },
      0
    );
  }, [repairParts]);

  // =========================================================
  // FINANCIAL VALUES
  // =========================================================

  const diagnosisFee = Math.max(
    0,
    Number(job?.diagnosisFee ?? 0)
  );

  /*
   * Advance paid when the repair job was received.
   *
   * This is NOT displayed in Estimate & Costing.
   * It is displayed in Payment History.
   */
  const storedAdvanceAmount = Math.max(
    0,
    Number(job?.advanceAmount ?? 0)
  );

  const paymentsTotal = useMemo(() => {
    return payments.reduce(
      (sum: number, payment: any) =>
        sum +
        Math.max(
          0,
          Number(payment?.amount ?? 0)
        ),
      0
    );
  }, [payments]);

  const advancePayment =
    Math.max(
      0,
      storedAdvanceAmount
    );

  const totalPaid =
    Math.max(
      0,
      advancePayment +
        paymentsTotal
    );

  // =========================================================
  // ESTIMATE TOTAL
  //
  // ONLY:
  // Parts Cost
  // Diagnosis Fee
  // Service Charge
  // Total
  // =========================================================

const estimateTotal =
  partsTotal +
  Math.max(0, Number(labourCharge || 0)) +
  diagnosisFee;

const billingDiscount = Math.max(
  0,
  Number(discount || 0)
);

const finalTotal = Math.max(
  0,
  estimateTotal - billingDiscount
);

const payableAmount = Math.max(
  0,
  finalTotal - totalPaid
);

const refund = Math.max(
  0,
  totalPaid - finalTotal
);
  // =========================================================
  // STATUS
  // =========================================================

  const currentStatus =
    job?.status || "RECEIVED";

// =========================================================
// LOCK STATES
// =========================================================

const alreadyDelivered =
  job?.status === "DELIVERED";

const repairLocked =
  job?.status === "IN_PROGRESS" ||
  job?.status === "WAITING_PARTS" ||
  job?.status === "READY" ||
  job?.status === "DELIVERED" ||
  job?.status === "NOT_REPAIRABLE";

const estimateLocked =
  repairLocked;

const partsLocked =
  repairLocked;

const discountLocked =
  Number(job?.discount ?? 0) > 0 ||
  alreadyDelivered;

  // =========================================================
  // SAVE DIAGNOSIS
  // =========================================================

  async function saveDiagnosis() {
    try {
      await updateRepairJob(id!, {
        diagnosis,
        status: "DIAGNOSIS",
      });

      alert(
        "Diagnosis Updated Successfully"
      );

     await reloadJobPreserveScroll();
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to update diagnosis"
      );
    }
  }

  async function markNotRepairable() {
  const confirmed = window.confirm(
    "This item is not repairable. Do you want to return it to the customer?"
  );

  if (!confirmed) return;

  try {
    await updateRepairJob(id!, {
      diagnosis,
      status: "NOT_REPAIRABLE",
    });

    alert(
      "Job marked as NOT REPAIRABLE. The item can be returned to the customer."
    );

   await reloadJobPreserveScroll();
  } catch (err: any) {
    console.error(err);

    alert(
      err.response?.data?.message ||
        err.message ||
        "Failed to mark job as not repairable."
    );
  }
}

  // =========================================================
  // SAVE ESTIMATE
  //
  // Parts Cost is automatic.
  // Total = Parts + Diagnosis Fee + Service Charge.
  // =========================================================

  async function saveEstimate() {
  if (estimateLocked) {
    alert(
      "Estimate is locked because it has already been approved."
    );
    return;
  }

  try {
    await updateRepairJob(id!, {
      estimatedCost: partsTotal,

      labourCharge: Math.max(
        0,
        Number(labourCharge || 0)
      ),

      totalAmount: estimateTotal,

      balanceAmount: Math.max(
        0,
        estimateTotal - totalPaid
      ),

      status: "WAITING_APPROVAL",
    });

    alert(
      "Estimate Saved Successfully. Please approve the estimate."
    );

   await reloadJobPreserveScroll();
  } catch (err: any) {
    console.error(err);

    alert(
      err.response?.data?.message ||
        err.message ||
        "Failed to save estimate"
    );
  }
}

  // =========================================================
  // APPROVE ESTIMATE
  // =========================================================

  async function approveEstimate() {
    if (estimateLocked) {
      alert(
        "Estimate has already been approved."
      );
      return;
    }

    if (
      job?.status !==
      "WAITING_APPROVAL"
    ) {
      alert(
        "Please save the estimate first."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to approve this estimate? After approval, the estimate cannot be edited."
      );

    if (!confirmed) return;

    try {
      await updateRepairStatus(
        id!,
        "IN_PROGRESS"
      );

      alert(
        "Estimate Approved. Repair is now IN PROGRESS."
      );

     await reloadJobPreserveScroll();
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve estimate"
      );
    }
  }

  // =========================================================
  // MARK AS READY
  // =========================================================

  async function markAsReady() {
    if (
      job?.status !==
      "IN_PROGRESS"
    ) {
      return;
    }

    try {
      await updateRepairStatus(
        id!,
        "READY"
      );

      alert(
        "Repair marked as READY."
      );

     await reloadJobPreserveScroll();
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to mark repair as ready"
      );
    }
  }

  // =========================================================
// TOGGLE ACCESSORY FINAL CONFIRMATION
// =========================================================

function toggleAccessoryConfirmation(
  accessoryId: string
) {
  setConfirmedAccessories(
    (prev) => ({
      ...prev,
      [accessoryId]:
        !prev[accessoryId],
    })
  );
}

// =========================================================
// DELIVERY
// =========================================================

async function deliverJob() {
  if (alreadyDelivered) {
    alert(
      "This job has already been delivered."
    );
    return;
  }

  if (
    job?.status !== "READY" &&
    job?.status !== "NOT_REPAIRABLE"
  ) {
    alert(
      "Only READY or NOT REPAIRABLE jobs can be returned to the customer."
    );
    return;
  }

  // =====================================================
  // FINAL ACCESSORY CONFIRMATION
  // =====================================================

  const accessories =
    Array.isArray(
      job?.repairJobAccessories
    )
      ? job.repairJobAccessories
      : [];

  const unconfirmedAccessories =
    accessories.filter(
      (item: any) =>
        item.received !== false &&
        !confirmedAccessories[
          item.id
        ]
    );

  if (
    unconfirmedAccessories.length > 0
  ) {
    alert(
      "Please confirm all received accessories before delivery."
    );
    return;
  }

  // =====================================================
  // OPEN DELIVERY CONFIRMATION
  // =====================================================

  setShowDeliveryConfirm(
    true
  );
}

  // =========================================================
  // CONFIRM DELIVERY
  // =========================================================

  async function confirmDelivery() {
    if (alreadyDelivered) {
      setShowDeliveryConfirm(
        false
      );

      alert(
        "This job has already been delivered."
      );

      return;
    }

    if (
     job?.status !== "READY" &&
     job?.status !== "NOT_REPAIRABLE"
    ) {
     setShowDeliveryConfirm(false);
     alert(
    "Only READY or NOT REPAIRABLE jobs can be returned to the customer."
    );
    return;
   }

    try {
      await updateRepairStatus(
        id!,
        "DELIVERED"
      );

      setShowDeliveryConfirm(
        false
      );

      alert(
        "Job Delivered Successfully."
      );

      await reloadJobPreserveScroll();
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to deliver job"
      );
    }
  }

  // =========================================================
  // RECEIVE PAYMENT
  // =========================================================

  async function savePayment() {
    if (paymentAmount <= 0) {
      alert(
        "Please enter a valid payment amount."
      );

      return;
    }

       if (payableAmount <= 0 && refund <= 0) {
      alert("There is no outstanding amount for this invoice.");
       return;
       }

    try {
      await receivePayment({
        repairJobId: id!,
        amount: paymentAmount,
        method: paymentMethod,
        remarks: paymentRemarks,
      });

      alert(
        "Payment received successfully."
      );

      setPaymentAmount(0);
      setPaymentMethod("Cash");
      setPaymentRemarks("");

      await loadPayments();
      await reloadJobPreserveScroll();
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to receive payment."
      );
    }
  }

  // =========================================================
// SEND DUE AMOUNT REMINDER SMS
// =========================================================

async function handleSendDueAmountSms() {
  if (!id) return;

  if (payableAmount <= 0) {
    alert("There is no outstanding due amount.");
    return;
  }

  if (sendingDueSms) return;

  try {
    setSendingDueSms(true);

    const response =
      await sendDueAmountReminder(id);

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

// =========================================================
// SEND REPAIR DELAYED SMS
// =========================================================

async function handleSendRepairDelayedSms() {
  if (!id) return;

  const delayReason =
    window.prompt(
      "Why is the repair delayed?"
    );

  if (
    !delayReason ||
    !delayReason.trim()
  ) {
    return;
  }

  const expectedDate =
    window.prompt(
      "Enter expected completion date (YYYY-MM-DD):"
    );

  if (
    !expectedDate ||
    !expectedDate.trim()
  ) {
    return;
  }

  try {

 const response =
  await sendRepairDelayedSms(
    id,
    delayReason.trim(),
    expectedDate.trim()
  );

console.log(
  "REPAIR DELAYED SMS RESPONSE:",
  response
);

alert(
  response?.message ||
    "Repair delayed SMS sent successfully."
);

} catch (error: any) {

    console.error(
      "SEND REPAIR DELAYED SMS ERROR:",
      error
    );

    alert(
      error?.response?.data?.message ||
        error?.message ||
        "Unable to send repair delayed SMS."
    );
  }
}

// =========================================================
// SEND PARTS REQUIRED SMS
// =========================================================

async function handleSendPartsRequiredSms() {
  if (!id) return;

  if (sendingPartsSms) return;

  try {
    setSendingPartsSms(true);

    const response =
      await sendPartsRequired(id);

    console.log(
      "PARTS REQUIRED SMS RESPONSE:",
      response
    );

    alert(
      response?.message ||
        "Parts required SMS sent successfully."
    );

  } catch (error: any) {

    console.error(
      "SEND PARTS REQUIRED SMS ERROR:",
      error
    );

    alert(
      error?.response?.data?.message ||
        error?.message ||
        "Unable to send parts required SMS."
    );

  } finally {
    setSendingPartsSms(false);
  }
}

// =========================================================
// SEND CUSTOMER APPROVAL REQUIRED SMS
// =========================================================

async function handleSendCustomerApprovalSms() {
  if (!id) return;

  if (sendingApprovalSms) return;

  try {
    setSendingApprovalSms(true);

    const response =
      await sendCustomerApprovalRequired(id);

    console.log(
      "CUSTOMER APPROVAL SMS RESPONSE:",
      response
    );

    alert(
      response?.message ||
        "Customer approval SMS sent successfully."
    );

  } catch (error: any) {

    console.error(
      "SEND CUSTOMER APPROVAL SMS ERROR:",
      error
    );

    alert(
      error?.response?.data?.message ||
        error?.message ||
        "Unable to send customer approval SMS."
    );

  } finally {
    setSendingApprovalSms(false);
  }
}

// =========================================================
// SEND FEEDBACK REQUEST SMS
// =========================================================

async function handleSendFeedbackRequest() {
  if (!id) return;

  if (sendingFeedbackRequest) return;

  if (feedbackRequestSent) {
    alert(
      "Feedback request has already been sent for this job."
    );
    return;
  }

  try {
    setSendingFeedbackRequest(true);

    const response =
      await sendFeedbackRequestSms(id);

    console.log(
      "FEEDBACK REQUEST SMS RESPONSE:",
      response
    );

    if (response?.alreadySent) {
      setFeedbackRequestSent(true);

      alert(
        "Feedback request has already been sent for this job."
      );

      return;
    }

    if (response?.success === false) {
      throw new Error(
        response?.message ||
          "Unable to send feedback request SMS."
      );
    }

    setFeedbackRequestSent(true);

    alert(
      response?.message ||
        "Feedback request SMS sent successfully."
    );

  } catch (error: any) {

    console.error(
      "SEND FEEDBACK REQUEST SMS ERROR:",
      error
    );

    // IMPORTANT:
    // If SMS fails, keep button enabled for retry.
    setFeedbackRequestSent(false);

    alert(
      error?.response?.data?.message ||
        error?.message ||
        "Unable to send feedback request SMS."
    );

  } finally {
    setSendingFeedbackRequest(false);
  }
}

  // =========================================================
  // ADD PART
  // =========================================================

  async function savePart() {
    if (partsLocked) {
      alert(
        "Parts are locked because the estimate has already been approved."
      );

      return;
    }

    if (!selectedPart) {
      alert(
        "Please select a part to add."
      );

      return;
    }

    if (partQty <= 0) {
      alert(
        "Quantity must be at least 1."
      );

      return;
    }

    if (
      Number(
        selectedPart.quantity || 0
      ) < partQty
    ) {
      alert(
        `Only ${selectedPart.quantity} item(s) available in stock.`
      );

      return;
    }

    try {
    await addRepairPart({
     repairJobId: id!,
     inventoryId:
     selectedPart.id,
     quantity: partQty,
     price: Number(partPrice),
     });

      setSelectedPart(null);
      setPartQty(1);

      setPartPrice("");

      await loadRepairParts();
      await loadInventory();
      await reloadJobPreserveScroll();
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to add part."
      );
    }
  }

  // =========================================================
  // DELETE PART
  // =========================================================

  async function removePart(
    partId: string
  ) {
    if (partsLocked) {
      alert(
        "Parts are locked because the estimate has already been approved."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to remove this part?"
      );

    if (!confirmed) return;

    try {
      await deleteRepairPart(
        partId
      );

      await loadRepairParts();
      await loadInventory();
      await reloadJobPreserveScroll();
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete part."
      );
    }
  }

  // =========================================================
  // PRINT CUSTOMER COPY FROM PREVIEW
  // =========================================================

  async function handlePrintPreviewedVoucher() {
    if (!voucherPreviewHtml) {
      alert("Customer voucher preview is not available.");
      return;
    }

    if (!voucherPreviewPrinter) {
      alert(
        "Voucher Printer is not configured.\n\nPlease go to:\nSettings → Receiving Print Settings"
      );
      return;
    }

    try {
      setPrintingVoucherPreview(true);

      await sendHtmlToPrintAgent(
        voucherPreviewHtml,
        voucherPreviewPrinter,
        voucherPreviewWidth,
        voucherPreviewHeight
      );

      setShowVoucherPreview(false);
      setVoucherPreviewHtml("");
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
      setPrintingVoucherPreview(false);
    }
  }

  // =========================================================
  // PRINT NEITS COPY
  // =========================================================

  async function handlePrintNeitsCopy() {
    if (!neitsVoucherHtml) {
      alert("NEITS voucher is not available.");
      return;
    }

    if (!voucherPreviewPrinter) {
      alert(
        "Voucher Printer is not configured.\n\nPlease go to:\nSettings → Receiving Print Settings"
      );
      return;
    }

    try {
      setPrintingVoucherPreview(true);

      await sendHtmlToPrintAgent(
        neitsVoucherHtml,
        voucherPreviewPrinter,
        voucherPreviewWidth,
        voucherPreviewHeight
      );

      setShowNeitsCopyPrompt(false);
      setNeitsVoucherHtml("");

      if (pendingStickerAfterVoucher) {
        setPendingStickerAfterVoucher(false);
        await printSavedReceivingDocument("jobSticker");
        return;
      }

      setShowPrintDocuments(false);
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
      setPrintingVoucherPreview(false);
    }
  }

  // =========================================================
  // SKIP NEITS COPY
  // =========================================================

  async function handleSkipNeitsCopy() {
    setShowNeitsCopyPrompt(false);
    setNeitsVoucherHtml("");

    if (pendingStickerAfterVoucher) {
      setPendingStickerAfterVoucher(false);
      await printSavedReceivingDocument("jobSticker");
      return;
    }

    setShowPrintDocuments(false);
  }

  // =========================================================
  // PRINT SAVED RECEIVING DOCUMENTS
  // =========================================================

  async function printSavedReceivingDocument(
    documentType: "voucher" | "jobSticker" | "both"
  ) {

    // =====================================================
   // DO NOT PRINT RECEIVING DOCUMENTS AFTER DELIVERY
   // =====================================================

    if (alreadyDelivered) {
    alert(
      "Receiving documents cannot be printed after the job has been delivered."
    );
     return;
    }

    if (!job?.id) {
      alert("Repair Job ID is missing.");
      return;
    }

    try {
      setPrintingReceivingDocument(true);

      const printerResponse =
        await getReceivingPrinterSettings();

      const printerSettings =
        printerResponse?.data || {};

      const voucherPrinter =
        String(
          printerSettings.voucherPrinter || ""
        ).trim();

      const stickerPrinter =
        String(
          printerSettings.stickerPrinter || ""
        ).trim();

      if (
        (documentType === "voucher" ||
          documentType === "both") &&
        !voucherPrinter
      ) {
        alert(
          "Voucher Printer is not configured.\n\nPlease go to:\nSettings → Receiving Print Settings"
        );
        return;
      }

      if (
        (documentType === "jobSticker" ||
          documentType === "both") &&
        !stickerPrinter
      ) {
        alert(
          "Sticker Printer is not configured.\n\nPlease go to:\nSettings → Receiving Print Settings"
        );
        return;
      }

      const [
        voucherLayoutRes,
        jobStickerLayoutRes,
        jobStickerSizeRes,
        companySettingsRes,
      ] = await Promise.all([
        documentType === "jobSticker"
          ? Promise.resolve(null)
          : getReceivingPrintLayout(
              "CUSTOMER_VOUCHER"
            ),

        documentType === "voucher"
          ? Promise.resolve(null)
          : getReceivingPrintLayout(
              "JOB_STICKER"
            ),

        documentType === "voucher"
          ? Promise.resolve(null)
          : getReceivingPrintSize(
              "JOB_STICKER"
            ),

        getCompanySettings(),
      ]);

      const company =
        companySettingsRes?.data?.data ??
        companySettingsRes?.data ??
        {};

      // =====================================================
      // VOUCHER -> PREVIEW FIRST
      // =====================================================

      if (
        documentType === "voucher" ||
        documentType === "both"
      ) {
        const voucherFields =
          Array.isArray(
            voucherLayoutRes?.data
          )
            ? voucherLayoutRes.data
            : [];

        const customerHtml =
          buildPortraitReceivingVoucherHtml(
            job,
            voucherFields,
            company,
            "CUSTOMER COPY"
          );

        const neitsHtml =
          buildPortraitReceivingVoucherHtml(
            job,
            voucherFields,
            company,
            "NEITS COPY"
          );

        setVoucherPreviewHtml(
          customerHtml
        );

        setNeitsVoucherHtml(
          neitsHtml
        );

        setVoucherPreviewPrinter(
          voucherPrinter
        );

        setVoucherPreviewWidth(210);
        setVoucherPreviewHeight(297);

        setPendingStickerAfterVoucher(
          documentType === "both"
        );

        setShowPrintDocuments(false);
        setShowVoucherPreview(true);

        return;
      }

      // =====================================================
      // JOB STICKER
      // =====================================================

      const stickerFields =
        Array.isArray(
          jobStickerLayoutRes?.data
        )
          ? jobStickerLayoutRes.data
          : [];

      const size =
        jobStickerSizeRes?.data || {};

      const width = Math.max(
        Number(size.widthMm) || 70,
        1
      );

      const height = Math.max(
        Number(size.heightMm) || 30,
        1
      );

      const stickerHtml =
        buildDetailJobStickerHtml(
          job,
          width,
          height,
          stickerFields,
          company
        );

      await sendHtmlToPrintAgent(
        stickerHtml,
        stickerPrinter,
        width,
        height
      );

      setShowPrintDocuments(false);

      alert(
        "Job Sticker sent to the printer successfully."
      );
    } catch (error: any) {
      console.error(
        "Receiving document reprint failed:",
        error
      );

      alert(
        error?.message ||
        "Unable to print receiving document(s)."
      );
    } finally {
      setPrintingReceivingDocument(false);
    }
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen text-gray-500">
        Loading Repair Job...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen text-red-500">
        Repair Job Not Found
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Repair Job Details
          </h1>

          <p className="text-gray-500 mt-1">
            Nepal Electronics & IT Solution
          </p>
        </div>

        <button
  type="button"
  disabled={alreadyDelivered}
  onClick={() => {
    if (alreadyDelivered) {
      return;
    }

     setShowPrintDocuments(true);
     }}
     className={`px-5 py-3 rounded-lg font-semibold shadow-lg whitespace-nowrap ${
     alreadyDelivered
      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
      : "bg-indigo-600 hover:bg-indigo-700 text-white"
     }`}
     title={
     alreadyDelivered
      ? "Receiving documents cannot be printed after delivery."
      : "Print Receiving Documents"
     }
     >
     🖨 Print Receiving Documents
     </button>
      </div>

            {/* =====================================================
          SMS ACTIONS
      ====================================================== */}

      <div className="mb-8 bg-white rounded-xl shadow p-5">

        <div className="flex flex-wrap gap-3">

          {/* DUE AMOUNT REMINDER */}

          <button
            type="button"
            onClick={handleSendDueAmountSms}
            disabled={
              payableAmount <= 0 ||
              sendingDueSms
            }
            className={`px-5 py-3 rounded-lg font-semibold text-white shadow ${
              payableAmount <= 0 ||
              sendingDueSms
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {sendingDueSms
              ? "Sending..."
              : "Due Amount Reminder"}
          </button>


          {/* REPAIR DELAYED */}

          <button
            type="button"
            onClick={handleSendRepairDelayedSms}
            className="px-5 py-3 rounded-lg font-semibold text-white shadow bg-red-600 hover:bg-red-700"
          >
            Repair Delayed
          </button>


          {/* PARTS REQUIRED */}

         <button
  type="button"
  onClick={handleSendPartsRequiredSms}
  disabled={sendingPartsSms}
  className={`px-5 py-3 rounded-lg font-semibold text-white shadow ${
    sendingPartsSms
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-purple-600 hover:bg-purple-700"
  }`}
>
  {sendingPartsSms
    ? "Sending..."
    : "Parts Required"}
</button>


          {/* CUSTOMER APPROVAL REQUIRED */}

          <button
            type="button"
            onClick={handleSendCustomerApprovalSms}
            disabled={sendingApprovalSms}
            className={`px-5 py-3 rounded-lg font-semibold text-white shadow ${
              sendingApprovalSms
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {sendingApprovalSms
              ? "Sending..."
              : "Customer Approval Required"}
          </button>


        </div>

      </div>

    {/* =====================================================
    CUSTOMER INFORMATION
===================================================== */}

<div className="bg-white rounded-xl shadow p-8">

  <h2 className="text-xl font-semibold mb-6">
    Customer Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {(job.customerLayoutFields || [])
     .filter(
  (field: any) => {
    const value =
      job.customer?.[
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
            job.customer?.[
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

    <div className="md:col-span-1">

      <label className="font-semibold text-gray-700">
        Job Number
      </label>

      <p className="mt-1">
        {job.jobNumber ||
          "-"}
      </p>

    </div>

    <div className="md:col-span-1">

      <label className="font-semibold text-gray-700">
        Current Status
      </label>

      <p className="mt-1 text-blue-600">
        {job.status ||
          "-"}
      </p>

    </div>

  </div>

</div>

      {/* =====================================================
    DEVICE INFORMATION
===================================================== */}

<div className="bg-white rounded-xl shadow p-8 mt-8">

  <h2 className="text-xl font-semibold mb-6">
    Device Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {(() => {
      const builtInFields =
        (
          job.deviceTypeLayout ||
          []
        )
          .filter(
            (item: any) =>
              item.visible !== false
          )
          .map(
            (item: any) => ({
              ...item,

              isBuiltIn: true,

              value:
                item.fieldKey ===
                "DEVICE_TYPE"
                  ? job.deviceType
                  : item.fieldKey ===
                      "BRAND"
                  ? job.brand
                  : "-",
            })
          );

      const dynamicFields =
        (
          job.deviceTypeFields ||
          []
        )
          .filter(
            (mapping: any) =>
              mapping.visible !== false &&
              mapping.deviceField
          )
          .map(
            (mapping: any) => {
              const field =
                mapping.deviceField;

              const fieldName =
                field?.name
                  ?.trim()
                  .toLowerCase();

              let value = "-";

              if (
                fieldName ===
                "model"
              ) {
                value =
                  job.model ||
                  "-";
              } else {
                const savedValue =
                  (
                    job.repairJobFieldValues ||
                    []
                  ).find(
                    (item: any) =>
                      item.deviceFieldId ===
                      mapping.deviceFieldId
                  );

                value =
                  savedValue?.value ||
                  "-";
              }

              return {
                ...mapping,

                isBuiltIn: false,

                fieldLabel:
                  field?.name ||
                  "-",

                value,
              };
            }
          );

      const allFields = [
      ...builtInFields,
     ...dynamicFields,
     ]
     .filter((field: any) => {
      const value = field.value;

     return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== "" &&
      value !== "-"
      );
      })
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
      );

      return allFields.map(
        (field: any) => {

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
                field.deviceFieldId ||
                field.fieldKey
              }
              className={
                columnClass
              }
            >

              <label className="font-semibold text-gray-700">
                {
                  field.fieldLabel ||
                  field.deviceField
                    ?.name ||
                  "-"
                }
              </label>

              <p className="mt-1">
                {field.value ||
                  "-"}
              </p>

            </div>
          );
        }
      );
    })()}

  </div>

</div>

{/* =====================================================
    COMPLAINT & INITIAL OBSERVATION
===================================================== */}

<div className="bg-white rounded-xl shadow p-8 mt-8">

  <h2 className="text-xl font-semibold mb-6">
    Complaint & Initial Observation
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* ================================================
        CUSTOMER COMPLAINT
    ================================================= */}

    <div>

      <label className="font-semibold text-gray-700">
        Customer Complaint
      </label>

      <div className="mt-2 border rounded-lg p-4 bg-gray-50 min-h-[100px] whitespace-pre-wrap">
        {job.complaint ||
          "-"}
      </div>

    </div>

    {/* ================================================
        INITIAL OBSERVATION
    ================================================= */}

    <div>

      <label className="font-semibold text-gray-700">
        Initial Observation
      </label>

      <div className="mt-2 border rounded-lg p-4 bg-gray-50 min-h-[100px] whitespace-pre-wrap">
        {job.observation ||
          "-"}
      </div>

    </div>

  </div>

</div>

      {/* =====================================================
          DIAGNOSIS
      ====================================================== */}

      <div className="bg-white rounded-xl shadow p-8 mt-8">

        <h2 className="text-xl font-semibold mb-6">
          Diagnosis & Repair
        </h2>

        <textarea
          rows={6}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={diagnosis}
          onChange={(e) =>
            setDiagnosis(e.target.value)
          }
        />

        <div className="mt-6 flex flex-wrap gap-3">
 <button
  onClick={saveDiagnosis}
  disabled={job?.status === "DELIVERED"}
  className={`px-6 py-3 rounded-lg font-semibold text-white ${
    job?.status === "DELIVERED"
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {job?.status === "DELIVERED"
    ? "Diagnosis Locked"
    : "Save Diagnosis"}
</button>

      <button
      onClick={markNotRepairable}
      disabled={job?.status !== "RECEIVED" && job?.status !== "DIAGNOSIS"}
      className={`px-6 py-3 rounded-lg font-semibold text-white ${
      job?.status === "RECEIVED" ||
      job?.status === "DIAGNOSIS"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-gray-400 cursor-not-allowed"
       }`}
      >
       Not Repairable / Return
      </button>
      </div>
      </div>

      {/* =====================================================
          PARTS USED
          IMPORTANT:
          THIS IS DIRECTLY BELOW DIAGNOSIS
          AND BEFORE ESTIMATE
      ====================================================== */}

     <div
     id="parts-used"
     className="bg-white rounded-xl shadow p-8 mt-8 scroll-mt-24"
     >

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-xl font-semibold">
              Parts Used
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Add physical parts used for this repair.
            </p>

          </div>

          <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm">
            Parts Count:{" "}
            {repairParts.length}
          </span>

        </div>

        {/* ADD PART */}

        <div className="grid grid-cols-4 gap-4">

        {/* =====================================================
            SEARCH INVENTORY
        ====================================================== */}

        <div className="col-span-2">

          <label className="font-semibold block mb-2">
            Search Inventory Item
          </label>

          <Autocomplete
            fullWidth
            options={inventory || []}
            disabled={partsLocked}
            value={selectedPart}
            onChange={(_, value) => {
            setSelectedPart(value);

           if (value) {
           setPartPrice(
           String(
           value.sellingPrice ?? 0
           )
           );
           } else {
           setPartPrice("");
           }
           }}

            getOptionLabel={(option: any) => {
              if (!option) return "";

              return `${option.itemName || "Unknown Item"} (${
                option.quantity ?? 0
              } in stock)`;
            }}

            isOptionEqualToValue={(option: any, value: any) =>
              option?.id === value?.id
            }

            filterOptions={(options: any[], { inputValue }) => {
              const search = inputValue.trim().toLowerCase();

              if (!search) {
                return options;
              }

              return options.filter((option: any) => {
                const itemName = String(
                  option?.itemName || ""
                ).toLowerCase();

                const itemCode = String(
                  option?.itemCode || ""
                ).toLowerCase();

                const sku = String(
                  option?.sku || ""
                ).toLowerCase();

                const category = String(
                  option?.category || ""
                ).toLowerCase();

                return (
                  itemName.includes(search) ||
                  itemCode.includes(search) ||
                  sku.includes(search) ||
                  category.includes(search)
                );
              });
            }}

            renderOption={(props, option: any) => (
              <li {...props} key={option.id}>
                <div className="w-full py-2">

                  <div className="font-semibold">
                    {option.itemName || "Unknown Item"}
                  </div>

                  <div className="text-sm text-gray-500">
                    Stock: {option.quantity ?? 0}

                    {option.itemCode
                      ? ` | Code: ${option.itemCode}`
                      : ""}

                    {option.sku
                      ? ` | SKU: ${option.sku}`
                      : ""}
                  </div>

                </div>
              </li>
            )}

            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Inventory Item"
                placeholder="Click here or type part name..."
                size="small"
                fullWidth
              />
            )}

            noOptionsText={
              inventory?.length === 0
                ? "No inventory items loaded"
                : "No matching inventory item"
            }
          />

        </div>

          {/* QUANTITY */}

          <div>

            <label className="font-semibold block mb-2">
              Quantity
            </label>

            <input
              type="number"
              min={1}
              disabled={partsLocked}
              value={partQty}
              onChange={(e) =>
                setPartQty(
                  Math.max(
                    1,
                    Number(
                      e.target.value
                    ) || 1
                  )
                )
              }
              className={`w-full border rounded-lg p-3 ${
                partsLocked
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            />

          </div>

          {/* PRICE */}

          <div>

         <label className="font-semibold block mb-2">
         Price
         </label>

        <input
        type="number"
        min={0}
        step="0.01"
        disabled={
        partsLocked ||
      !selectedPart
      }
       value={partPrice}
      onChange={(e) =>
        setPartPrice(e.target.value)
      }
      placeholder="Selling Price"
       className={`w-full border rounded-lg p-3 ${
      partsLocked ||
      !selectedPart
        ? "bg-gray-100 cursor-not-allowed"
      : ""
      }`}
      />

      </div>

        {/* ADD PART */}

<div className="flex items-end gap-2">

  <button
    onClick={savePart}
    disabled={
      partsLocked ||
      !selectedPart
    }
    className={`flex-1 rounded-lg p-3 font-semibold text-white ${
      partsLocked ||
      !selectedPart
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
     }`}
     >
     {partsLocked
      ? "Parts Locked"

      : "Add Part"}
      </button>

     <button
     type="button"
   onClick={() =>
  navigate(
    `/inventory/new?returnTo=${encodeURIComponent(
      `/repair-jobs/${id}#parts-used`
    )}`
  )
}
    className="rounded-lg p-3 px-4 font-semibold text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap" 
>
  + Add Inventory
</button>

       </div>

        </div>

        {/* PARTS TABLE */}

        <div className="mt-8 overflow-x-auto">

          <table className="w-full border border-gray-300">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-3 text-left">
                  Part
                </th>

                <th className="border p-3 text-center">
                  Qty
                </th>

                <th className="border p-3 text-right">
                  Price
                </th>

                <th className="border p-3 text-right">
                  Total
                </th>

                <th className="border p-3 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {repairParts.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="text-center p-6 text-gray-500"
                  >
                    No Parts Added
                  </td>

                </tr>

              ) : (

                repairParts.map(
                  (part: any) => {

                    const quantity =
                      getPartQuantity(
                        part
                      );

                    const unitPrice =
                      getPartUnitPrice(
                        part
                      );

                    const lineTotal =
                      quantity *
                      unitPrice;

                    return (

                      <tr
                        key={part.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="border p-3">
                          {part.inventory
                            ?.itemName ||
                            part.itemName ||
                            "Unknown Part"}
                        </td>

                        <td className="border p-3 text-center">
                          {quantity}
                        </td>

                        <td className="border p-3 text-right">
                          Rs.{" "}
                          {unitPrice.toFixed(
                            2
                          )}
                        </td>

                        <td className="border p-3 text-right font-semibold">
                          Rs.{" "}
                          {lineTotal.toFixed(
                            2
                          )}
                        </td>

                        <td className="border p-3 text-center">

                          <button
                            onClick={() =>
                              removePart(
                                part.id
                              )
                            }
                            disabled={
                              partsLocked
                            }
                            className={`px-3 py-1 rounded text-white ${
                              partsLocked
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

            <tfoot>

              <tr className="bg-gray-50 font-bold">

                <td
                  colSpan={3}
                  className="border p-3 text-right"
                >
                  Parts Total
                </td>

                <td className="border p-3 text-right">
                  Rs.{" "}
                  {partsTotal.toFixed(
                    2
                  )}
                </td>

                <td className="border p-3"></td>

              </tr>

            </tfoot>

          </table>

        </div>

      </div>

      {/* =====================================================
          ESTIMATE & COSTING

          ONLY FOUR ITEMS:
          1. Parts Cost
          2. Diagnosis Fee
          3. Service Charge
          4. Total

          REMOVED:
          Invoice Discount
          Grand Total
          Total Paid
          Refund
          Due Amount
          Advance Received
      ====================================================== */}

      <div className="bg-white rounded-xl shadow p-8 mt-8">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-xl font-semibold">
              Estimate & Costing
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Estimate is calculated from parts used,
              diagnosis fee and service charge.
            </p>

            {estimateLocked && (
              <p className="text-sm text-red-600 mt-1">
                Estimate is locked after approval.
              </p>
            )}

            {job.status ===
              "WAITING_APPROVAL" && (
              <p className="text-sm text-orange-600 mt-1">
                Estimate saved. Approval is required before repair can begin.
              </p>
            )}

          </div>

          {estimateLocked && (

            <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
              ESTIMATE LOCKED
            </span>

          )}

        </div>

        {/* FOUR ESTIMATE FIELDS ONLY */}

        <div className="grid grid-cols-2 gap-6">

          {/* PARTS COST */}

          <div>

            <label className="font-semibold">
              Parts Cost (Rs.)
            </label>

            <input
              type="text"
              readOnly
              className="w-full border rounded-lg p-3 mt-1 bg-blue-50 font-bold"
              value={partsTotal.toFixed(
                2
              )}
            />

            <p className="text-xs text-gray-500 mt-1">
              Automatically calculated from Parts Used.
            </p>

          </div>

          {/* DIAGNOSIS FEE */}

          <div>

            <label className="font-semibold">
              Diagnosis Fee (Rs.)
            </label>

            <input
              type="text"
              readOnly
              className="w-full border rounded-lg p-3 mt-1 bg-gray-100"
              value={diagnosisFee.toFixed(
                2
              )}
            />

          </div>

          {/* SERVICE CHARGE */}

          <div>

            <label className="font-semibold">
              Service Charge (Rs.)
            </label>

            <input
              type="number"
              min={0}
              disabled={estimateLocked}
              className={`w-full border rounded-lg p-3 mt-1 ${
                estimateLocked
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
              value={labourCharge}
              onChange={(e) =>
                setLabourCharge(
                  Math.max(
                    0,
                    Number(
                      e.target.value
                    ) || 0
                  )
                )
              }
            />

          </div>

          {/* TOTAL */}

          <div>

            <label className="font-semibold">
              Total (Rs.)
            </label>

            <input
              type="text"
              readOnly
              className="w-full border rounded-lg p-3 mt-1 bg-green-50 text-green-700 font-bold"
             value={estimateTotal.toFixed(
             2
            )}
            />

            <p className="text-xs text-gray-500 mt-1">
              Parts Cost + Diagnosis Fee + Service Charge
            </p>

          </div>

        </div>

        {/* ESTIMATE ACTIONS */}

        <div className="flex flex-wrap gap-3 mt-6">

          <button
            onClick={saveEstimate}
            disabled={estimateLocked}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              estimateLocked
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {estimateLocked
              ? "Estimate Locked"
              : "Save Estimate"}
          </button>

          {job.status ===
            "WAITING_APPROVAL" && (

            <button
              onClick={approveEstimate}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700"
            >
              Approve Estimate
            </button>

          )}

          {estimateLocked && (

            <span className="flex items-center px-4 py-3 bg-green-50 text-green-700 rounded-lg font-semibold">
              Estimate Approved
            </span>

          )}

        </div>

        {/* MARK AS READY */}

        <div className="flex flex-wrap gap-3 mt-6">

          {job.status ===
            "IN_PROGRESS" && (

            <button
              onClick={markAsReady}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Mark as Ready
            </button>

          )}

        </div>

      </div>

      {/* =====================================================
          RECEIVE PAYMENT
      ====================================================== */}

      <div className="bg-white rounded-xl shadow p-8 mt-8">

        <h2 className="text-xl font-semibold mb-6">
          Receive Payment
        </h2>
        {/* BILLING DISCOUNT */}

<div className="mb-6 max-w-md">
  <label className="font-semibold block mb-2">
    Discount (Rs.)
  </label>

  <div className="flex gap-3">
    <input
      type="number"
      min={0}
      value={discount}
      disabled={discountLocked}
      onChange={(e) =>
        setDiscount(
          Math.max(
            0,
            Number(e.target.value) || 0
          )
        )
      }
      className={`w-full border rounded-lg p-3 ${
      discountLocked
       ? "bg-gray-100 cursor-not-allowed"
       : ""
      }`}
    />

    <button
      type="button"
      disabled={discountLocked}
      onClick={async () => {
        try {
          await updateRepairJob(id!, {
            discount: Math.max(
              0,
              Number(discount || 0)
            ),
          });

    await reloadJobPreserveScroll();

alert("Billing discount updated successfully.");
} catch (err: any) {
  console.error(err);

  alert(
    err.response?.data?.message ||
      err.message ||
      "Failed to update discount."
  );
}
}}
className={`px-5 py-3 rounded-lg font-semibold text-white whitespace-nowrap ${
  discountLocked
    ? "bg-gray-400 cursor-not-allowed"
    : "bg-orange-600 hover:bg-orange-700"
}`}
>
  {discountLocked
    ? "Discount Locked"
    : "Apply Discount"}
</button>
  </div>

  <p className="text-xs text-gray-500 mt-1">
    Billing discount is applied after estimate approval.
  </p>
</div>
<div className="grid grid-cols-2 gap-4 mb-6 max-w-3xl">

  <div className="border rounded-lg p-4 bg-gray-50">
    <p className="text-sm text-gray-500">
      Estimate Total
    </p>

    <p className="text-xl font-bold">
      Rs. {estimateTotal.toFixed(2)}
    </p>
  </div>

  <div className="border rounded-lg p-4 bg-green-50">
    <p className="text-sm text-gray-500">
      Final Bill After Discount
    </p>

    <p className="text-xl font-bold text-green-700">
      Rs. {finalTotal.toFixed(2)}
    </p>
  </div>
<div className="grid grid-cols-3 gap-4 mb-6 max-w-5xl">

  <div className="border rounded-lg p-4 bg-yellow-50">
    <p className="text-sm text-gray-500">
      Advance Paid
    </p>

    <p className="text-xl font-bold text-yellow-700">
      Rs. {advancePayment.toFixed(2)}
    </p>
  </div>

  <div className="border rounded-lg p-4 bg-green-50">
    <p className="text-sm text-gray-500">
      Total Paid
    </p>

    <p className="text-xl font-bold text-green-700">
      Rs. {totalPaid.toFixed(2)}
    </p>
  </div>

  <div className="border rounded-lg p-4 bg-red-50">
    <p className="text-sm text-gray-500">
      Payable Amount
    </p>

    <p className="text-xl font-bold text-red-700">
      Rs. {payableAmount.toFixed(2)}
    </p>
  </div>

</div>

</div>

        <div className="grid grid-cols-4 gap-4">

          {/* AMOUNT */}

          <div>

            <label className="font-semibold block mb-2">
              Amount
            </label>

            <input
              type="number"
              min={0}
              value={paymentAmount}
              onChange={(e) =>
                setPaymentAmount(
                  Number(
                    e.target.value
                  ) || 0
                )
              }
              className="w-full border rounded-lg p-3"
            />

          </div>

          {/* METHOD */}

          <div>

            <label className="font-semibold block mb-2">
              Method
            </label>
<select
  value={paymentMethod}
  onChange={(e) =>
    setPaymentMethod(
      e.target.value
    )
     }
  className="w-full border rounded-lg p-3"
  >
  {paymentMethods.map(
    (method: any) => (
      <option
        key={method.id}
        value={method.code}
      >
        {method.name}
      </option>
        )
        )}
       </select>

          </div>

          {/* REMARKS */}

          <div>

            <label className="font-semibold block mb-2">
              Remarks
            </label>

            <input
              type="text"
              value={paymentRemarks}
              onChange={(e) =>
                setPaymentRemarks(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3"
              placeholder="Optional"
            />

          </div>

         {/* BUTTONS */}

         <div className="flex items-end gap-2">

        {/* RECEIVE PAYMENT */}

        <button
        onClick={savePayment}
        disabled={
        paymentAmount <= 0
       }
        className={`flex-1 rounded-lg p-3 font-semibold text-white ${
        paymentAmount <= 0
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
        }`}
        >
        Receive Payment
       </button>

        </div>

        </div>

        {/* =====================================================
            PAYMENT HISTORY
            ADVANCE PAYMENT IS SHOWN HERE
        ====================================================== */}

        <div className="mt-8 overflow-x-auto">

          <h3 className="font-semibold mb-3">
            Payment History
          </h3>

          <table className="w-full border border-gray-300">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-3 text-left">
                  Date
                </th>

                <th className="border p-3 text-right">
                  Amount
                </th>

                <th className="border p-3 text-left">
                  Method
                </th>

                <th className="border p-3 text-left">
                  Remarks
                </th>

              </tr>

            </thead>

            <tbody>

              {/* ADVANCE PAYMENT */}

              {storedAdvanceAmount >
                0 && (

                <tr className="bg-yellow-50">

                  <td className="border p-3">

                    {job.receivedDate
                      ? formatNepaliDateTime(
                          job.receivedDate
                        )
                      : job.createdAt
                      ? formatNepaliDateTime(
                          job.createdAt
                        )
                      : "-"}

                  </td>

                  <td className="border p-3 text-right font-semibold text-green-700">

                    Rs.{" "}
                    {storedAdvanceAmount.toFixed(
                      2
                    )}

                  </td>

                  <td className="border p-3 font-semibold">
                    Advance
                  </td>

                  <td className="border p-3 font-semibold text-yellow-700">
                    Advance Payment
                  </td>

                </tr>

              )}

              {/* NORMAL PAYMENTS */}

              {payments.map(
                (payment: any) => (

                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="border p-3">

                      {payment.createdAt
                        ? formatNepaliDateTime(
                            payment.createdAt
                          )
                        : "-"}

                    </td>

                    <td className="border p-3 text-right font-semibold">

                      Rs.{" "}
                      {Number(
                        payment.amount ||
                          0
                      ).toFixed(2)}

                    </td>

                    <td className="border p-3">
                      {payment.method ||
                        "-"}
                    </td>

                    <td className="border p-3">
                      {payment.remarks ||
                        "-"}
                    </td>

                  </tr>

                )
              )}

              {/* NO PAYMENT */}

              {storedAdvanceAmount <=
                0 &&
                payments.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={4}
                      className="text-center p-6 text-gray-500"
                    >
                      No Payments Yet
                    </td>

                  </tr>

                )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          PRINT INVOICE
      ====================================================== */}

      <div className="mt-10 mb-8 flex justify-center">

        <button
          onClick={() =>
            window.open(
              `/invoice/${id}`,
              "_blank"
            )
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg"
        >
           Print Invoice
        </button>

      </div>

      {showPrintDocuments && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[460px] max-w-[92vw]">

            <h2 className="text-2xl font-bold text-gray-800">
              Print Receiving Documents
            </h2>

            <p className="text-gray-500 mt-2 mb-6">
              Print documents again for this saved repair job.
            </p>

            <div className="space-y-3">

              <button
                type="button"
                disabled={printingReceivingDocument}
                onClick={() =>
                  printSavedReceivingDocument("voucher")
                }
                className="w-full text-left border rounded-lg p-4 hover:bg-blue-50 disabled:opacity-50"
              >
                <div className="font-semibold">
                  Customer Job Received Voucher
                </div>

                <div className="text-sm text-gray-500">
                  Preview first, print Customer Copy, then optionally print NEITS Copy.
                </div>
              </button>

              <button
                type="button"
                disabled={printingReceivingDocument}
                onClick={() =>
                  printSavedReceivingDocument("jobSticker")
                }
                className="w-full text-left border rounded-lg p-4 hover:bg-indigo-50 disabled:opacity-50"
              >
                <div className="font-semibold">
                  Job Sticker
                </div>

                <div className="text-sm text-gray-500">
                  Job No, Customer, Contact, Complaint and Received accessories.
                </div>
              </button>

              <button
                type="button"
                disabled={printingReceivingDocument}
                onClick={() =>
                  printSavedReceivingDocument("both")
                }
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 font-semibold disabled:opacity-50"
              >
                {printingReceivingDocument
                  ? "Preparing..."
                  : "Print Voucher + Job Sticker"}
              </button>

            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                disabled={printingReceivingDocument}
                onClick={() =>
                  setShowPrintDocuments(false)
                }
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          SAVED JOB RECEIVED VOUCHER PREVIEW
      ===================================================== */}

      {showVoucherPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80]">

          <div className="bg-white rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div>
                <h2 className="text-xl font-bold">
                  Voucher Preview
                </h2>

                <p className="text-sm text-gray-500">
                  Check the customer voucher before printing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowVoucherPreview(false);
                  setVoucherPreviewHtml("");
                  setNeitsVoucherHtml("");
                  setPendingStickerAfterVoucher(false);
                }}
                disabled={printingVoucherPreview}
                className="text-gray-500 hover:text-gray-900 text-2xl"
              >
                ×
              </button>

            </div>

            <div className="flex-1 bg-gray-100 overflow-auto p-6">

              <div className="flex justify-center">

                <iframe
                  title="Saved Voucher Preview"
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

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">

              <button
                type="button"
                onClick={() => {
                  setShowVoucherPreview(false);
                  setVoucherPreviewHtml("");
                  setNeitsVoucherHtml("");
                  setPendingStickerAfterVoucher(false);
                }}
                disabled={printingVoucherPreview}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrintPreviewedVoucher}
                disabled={printingVoucherPreview}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold"
              >
                {printingVoucherPreview
                  ? "Printing..."
                  : "Print Customer Copy"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          NEITS COPY CONFIRMATION
      ===================================================== */}

      {showNeitsCopyPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[85]">

          <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[90vw]">

            <div className="px-6 py-5 border-b">
              <h2 className="text-xl font-bold">
                Customer Copy Printed
              </h2>
            </div>

            <div className="px-6 py-6">

              <p className="text-base text-gray-700">
                Customer copy has been printed successfully.
              </p>

              <p className="text-base font-semibold text-gray-900 mt-3">
                Would you like to print the NEITS copy?
              </p>

            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">

              <button
                type="button"
                onClick={handleSkipNeitsCopy}
                disabled={printingVoucherPreview}
                className="px-5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 font-medium"
              >
                No
              </button>

              <button
                type="button"
                onClick={handlePrintNeitsCopy}
                disabled={printingVoucherPreview}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold"
              >
                {printingVoucherPreview
                  ? "Printing..."
                  : "Yes, Print NEITS Copy"}
              </button>

            </div>

          </div>

        </div>
      )}


   {/* =====================================================
    FINAL DELIVERY CHECK
===================================================== */}

<div className="bg-white rounded-xl shadow p-8 mt-8">

  <h2 className="text-xl font-semibold mb-6">
    Final Delivery Check
  </h2>

  {/* =================================================
      PHYSICAL CONDITION
  ================================================= */}

  <div className="mb-8">

    <h3 className="text-lg font-semibold mb-4 text-gray-800">
      Device Physical Condition
    </h3>

    {(() => {
      const physicalFields =
        (job?.repairJobFieldValues || []).filter(
          (item: any) =>
            item.deviceField?.category ===
              "PHYSICAL_CONDITION" &&
            item.value !== null &&
            item.value !== undefined &&
            String(item.value).trim() !== ""
        );

      if (physicalFields.length === 0) {
        return (
          <p className="text-gray-500">
            No physical condition was recorded at job receiving.
          </p>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {physicalFields.map(
            (item: any) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <p className="font-semibold text-gray-800">
                  {item.deviceField?.name ||
                    "Unknown Field"}
                </p>

                <p className="mt-1 text-gray-700">
                  {String(item.value)}
                </p>
              </div>
            )
          )}

        </div>
      );
    })()}

  </div>

  {/* =================================================
    ACCESSORIES RECEIVED
================================================= */}

<div>

  <h3 className="text-lg font-semibold mb-4 text-gray-800">
    Accessories Received
  </h3>

  {Array.isArray(
    job?.repairJobAccessories
  ) &&
  job.repairJobAccessories.length > 0 ? (

    <div className="space-y-3">

      {job.repairJobAccessories.map(
        (item: any) => {

          const accessoryId =
            item.id;

          const isReceived =
            item.received !== false;

          const isConfirmed =
            Boolean(
              confirmedAccessories[
                accessoryId
              ]
            );

          return (
            <div
              key={accessoryId}
              className={`border rounded-lg p-4 flex items-center justify-between gap-4 ${
                isConfirmed
                  ? "bg-green-50 border-green-300"
                  : "bg-yellow-50 border-yellow-300"
              }`}
            >

              {/* =================================
                  ACCESSORY INFORMATION
              ================================= */}

              <div>

                <div className="font-semibold text-gray-800">
                  {item.accessory?.name ||
                    item.accessoryId}
                </div>

                <div
                  className={`text-sm mt-1 ${
                    isReceived
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {isReceived
                    ? "Received at job receiving"
                    : "Not received at job receiving"}
                </div>

                <div
                  className={`text-sm mt-1 font-medium ${
                    isConfirmed
                      ? "text-green-700"
                      : "text-orange-700"
                  }`}
                >
                  {isConfirmed
                    ? "Confirmed for delivery"
                    : "Pending final confirmation"}
                </div>

              </div>

              {/* =================================
                  CONFIRM CHECKBOX
              ================================= */}

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  checked={
                    isConfirmed
                  }
                  disabled={
                    !isReceived ||
                    alreadyDelivered
                  }
                  onChange={() =>
                    toggleAccessoryConfirmation(
                      accessoryId
                    )
                  }
                  className="w-5 h-5"
                />

                <span className="font-medium">
                  Confirm
                </span>

              </label>

            </div>
          );
        }
      )}

    </div>

  ) : (

    <p className="text-gray-500">
      No additional accessories were recorded at job receiving.
    </p>

  )}

</div>

{Array.isArray(
  job?.repairJobAccessories
) &&
job.repairJobAccessories.length > 0 && (

  <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">

    <p className="font-semibold text-blue-800">
      Final Accessory Check
    </p>

    <p className="text-sm text-blue-700 mt-1">

      {
        Object.values(
          confirmedAccessories
        ).filter(Boolean).length
      }{" "}

      of{" "}

      {
        job.repairJobAccessories
          .filter(
            (item: any) =>
              item.received !== false
          )
          .length
      }{" "}

      accessories confirmed.

    </p>

  </div>

)}
</div>

            <div className="mt-8 mb-10 flex justify-center gap-4">

        {/* ================================================
            FEEDBACK REQUEST
            SEPARATE FROM DELIVERY
        ================================================= */}

        {id && (
          <button
            type="button"
            onClick={handleSendFeedbackRequest}
            disabled={
              sendingFeedbackRequest ||
              feedbackRequestSent
            }
            className={`text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg ${
              sendingFeedbackRequest ||
              feedbackRequestSent
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {sendingFeedbackRequest
              ? "Sending Feedback..."
              : feedbackRequestSent
                ? "✓ Feedback Request Sent"
                : "💬 Feedback Request"}
          </button>
        )}

        {/* ================================================
            DELIVERY
            EXISTING LOGIC
        ================================================= */}

        {(currentStatus === "READY" ||
          currentStatus === "NOT_REPAIRABLE") &&
          !alreadyDelivered && (

          <button
            onClick={deliverJob}
            className={`text-white px-10 py-4 rounded-lg font-bold text-lg shadow-lg ${
              currentStatus === "NOT_REPAIRABLE"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {currentStatus === "NOT_REPAIRABLE"
              ? "↩ Return to Customer"
              : "🚚 Deliver Job"}
          </button>

        )}

        {alreadyDelivered && (

          <span className="flex items-center px-6 py-4 bg-green-50 text-green-700 rounded-lg font-bold text-lg">
            ✓ Job Delivered
          </span>

        )}

      </div>

      {/* =====================================================
          DELIVERY CONFIRMATION MODAL
      ====================================================== */}

      {showDeliveryConfirm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-2xl p-8 w-[420px]">

            <h2 className="text-xl font-bold mb-4">
              Confirm Delivery
            </h2>

           {payableAmount > 0 ? (

              <div>

                <p className="text-gray-700 mb-3">
                  There is an outstanding payment:
                </p>

                <p className="text-red-600 text-2xl font-bold mb-5">
                  Rs.{" "}
                  {payableAmount.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </p>

                <p className="text-gray-700 mb-6">
                  Are you sure you want to deliver this job?
                </p>

              </div>

            ) : refund > 0 ? (

              <div>

                <p className="text-gray-700 mb-3">
                  Customer has overpaid:
                </p>

                <p className="text-blue-600 text-2xl font-bold mb-5">
                  Refund Rs.{" "}
                  {refund.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </p>

                <p className="text-gray-700 mb-6">
                  Please confirm the refund before delivery.
                </p>

              </div>

            ) : (

              <p className="text-gray-700 mb-6">
                Payment is fully cleared.
                <br />
                <br />
                Are you sure you want to deliver this job?
              </p>

            )}

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowDeliveryConfirm(
                    false
                  )
                }
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={
                  confirmDelivery
                }
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                Confirm Delivery
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

