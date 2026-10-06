/**
 * Security headers for a site with no third-party embeds.
 *
 * Nothing here loads from another origin: next/font self-hosts Geist, Vercel
 * Analytics is served from /_vercel on the same origin, every product photo is
 * a file in /public/thread, and the cart posts to /api/checkout on this site.
 *
 * Checkout needs nothing added here. The cart fetches /api/checkout (same
 * origin), then sends the whole tab to checkout.stripe.com with
 * `location.assign` — a top-level navigation, which this policy does not
 * govern. No Stripe script, frame, or form post ever runs on these pages. Moving
 * to embedded Checkout or Stripe Elements would change that: js.stripe.com in
 * `script-src` and `frame-src`, and api.stripe.com in `connect-src`, first. So the policy is 'self' everywhere, plus the two allowances Next.js
 * itself needs: 'unsafe-inline' in script-src for the hydration bootstrap, and
 * in style-src for the inline style attributes the components use to carry the
 * palette (and for the `<style>` blocks ThreadStyles and ThreadHeroBackdrop
 * render). To drop the script-src allowance, generate a per-request nonce in
 * middleware and emit the CSP from there.
 *
 * `img-src` is the reason product photos cannot be hotlinked from a supplier or
 * a stock site: a Shopify, Printful, or Unsplash URL is blocked. Real photos go
 * in /public/thread/. If a third-party script or frame is ever added (an
 * embedded payment form, a chat widget), it needs its origin listed here first
 * or it will be blocked silently.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Carried over from the parent site as-is. `next/image` passes the files
    // through untouched, which is what lets the SVG placeholders work; turning
    // this off is a deliberate change, not a cleanup.
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // The page lived at leeenterprisesunlimited.com/thread-t-shirts before it
      // had its own site. The parent site redirects that path here; this
      // catches anyone who kept the old path but swapped in the new host. The
      // `#catalog` fragment survives the redirect in the browser. An old
      // `#order-request` link lands at the top of the page, since the order
      // request form is gone.
      {
        source: "/thread-t-shirts",
        destination: "/",
        permanent: true,
      },
      {
        source: "/thread-t-shirts/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
