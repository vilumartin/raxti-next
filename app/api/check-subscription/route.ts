import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  return handler(req);
}
export async function POST(req: NextRequest) {
  return handler(req);
}

async function handler(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader) return NextResponse.json({ error: "Authorization header required" }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: "User not authenticated" }, { status: 401 });

    // Lazy Stripe init — only runs at request time, not build time
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-08-26.dahlia" as any });

    const { data: customers } = await stripe.customers.list({ email: user.email, limit: 1 });
    if (!customers || customers.length === 0) {
      return NextResponse.json({ subscribed: false, subscription_tier: null, subscription_end: null, cancel_at_period_end: false });
    }

    const customerId = customers[0].id;
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 });
    if (subscriptions.data.length === 0) {
      return NextResponse.json({ subscribed: false, subscription_tier: null, subscription_end: null, cancel_at_period_end: false });
    }

    const subscription = subscriptions.data[0];
    // In Stripe v22 (dahlia), current_period_end moved to SubscriptionItem
    const firstItem = subscription.items?.data?.[0] as any;
    const periodEnd = firstItem?.current_period_end ?? (subscription as any).current_period_end;
    const subscriptionEnd = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;

    let subscriptionTier = "Basic";
    if (subscription.items.data.length > 0) {
      const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
      const amount = (price as any).unit_amount || 0;
      if (amount >= 2000) subscriptionTier = "Enterprise";
      else if (amount >= 1000) subscriptionTier = "Premium";
      else subscriptionTier = "Basic";
    }

    return NextResponse.json({ subscribed: true, subscription_tier: subscriptionTier, subscription_end: subscriptionEnd, cancel_at_period_end: cancelAtPeriodEnd });
  } catch (error: any) {
    console.error("Error in check-subscription:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
