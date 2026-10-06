import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type Stripe from "stripe";

import {
  THREAD_CONTACT_EMAIL,
  THREAD_PALETTE,
  formatThreadCents,
} from "@/data/thread";
import { shopHref } from "@/data/navigation";
import {
  THREAD_STRIPE_METADATA,
  getStripe,
  isStripeConfigured,
} from "@/lib/stripe";
import { threadPrimaryButtonClass } from "@/components/thread/ThreadUI";
import { ThreadClearCartOnMount } from "@/components/thread/ThreadClearCartOnMount";

// One customer's order. Never indexed, never canonical, never previewed.
export const metadata: Metadata = {
  title: "Order confirmed | Thread T-Shirts",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: { url: null },
};

/**
 * Where Stripe sends the customer after paying.
 *
 * The session id in the URL is the only input, and the page trusts nothing
 * else: it reads the session back from Stripe and renders only one that this
 * site created (`metadata.site`) and that is actually paid. Anything else —
 * a made-up id, an unpaid session, a session from another LEU flow on the
 * shared account — is a 404, so the URL cannot be used to look at someone
 * else's purchase without already holding its id.
 */
async function loadPaidSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId) || !isStripeConfigured()) {
    return null;
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    const isThread = session.metadata?.site === THREAD_STRIPE_METADATA.site;
    const isPaid =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required";

    return isThread && isPaid ? session : null;
  } catch (error) {
    console.error(
      "[thread] Could not load a Checkout Session for the confirmation page.",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id: rawId } = await searchParams;
  const sessionId = typeof rawId === "string" ? rawId : "";

  const session = await loadPaidSession(sessionId);
  if (!session) notFound();

  const lines = session.line_items?.data ?? [];
  const email = session.customer_details?.email;
  const shipping = session.collected_information?.shipping_details;
  const address = shipping?.address;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen pt-20 focus:outline-none"
    >
      <ThreadClearCartOnMount />

      <div className="section-container py-20">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <CheckCircle2
              className="mx-auto mb-5 h-12 w-12"
              style={{ color: THREAD_PALETTE.champagne }}
              aria-hidden="true"
            />
            <h1 className="heading-lg mb-4" style={{ color: THREAD_PALETTE.bone }}>
              Thank you. Your order is in.
            </h1>
            <p
              className="text-lg leading-relaxed"
              style={{ color: THREAD_PALETTE.muted }}
            >
              {email
                ? `A receipt is on its way to ${email}.`
                : "A receipt is on its way to the email you entered at checkout."}{" "}
              Your order ships free.
            </p>
          </div>

          <div
            className="mt-12 rounded-lg border p-6"
            style={{
              borderColor: THREAD_PALETTE.border,
              backgroundColor: THREAD_PALETTE.charcoal,
            }}
          >
            <h2
              className="mb-4 text-xs font-semibold uppercase tracking-wider"
              style={{ color: THREAD_PALETTE.muted }}
            >
              Order summary
            </h2>

            <ul className="space-y-3">
              {lines.map((line) => (
                <li key={line.id} className="flex justify-between gap-4 text-sm">
                  <span style={{ color: THREAD_PALETTE.bone }}>
                    {line.quantity ?? 1} × {line.description}
                  </span>
                  <span
                    className="font-semibold tabular-nums"
                    style={{ color: THREAD_PALETTE.bone }}
                  >
                    {formatThreadCents(line.amount_total)}
                  </span>
                </li>
              ))}
            </ul>

            <dl
              className="mt-5 space-y-1.5 border-t pt-4 text-sm"
              style={{ borderColor: THREAD_PALETTE.border }}
            >
              <div className="flex justify-between">
                <dt style={{ color: THREAD_PALETTE.muted }}>Shipping</dt>
                <dd style={{ color: THREAD_PALETTE.bone }}>Free</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold" style={{ color: THREAD_PALETTE.bone }}>
                  Total paid
                </dt>
                <dd
                  className="font-semibold tabular-nums"
                  style={{ color: THREAD_PALETTE.bone }}
                >
                  {formatThreadCents(session.amount_total ?? 0)}
                </dd>
              </div>
            </dl>

            {address && (
              <div
                className="mt-5 border-t pt-4 text-sm"
                style={{ borderColor: THREAD_PALETTE.border }}
              >
                <h2
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: THREAD_PALETTE.muted }}
                >
                  Shipping to
                </h2>
                <address className="not-italic leading-relaxed" style={{ color: THREAD_PALETTE.bone }}>
                  {shipping?.name && <>{shipping.name}<br /></>}
                  {address.line1}
                  {address.line2 && <><br />{address.line2}</>}
                  <br />
                  {address.city}, {address.state} {address.postal_code}
                </address>
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link href={shopHref} className={threadPrimaryButtonClass}>
              Keep Shopping
            </Link>
            <p className="mt-6 text-sm" style={{ color: THREAD_PALETTE.muted }}>
              Questions about your order? Email{" "}
              <a
                href={`mailto:${THREAD_CONTACT_EMAIL}`}
                className="underline underline-offset-4"
                style={{ color: THREAD_PALETTE.champagne }}
              >
                {THREAD_CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
