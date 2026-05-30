"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UploadZone from "@/components/UploadZone";
import ResultTable from "@/components/ResultTable";
import { supabase } from "@/lib/supabase";
import type { ParsedInvoice } from "@/types";

export default function Home() {
  const router = useRouter();
  const [result, setResult] = useState<ParsedInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  async function handleFile(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { router.push("/auth"); return; }
        if (res.status === 402) { setError(data.error + " Upgrade your plan below."); return; }
        throw new Error(data.error ?? "Parse failed");
      }
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.85)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.03em", color: "var(--text)" }}>
            Invoice<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {userEmail ? (
              <>
                <Link href="/dashboard" style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", textDecoration: "none", padding: "7px 16px", borderRadius: 999, border: "1.5px solid var(--border)", background: "var(--surface)" }}>
                  Dashboard
                </Link>
                <button onClick={async () => { await supabase.auth.signOut(); setUserEmail(null); }} style={{ fontSize: 13, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/auth" style={{ fontWeight: 700, fontSize: 14, color: "#fff", textDecoration: "none", padding: "8px 20px", borderRadius: 999, background: "var(--text)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", padding: "72px 1.25rem 48px" }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 80, right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, background: "var(--accent-light)", border: "1px solid var(--accent-mid)", fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 28 }}>
            <span>⚡</span> Powered by Claude AI
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 20px", color: "var(--text)" }}>
            Extract invoice data<br />
            <span style={{ backgroundImage: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              in seconds.
            </span>
          </h1>

          <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)", color: "var(--muted)", marginBottom: 40, lineHeight: 1.6 }}>
            Drop any PDF or image invoice. Get vendor, line items, and totals — clean and structured, ready to export.
          </p>

          {/* Upload card */}
          <div style={{ background: "var(--surface)", borderRadius: 28, boxShadow: "var(--card-shadow-lg)", padding: "28px", border: "1px solid var(--border)" }}>
            <UploadZone onFile={handleFile} loading={loading} />
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 16, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 14, fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Result */}
      {result && (
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 1.25rem 48px" }}>
          <div style={{ background: "var(--surface)", borderRadius: 28, boxShadow: "var(--card-shadow)", border: "1px solid var(--border)", padding: 24 }}>
            <ResultTable data={result} />
          </div>
        </section>
      )}

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 1.25rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.35rem", fontWeight: 800, marginBottom: 32, letterSpacing: "-0.02em", color: "var(--text)" }}>
          Three steps, zero hassle
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { step: "01", title: "Upload", desc: "Drop a PDF or photo of any invoice, receipt, or bill" },
            { step: "02", title: "Extract", desc: "Claude AI reads every field in seconds — no templates" },
            { step: "03", title: "Export", desc: "Download CSV or copy straight into your spreadsheet" },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ background: "var(--surface)", borderRadius: 24, padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "var(--accent)", marginBottom: 10 }}>{step}</div>
              <p style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: 6, color: "var(--text)" }}>{title}</p>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "48px 1.25rem 80px" }} id="pricing">
        <h2 style={{ textAlign: "center", fontSize: "1.35rem", fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em", color: "var(--text)" }}>
          Simple pricing
        </h2>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginBottom: 36 }}>Cancel any time. No hidden fees.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {/* Starter */}
          <div style={{ background: "var(--surface)", borderRadius: 28, padding: "32px 28px", border: "1.5px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>Starter</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text)" }}>$12</span>
              <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>/month</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>50 documents per month</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              {["PDF + image support", "CSV export", "Parse history"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text)", fontWeight: 500 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--accent)", fontWeight: 800, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth?plan=starter" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 999, border: "1.5px solid var(--border)", fontWeight: 700, fontSize: 14, color: "var(--text)", textDecoration: "none", background: "var(--bg)" }}>
              Get started
            </Link>
          </div>

          {/* Pro */}
          <div style={{ background: "var(--text)", borderRadius: 28, padding: "32px 28px", border: "1.5px solid var(--text)", boxShadow: "0 8px 40px rgba(15,23,42,0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)" }} />
            <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 999, background: "rgba(37,99,235,0.3)", fontSize: 11, fontWeight: 800, color: "#93c5fd", letterSpacing: "0.05em", marginBottom: 12, position: "relative" }}>
              MOST POPULAR
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Pro</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4, position: "relative" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>$29</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>/month</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24, position: "relative" }}>Unlimited documents</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
              {["PDF + image support", "CSV export", "Parse history", "Priority support"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#93c5fd", fontWeight: 800, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth?plan=pro" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 999, fontWeight: 800, fontSize: 14, color: "var(--text)", textDecoration: "none", background: "#fff", boxShadow: "var(--btn-shadow)", position: "relative" }}>
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 1.25rem", textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
        © 2025 InvoiceAI — Powered by Claude AI
      </footer>
    </div>
  );
}
