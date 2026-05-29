import { supabaseAdmin } from "./supabase";
import { PLANS } from "./plans";

export async function canParse(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const db = supabaseAdmin();

  const { data: sub } = await db
    .from("subscriptions")
    .select("plan_id, status")
    .eq("user_id", userId)
    .single();

  if (!sub || sub.status !== "active") {
    return { allowed: false, reason: "An active subscription is required to parse invoices." };
  }

  const plan = PLANS.find((p) => p.id === sub.plan_id);
  if (!plan) {
    return { allowed: false, reason: "Unknown plan. Please contact support." };
  }

  if (plan.documentsPerMonth === "unlimited") {
    return { allowed: true };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await db
    .from("parse_results")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("parsed_at", startOfMonth.toISOString());

  if ((count ?? 0) >= plan.documentsPerMonth) {
    return {
      allowed: false,
      reason: `You've used all ${plan.documentsPerMonth} documents this month. Upgrade to Pro for unlimited.`,
    };
  }

  return { allowed: true };
}

export async function getMonthlyUsage(userId: string): Promise<number> {
  const db = supabaseAdmin();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await db
    .from("parse_results")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("parsed_at", startOfMonth.toISOString());

  return count ?? 0;
}
