"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
  const [usage, setUsage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setEmail(user.email ?? null);

      const [historyRes, subRes] = await Promise.all([
        supabase
          .from("parse_results")
          .select("*")
          .order("parsed_at", { ascending: false })
          .limit(50),
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single(),
      ]);

      if (historyRes.data) {
        setHistory(
          historyRes.data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            userId: row.user_id as string,
            fileName: row.file_name as string,
            parsedAt: row.parsed_at as string,
            data: row.data as ParseResult["data"],
          }))
        );

        // Count this month's usage
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthCount = historyRes.data.filter(
          (r: Record<string, unknown>) => new Date(r.parsed_at as string) >= startOfMonth
        ).length;
        setUsage(monthCount);
      }

      if (subRes.data) {
        setSubscription({
          id: subRes.data.id,
          userId: subRes.data.user_id,
          stripeCustomerId: subRes.data.stripe_customer_id,
          stripeSubscriptionId: subRes.data.stripe_subscription_id,
          planId: subRes.data.plan_id,
          priceId: subRes.data.price_id,
          status: subRes.data.status,
          currentPeriodEnd: subRes.data.current_period_end,
          createdAt: subRes.data.created_at,
        });
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const plan = subscription ? PLANS.find((p) => p.id === subscription.planId) : null;
  const isActive = subscription?.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-bold text-lg tracking-tight">Invoice Parser AI</a>
        <div className="flex items-center gap-4 text-sm">
          {email && <span className="text-gray-500 hidden sm:block">{email}</span>}
          <a href="/" className="text-blue-600 hover:underline font-medium">Parse invoice</a>
          <button onClick={handleSignOut} className="text-gray-500 hover:text-gray-700">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Success banner */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-sm text-green-800 font-medium">
            Subscription activated! You're all set. Start parsing invoices below.
          </div>
        )}

        {/* Subscription card */}
        <div className="bg-white rounded-xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Subscription
            </p>
            {loading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : isActive && plan ? (
              <>
                <p className="font-semibold text-lg">
                  {plan.name} plan
                  <span className="ml-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {plan.documentsPerMonth === "unlimited"
                    ? "Unlimited documents per month"
                    : `${usage} / ${plan.documentsPerMonth} documents used this month`}
                  {subscription?.currentPeriodEnd && (
                    <> · Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                  )}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-700">No active subscription</p>
                <p className="text-sm text-gray-500 mt-1">Subscribe to start parsing invoices.</p>
              </>
            )}
          </div>

          {isActive ? (
            <a
              href="/api/stripe/portal"
              className="shrink-0 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
            >
              Manage billing
            </a>
          ) : (
            <a
              href="/#pricing"
              className="shrink-0 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
            >
              View plans
            </a>
          )}
        </div>

        {/* History + detail */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-60 shrink-0">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Parse history
            </h2>

            {loading && <p className="text-sm text-gray-400">Loading…</p>}
            {!loading && history.length === 0 && (
              <p className="text-sm text-gray-400">No parses yet.</p>
            )}

            <ul className="space-y-1">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setSelected(item)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      selected?.id === item.id
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <p className="truncate font-medium">{item.fileName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.parsedAt).toLocaleDateString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Detail */}
          <main className="flex-1 min-w-0">
            {selected ? (
              <div className="bg-white rounded-xl border p-6">
                <ResultTable data={selected.data} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 bg-white rounded-xl border">
                <p className="font-medium">Select a result from the left to view it</p>
                <a href="/" className="mt-3 text-sm text-blue-600 hover:underline font-medium">
                  Parse a new invoice →
                </a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
