/**
 * The one place the site knows its own address.
 *
 * Nothing else may hardcode a domain: `metadataBase` and the canonical URL read
 * `SITE_URL`, so attaching the custom domain is a matter of setting one
 * environment variable.
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_SITE_URL` — set this once the custom domain is attached, so
 *    canonical links name the domain rather than the *.vercel.app alias.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — provided by Vercel on every deployment,
 *    so a fresh import works with no configuration at all.
 * 3. localhost, for `next dev` and `next build` on a laptop.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Thread T-Shirts";

/** Verbatim from the page's metadata as it was on the parent site. */
export const SITE_TITLE = "Thread T-Shirts | Premium & Custom Apparel";

export const SITE_DESCRIPTION =
  "Premium everyday apparel and custom printed T-shirts, hoodies, and team gear for businesses, teams, schools, events, and fundraisers. Send an order request — no payment required.";

/** The parent company. The footer links back to it and to the policies it publishes. */
export const PARENT_SITE_URL = "https://leeenterprisesunlimited.com";
export const PARENT_NAME = "Lee Enterprises Unlimited";
