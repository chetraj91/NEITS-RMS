import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getCustomers } from "../../api/customer";

import {
  getCustomerLedger,
  getCustomerDetailedLedger,
} from "../../api/customerLedger";

import {
  getPaymentMethods
} from "../../api/paymentMethod";

import {
  createCustomerPayment,
} from "../../api/customerPayment";

export default function CustomerLedgerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
const [, setCustomerId] = useState("");
const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
const [ledger, setLedger] = useState<any[]>([]);
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

const [
  showPayment,
  setShowPayment,
] = useState(false);

const [
  paymentAmount,
  setPaymentAmount,
] = useState(0);

const [
  paymentMethod,
  setPaymentMethod,
] = useState("CASH");

const [
  paymentMethods,
  setPaymentMethods,
] = useState<any[]>([]);

const [
  paymentDate,
  setPaymentDate,
] = useState(
  new Date()
    .toISOString()
    .split("T")[0]
);

const [
  paymentRemarks,
  setPaymentRemarks,
] = useState("");

const [
  savingPayment,
  setSavingPayment,
] = useState(false);

  useEffect(() => {
  loadCustomers();
  loadPaymentMethods();
}, []);

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

  async function loadCustomers() {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (err) {
      console.error(err);
    }
  }

function openPayment() {
  if (!selectedCustomer) {
    alert("Please select a customer first.");
    return;
  }

  if (outstanding <= 0) {
    alert("There is no outstanding balance.");
    return;
  }

  setPaymentAmount(outstanding);

  setPaymentMethod("CASH");

  setPaymentDate(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  setPaymentRemarks("");

  setShowPayment(true);
}

async function handlePayment() {
  const amount =
    Number(paymentAmount || 0);

  if (amount <= 0) {
    alert(
      "Payment amount must be greater than zero."
    );
    return;
  }

  if (amount > outstanding) {
    alert(
      `Payment cannot exceed outstanding balance of Rs. ${outstanding.toFixed(
        2
      )}.`
    );
    return;
  }

  if (!selectedCustomer) {
    alert(
      "Please select a customer first."
    );
    return;
  }

  try {
    setSavingPayment(true);

    const response =
      await createCustomerPayment({
        customerId:
          selectedCustomer.id,

        amount,

        paymentDate,

        paymentMethod,

        remarks:
          paymentRemarks.trim() ||
          undefined,
      });

    alert(
      response?.message ||
        "Customer payment recorded successfully."
    );

    setShowPayment(false);

    await loadLedger(
      selectedCustomer.id
    );
  } catch (error: any) {
    console.error(
      "Customer payment error:",
      error
    );

    alert(
      error?.response?.data
        ?.message ||
        error?.message ||
        "Unable to record customer payment."
    );
  } finally {
    setSavingPayment(false);
  }
}

  async function loadLedger(id: string) {
    if (!id) return;

    try {
      const data = await getCustomerLedger(id);

      setLedger(
       Array.isArray(data)
      ? [...data].sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
       )
       : []
       );


    } catch (err) {
      console.error(err);
    }
  }
    // =========================================================
  // DOWNLOAD CURRENT LEDGER PDF
  // =========================================================

  function downloadLedgerPdf() {
    if (!selectedCustomer) {
      alert("Please select a customer first.");
      return;
    }

    if (ledger.length === 0) {
      alert("No ledger data available for this customer.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    // -------------------------------------------------------
    // HEADER
    // -------------------------------------------------------

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    doc.text(
      "CUSTOMER LEDGER",
      pageWidth / 2,
      15,
      {
        align: "center",
      }
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Customer: ${selectedCustomer.fullName}`,
      14,
      24
    );

    doc.text(
      `Phone: ${selectedCustomer.phone || "-"}`,
      14,
      30
    );

    doc.text(
      `Address: ${selectedCustomer.address || "-"}`,
      14,
      36
    );

    doc.text(
      `PAN: ${selectedCustomer.panVat || "-"}`,
      pageWidth - 14,
      36,
      {
        align: "right",
      }
    );

    // -------------------------------------------------------
    // TABLE DATA
    // -------------------------------------------------------

 // Calculate running balance chronologically
// and display the PDF oldest -> newest.

let runningBalance = 0;

const chronologicalLedger =
  [...filteredLedger].sort(
    (a: any, b: any) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
  );

const ledgerWithBalance =
  chronologicalLedger.map((item: any) => {
    const debit =
      Number(item.debit ?? 0);

    const credit =
      Number(item.credit ?? 0);

    runningBalance +=
      debit - credit;

    return {
      ...item,
      calculatedBalance: runningBalance,
    };
  });

// Display oldest -> newest
const tableData =
  ledgerWithBalance.map((item: any) => {

        const debit =
        Number(item.debit ?? 0);

      const credit =
        Number(item.credit ?? 0);

      const reference =
        item.repairJob?.jobNumber ||
        item.sale?.invoiceNumber ||
        "-";

      return [
        new Date(
          item.createdAt
        ).toLocaleDateString(),

        reference,

        item.particulars || "-",

        debit > 0
          ? debit.toLocaleString()
          : "-",

        credit > 0
          ? credit.toLocaleString()
          : "-",

        Number(
          item.calculatedBalance
        ).toLocaleString(),
      ];
    });

    // -------------------------------------------------------
    // LEDGER TABLE
    // -------------------------------------------------------

    autoTable(doc, {
      startY: 43,

      head: [[
        "Date",
        "Reference",
        "Particulars",
        "Debit",
        "Credit",
        "Balance",
      ]],

      body: tableData,

      theme: "grid",

      styles: {
        fontSize: 8,
        cellPadding: 2,
      },

      headStyles: {
        fontStyle: "bold",
      },

      columnStyles: {
        0: {
          cellWidth: 24,
        },
        1: {
          cellWidth: 28,
        },
        2: {
          cellWidth: 65,
        },
        3: {
          cellWidth: 23,
          halign: "right",
        },
        4: {
          cellWidth: 23,
          halign: "right",
        },
        5: {
          cellWidth: 25,
          halign: "right",
        },
      },

      margin: {
        left: 10,
        right: 10,
      },
    });

    // -------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------
    let finalY =
    (doc as any).lastAutoTable.finalY + 8;

   const pageHeight =
   doc.internal.pageSize.getHeight();

   if (finalY + 18 > pageHeight - 10) {
   doc.addPage();
   finalY = 20;
   }

   doc.setFontSize(10);
   doc.setFont("helvetica", "bold");

    doc.text(
      `Total Debit: Rs. ${totalDebit.toLocaleString()}`,
      14,
      finalY
    );

    doc.text(
      `Total Credit: Rs. ${totalCredit.toLocaleString()}`,
      14,
      finalY + 6
    );

    doc.text(
      `Outstanding Balance: Rs. ${outstanding.toLocaleString()}`,
      14,
      finalY + 12
    );

    // -------------------------------------------------------
    // DOWNLOAD
    // -------------------------------------------------------

    const safeName =
      selectedCustomer.fullName
        .replace(/[^a-z0-9]/gi, "_");

    doc.save(
      `Customer Ledger - ${safeName}.pdf`
    );
  }

    // =========================================================
  // DOWNLOAD DETAILED LEDGER PDF
  // =========================================================

  async function downloadDetailedLedgerPdf() {
    if (!selectedCustomer) {
      alert("Please select a customer first.");
      return;
    }

    try {
     const data = await getCustomerDetailedLedger(
  selectedCustomer.id
);

const allRepairs = data?.repairs || [];
const allSales = data?.sales || [];

const repairs = allRepairs.filter(
  (repair: any) => {
    const itemDate = new Date(
      repair.receivedDate
    );

    if (fromDate) {
      const startDate = new Date(
        `${fromDate}T00:00:00`
      );

      if (itemDate < startDate) {
        return false;
      }
    }

    if (toDate) {
      const endDate = new Date(
        `${toDate}T23:59:59.999`
      );

      if (itemDate > endDate) {
        return false;
      }
    }

    return true;
  }
);

const sales = allSales.filter(
  (sale: any) => {
    const itemDate = new Date(
      sale.saleDate || sale.createdAt
    );

    if (fromDate) {
      const startDate = new Date(
        `${fromDate}T00:00:00`
      );

      if (itemDate < startDate) {
        return false;
      }
    }

    if (toDate) {
      const endDate = new Date(
        `${toDate}T23:59:59.999`
      );

      if (itemDate > endDate) {
        return false;
      }
    }

    return true;
  }
);

      if (repairs.length === 0 && sales.length === 0) {
        alert("No detailed transaction data available for this customer.");
        return;
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      // -------------------------------------------------------
      // HEADER
      // -------------------------------------------------------

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");

      doc.text(
        "CUSTOMER DETAILED LEDGER",
        pageWidth / 2,
        15,
        {
          align: "center",
        }
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(
        `Customer: ${selectedCustomer.fullName}`,
        14,
        24
      );

      doc.text(
        `Phone: ${selectedCustomer.phone || "-"}`,
        14,
        30
      );

      doc.text(
        `Address: ${selectedCustomer.address || "-"}`,
        14,
        36
      );

      doc.text(
        `PAN: ${selectedCustomer.panVat || "-"}`,
        pageWidth - 14,
        36,
        {
          align: "right",
        }
      );

      let currentY = 45;

      // -------------------------------------------------------
      // REPAIR TRANSACTIONS
      // -------------------------------------------------------

      if (repairs.length > 0) {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");

        doc.text(
          "REPAIR TRANSACTIONS",
          14,
          currentY
        );

        currentY += 5;

        for (const repair of repairs) {
          const parts = repair.parts || [];

          // Repair heading
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");

          doc.text(
            `Job No.: ${repair.jobNumber || "-"}`,
            14,
            currentY + 6
          );

          doc.setFont("helvetica", "normal");

          doc.text(
            `Date: ${
              repair.receivedDate
                ? new Date(
                    repair.receivedDate
                  ).toLocaleDateString()
                : "-"
            }`,
            pageWidth - 14,
            currentY + 6,
            {
              align: "right",
            }
          );

          currentY += 10;

          const repairRows = parts.map(
            (part: any) => {
              const quantity =
                Number(part.quantity ?? 0);

              const price =
                Number(part.price ?? 0);

              const total =
                quantity * price;

              return [
                part.inventory?.name ||
                  part.inventory?.itemName ||
                  "-",

                quantity.toLocaleString(),

                price.toLocaleString(),

                total.toLocaleString(),
              ];
            }
          );

          if (repairRows.length > 0) {
            autoTable(doc, {
              startY: currentY,

              head: [[
                "Item / Part",
                "Qty",
                "Price",
                "Total",
              ]],

              body: repairRows,

              theme: "grid",

              styles: {
                fontSize: 8,
                cellPadding: 2,
              },

              headStyles: {
                fontStyle: "bold",
              },

              columnStyles: {
                0: {
                  cellWidth: 100,
                },
                1: {
                  cellWidth: 20,
                  halign: "right",
                },
                2: {
                  cellWidth: 30,
                  halign: "right",
                },
                3: {
                  cellWidth: 30,
                  halign: "right",
                },
              },

              margin: {
                left: 10,
                right: 10,
              },
            });

            currentY =
              (doc as any).lastAutoTable.finalY + 5;
          }

          // ---------------------------------------------------
          // REPAIR TOTAL / PAID / DUE
          // ---------------------------------------------------
const partsTotal =
  (repair.parts || []).reduce(
    (sum: number, part: any) => {
      const quantity =
        Number(part.quantity ?? 0);

      const price =
        Number(
          part.price ??
            part.unitPrice ??
            part.sellingPrice ??
            part.inventory?.sellingPrice ??
            part.inventory?.price ??
            0
        );

      return (
        sum +
        Math.max(0, quantity) *
          Math.max(0, price)
      );
    },
    0
  );

const diagnosisFee =
  Math.max(
    0,
    Number(repair.diagnosisFee ?? 0)
  );

const labourCharge =
  Math.max(
    0,
    Number(repair.labourCharge ?? 0)
  );

const discount =
  Math.max(
    0,
    Number(repair.discount ?? 0)
  );

const estimateTotal =
  partsTotal +
  diagnosisFee +
  labourCharge;

const repairTotal =
  Math.max(
    0,
    estimateTotal - discount
  );

          const advanceAmount =
          Number(repair.advanceAmount ?? 0);

           const paymentAmount =
           (repair.payments || []).reduce(
            (
            sum: number,
            payment: any
            ) =>
            sum +
             Number(
             payment.amount ?? 0
             ),
             0
              );

const paid =
  advanceAmount +
  paymentAmount;

const due =
  Math.max(
    0,
    repairTotal - paid
  );
          const summaryText =
            `Repair Total: Rs. ${repairTotal.toLocaleString()}    ` +
            `Paid: Rs. ${paid.toLocaleString()}    ` +
            `Due: Rs. ${due.toLocaleString()}`;

          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");

          doc.text(
            summaryText,
            14,
            currentY
          );

          currentY += 9;

          // Separator
          doc.setLineWidth(0.2);

          doc.line(
            10,
            currentY,
            pageWidth - 10,
            currentY
          );

          currentY += 6;

          // Make sure the next transaction does not
          // start too close to the bottom.
          if (
            currentY >
            doc.internal.pageSize.getHeight() - 20
          ) {
            doc.addPage();
            currentY = 20;
          }
        }
      }

      // -------------------------------------------------------
      // SALES TRANSACTIONS
      // -------------------------------------------------------

      if (sales.length > 0) {
        if (
          currentY >
          doc.internal.pageSize.getHeight() - 45
        ) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");

        doc.text(
          "SALES TRANSACTIONS",
          14,
          currentY
        );

        currentY += 5;

        for (const sale of sales) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");

          doc.text(
            `Invoice: ${sale.invoiceNumber || "-"}`,
            14,
            currentY + 6
          );

          doc.setFont("helvetica", "normal");

          doc.text(
            `Date: ${
              sale.saleDate
                ? new Date(
                    sale.saleDate
                  ).toLocaleDateString()
                : "-"
            }`,
            pageWidth - 14,
            currentY + 6,
            {
              align: "right",
            }
          );

          currentY += 10;

          const saleRows =
            (sale.items || []).map(
              (item: any) => {
                const quantity =
                  Number(
                    item.quantity ?? 0
                  );

                const price =
                  Number(
                    item.sellingPrice ?? 0
                  );

                const total =
                  Number(
                    item.total ??
                      quantity * price
                  );

                return [
                  item.inventory?.name ||
                    item.inventory?.itemName ||
                    "-",

                  quantity.toLocaleString(),

                  price.toLocaleString(),

                  total.toLocaleString(),
                ];
              }
            );

          if (saleRows.length > 0) {
            autoTable(doc, {
              startY: currentY,

              head: [[
                "Item",
                "Qty",
                "Price",
                "Total",
              ]],

              body: saleRows,

              theme: "grid",

              styles: {
                fontSize: 8,
                cellPadding: 2,
              },

              headStyles: {
                fontStyle: "bold",
              },

              columnStyles: {
                0: {
                  cellWidth: 100,
                },
                1: {
                  cellWidth: 20,
                  halign: "right",
                },
                2: {
                  cellWidth: 30,
                  halign: "right",
                },
                3: {
                  cellWidth: 30,
                  halign: "right",
                },
              },

              margin: {
                left: 10,
                right: 10,
              },
            });

            currentY =
              (doc as any).lastAutoTable.finalY + 5;
          }

          // Sales total
          const salesTotal =
          Number(
          sale.grandTotal ?? 0
          );

          const salesPaid =
          Number(
          sale.paidAmount ?? 0
          );

         const salesDue =
         Number(
         sale.dueAmount ?? 0
          );

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");

       doc.text(
      `Sales Total: Rs. ${salesTotal.toLocaleString()}    ` +
      `Paid: Rs. ${salesPaid.toLocaleString()}    ` +
     `Due: Rs. ${salesDue.toLocaleString()}`,
     14,
    currentY
   );

          currentY += 9;

          doc.setLineWidth(0.2);

          doc.line(
            10,
            currentY,
            pageWidth - 10,
            currentY
          );

          currentY += 6;

          if (
            currentY >
            doc.internal.pageSize.getHeight() - 20
          ) {
            doc.addPage();
            currentY = 20;
          }
        }
      }
      // -------------------------------------------------------
      // OVERALL SUMMARY
      // -------------------------------------------------------
      // -------------------------------------------------------
      // OVERALL SUMMARY
      // Use the SAME filtered ledger as Customer Ledger
      // -------------------------------------------------------

      const detailedTotalDebit =
        filteredLedger.reduce(
          (sum: number, item: any) =>
            sum + Number(item.debit ?? 0),
          0
        );

      const detailedTotalCredit =
        filteredLedger.reduce(
          (sum: number, item: any) =>
            sum + Number(item.credit ?? 0),
          0
        );

      const detailedOutstanding =
        detailedTotalDebit -
        detailedTotalCredit;

      if (
        currentY >
        doc.internal.pageSize.getHeight() - 35
      ) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");

      doc.text(
        `Total Debit: Rs. ${detailedTotalDebit.toLocaleString()}`,
        14,
        currentY
      );

      doc.text(
        `Total Credit: Rs. ${detailedTotalCredit.toLocaleString()}`,
        14,
        currentY + 7
      );

      doc.text(
        `Outstanding Balance: Rs. ${detailedOutstanding.toLocaleString()}`,
        14,
        currentY + 14
      );

      currentY += 20;

      // -------------------------------------------------------
      // DOWNLOAD
      // -------------------------------------------------------

      const safeName =
        selectedCustomer.fullName
          .replace(/[^a-z0-9]/gi, "_");

      doc.save(
        `Customer Detailed Ledger - ${safeName}.pdf`
      );
    } catch (error) {
      console.error(
        "Unable to generate detailed customer ledger PDF:",
        error
      );

      alert(
        "Unable to generate detailed ledger PDF."
      );
    }
  }


  // =========================================================
  // DATE FILTERED LEDGER
  // =========================================================

  const filteredLedger = ledger.filter(
    (item: any) => {
      const itemDate = new Date(item.createdAt);

      if (fromDate) {
        const startDate = new Date(
          `${fromDate}T00:00:00`
        );

        if (itemDate < startDate) {
          return false;
        }
      }

      if (toDate) {
        const endDate = new Date(
          `${toDate}T23:59:59.999`
        );

        if (itemDate > endDate) {
          return false;
        }
      }

      return true;
    }
  );

 // Calculate running balance chronologically.
// For transactions on the same date, use the proper
// accounting sequence.

let balance = 0;

const chronologicalLedger =
  [...filteredLedger].sort(
    (a: any, b: any) => {
      const dateDifference =
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return 0;
    }
  );

const ledgerWithBalance =
  chronologicalLedger.map((item: any) => {
    const debit =
      Number(item.debit ?? 0);

    const credit =
      Number(item.credit ?? 0);

    balance +=
      debit - credit;

    return {
      ...item,
      calculatedBalance: balance,
    };
  });

// Summary
const totalDebit = filteredLedger.reduce(
  (sum: number, item: any) =>
    sum + Number(item.debit ?? 0),
  0
);

const totalCredit = filteredLedger.reduce(
  (sum: number, item: any) =>
    sum + Number(item.credit ?? 0),
  0
);

const outstanding = totalDebit - totalCredit;

  return (
    <div className="p-8">
     <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold">
    Customer Ledger
    </h1>

    <div className="flex gap-3">
<button
  type="button"
  onClick={openPayment}
  disabled={
    !selectedCustomer ||
    outstanding <= 0
  }
  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-semibold disabled:cursor-not-allowed"
>
  Receive Payment
</button>
     <button
      type="button"
      onClick={downloadLedgerPdf}
      disabled={!selectedCustomer || ledger.length === 0}
      className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      Download Ledger PDF
     </button>

     <button
      type="button"
      onClick={downloadDetailedLedgerPdf}
      disabled={!selectedCustomer}
      className="px-5 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
      Download Detailed Ledger PDF
     </button>
     </div>
    </div>

      <div className="bg-white rounded-xl shadow p-6">
        <label className="block mb-2 font-semibold">
          Customer
        </label>

     <Autocomplete
  options={customers}
  value={selectedCustomer}
  onChange={(_event, customer) => {
    if (!customer) {
      setCustomerId("");
      setSelectedCustomer(null);
      setLedger([]);
      return;
    }

    const id = customer.id;

    setCustomerId(id);
    setSelectedCustomer(customer);
    loadLedger(id);
  }}
  getOptionLabel={(customer) =>
    `${customer.fullName || ""} (${customer.phone || ""})`
  }
  isOptionEqualToValue={(option, value) =>
    option.id === value.id
  }
  filterOptions={(options, { inputValue }) => {
    const search =
      inputValue.trim().toLowerCase();

    if (!search) {
      return options;
    }

    return options.filter((customer) => {
      const name =
        String(
          customer.fullName || ""
        ).toLowerCase();

      const phone =
        String(
          customer.phone || ""
        ).toLowerCase();

      return (
        name.includes(search) ||
        phone.includes(search)
      );
    });
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Search customer name or contact number"
      size="small"
    />
  )}
  fullWidth
  sx={{
    marginBottom: 3,
  }}
/>

 <div className="grid grid-cols-3 gap-4 mb-6">
  <div>
    <label className="block mb-2 font-semibold">
      From Date
    </label>
    <input
      type="date"
      className="border rounded-lg p-3 w-full"
      value={fromDate}
      onChange={(e) =>
        setFromDate(e.target.value)
      }
    />
  </div>

  <div>
    <label className="block mb-2 font-semibold">
      To Date
    </label>
    <input
      type="date"
      className="border rounded-lg p-3 w-full"
      value={toDate}
      onChange={(e) =>
        setToDate(e.target.value)
      }
    />
  </div>

  <div className="flex items-center justify-center">
    <button
      type="button"
      onClick={() => {
        setFromDate("");
        setToDate("");
      }}
      className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600"
    >
      Clear
    </button>
  </div>
</div>

        {selectedCustomer && (
          <div className="bg-blue-50 border rounded-lg p-5 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500">Customer Name</p>
                <p className="font-bold text-lg">
                  {selectedCustomer.fullName}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-bold">
                  {selectedCustomer.phone}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Address</p>
                <p>{selectedCustomer.address || "-"}</p>
              </div>

              <div>
                <p className="text-gray-500">Customer PAN</p>
                <p>{selectedCustomer.panVat || "-"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 rounded-lg border p-5">
            <p className="text-gray-500">Total Debit</p>

            <h2 className="text-2xl font-bold text-green-700">
              Rs. {totalDebit.toLocaleString()}
            </h2>
          </div>

          <div className="bg-blue-50 rounded-lg border p-5">
            <p className="text-gray-500">Total Credit</p>

            <h2 className="text-2xl font-bold text-blue-700">
              Rs. {totalCredit.toLocaleString()}
            </h2>
          </div>

          <div className="bg-red-50 rounded-lg border p-5">
            <p className="text-gray-500">
              Outstanding Balance
            </p>

            <h2 className="text-2xl font-bold text-red-700">
              Rs. {outstanding.toLocaleString()}
            </h2>
          </div>
        </div>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Date</th>
              <th className="border p-2">Reference</th>
              <th className="border p-2">Particulars</th>
              <th className="border p-2">Debit</th>
              <th className="border p-2">Credit</th>
              <th className="border p-2">Balance</th>
            </tr>
          </thead>

          <tbody>
  {[...ledgerWithBalance]
    .reverse()
    .map((item: any) => {
      return (
        <tr key={item.id}>
          <td className="border p-2">
            {new Date(
              item.createdAt
            ).toLocaleDateString()}
          </td>

          <td className="border p-2">
            {item.repairJob?.jobNumber ||
              item.sale?.invoiceNumber ||
              "-"}
          </td>

          <td className="border p-2">
            {item.particulars}
          </td>

          <td className="border p-2 text-right">
            {item.debit}
          </td>

          <td className="border p-2 text-right">
            {item.credit}
          </td>

          <td className="border p-2 text-right font-bold">
            {Number(
              item.calculatedBalance
            ).toLocaleString()}
          </td>
        </tr>
      );
    })}
</tbody>

        </table>
      </div>

      {/* =================================================
          PAY CUSTOMER MODAL
      ================================================= */}

      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7">

            <div className="flex justify-between items-center mb-6">

              <div>
                <h2 className="text-2xl font-bold">
                 Receive Payment
                </h2>

                <p className="text-gray-500 mt-1">
                  {selectedCustomer?.fullName}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPayment(false)
                }
                disabled={savingPayment}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>

            </div>

            <div className="bg-orange-50 border rounded-lg p-4 mb-5">

              <p className="text-sm text-gray-500">
                Current Outstanding
              </p>

              <p className="text-2xl font-bold text-orange-700">
                Rs.{" "}
                {outstanding.toFixed(2)}
              </p>

            </div>

            <div className="mb-5">

              <label className="text-sm font-medium">
                Payment Amount
              </label>

              <input
                type="number"
                min={0}
                max={outstanding}
                value={paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(
                    Math.max(
                      0,
                      Math.min(
                        Number(
                          e.target.value
                        ) || 0,
                        outstanding
                      )
                    )
                  )
                }
                className="border rounded-lg p-3 w-full mt-1"
              />

            </div>

            <div className="mb-5">

              <label className="text-sm font-medium">
                Payment Date
              </label>

              <input
                type="date"
                value={paymentDate}
                onChange={(e) =>
                  setPaymentDate(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full mt-1"
              />

            </div>

            <div className="mb-5">

              <label className="text-sm font-medium">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full mt-1"
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

            <div className="mb-6">

              <label className="text-sm font-medium">
                Remarks
              </label>

              <textarea
                rows={3}
                value={paymentRemarks}
                onChange={(e) =>
                  setPaymentRemarks(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3 w-full mt-1"
                placeholder="Optional remarks"
              />

            </div>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowPayment(false)
                }
                disabled={savingPayment}
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePayment}
                disabled={savingPayment}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
              >
                {savingPayment
                  ? "Processing..."
                  : "Receive Payment"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

