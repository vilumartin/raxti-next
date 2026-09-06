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

    const customerList = await stripe.customers.list({ email: user.email });
    if (!customerList.data.length) {
      return NextResponse.json({ error: "No Stripe customer found for this user" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://raxti.app";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerList.data[0].id,
      return_url: `${origin}/profile`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Error in customer-portal:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
