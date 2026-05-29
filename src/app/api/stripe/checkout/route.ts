import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { routeHandlerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { PLANS } from "@/lib/plans";
import type { PlanId } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const supabase = routeHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  const planId = req.nextUrl.searchParams.get("plan") as PlanId | null;
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Get or create Stripe customer
  const { data: sub } = await db
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = sub?.stripe_customer_id as string | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await db.from("subscriptions").upsert(
      { user_id: user.id, stripe_customer_id: customerId, status: "inactive" },
      { onConflict: "user_id" }
    );
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    metadata: { userId: user.id, planId: plan.id },
  });

  return NextResponse.redirect(session.url!);
}
