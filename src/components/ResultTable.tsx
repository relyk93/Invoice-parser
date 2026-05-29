"use client";

import type { ParsedInvoice } from "@/types";

interface Props {
  data: ParsedInvoice;
}

export default function ResultTable({ data }: Props) {
  function exportCSV() {
    const rows: string[][] = [
      ["Field", "Value"],
      ["Vendor", data.vendorName ?? ""],
      ["Invoice #", data.invoiceNumber ?? ""],
      ["Invoice Date", data.invoiceDate ?? ""],
      ["Due Date", data.dueDate ?? ""],
      ["Currency", data.currency ?? ""],
      ["Subtotal", data.subtotal?.toString() ?? ""],
      ["Tax", data.tax?.toString() ?? ""],
      ["Total", data.total?.toString() ?? ""],
      ["Notes", data.notes ?? ""],
      [],
      ["Line Items"],
      ["Description", "Quantity", "Unit Price", "Total"],
      ...data.lineItems.map((li) => [
        li.description,
        li.quantity?.toString() ?? "",
        li.unitPrice?.toString() ?? "",
        li.total?.toString() ?? "",
      ]),
    ];

    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const summaryRows = [
    { label: "Vendor", value: data.vendorName },
    { label: "Invoice #", value: data.invoiceNumber },
    { label: "Invoice Date", value: data.invoiceDate },
    { label: "Due Date", value: data.dueDate },
    { label: "Currency", value: data.currency },
    { label: "Subtotal", value: fmt(data.subtotal, data.currency) },
    { label: "Tax", value: fmt(data.tax, data.currency) },
    { label: "Total", value: fmt(data.total, data.currency) },
    { label: "Notes", value: data.notes },
  ].filter((r) => r.value != null && r.value !== "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Extracted Data</h2>
        <button
          onClick={exportCSV}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
        >
          Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {summaryRows.map(({ label, value }) => (
              <tr key={label} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium text-gray-500 w-36 bg-gray-50">{label}</td>
                <td className="px-4 py-3 text-gray-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Line items */}
      {data.lineItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Line Items</h3>
          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Description</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Qty</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Unit Price</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-3 text-gray-900">{item.description}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.quantity ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {fmt(item.unitPrice, data.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {fmt(item.total, data.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function fmt(value: number | null | undefined, currency: string | null | undefined): string {
  if (value == null) return "—";
  const symbol = currencySymbol(currency);
  return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function currencySymbol(currency: string | null | undefined): string {
  const map: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$" };
  return currency ? (map[currency.toUpperCase()] ?? currency + " ") : "$";
}
