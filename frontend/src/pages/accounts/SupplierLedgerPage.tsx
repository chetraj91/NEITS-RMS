import {
  useEffect,
  useState,
} from "react";

import {
  Autocomplete,
  TextField,
} from "@mui/material";

import NepaliDate from "nepali-date-converter";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getSuppliers,
} from "../../api/supplier";

import {
  getSupplierLedger,
  getSupplierDetailedLedger,
} from "../../api/supplierLedger";


import {
  createSupplierPayment,
} from "../../api/supplierPayment";

import {
  getPaymentMethods,
} from "../../api/paymentMethod";

export default function SupplierLedgerPage() {
  const [suppliers, setSuppliers] =
    useState<any[]>([]);

  const [supplierId, setSupplierId] =
    useState("");

  const [
    selectedSupplier,
    setSelectedSupplier,
  ] = useState<any>(null);

  const [ledger, setLedger] =
    useState<any[]>([]);

    const [adStartDate, setAdStartDate] =
    useState("");

   const [adEndDate, setAdEndDate] =
   useState("");

    const [bsStartDate, setBsStartDate] =
    useState("");

   const [bsEndDate, setBsEndDate] =
   useState("");
// =====================================================
// BS DATE -> AD DATE
// =====================================================

function convertBsToAd(
  bsDate: string
): Date | null {
  if (!bsDate.trim()) {
    return null;
  }

  try {
    const converted =
      new NepaliDate(
        bsDate.trim()
      ).toJsDate();

    if (
      Number.isNaN(
        converted.getTime()
      )
    ) {
      return null;
    }

    return converted;
  } catch {
    return null;
  }
}

   const [loading, setLoading] =
    useState(false);

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

  // =====================================================
  // LOAD SUPPLIERS
  // =====================================================

 useEffect(() => {
  loadSuppliers();
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
  async function loadSuppliers() {
    try {
      const response =
        await getSuppliers();

      const data =
        Array.isArray(response)
          ? response
          : response?.data ?? [];

      setSuppliers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load suppliers:",
        error
      );
    }
  }

  // =====================================================
  // LOAD LEDGER
  // =====================================================

  async function loadLedger(
    id: string
  ) {
    if (!id) {
      setLedger([]);
      return;
    }

    try {
      setLoading(true);

      const data =
        await getSupplierLedger(
          id
        );

        setLedger(
        Array.isArray(data)
        ? [...data].sort(
         (a: any, b: any) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
         )
         : []
         );

    } catch (error) {
      console.error(
        "Failed to load supplier ledger:",
        error
      );

      setLedger([]);
    } finally {
      setLoading(false);
    }
  }

  const downloadSupplierLedgerPdf = () => {
  if (
    !selectedSupplier ||
    ledger.length === 0
  ) {
    alert(
      "No supplier ledger data available."
    );
    return;
  }

  // =====================================================
  // FILTER LEDGER BY AD DATE
  // =====================================================

  const filteredLedger =
    ledger.filter(
      (item: any) => {
        const itemDate =
          new Date(item.date);

        if (adStartDate) {
          const startDate =
            new Date(
              `${adStartDate}T00:00:00`
            );

          if (
            itemDate < startDate
          ) {
            return false;
          }
        }

        if (adEndDate) {
          const endDate =
            new Date(
              `${adEndDate}T23:59:59.999`
            );

          if (
            itemDate > endDate
          ) {
            return false;
          }
        }

        return true;
      }
    );

  if (
    filteredLedger.length === 0
  ) {
    alert(
      "No supplier transactions found for the selected date range."
    );
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);

  doc.text(
    "Supplier Ledger",
    14,
    18
  );

  doc.setFontSize(11);

  doc.text(
    `Supplier: ${
      selectedSupplier.companyName ||
      "-"
    }`,
    14,
    27
  );

  // =====================================================
  // DATE RANGE ON PDF
  // =====================================================

  if (
    adStartDate ||
    adEndDate
  ) {
    doc.setFontSize(9);

    doc.text(
      `AD Date Range: ${
        adStartDate || "Beginning"
      } to ${
        adEndDate || "Present"
      }`,
      14,
      32
    );
  }

  const tableStartY =
    adStartDate ||
    adEndDate
      ? 39
      : 34;

  const totalPurchases =
    filteredLedger.reduce(
      (
        sum: number,
        item: any
      ) =>
        sum +
        Number(
          item.debit || 0
        ),
      0
    );

  const totalPaid =
    filteredLedger.reduce(
      (
        sum: number,
        item: any
      ) =>
        sum +
        Number(
          item.credit || 0
        ),
      0
    );

  const outstanding =
    Math.max(
      0,
      totalPurchases -
        totalPaid
    );

  autoTable(doc, {
    startY: tableStartY,

    head: [
      [
        "Date",
        "Purchase No.",
        "Particulars",
        "Debit",
        "Credit",
        "Balance",
      ],
    ],

    body:
      filteredLedger.map(
        (item: any) => [
          new Date(
            item.date
          ).toLocaleDateString(
            "en-GB"
          ),

          item.purchase
            ?.purchaseNumber ||
            item.purchaseNumber ||
            "-",

          item.particulars ||
            "-",

          Number(
            item.debit || 0
          ).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          ),

          Number(
            item.credit || 0
          ).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          ),

          Number(
            item.balance || 0
          ).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          ),
        ]
      ),

    styles: {
      fontSize: 8,
    },

    headStyles: {
      fontStyle: "bold",
    },
  });

  let finalY =
    (doc as any)
      .lastAutoTable
      .finalY + 8;

  const pageHeight =
    doc.internal.pageSize
      .getHeight();

  if (
    finalY + 25 >
    pageHeight - 10
  ) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(10);

  doc.text(
    `Total Purchases: Rs. ${totalPurchases.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`,
    14,
    finalY
  );

  doc.text(
    `Total Paid: Rs. ${totalPaid.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`,
    14,
    finalY + 7
  );

  doc.text(
    `Outstanding: Rs. ${outstanding.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`,
    14,
    finalY + 14
  );

  doc.save(
    `Supplier-Ledger-${
      selectedSupplier.companyName ||
      "Supplier"
    }.pdf`
  );
};
  // =====================================================
  // DOWNLOAD DETAILED SUPPLIER LEDGER PDF
  // =====================================================

    const downloadDetailedSupplierLedgerPdf =
    async () => {
      if (!selectedSupplier) {
        alert(
          "Please select a supplier first."
        );
        return;
      }

      try {
        const data =
          await getSupplierDetailedLedger(
            selectedSupplier.id
          );

        const allPurchases =
          data?.purchases || [];

        const allSupplierPayments =
          data?.supplierPayments || [];

        // =====================================================
        // FILTER PURCHASES BY AD DATE
        // =====================================================

        const filteredPurchases =
          allPurchases.filter(
            (purchase: any) => {
              const purchaseDate =
                new Date(
                  purchase.purchaseDate
                );

              if (adStartDate) {
                const startDate =
                  new Date(
                    `${adStartDate}T00:00:00`
                  );

                if (
                  purchaseDate <
                  startDate
                ) {
                  return false;
                }
              }

                      if (adEndDate) {
          const endDate =
            new Date(
              `${adEndDate}T23:59:59.999`
            );

          if (
            purchaseDate > endDate
          ) {
            return false;
          }
        }

        // =====================================================
        // BS DATE FILTER
        // =====================================================

        if (bsStartDate) {
          const convertedBsStart =
            convertBsToAd(
              bsStartDate
            );

          if (convertedBsStart) {
            const startDate =
              new Date(
                convertedBsStart
              );

            startDate.setHours(
              0,
              0,
              0,
              0
            );

            if (
                new Date(paymentDate) < startDate
            ) {
              return false;
            }
          }
        }

        if (bsEndDate) {
          const convertedBsEnd =
            convertBsToAd(
              bsEndDate
            );

          if (convertedBsEnd) {
            const endDate =
              new Date(
                convertedBsEnd
              );

            endDate.setHours(
              23,
              59,
              59,
              999
            );

            if (
             new Date(paymentDate) > endDate
            ) {
              return false;
            }
          }
        }

        return true;
            }
          );

        // =====================================================
        // FILTER SUPPLIER PAYMENTS BY AD DATE
        // =====================================================

        const filteredSupplierPayments =
          allSupplierPayments.filter(
            (payment: any) => {
              const paymentDate =
                new Date(
                  payment.paymentDate
                );

              if (adStartDate) {
                const startDate =
                  new Date(
                    `${adStartDate}T00:00:00`
                  );

                if (
                  paymentDate <
                  startDate
                ) {
                  return false;
                }
              }

              if (adEndDate) {
                const endDate =
                  new Date(
                    `${adEndDate}T23:59:59.999`
                  );

                if (
                  paymentDate >
                  endDate
                ) {
                  return false;
                }
              }

              return true;
            }
          );

        if (
          filteredPurchases.length === 0 &&
          filteredSupplierPayments.length === 0
        ) {
          alert(
            "No supplier transactions found for the selected date range."
          );
          return;
        }

        const doc = new jsPDF();

        doc.setFontSize(16);

        doc.text(
          "Detailed Supplier Ledger",
          14,
          18
        );

        doc.setFontSize(11);

        doc.text(
          `Supplier: ${
            selectedSupplier.companyName ||
            "-"
          }`,
          14,
          27
        );

        // =====================================================
        // DATE RANGE
        // =====================================================

        let currentY = 36;

        if (
          adStartDate ||
          adEndDate
        ) {
          doc.setFontSize(9);

          doc.text(
            `AD Date Range: ${
              adStartDate ||
              "Beginning"
            } to ${
              adEndDate ||
              "Present"
            }`,
            14,
            currentY
          );

          currentY += 6;
        }

        // =====================================================
        // PURCHASE DETAILS
        // =====================================================

        for (
          const purchase of filteredPurchases
        ) {
          if (
            currentY > 250
          ) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(11);

          doc.text(
            `Purchase No.: ${
              purchase.purchaseNumber ||
              "-"
            }`,
            14,
            currentY
          );

          doc.text(
            `Date: ${
              new Date(
                purchase.purchaseDate
              ).toLocaleDateString(
                "en-GB"
              )
            }`,
            120,
            currentY
          );

          currentY += 5;

          const rows =
            (purchase.items || []).map(
              (item: any) => {
                const quantity =
                  Number(
                    item.quantity || 0
                  );

                const price =
                  Number(
                    item.purchasePrice ||
                    0
                  );

                const total =
                  Number(
                    item.total ??
                      quantity *
                        price
                  );

                return [
                  item.inventory
                    ?.name ||
                    item.inventory
                    ?.itemName ||
                    "-",

                  quantity.toLocaleString(),

                  price.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  ),

                  total.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  ),
                ];
              }
            );

          autoTable(doc, {
            startY:
              currentY + 2,

            head: [
              [
                "Item",
                "Qty",
                "Price",
                "Total",
              ],
            ],

            body: rows,

            styles: {
              fontSize: 8,
            },

            headStyles: {
              fontStyle: "bold",
            },

            margin: {
              left: 14,
              right: 14,
            },
          });

          currentY =
            (doc as any)
              .lastAutoTable
              .finalY + 7;

          const purchaseTotal =
            Number(
              purchase.totalAmount ||
              0
            );

          const paid =
            Number(
              purchase.paidAmount ||
              0
            );

          const due =
            Math.max(
              0,
              purchaseTotal -
                paid
            );

          doc.setFontSize(9);

          doc.text(
            `Purchase Total: Rs. ${purchaseTotal.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}    Paid: Rs. ${paid.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}    Due: Rs. ${due.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`,
            14,
            currentY
          );

          currentY += 12;
        }

        // =====================================================
        // SUPPLIER PAYMENT HISTORY
        // =====================================================

        if (
          filteredSupplierPayments.length > 0
        ) {
          if (
            currentY > 245
          ) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(12);

          doc.text(
            "Supplier Payments",
            14,
            currentY
          );

          autoTable(doc, {
            startY:
              currentY + 5,

            head: [
              [
                "Date",
                "Purchase No.",
                "Payment Method",
                "Amount",
              ],
            ],

            body:
              filteredSupplierPayments.map(
                (payment: any) => [
                  new Date(
                    payment.paymentDate
                  ).toLocaleDateString(
                    "en-GB"
                  ),

                  payment.purchase
                    ?.purchaseNumber ||
                    "-",

                  payment.paymentMethod ||
                    "CASH",

                  Number(
                    payment.amount ||
                    0
                  ).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  ),
                ]
              ),

            styles: {
              fontSize: 8,
            },

            headStyles: {
              fontStyle: "bold",
            },

            margin: {
              left: 14,
              right: 14,
            },
          });

          currentY =
            (doc as any)
              .lastAutoTable
              .finalY + 8;
        }

        // =====================================================
        // FINAL FINANCIAL SUMMARY
        // =====================================================

        const totalPurchases =
          filteredPurchases.reduce(
            (
              sum: number,
              purchase: any
            ) =>
              sum +
              Number(
                purchase.totalAmount ||
                0
              ),
            0
          );

        const purchasePaid =
          filteredPurchases.reduce(
            (
              sum: number,
              purchase: any
            ) =>
              sum +
              Number(
                purchase.paidAmount ||
                0
              ),
            0
          );

        const laterPaid =
          filteredSupplierPayments.reduce(
            (
              sum: number,
              payment: any
            ) =>
              sum +
              Number(
                payment.amount ||
                0
              ),
            0
          );

        const totalPaid =
          purchasePaid +
          laterPaid;

        const totalOutstanding =
          Math.max(
            0,
            totalPurchases -
              totalPaid
          );

        if (
          currentY > 250
        ) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(11);

        doc.text(
          "Financial Summary",
          14,
          currentY
        );

        currentY += 8;

        doc.setFontSize(10);

        doc.text(
          `Total Purchases: Rs. ${totalPurchases.toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`,
          14,
          currentY
        );

        currentY += 7;

        doc.text(
          `Total Paid: Rs. ${totalPaid.toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`,
          14,
          currentY
        );

        currentY += 7;

        doc.text(
          `Outstanding: Rs. ${totalOutstanding.toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`,
          14,
          currentY
        );

        currentY += 7;

        doc.save(
          `Detailed-Supplier-Ledger-${
            selectedSupplier.companyName ||
            "Supplier"
          }.pdf`
        );
      } catch (error) {
        console.error(
          "DETAILED SUPPLIER LEDGER PDF ERROR:",
          error
        );

        alert(
          "Unable to generate detailed supplier ledger PDF."
        );
      }
    };
    // =====================================================
  // SUMMARY FROM FILTERED LEDGER
  // =====================================================

  const filteredLedgerForSummary =
    ledger.filter(
      (item: any) => {
        const itemDate =
          new Date(item.date);

        if (adStartDate) {
          const startDate =
            new Date(
              `${adStartDate}T00:00:00`
            );

          if (
            itemDate < startDate
          ) {
            return false;
          }
        }

        if (adEndDate) {
          const endDate =
            new Date(
              `${adEndDate}T23:59:59.999`
            );

          if (
            itemDate > endDate
          ) {
            return false;
          }
        }

        return true;
      }
    );

  const totalPurchases =
    filteredLedgerForSummary.reduce(
      (
        sum: number,
        item: any
      ) =>
        sum +
        Number(
          item.debit || 0
        ),
      0
    );

  const totalPaid =
    filteredLedgerForSummary.reduce(
      (
        sum: number,
        item: any
      ) =>
        sum +
        Number(
          item.credit || 0
        ),
      0
    );

  const outstanding =
    Math.max(
      0,
      totalPurchases -
        totalPaid
    );
  // =====================================================
  // FORMAT
  // =====================================================

  function money(
    value: number
  ) {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  function formatDate(
    value: string
  ) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString();
  }

  // =====================================================
  // OPEN PAYMENT
  // =====================================================

  function openPayment() {
    if (!supplierId) {
      alert(
        "Please select a supplier."
      );
      return;
    }

    if (outstanding <= 0) {
      alert(
        "This supplier has no outstanding balance."
      );
      return;
    }

    setPaymentAmount(
      outstanding
    );

    setPaymentMethod(
      "CASH"
    );

    setPaymentDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setPaymentRemarks("");

    setShowPayment(
      true
    );
  }

  // =====================================================
  // SAVE PAYMENT
  // =====================================================

  async function handlePayment() {
    const amount =
      Number(
        paymentAmount || 0
      );

    if (amount <= 0) {
      alert(
        "Payment amount must be greater than zero."
      );
      return;
    }

    if (
      amount >
      outstanding
    ) {
      alert(
        `Payment cannot exceed outstanding balance of Rs. ${outstanding.toFixed(
          2
        )}.`
      );
      return;
    }

    try {
      setSavingPayment(
        true
      );

      const response =
        await createSupplierPayment({
          supplierId,

          amount,

          paymentDate,

          paymentMethod,

          remarks:
            paymentRemarks.trim() ||
            undefined,
        });

      alert(
        response?.message ||
          "Supplier payment recorded successfully."
      );

      setShowPayment(
        false
      );

      await loadLedger(
        supplierId
      );
    } catch (error: any) {
      console.error(
        "Supplier payment error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to record supplier payment."
      );
    } finally {
      setSavingPayment(
        false
      );
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Supplier Ledger
        </h1>

      <button
      type="button"
      onClick={
      openPayment
      }
      disabled={
      !supplierId ||
      outstanding <= 0
      }
      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold"
      >
      Pay Supplier
      </button>

      <button
      type="button"
      onClick={
      downloadSupplierLedgerPdf
      }
      disabled={
      !supplierId ||
      ledger.length === 0
      }
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold"
      >
      Download Ledger PDF
      </button>
            <button
      type="button"
      onClick={
      downloadDetailedSupplierLedgerPdf
      }
      disabled={
      !supplierId
      }
      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold"
      >
      Download Detailed Ledger PDF
      </button>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        {/* SUPPLIER */}

        <label className="block mb-2 font-semibold">
          Supplier
        </label>

    <Autocomplete
  options={suppliers}
  value={selectedSupplier}
  onChange={(_event, supplier) => {
    if (!supplier) {
      setSupplierId("");
      setSelectedSupplier(null);
      setLedger([]);
      return;
    }

    const id = supplier.id;

    setSupplierId(id);
    setSelectedSupplier(supplier);
    loadLedger(id);
  }}
  getOptionLabel={(supplier) =>
    `${supplier.companyName || ""}${
      supplier.phone
        ? ` (${supplier.phone})`
        : ""
    }`
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

    return options.filter((supplier) => {
      const companyName =
        String(
          supplier.companyName || ""
        ).toLowerCase();

      const phone =
        String(
          supplier.phone || ""
        ).toLowerCase();

      return (
        companyName.includes(search) ||
        phone.includes(search)
      );
    });
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Search supplier name or contact number"
      size="small"
    />
  )}
  fullWidth
  sx={{
    marginBottom: 3,
  }}
/>

                {/* DATE FILTERS */}

      <div className="grid grid-cols-5 gap-4 mb-6">

          {/* AD START */}

          <div>
            <label className="block mb-2 font-semibold">
              AD Start Date
            </label>

            <input
              type="date"
              className="border rounded-lg p-3 w-full"
              value={adStartDate}
              onChange={(e) =>
                setAdStartDate(
                  e.target.value
                )
              }
            />
          </div>

          {/* AD END */}

          <div>
            <label className="block mb-2 font-semibold">
              AD End Date
            </label>

            <input
              type="date"
              className="border rounded-lg p-3 w-full"
              value={adEndDate}
              onChange={(e) =>
                setAdEndDate(
                  e.target.value
                )
              }
            />
          </div>

           <div className="flex items-center justify-center">
    <button
      type="button"
      onClick={() => {
        setAdStartDate("");
        setAdEndDate("");
        setBsStartDate("");
        setBsEndDate("");
      }}
      className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600"
      >
      Clear
      </button>
      </div>

          {/* BS START */}

          <div>
            <label className="block mb-2 font-semibold">
              BS Start Date
            </label>

            <input
              type="text"
              placeholder="YYYY-MM-DD"
              className="border rounded-lg p-3 w-full"
              value={bsStartDate}
              onChange={(e) =>
                setBsStartDate(
                  e.target.value
                )
              }
            />
          </div>

          {/* BS END */}

          <div>
            <label className="block mb-2 font-semibold">
              BS End Date
            </label>

            <input
              type="text"
              placeholder="YYYY-MM-DD"
              className="border rounded-lg p-3 w-full"
              value={bsEndDate}
              onChange={(e) =>
                setBsEndDate(
                  e.target.value
                )
              }
            />
          </div>

        </div>

        {/* SUPPLIER INFORMATION */}

        {selectedSupplier && (
          <div className="bg-orange-50 border rounded-lg p-5 mb-6">

            <div className="grid grid-cols-2 gap-6">

              <div>
                <p className="text-gray-500">
                  Supplier Name
                </p>

                <p className="font-bold text-lg">
                  {
                    selectedSupplier.companyName
                  }
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Contact Person
                </p>

                <p className="font-bold">
                  {
                    selectedSupplier.contactPerson ||
                    "-"
                  }
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Phone
                </p>

                <p className="font-bold">
                  {
                    selectedSupplier.phone ||
                    "-"
                  }
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  PAN/VAT
                </p>

                <p>
                  {
                    selectedSupplier.panVat ||
                    "-"
                  }
                </p>
              </div>

            </div>

          </div>
        )}

        {/* SUMMARY */}

        <div className="grid grid-cols-3 gap-6 mb-6">

          <div className="bg-red-50 rounded-lg border p-5">
            <p className="text-gray-500">
              Total Purchases
            </p>

            <h2 className="text-2xl font-bold text-red-700">
              Rs.{" "}
              {money(
                totalPurchases
              )}
            </h2>
          </div>

          <div className="bg-green-50 rounded-lg border p-5">
            <p className="text-gray-500">
              Total Paid
            </p>

            <h2 className="text-2xl font-bold text-green-700">
              Rs.{" "}
              {money(
                totalPaid
              )}
            </h2>
          </div>

          <div className="bg-orange-50 rounded-lg border p-5">
            <p className="text-gray-500">
              Outstanding
            </p>

            <h2 className="text-2xl font-bold text-orange-700">
              Rs.{" "}
              {money(
                outstanding
              )}
            </h2>
          </div>

        </div>

        {/* =================================================
            SINGLE ACCOUNT LEDGER
        ================================================= */}

        <h2 className="text-xl font-bold mb-4">
          Account Ledger
        </h2>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Loading supplier ledger...
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full border">

              <thead>

                <tr className="bg-gray-200">

                  <th className="border p-3 text-left">
                    Date
                  </th>

                  <th className="border p-3 text-left">
                    Purchase No.
                  </th>

                  <th className="border p-3 text-left">
                    Particulars
                  </th>

                  <th className="border p-3 text-right">
                    Debit
                  </th>

                  <th className="border p-3 text-right">
                    Credit
                  </th>

                  <th className="border p-3 text-right">
                    Balance
                  </th>

                </tr>

              </thead>

              <tbody>

             {ledger
             .filter((item: any) => {
              const itemDate =
               new Date(item.date);

              if (adStartDate) {
             const startDate =
             new Date(
            `${adStartDate}T00:00:00`
             );

           if (
            itemDate < startDate
            ) {
            return false;
          }
         }

          if (adEndDate) {
          const endDate =
           new Date(
            `${adEndDate}T23:59:59.999`
          );

        if (
          itemDate > endDate
        ) {
          return false;
        }
      }

            // =====================================================
      // BS DATE FILTER
      // =====================================================

      if (bsStartDate) {
        const convertedBsStart =
          convertBsToAd(
            bsStartDate
          );

        if (convertedBsStart) {
          const startDate =
            new Date(
              convertedBsStart
            );

          startDate.setHours(
            0,
            0,
            0,
            0
          );

          if (
            itemDate < startDate
          ) {
            return false;
          }
        }
      }

      if (bsEndDate) {
        const convertedBsEnd =
          convertBsToAd(
            bsEndDate
          );

        if (convertedBsEnd) {
          const endDate =
            new Date(
              convertedBsEnd
            );

          endDate.setHours(
            23,
            59,
            59,
            999
          );

          if (
            itemDate > endDate
          ) {
            return false;
          }
        }
      }

      return true;
    })
    .map(
      (
        item: any
      ) => (
                    <tr
                      key={
                        item.id
                      }
                      className="hover:bg-gray-50"
                    >

                      <td className="border p-3">
                        {
                          formatDate(
                            item.date
                          )
                        }
                      </td>

                      <td className="border p-3 font-semibold">
                        {
                          item.purchaseNumber ||
                          "-"
                        }
                      </td>

                      <td className="border p-3">
                        {
                          item.particulars
                        }
                      </td>

                      <td className="border p-3 text-right text-red-600 font-semibold">
                        {Number(
                          item.debit || 0
                        ) > 0
                          ? `Rs. ${money(
                              Number(
                                item.debit
                              )
                            )}`
                          : "-"}
                      </td>

                      <td className="border p-3 text-right text-green-600 font-semibold">
                        {Number(
                          item.credit || 0
                        ) > 0
                          ? `Rs. ${money(
                              Number(
                                item.credit
                              )
                            )}`
                          : "-"}
                      </td>

                      <td className="border p-3 text-right font-bold">
                        Rs.{" "}
                        {money(
                          Number(
                            item.balance ||
                              0
                          )
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

            {!supplierId && (
              <div className="py-10 text-center text-gray-500">
                Please select a supplier.
              </div>
            )}

            {supplierId &&
              !ledger.length &&
              !loading && (
                <div className="py-10 text-center text-gray-500">
                  No supplier transactions found.
                </div>
              )}

          </div>
        )}

      </div>

      {/* =================================================
          PAY SUPPLIER MODAL
      ================================================= */}

      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7">

            <div className="flex justify-between items-center mb-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Pay Supplier
                </h2>

                <p className="text-gray-500 mt-1">
                  {
                    selectedSupplier?.companyName
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPayment(
                    false
                  )
                }
                disabled={
                  savingPayment
                }
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
                {money(
                  outstanding
                )}
              </p>

            </div>

            <div className="mb-5">

              <label className="text-sm font-medium">
                Payment Amount
              </label>

              <input
                type="number"
                min={0}
                max={
                  outstanding
                }
                value={
                  paymentAmount
                }
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
                value={
                  paymentDate
                }
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
                value={
                  paymentMethod
                }
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
                value={
                  paymentRemarks
                }
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
                  setShowPayment(
                    false
                  )
                }
                disabled={
                  savingPayment
                }
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handlePayment
                }
                disabled={
                  savingPayment
                }
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
              >
                {savingPayment
                  ? "Processing..."
                  : "Pay Supplier"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}