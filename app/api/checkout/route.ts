import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { resolveCheckoutLines } from "@/lib/checkout";
import { SITE_URL } from "@/lib/site";
import {
  THREAD_STRIPE_METADATA,
  getStripe,
  isStripeConfigured,
} from "@/lib/stripe";

/**
 * Starts a Stripe-hosted Checkout and hands back its URL.
 *
 * The browser posts ids and quantities only; `resolveCheckoutLines` rebuilds
 * every line — name, price, image — from data/thread.ts. The customer then
 * leaves this site for checkout.stripe.com, which collects the card, the
 * shipping address, and the phone number, and sends the receipt. Nothing
 * Stripe-hosted loads on this site's pages, which is why the Content Security
 * Policy in next.config.mjs needs no Stripe origins.
 */
export async function POST(request: NextRequest) {
  let body: { items?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "bad_request" }, { status: 400 });
  }

  const resolution = resolveCheckoutLines(body?.items, SITE_URL);
  if (!resolution.ok) {
    return NextResponse.json(
      { code: resolution.code, invalidIndexes: resolution.invalidIndexes },
      { status: 400 }
    );
  }

  // Checked after validation so a malformed cart is reported as itself even on
  // a deployment with no key.
  if (!isStripeConfigured()) {
    console.error(
      "[thread] STRIPE_SECRET_KEY is not set - checkout cannot start."
    );
    return NextResponse.json(
      { code: "payments_not_configured" },
      { status: 500 }
    );
  }

  // The origin the customer is actually on, not SITE_URL: a preview deployment
  // runs on test keys, and returning its customers to production would send
  // them to a confirmation page that cannot see their session.
  const origin = request.nextUrl.origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: resolution.lineItems,
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: "Free shipping",
            fixed_amount: { amount: 0, currency: "usd" },
          },
        },
      ],
      phone_number_collection: { enabled: true },
      metadata: { ...THREAD_STRIPE_METADATA },
      payment_intent_data: {
        metadata: { ...THREAD_STRIPE_METADATA },
        // Appended to the shared LEU account's statement descriptor, so the
        // charge on a customer's card names the shirt brand they bought from.
        statement_descriptor_suffix: "THREAD",
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#catalog`,
    });

    if (!session.url) {
      console.error("[thread] Stripe returned a Checkout Session with no URL.");
      return NextResponse.json({ code: "checkout_failed" }, { status: 502 });
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    // Logged field by field: the error object itself prints as a wall of
    // request internals on Vercel and buries the reason.
    if (error instanceof Stripe.errors.StripeError) {
      console.error(
        "[thread] Stripe refused the Checkout Session.",
        `type=${error.type}`,
        `code=${error.code ?? "none"}`,
        `message=${error.message}`
      );
    } else {
      console.error("[thread] Checkout error:", error);
    }
    return NextResponse.json({ code: "checkout_failed" }, { status: 502 });
  }
}
