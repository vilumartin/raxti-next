import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
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

    // Lazy Stripe init
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-08-26.dahlia" as any });

    const customerList = await stripe.customers.list({ email: user.email, limit: 1 });
    if (!customerList.data.length) {
      return NextResponse.json({ success: false, error: "No Stripe customer found" }, { status: 404 });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerList.data[0].id,
      status: "active",
      limit: 10,
    });
    if (!subscriptions.data.length) {
      return NextResponse.json({ success: false, error: "No active subscription found" }, { status: 404 });
    }

    const cancelled = await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    });

    // In Stripe v22 (dahlia), current_period_end moved to SubscriptionItem
    const firstItem = (cancelled.items?.data?.[0] as any);
    const periodEnd = firstItem?.current_period_end ?? (cancelled as any).current_period_end;

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription: {
        id: cancelled.id,
        status: cancelled.status,
        cancel_at_period_end: cancelled.cancel_at_period_end,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      },
    });
  } catch (error: any) {
    console.error("Error in cancel-subscription:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
