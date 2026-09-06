import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Pricing tiers.
 * Set the corresponding env vars to your Stripe Price IDs.
 * Create products in Stripe Dashboard → Products, then copy the "Price ID" (price_xxx).
 */
const PLANS: Record<string, { priceId: string | undefined; amount: number; label: string }> = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER_ID,
    amount: 299,   // €2.99
    label: "Starter",
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO_ID,
    amount: 799,   // €7.99
    label: "Pro",
  },
  business: {
    priceId: process.env.STRIPE_PRICE_BUSINESS_ID,
    amount: 1999,  // €19.99
    label: "Business",
  },
};

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader)
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user)
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });

    let promotionCode: string | undefined;
    let plan = "starter"; // default to cheapest tier
    try {
      const body = await req.json();
      promotionCode = body?.promotion_code;
      if (body?.plan && PLANS[body.plan]) plan = body.plan;
    } catch {
      /* no body */
    }

    const selectedPlan = PLANS[plan];

    // Lazy Stripe init
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-08-26.dahlia" as any,
    });

    // Find or create Stripe customer, using stored customer ID if available
    let customerId: string | undefined;

    // Try to look up existing subscription record for stored customer ID
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id;
    } else {
      // Fall back to email lookup
      const list = await stripe.customers.list({ email: user.email, limit: 1 });
      if (list.data.length > 0) {
        customerId = list.data[0].id;
      } else {
        const created = await stripe.customers.create({
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          metadata: { supabase_user_id: user.id },
        });
        customerId = created.id;
      }
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://raxti.app";

    // Build line item: prefer stored Stripe Price ID, fall back to inline price_data
    const lineItem: any = selectedPlan.priceId
      ? {
          price: selectedPlan.priceId,
          quantity: 1,
        }
      : {
          price_data: {
            currency: "eur",
            product: "prod_SMo5hQsRTntScc", // legacy product ID
            unit_amount: selectedPlan.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        };

    const sessionOptions: any = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [lineItem],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro`,
      metadata: { user_id: user.id, plan },
    };

    if (promotionCode) {
      const promoCodes = await stripe.promotionCodes.list({
        code: promotionCode,
        active: true,
        limit: 1,
      });
      if (promoCodes.data.length > 0) {
        sessionOptions.discounts = [{ promotion_code: promoCodes.data[0].id }];
      }
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error in create-checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
