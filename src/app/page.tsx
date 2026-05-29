"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleFile(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth");
          return;
        }
        if (res.status === 402) {
          setError(data.error + " Upgrade your plan below.");
          return;
        }
        throw new Error(data.error ?? "Parse failed");
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserEmail(null);
  }

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">Invoice Parser AI</span>
        <div className="flex items-center gap-4 text-sm">
          {userEmail ? (
            <>
              <a href="/dashboard" className="text-blue-600 hover:underline font-medium">
                Dashboard →
              </a>
              <button onClick={handleSignOut} className="text-gray-500 hover:text-gray-700">
                Sign out
              </button>
            </>
          ) : (
            <a href="/auth" className="text-blue-600 hover:underline font-medium">
              Sign in
            </a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Extract data from any invoice — instantly
        </h1>
        <p className="text-gray-500 text-lg mb-10">
          Upload a PDF or image. Get vendor, line items, totals, and more as
          clean structured data in seconds.
        </p>

        <UploadZone onFile={handleFile} loading={loading} />

        {error && (
          <p className="mt-6 text-red-600 text-sm font-medium">{error}</p>
        )}

        {result && (
          <div className="mt-10 text-left">
            <ResultTable data={result} />
          </div>
        )}
      </section>

      {/* Pricing */}
      <section className="bg-white border-t py-16 px-6" id="pricing">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Simple pricing</h2>
          <p className="text-gray-500 mb-10">Cancel any time. No hidden fees.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Starter */}
            <div className="border rounded-2xl p-8 text-left">
              <p className="font-semibold text-lg">Starter</p>
              <p className="text-4xl font-bold mt-2">
                $12<span className="text-base font-normal text-gray-400">/mo</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li>✓ 50 documents / month</li>
                <li>✓ PDF + image support</li>
                <li>✓ CSV export</li>
                <li>✓ Parse history</li>
              </ul>
              <a
                href="/auth?plan=starter"
                className="mt-8 block w-full rounded-xl bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition text-center"
              >
                Get started
              </a>
            </div>
            {/* Pro */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 text-left relative">
              <span className="absolute top-4 right-4 text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                Most popular
              </span>
              <p className="font-semibold text-lg">Pro</p>
              <p className="text-4xl font-bold mt-2">
                $29<span className="text-base font-normal text-gray-400">/mo</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li>✓ Unlimited documents</li>
                <li>✓ PDF + image support</li>
                <li>✓ CSV export</li>
                <li>✓ Parse history</li>
                <li>✓ Priority support</li>
              </ul>
              <a
                href="/auth?plan=pro"
                className="mt-8 block w-full rounded-xl bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition text-center"
              >
                Get started
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
