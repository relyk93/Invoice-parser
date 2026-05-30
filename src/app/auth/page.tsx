"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      setSignupDone(true); setLoading(false); return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }

    if (plan) {
      const res = await fetch(`/api/stripe/checkout?plan=${plan}`);
      if (res.redirected) { window.location.href = res.url; return; }
    }
    router.push("/dashboard");
  }

  if (signupDone) {
    return (
      <div style={{ background: "var(--surface)", borderRadius: 28, padding: "40px 32px", border: "1.5px solid var(--border)", boxShadow: "var(--card-shadow-lg)", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text)", marginBottom: 10 }}>Check your email</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
          We sent a confirmation link to <strong style={{ color: "var(--text)" }}>{email}</strong>. Click it to activate your account, then sign in.
        </p>
        <button onClick={() => { setSignupDone(false); setMode("signin"); }} style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
          Back to sign in →
        </button>
      </div>
    );
  }

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid var(--border)",
    background: "var(--bg)", fontSize: 14, fontWeight: 500, color: "var(--text)",
    outline: "none", display: "block",
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "var(--surface)", borderRadius: 28, padding: "36px 28px", border: "1.5px solid var(--border)", boxShadow: "var(--card-shadow-lg)", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 7 }}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 7 }}>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} style={inputStyle} />
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 14, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 999, background: "var(--text)", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: "0 4px 14px rgba(0,0,0,0.15)", marginTop: 4 }}>
        {loading ? "Loading…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>

      <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)", margin: 0 }}>
        {mode === "signin" ? "No account? " : "Already have one? "}
        <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }} style={{ fontWeight: 700, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
          {mode === "signin" ? "Sign up free" : "Sign in"}
        </button>
      </p>
    </form>
  );
}

export default function AuthPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 1.25rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.03em", color: "var(--text)", textDecoration: "none" }}>
            Invoice<span style={{ color: "var(--accent)" }}>AI</span>
          </Link>
          <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 14 }}>Sign in or create an account to continue</p>
        </div>
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
