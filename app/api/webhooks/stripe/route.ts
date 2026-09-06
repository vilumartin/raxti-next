import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Required env vars:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET   ← add in Stripe Dashboard → Webhooks → endpoint secret
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  ← needed to write to subscriptions table server-side

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
  }

  // Lazy Stripe init
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-08-26.dahlia" as any,
  });

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.mode !== "subscription") break;

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const clientEmail = session.customer_details?.email || session.customer_email;

        // Retrieve the full subscription object
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = (subscription as any).current_period_end;

        // Find the Supabase user by email
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const matchedUser = authUsers?.users?.find(
          (u) => u.email?.toLowerCase() === clientEmail?.toLowerCase()
        );

        if (!matchedUser) {
          console.error("No Supabase user found for email:", clientEmail);
          break;
        }

        await supabase.from("subscriptions").upsert(
          {
            user_id: matchedUser.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
          },
          { onConflict: "user_id" }
        );

        console.log("checkout.session.completed: upserted subscription for", matchedUser.id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const periodEnd = subscription.current_period_end;

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        console.log("customer.subscription.updated:", subscription.id, "→", subscription.status);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        await supabase
          .from("subscriptions")
          .update({ status: "canceled", cancel_at_period_end: false })
          .eq("stripe_subscription_id", subscription.id);

        console.log("customer.subscription.deleted:", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);
          console.log("invoice.payment_failed: marked past_due for", subscriptionId);
        }
        break;
      }

      default:
        console.log("Unhandled webhook event type:", event.type);
    }
  } catch (err: any) {
    console.error("Error processing webhook event:", err.message);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
