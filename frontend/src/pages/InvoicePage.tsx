import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getRepairInvoice,
  getSaleInvoice,
} from "../api/invoice";
import {
  formatNepaliDate,
  formatNepaliDateTime,
} from "../utils/nepaliDate";

export default function InvoicePage() {
  const { id } = useParams();
  const isSaleInvoice =
  window.location.pathname.startsWith(
    "/invoice/sale/"
  );

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  async function loadInvoice() {
    try {
      setLoading(true);

    const res = isSaleInvoice
    ? await getSaleInvoice(id!)
    : await getRepairInvoice(id!);

    console.log(
     isSaleInvoice
    ? "SALE INVOICE API:"
    : "REPAIR INVOICE API:",
     res
     );

      const data = res.data?.data ?? res.data ?? res;

      console.log("ACTUAL INVOICE DATA:", data);

      setInvoice(data);
    } catch (err) {
      console.error("Failed to load invoice:", err);
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading Invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Invoice Not Found
      </div>
    );
  }

  // ==================================================
  // SUPPORT BOTH CURRENT AND OLDER API STRUCTURES
  // ==================================================

  const repair = invoice.repair || invoice.repairJob || {};

  const customer =
    invoice.customer ||
    repair.customer ||
    {};

  const parts =
    invoice.parts ||
    repair.parts ||
    [];

  const payments =
    invoice.payments ||
    repair.payments ||
    [];

  const summary = invoice.summary || {};

  // ==================================================
  // COMPANY
  // ==================================================

  const company = invoice.company || {
    name: "Nepal Electronics & IT Solution",
    address: "New Baneshwor, Kathmandu, Nepal",
    phone: "+977-9803453571",
    email: "neitslab@gmail.com",
    pan: "601837201",
  };

  // ==================================================
  // FINANCIAL VALUES
  // ==================================================

  const partsTotal = Number(
    summary.partsTotal ?? 0
  );

  const labourCharge = Number(
    summary.labourCharge ?? 0
  );

  const diagnosisFee = Number(
    summary.diagnosisFee ?? 0
  );

  const serviceCharge = Number(
    summary.serviceCharge ??
      labourCharge + diagnosisFee
  );

  const discount = Number(
    summary.discount ?? 0
  );

  const subtotal = Number(
    summary.subtotal ??
      partsTotal + serviceCharge
  );

  const grandTotal = Number(
    summary.grandTotal ??
      Math.max(0, subtotal - discount)
  );

  const advancePayment = Number(
    summary.advancePayment ??
      summary.advance ??
      0
  );

  const paymentsTotal = Number(
    summary.paymentsTotal ?? 0
  );

  const totalPaid = Number(
    summary.totalPaid ??
      advancePayment + paymentsTotal
  );

  const dueAmount = Number(
    summary.dueAmount ??
      summary.balance ??
      Math.max(0, grandTotal - totalPaid)
  );

  const refundAmount = Number(
    summary.refundAmount ?? 0
  );

  // ==================================================
  // INVOICE INFORMATION
  // ==================================================

  const invoiceNumber =
  repair.invoiceNumber ||
  invoice.invoiceNumber ||
  "-";
  
  const jobNumber =
    repair.jobNumber ||
    "-";

  const invoiceDate = repair.receivedDate
    ? formatNepaliDate(repair.receivedDate)
    : formatNepaliDate(new Date());

  const deliveryDate = repair.deliveryDate
    ? formatNepaliDateTime(repair.deliveryDate)
    : "-";

  // ==================================================
  // PAYMENT STATUS
  // ==================================================

  let paymentStatus = "PAYMENT DUE";

  if (dueAmount <= 0) {
    paymentStatus = "PAID";
  } else if (totalPaid > 0) {
    paymentStatus = "PARTIALLY PAID";
  }

  // ==================================================
  // PRINT
  // ==================================================

  function printInvoice() {
    window.print();
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:py-0 print:bg-white flex flex-col items-center">

      {/* ==================================================
          PRINT STYLE
      ================================================== */}

      <style type="text/css">
        {`
          @media print {

            @page {
              size: A4 portrait;
              margin: 12mm;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body * {
              visibility: hidden;
            }

            #invoice,
            #invoice * {
              visibility: visible;
            }

            #invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* ==================================================
          ACTION BAR
      ================================================== */}

      <div className="w-full max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden no-print">
        <button
          onClick={printInvoice}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition duration-200"
        >
          Print Invoice
        </button>
      </div>

      {/* ==================================================
          INVOICE
      ================================================== */}

      <div
        id="invoice"
        className="bg-white w-full max-w-[210mm] mx-auto shadow-lg print:shadow-none p-8"
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4 mb-6">

          {/* COMPANY */}

          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              {company.name ||
                "Nepal Electronics & IT Solution"}
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              {company.address ||
                "New Road, Kathmandu, Nepal"}
            </p>

            <p className="text-gray-800 text-sm font-semibold mt-1">
              PAN No:{" "}
              <span className="font-normal">
                {company.pan || "-"}
              </span>
            </p>

            <p className="text-gray-600 text-sm">
              Phone: {company.phone || "-"}
            </p>

            <p className="text-gray-600 text-sm">
              Email: {company.email || "-"}
            </p>
          </div>

          {/* INVOICE TITLE */}

          <div className="text-right">

            <h2 className="text-3xl font-black text-gray-200 uppercase tracking-widest">
              Invoice
            </h2>

            <p
              className={`text-sm font-bold mt-2 ${
                dueAmount > 0
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {paymentStatus}
            </p>

          </div>

        </div>

        {/* ==================================================
            CUSTOMER + INVOICE INFORMATION
        ================================================== */}

        <div className="flex justify-between items-start mb-6">

          {/* CUSTOMER */}

          <div className="w-1/2 pr-4">

            <div className="bg-gray-50 p-4 rounded border border-gray-200">

              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Billed To
              </h3>

              <p className="font-bold text-gray-800 text-base">
                {customer.fullName ||
                  customer.name ||
                  "Cash Customer"}
              </p>

              <p className="text-gray-700 text-sm mt-1">
                Phone: {customer.phone || "-"}
              </p>

              <p className="text-gray-700 text-sm">
                Address: {customer.address || "-"}
              </p>

              <p className="text-gray-700 text-sm">
                PAN/VAT:{" "}
                {customer.panVat || "-"}
              </p>

            </div>

          </div>

          {/* INVOICE META */}

          <div className="w-1/2 pl-4 flex justify-end">

            <div className="bg-gray-50 p-4 rounded border border-gray-200 w-full max-w-[280px]">

              <table className="w-full text-sm text-gray-700">

                <tbody>

                  <tr>
                    <td className="font-semibold pb-1">
                      Invoice No:
                    </td>

                    <td className="text-right pb-1 break-all">
                      {invoiceNumber}
                    </td>
                  </tr>

                  <tr>
                    <td className="font-semibold pb-1">
                      Job No:
                    </td>

                    <td className="text-right pb-1">
                      {jobNumber}
                    </td>
                  </tr>

                  <tr>
                    <td className="font-semibold pb-1">
                      Date:
                    </td>

                    <td className="text-right pb-1">
                      {invoiceDate}
                    </td>
                  </tr>

                  <tr>
                    <td className="font-semibold pb-1">
                      Delivery:
                    </td>

                    <td className="text-right pb-1">
                      {deliveryDate}
                    </td>
                  </tr>

                  <tr>

                    <td className="font-semibold">
                      Status:
                    </td>

                    <td
                      className={`text-right font-bold ${
                        repair.status === "DELIVERED"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {repair.status || "-"}
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

        {/* ==================================================
            PARTS / BILLABLE ITEMS
        ================================================== */}

        <div className="mb-6">

          <table className="w-full text-left border-collapse border border-gray-300">

            <thead>

              <tr className="bg-gray-100 text-gray-700 text-[11px] uppercase tracking-wider">

                <th className="py-2 px-3 border-b border-gray-300 w-12 text-center">
                  S.N.
                </th>

                <th className="py-2 px-3 border-b border-gray-300 border-l">
                  Description
                </th>

                <th className="py-2 px-3 border-b border-gray-300 border-l text-center w-16">
                  Qty
                </th>

                <th className="py-2 px-3 border-b border-gray-300 border-l text-right w-28">
                  Unit Price
                </th>

                <th className="py-2 px-3 border-b border-gray-300 border-l text-right w-32">
                  Total
                </th>

              </tr>

            </thead>

            <tbody className="text-gray-800 text-sm">

              {parts.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="py-4 px-3 text-center text-gray-500 italic"
                  >
                    No physical parts billed.
                  </td>

                </tr>

              ) : (

                parts.map(
                  (part: any, index: number) => {

                    const quantity = Number(
                      part.quantity ?? 0
                    );

                    const unitPrice = Number(
                      part.unitPrice ??
                      part.price ??
                      0
                    );

                    const lineTotal = Number(
                      part.total ??
                      quantity * unitPrice
                    );

                    const itemName =
                      part.itemName ||
                      part.inventory?.itemName ||
                      "Unknown Part";

                    return (
                      <tr
                        key={part.id || index}
                        className="border-b border-gray-200"
                      >

                        <td className="py-1.5 px-3 text-center">
                          {index + 1}
                        </td>

                        <td className="py-1.5 px-3 border-l border-gray-200">
                          {itemName}
                        </td>

                        <td className="py-1.5 px-3 text-center border-l border-gray-200">
                          {quantity}
                        </td>

                        <td className="py-1.5 px-3 text-right border-l border-gray-200">
                          Rs.{" "}
                          {unitPrice.toFixed(2)}
                        </td>

                        <td className="py-1.5 px-3 text-right border-l border-gray-200">
                          Rs.{" "}
                          {lineTotal.toFixed(2)}
                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

        {/* ==================================================
            BILLING SUMMARY
        ================================================== */}

        <div className="flex justify-end mb-8">

          <div className="w-80">

            {/* PARTS TOTAL */}

            <div className="flex justify-between text-sm mb-2 text-gray-700">

              <span>
                Parts Total
              </span>

              <span>
                Rs. {partsTotal.toFixed(2)}
              </span>

            </div>

            {/* SERVICE CHARGE */}

            <div className="flex justify-between text-sm mb-2 text-gray-700">

              <span>
                Service Charge
              </span>

              <span>
                Rs. {serviceCharge.toFixed(2)}
              </span>

            </div>

            {/* SUBTOTAL */}

            <div className="flex justify-between text-sm mb-2 text-gray-700 border-t border-gray-300 pt-2">

              <span>
                Subtotal
              </span>

              <span>
                Rs. {subtotal.toFixed(2)}
              </span>

            </div>

            {/* DISCOUNT */}

            {discount > 0 && (
              <div className="flex justify-between text-sm mb-2 text-gray-700">

                <span>
                  Discount
                </span>

                <span>
                  - Rs. {discount.toFixed(2)}
                </span>

              </div>
            )}

            {/* GRAND TOTAL */}

            <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-400 pt-2 mb-2">

              <span>
                Grand Total
              </span>

              <span>
                Rs. {grandTotal.toFixed(2)}
              </span>

            </div>

            {/* ADVANCE PAYMENT */}

            <div className="flex justify-between text-sm text-gray-700 mb-2">

              <span>
                Advance Payment
              </span>

              <span>
                Rs. {advancePayment.toFixed(2)}
              </span>

            </div>

            {/* ADDITIONAL PAYMENTS */}

            {paymentsTotal > 0 && (
              <div className="flex justify-between text-sm text-gray-700 mb-2">

                <span>
                  Additional Payments
                </span>

                <span>
                  Rs. {paymentsTotal.toFixed(2)}
                </span>

              </div>
            )}

            {/* TOTAL PAID */}

            <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2">

              <span>
                Total Paid
              </span>

              <span className="text-green-600">
                Rs. {totalPaid.toFixed(2)}
              </span>

            </div>

            {/* BALANCE DUE */}

            <div
              className={`flex justify-between text-xl font-extrabold border-t-2 border-gray-400 mt-2 pt-2 ${
                dueAmount > 0
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >

              <span>
                {dueAmount > 0
                  ? "Balance Due"
                  : "Balance"}
              </span>

              <span>
                Rs. {dueAmount.toFixed(2)}
              </span>

            </div>

            {/* REFUND */}

            {refundAmount > 0 && (
              <div className="flex justify-between text-sm text-blue-600 font-semibold mt-2">

                <span>
                  Refund
                </span>

                <span>
                  Rs. {refundAmount.toFixed(2)}
                </span>

              </div>
            )}

          </div>

        </div>

        {/* ==================================================
            PAYMENT HISTORY
        ================================================== */}

        {payments.length > 0 && (

          <div className="mb-8">

            <h3 className="font-bold text-gray-700 text-sm mb-2">
              Payment History
            </h3>

            <table className="w-full border-collapse border border-gray-300 text-sm">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border p-2 text-left">
                    Date
                  </th>

                  <th className="border p-2 text-right">
                    Amount
                  </th>

                  <th className="border p-2 text-left">
                    Method
                  </th>

                  <th className="border p-2 text-left">
                    Remarks
                  </th>

                </tr>

              </thead>

              <tbody>

                {payments.map(
                  (payment: any, index: number) => (

                    <tr
                      key={payment.id || index}
                    >

                      <td className="border p-2">

                        {payment.createdAt
                          ? formatNepaliDateTime(
                              payment.createdAt
                            )
                          : "-"}

                      </td>

                      <td className="border p-2 text-right">

                        Rs.{" "}
                        {Number(
                          payment.amount || 0
                        ).toFixed(2)}

                      </td>

                      <td className="border p-2">

                        {payment.method ||
                          payment.paymentMode ||
                          "-"}

                      </td>

                      <td className="border p-2">

                        {payment.remarks || "-"}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

        {/* ==================================================
            SIGNATURES
        ================================================== */}

        <div className="mt-12 pt-6 border-t border-gray-300 text-gray-700">

          <div className="grid grid-cols-2 gap-10">

            <div className="text-center">

              <div className="h-12 border-b border-gray-400 w-3/4 mx-auto"></div>

              <p className="mt-1 font-semibold text-xs">
                Customer Signature
              </p>

            </div>

            <div className="text-center">

              <div className="h-12 border-b border-gray-400 w-3/4 mx-auto"></div>

              <p className="mt-1 font-semibold text-xs">
                Authorized Signatory
              </p>

            </div>

          </div>

          <div className="text-center mt-6 text-[11px] text-gray-500 font-medium">
            Goods once sold will not be returned.
          </div>

        </div>

      </div>

    </div>
  );
}