"use client";

import type { ParsedInvoice } from "@/types";

interface Props { data: ParsedInvoice; }

export default function ResultTable({ data }: Props) {
  function exportCSV() {
    const rows: string[][] = [
      ["Field", "Value"],
      ["Vendor", data.vendorName ?? ""], ["Invoice #", data.invoiceNumber ?? ""],
      ["Invoice Date", data.invoiceDate ?? ""], ["Due Date", data.dueDate ?? ""],
      ["Currency", data.currency ?? ""], ["Subtotal", data.subtotal?.toString() ?? ""],
      ["Tax", data.tax?.toString() ?? ""], ["Total", data.total?.toString() ?? ""],
      ["Notes", data.notes ?? ""], [], ["Line Items"],
      ["Description", "Quantity", "Unit Price", "Total"],
      ...data.lineItems.map((li) => [li.description, li.quantity?.toString() ?? "", li.unitPrice?.toString() ?? "", li.total?.toString() ?? ""]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "invoice.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const summaryRows = [
    { label: "Vendor", value: data.vendorName },
    { label: "Invoice #", value: data.invoiceNumber },
    { label: "Date", value: data.invoiceDate },
    { label: "Due", value: data.dueDate },
    { label: "Currency", value: data.currency },
    { label: "Subtotal", value: fmt(data.subtotal, data.currency) },
    { label: "Tax", value: fmt(data.tax, data.currency) },
    { label: "Notes", value: data.notes },
  ].filter((r) => r.value != null && r.value !== "" && r.value !== "—");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text)", margin: 0 }}>Extracted Data</h2>
        <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, border: "1.5px solid var(--border)", background: "var(--surface)", fontWeight: 700, fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
          ↓ Export CSV
        </button>
      </div>

      {/* Summary rows */}
      <div style={{ borderRadius: 20, overflow: "hidden", border: "1.5px solid var(--border)" }}>
        {summaryRows.map(({ label, value }, i) => (
          <div key={label} style={{ display: "flex", gap: 12, padding: "12px 16px", fontSize: 14, background: i % 2 === 0 ? "var(--surface)" : "var(--bg)", borderBottom: i < summaryRows.length - 1 ? "1px solid var(--border)" : "none" }}>
            <span style={{ width: 88, flexShrink: 0, fontWeight: 600, color: "var(--muted)" }}>{label}</span>
            <span style={{ fontWeight: 600, color: "var(--text)", wordBreak: "break-all" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Line items */}
      {data.lineItems.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>Line Items</p>
          <div style={{ borderRadius: 20, overflow: "hidden", border: "1.5px solid var(--border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {["Description", "Qty", "Unit Price", "Total"].map((h, i) => (
                    <th key={h} style={{ padding: "10px 14px", fontWeight: 700, color: "var(--muted)", textAlign: i === 0 ? "left" : "right", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, i) => (
                  <tr key={i} style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 14px", color: "var(--text)", fontWeight: 500 }}>{item.description}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)" }}>{item.quantity ?? "—"}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--muted)" }}>{fmt(item.unitPrice, data.currency)}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>{fmt(item.total, data.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Total pill */}
      {data.total != null && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 999, background: "var(--text)" }}>
          <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Total</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{fmt(data.total, data.currency)}</span>
        </div>
      )}
    </div>
  );
}

function fmt(value: number | null | undefined, currency: string | null | undefined): string {
  if (value == null) return "—";
  const map: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$" };
  const symbol = currency ? (map[currency.toUpperCase()] ?? currency + " ") : "$";
  return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
