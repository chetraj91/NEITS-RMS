import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSaleInvoice } from "../api/invoice";

import {
  formatNepaliDate,
} from "../utils/nepaliDate";

export default function SaleInvoicePage() {
  const { id } = useParams();

  const [invoice, setInvoice] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  async function loadInvoice() {
    if (!id) return;

    try {
      setLoading(true);

      const res =
        await getSaleInvoice(id);

      const data =
        res.data?.data ??
        res.data ??
        res;

      console.log(
        "SALE INVOICE:",
        data
      );

      setInvoice(data);
    } catch (err: any) {
      console.error(
        "Failed to load sales invoice:",
        err
      );

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load sales invoice."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading Sales Invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-red-600">
        Sales Invoice not found.
      </div>
    );
  }

  const company =
    invoice.company || {};

  const customer =
    invoice.customer || null;

  const sale =
    invoice.sale || {};

  const items =
    Array.isArray(invoice.items)
      ? invoice.items
      : [];

  const summary =
    invoice.summary || {};

  const subtotal = Number(
    summary.subtotal ?? 0
  );

  const discount = Number(
    summary.discount ?? 0
  );

  const grandTotal = Number(
    summary.grandTotal ?? 0
  );

  const invoiceNumber =
    sale.invoiceNumber || "-";

  const saleDate = sale.saleDate
    ? formatNepaliDate(
        sale.saleDate
      )
    : formatNepaliDate(
        new Date()
      );

  function printInvoice() {
    window.print();
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">

      {/* =================================================
          PRINT BUTTON
      ================================================= */}

      <div className="max-w-4xl mx-auto mb-4 flex justify-end print:hidden">

        <button
          onClick={printInvoice}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          🖨 Print Invoice
        </button>

      </div>

      {/* =================================================
          INVOICE
      ================================================= */}

      <div
        id="sales-invoice"
        className="bg-white max-w-4xl mx-auto p-8 shadow print:shadow-none print:max-w-none"
      >

        {/* =================================================
            COMPANY HEADER
        ================================================= */}

        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-5 mb-6">

          <div>

            <h1 className="text-2xl font-extrabold text-gray-800">
              {company.name ||
                "Nepal Electronics & IT Solution"}
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              {company.address ||
                "New Baneshwor, Kathmandu, Nepal"}
            </p>

            <p className="text-gray-800 text-sm font-semibold mt-1">
              PAN No:{" "}
              <span className="font-normal">
                {company.pan ||
                  "601837201"}
              </span>
            </p>

            <p className="text-gray-600 text-sm">
              Phone:{" "}
              {company.phone ||
                "+977-9803453571"}
            </p>

            <p className="text-gray-600 text-sm">
              Email:{" "}
              {company.email ||
                "neitslab@gmail.com"}
            </p>

          </div>

          <div className="text-right">

            <h2 className="text-4xl font-extrabold text-gray-200 tracking-wide">
              INVOICE
            </h2>

            <p className="text-red-600 font-bold text-sm mt-1">
              SALES INVOICE
            </p>

          </div>

        </div>

        {/* =================================================
            CUSTOMER + INVOICE INFORMATION
        ================================================= */}

        <div className="grid grid-cols-2 gap-8 mb-6">

          {/* CUSTOMER */}

          <div className="border rounded-lg p-4 bg-gray-50">

            <p className="text-xs text-gray-500 uppercase mb-2">
              Billed To
            </p>

            <p className="font-bold text-lg">
              {customer?.name ||
                "Cash Customer"}
            </p>

            <p className="text-sm mt-1">
              Phone:{" "}
              {customer?.phone ||
                "-"}
            </p>

            <p className="text-sm">
              Address:{" "}
              {customer?.address ||
                "-"}
            </p>

            <p className="text-sm">
              PAN/VAT:{" "}
              {customer?.panVat ||
                "-"}
            </p>

          </div>

          {/* INVOICE */}

          <div className="border rounded-lg p-4 bg-gray-50">

            <div className="flex justify-between">
              <span className="font-semibold">
                Invoice No:
              </span>

              <span>
                {invoiceNumber}
              </span>
            </div>

            <div className="flex justify-between mt-2">
              <span className="font-semibold">
                Date:
              </span>

              <span>
                {saleDate}
              </span>
            </div>

          </div>

        </div>

        {/* =================================================
            ITEMS
        ================================================= */}

        <table className="w-full border-collapse mb-8">

          <thead>

            <tr className="bg-gray-100">

              <th className="border px-3 py-3 text-center text-sm">
                S.N.
              </th>

              <th className="border px-3 py-3 text-left text-sm">
                DESCRIPTION
              </th>

              <th className="border px-3 py-3 text-center text-sm">
                QTY
              </th>

              <th className="border px-3 py-3 text-right text-sm">
                UNIT PRICE
              </th>

              <th className="border px-3 py-3 text-right text-sm">
                TOTAL
              </th>

            </tr>

          </thead>

          <tbody>

            {items.length > 0 ? (
              items.map(
                (
                  item: any,
                  index: number
                ) => {

                  const description =
                    item.itemName ||
                    item.inventory?.itemName ||
                    "Unnamed Item";

                  const quantity =
                    Number(
                      item.quantity ?? 0
                    );

                  const unitPrice =
                    Number(
                      item.unitPrice ??
                        item.sellingPrice ??
                        0
                    );

                  const total =
                    Number(
                      item.total ??
                        quantity *
                          unitPrice
                    );

                  return (
                    <tr
                      key={
                        item.id ||
                        `${description}-${index}`
                      }
                    >

                      <td className="border px-3 py-3 text-center">
                        {index + 1}
                      </td>

                      <td className="border px-3 py-3">

                        <div className="font-semibold">
                          {description}
                        </div>

                        {(item.brand ||
                          item.model ||
                          item.itemCode) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.itemCode &&
                              `Code: ${item.itemCode}`}
                            {item.itemCode &&
                              (item.brand ||
                                item.model) &&
                              " | "}
                            {item.brand &&
                              `Brand: ${item.brand}`}
                            {item.brand &&
                              item.model &&
                              " | "}
                            {item.model &&
                              `Model: ${item.model}`}
                          </div>
                        )}

                      </td>

                      <td className="border px-3 py-3 text-center">
                        {quantity}
                      </td>

                      <td className="border px-3 py-3 text-right">
                        Rs.{" "}
                        {unitPrice.toFixed(
                          2
                        )}
                      </td>

                      <td className="border px-3 py-3 text-right font-semibold">
                        Rs.{" "}
                        {total.toFixed(
                          2
                        )}
                      </td>

                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="border px-3 py-6 text-center text-gray-500"
                >
                  No items found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

        {/* =================================================
            TOTALS
        ================================================= */}

        <div className="flex justify-end">

          <div className="w-full max-w-sm">

            <div className="flex justify-between py-2">
              <span>
                Subtotal
              </span>

              <span>
                Rs.{" "}
                {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span>
                Discount
              </span>

              <span>
                - Rs.{" "}
                {discount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-3 text-lg font-bold">
              <span>
                Grand Total
              </span>

              <span>
                Rs.{" "}
                {grandTotal.toFixed(
                  2
                )}
              </span>
            </div>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="border-t mt-10 pt-10">

          <div className="grid grid-cols-2 gap-16">

            <div className="text-center">
              <div className="border-t pt-2 text-sm">
                Customer Signature
              </div>
            </div>

            <div className="text-center">
              <div className="border-t pt-2 text-sm">
                Authorized Signatory
              </div>
            </div>

          </div>

          <p className="text-center text-xs text-gray-500 mt-8">
            Goods once sold will not be returned.
          </p>

        </div>

      </div>

    </div>
  );
}