/**
 * ONE-TIME SETUP ENDPOINT — DELETE AFTER USE
 * Creates the 3 Raxti subscription products + prices in Stripe.
 * Protected by SETUP_TOKEN env var so only the holder can call it.
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Guard: only callable with the correct setup token
  const token = req.headers.get("x-setup-token");
  if (!token || token !== process.env.SETUP_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY not set" }, { status: 500 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-08-26.dahlia" as any,
  });

  const tiers = [
    { name: "Raxti Starter", amount: 299,  interval: "month", tier: "starter" },
    { name: "Raxti Pro",     amount: 799,  interval: "month", tier: "pro"     },
    { name: "Raxti Business",amount: 1999, interval: "month", tier: "business"},
  ] as const;

  const results: Record<string, { productId: string; priceId: string }> = {};

  for (const t of tiers) {
    const product = await stripe.products.create({
      name: t.name,
      metadata: { tier: t.tier },
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: "eur",
      unit_amount: t.amount,
      recurring: { interval: t.interval },
      metadata: { tier: t.tier },
    });

    results[t.tier] = { productId: product.id, priceId: price.id };
  }

  return NextResponse.json({
    message: "Products created. Copy the priceIds into your Vercel env vars, then delete this endpoint.",
    STRIPE_PRICE_STARTER_ID:  results.starter.priceId,
    STRIPE_PRICE_PRO_ID:      results.pro.priceId,
    STRIPE_PRICE_BUSINESS_ID: results.business.priceId,
    products: results,
  });
}
