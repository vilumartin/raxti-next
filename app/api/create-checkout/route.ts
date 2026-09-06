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

    let promotionCode: string | undefined;
    try {
      const body = await req.json();
      promotionCode = body?.promotion_code;
    } catch { /* no body */ }

    // Lazy Stripe init
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-08-26.dahlia" as any });

    // Find or create Stripe customer
    const customerList = await stripe.customers.list({ email: user.email });
    let customer = customerList.data[0];
    if (!customer) {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://raxti.app";

    const sessionOptions: any = {
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product: "prod_SMo5hQsRTntScc",
            unit_amount: 299,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/subscribe`,
      metadata: { user_id: user.id },
    };

    if (promotionCode) {
      const promoCodes = await stripe.promotionCodes.list({ code: promotionCode, active: true, limit: 1 });
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
