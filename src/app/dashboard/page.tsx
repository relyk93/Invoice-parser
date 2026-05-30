"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@/lib/plans";
import ResultTable from "@/components/ResultTable";
import type { ParseResult, Subscription } from "@/types";

function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const showSuccess = params.get("success") === "true";

  const [history, setHistory] = useState<ParseResult[]>([]);
  const [selected, setSelected] = useState<ParseResult | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const [histRes, subRes] = await Promise.all([
        supabase.from("parse_results").select("*").order("parsed_at", { ascending: false }).limit(50),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
      ]);

      if (histRes.data) {
        setHistory(histRes.data.map((row: Record<string, unknown>) => ({
          id: row.id as string, userId: row.user_id as string,
          fileName: row.file_name as string, parsedAt: row.parsed_at as string,
          data: row.data as ParseResult["data"],
        })));
        const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
        setUsage(histRes.data.filter((r: Record<string, unknown>) => new Date(r.parsed_at as string) >= start).length);
      }

      if (subRes.data) {
        setSubscription({
          id: subRes.data.id, userId: subRes.data.user_id,
          stripeCustomerId: subRes.data.stripe_customer_id,
          stripeSubscriptionId: subRes.data.stripe_subscription_id,
          planId: subRes.data.plan_id, priceId: subRes.data.price_id,
          status: subRes.data.status, currentPeriodEnd: subRes.data.current_period_end,
          createdAt: subRes.data.created_at,
        });
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const plan = subscription ? PLANS.find((p) => p.id === subscription.planId) : null;
  const isActive = subscription?.status === "active";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.85)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <a href="/" style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.03em", color: "var(--text)", textDecoration: "none" }}>
            Invoice<span style={{ color: "var(--accent)" }}>AI</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="/" style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", textDecoration: "none", padding: "7px 16px", borderRadius: 999, border: "1.5px solid var(--border)", background: "var(--surface)" }}>
              + Parse new
            </a>
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 1.25rem", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Success */}
        {showSuccess && (
          <div style={{ padding: "14px 20px", borderRadius: 16, background: "#f0fdf4", border: "1.5px solid #86efac", color: "#16a34a", fontSize: 14, fontWeight: 700 }}>
            ✓ Subscription activated — you&apos;re all set!
          </div>
        )}

        {/* Plan card */}
        <div style={{ background: "var(--surface)", borderRadius: 24, border: "1.5px solid var(--border)", boxShadow: "var(--card-shadow)", padding: "20px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Your Plan</p>
            {loading ? (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
            ) : isActive && plan ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "var(--text)" }}>{plan.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac" }}>Active</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  {plan.documentsPerMonth === "unlimited" ? "Unlimited documents" : `${usage} / ${plan.documentsPerMonth} docs this month`}
                  {subscription?.currentPeriodEnd && ` · Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                </p>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 700, color: "var(--text)", fontSize: "1.05rem" }}>No active plan</p>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>Subscribe to start parsing invoices</p>
              </>
            )}
          </div>
          {isActive ? (
            <a href="/api/stripe/portal" style={{ padding: "10px 20px", borderRadius: 999, border: "1.5px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--text)", textDecoration: "none", background: "var(--bg)" }}>
              Manage billing
            </a>
          ) : (
            <a href="/#pricing" style={{ padding: "10px 20px", borderRadius: 999, fontWeight: 700, fontSize: 13, color: "#fff", textDecoration: "none", background: "var(--text)" }}>
              View plans
            </a>
          )}
        </div>

        {/* Mobile history toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{ display: "none", width: "100%", padding: "12px", borderRadius: 999, border: "1.5px solid var(--border)", background: "var(--surface)", fontWeight: 700, fontSize: 14, color: "var(--text)", cursor: "pointer" }}
          className="mobile-history-btn"
        >
          {showHistory ? "Hide history" : `View history (${history.length})`}
        </button>

        <style>{`
          @media (max-width: 640px) {
            .mobile-history-btn { display: block !important; }
            .sidebar { display: none; }
            .sidebar.open { display: block !important; }
          }
        `}</style>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* Sidebar */}
          <aside className={`sidebar${showHistory ? " open" : ""}`} style={{ width: 220, flexShrink: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 12 }}>History</p>
            {loading && <p style={{ fontSize: 13, color: "var(--muted)" }}>Loading…</p>}
            {!loading && history.length === 0 && <p style={{ fontSize: 13, color: "var(--muted)" }}>No parses yet.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSelected(item); setShowHistory(false); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 16, cursor: "pointer",
                    background: selected?.id === item.id ? "var(--accent-light)" : "var(--surface)",
                    border: `1.5px solid ${selected?.id === item.id ? "var(--accent-mid)" : "var(--border)"}`,
                    boxShadow: selected?.id === item.id ? "none" : "var(--card-shadow)",
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: 13, color: selected?.id === item.id ? "var(--accent)" : "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.fileName}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: "3px 0 0" }}>
                    {new Date(item.parsedAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {selected ? (
              <div style={{ background: "var(--surface)", borderRadius: 24, border: "1.5px solid var(--border)", boxShadow: "var(--card-shadow)", padding: 24 }}>
                <ResultTable data={selected.data} />
              </div>
            ) : (
              <div style={{ background: "var(--surface)", borderRadius: 24, border: "1.5px solid var(--border)", boxShadow: "var(--card-shadow)", padding: 48, textAlign: "center" }}>
                <p style={{ fontWeight: 700, color: "var(--muted)", marginBottom: 12 }}>Select a result to view it</p>
                <a href="/" style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)", textDecoration: "none" }}>+ Parse a new invoice</a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense><Dashboard /></Suspense>;
}
