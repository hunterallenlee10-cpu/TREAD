# Thread T-Shirts

The online store for Thread T-Shirts — original premium everyday apparel. A
[Lee Enterprises Unlimited](https://leeenterprisesunlimited.com) venture.

> The site's own domain is not attached yet. Once it is, set
> `NEXT_PUBLIC_SITE_URL` to it (see below) and link it here.

One store page, one API route, one confirmation page. Customers fill a cart
and pay through Stripe Checkout; shipping is free.

The site was built as `/thread-t-shirts` inside the
[Lee Enterprises Unlimited repo](https://github.com/hunterallenlee10-cpu/leu)
and moved here on 2026-09-25 to run on its own. `docs/THREAD.md` is the build
spec: the settled decisions, the cart and checkout contract, and what has to
be confirmed before the "Coming soon" lines go on sale. Read it before changing
the catalog or checkout.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- [Stripe Checkout](https://docs.stripe.com/payments/checkout) (hosted) for payment
- Vercel Analytics (production only)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in a sk_test_ STRIPE_SECRET_KEY to test checkout
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Before pushing:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Where things live

| Path | What |
| --- | --- |
| `data/thread.ts` | Every word and product on the page: palette, catalog, prices, section copy, FAQ |
| `types/index.ts` | The shapes of the above |
| `components/thread/` | The sections, the product card and gallery, the cart, and `ThreadStyles` (every hover, focus, and pressed state) |
| `components/layout/` | Header and footer |
| `app/page.tsx` | The store page |
| `app/api/checkout/route.ts` | Starts a Stripe Checkout Session from the cart |
| `lib/checkout.ts` | Rebuilds every cart line, price included, from the catalog |
| `lib/stripe.ts` | The Stripe client and the `thread` metadata tag |
| `app/order/success/page.tsx` | The order confirmation Stripe returns customers to |
| `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx` | Favicon, home-screen icon, and link preview, generated at build time from the wordmark |
| `lib/site.ts` | The site's own URL and name. Nothing else hardcodes a domain |
| `public/thread/` | Product photos, placeholder art, and the wordmark |
| `docs/THREAD.md` | The build spec |

To add or change a product, edit its entry in `data/thread.ts` and put its
photos in `public/thread/`; no component needs to change. A product is for
sale once it has a `priceCents` and no `comingSoon` — the cart and checkout
both follow from that.

## Environment variables

See `.env.example` for the full list with notes. In short:

| Variable | Required | Purpose |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | To sell | The Lee Enterprises Unlimited Stripe account's secret key. `sk_test_` everywhere but Production |
| `NEXT_PUBLIC_SITE_URL` | Once the domain is attached | Canonical origin for metadata and structured data |

## Deploying

The site is a standard Next.js app and deploys to Vercel with no extra
configuration:

1. In Vercel, **Add New → Project** and import this repository. The defaults
   (framework: Next.js, build: `next build`) are correct.
2. Add `STRIPE_SECRET_KEY` as a sensitive environment variable: the LEU
   account's live key for Production, its test key for Preview. Checkout fails
   with `payments_not_configured` until it is set. See "Going live" in
   `docs/THREAD.md` for the Stripe dashboard settings to check first.
3. Deploy. The `*.vercel.app` URL works immediately; `lib/site.ts` picks it up
   from Vercel's own `VERCEL_PROJECT_PRODUCTION_URL`.
4. Open the project's **Analytics** tab and click **Enable** (Web Analytics).
   `<Analytics />` runs in production; until this is on,
   `/_vercel/insights/script.js` returns 404 and no pageviews are recorded.
5. Attach the custom domain, then set `NEXT_PUBLIC_SITE_URL` to it and
   redeploy, so canonical links and the structured data name the domain.
6. Point the Lee Enterprises Unlimited site at this one. Either attach
   `thread.leeenterprisesunlimited.com` to this project (the parent's default
   when nothing is set), or, in the **Lee Enterprises Unlimited** Vercel
   project, set `NEXT_PUBLIC_THREAD_SITE_URL` to this site's URL (no trailing
   slash, Production and Preview). That one value drives the parent's redirect
   from `leeenterprisesunlimited.com/thread-t-shirts`, its nav and footer
   links, and its portfolio and marketing links. Do this **before** the
   parent's change that removed the page is deployed, and confirm the URL
   answers first: the redirect becomes permanent (308) once the variable is
   set, and browsers cache a 308 indefinitely.

Every merge to `main` deploys once the project is connected.

## Relationship to the parent site

- `leeenterprisesunlimited.com/thread-t-shirts` redirects here.
- The parent still lists Thread as one of its ventures: its nav, footer,
  contact form, "own sites" portfolio, and marketing page link here.
- Payments go to the parent's Stripe account. Every Checkout Session and
  payment this site creates carries `metadata.site = "thread"`, and card
  statements read with a `THREAD` suffix, so Thread's sales can be filtered
  out of LEU's in the dashboard.
