import Stripe from "stripe";

/**
 * Constructed per request rather than at module scope: the constructor needs
 * the key, and `next build` runs on environments that don't expose
 * STRIPE_SECRET_KEY. Callers check `isStripeConfigured()` first so a missing
 * key reports as itself rather than as a failed Stripe call.
 *
 * The API version is left to the SDK's pinned default, so upgrading the
 * `stripe` package is the one place the version moves.
 */
export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/**
 * Tags every Checkout Session and PaymentIntent this site creates. Thread
 * shares the Lee Enterprises Unlimited Stripe account, so this is how its
 * payments are told apart in the dashboard — and how the confirmation page
 * refuses to render a session some other LEU flow created.
 */
export const THREAD_STRIPE_METADATA = { site: "thread" } as const;
