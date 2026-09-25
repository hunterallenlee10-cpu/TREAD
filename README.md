# Thread T-Shirts

The website for Thread T-Shirts — premium everyday apparel and custom printed
apparel for businesses, teams, schools, events, and fundraisers. A
[Lee Enterprises Unlimited](https://leeenterprisesunlimited.com) venture.

> The site's own domain is not attached yet. Once it is, set
> `NEXT_PUBLIC_SITE_URL` to it (see below) and link it here.

One page, one API route. The page shows the collection and takes order
requests; it does not take payment.

The site was built as `/thread-t-shirts` inside the
[Lee Enterprises Unlimited repo](https://github.com/hunterallenlee10-cpu/leu)
and moved here on 2026-09-25 to run on its own. `docs/THREAD.md` is the build
spec: the settled decisions, the cart and order-request contract, and what has
to be confirmed before placeholder products are advertised as real. Read it
before changing the catalog or the form.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- [Resend](https://resend.com) for the order request form
- Vercel Analytics (production only)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in RESEND_API_KEY to test the form
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
| `app/page.tsx` | The page |
| `app/api/thread-order/route.ts` | The order request handler |
| `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx` | Favicon, home-screen icon, and link preview, generated at build time from the wordmark |
| `lib/site.ts` | The site's own URL and name. Nothing else hardcodes a domain |
| `public/thread/` | Product photos, placeholder art, and the wordmark |
| `docs/THREAD.md` | The build spec |

To add or change a product, edit its entry in `data/thread.ts` and put its
photos in `public/thread/`; no component needs to change.

## Environment variables

See `.env.example` for the full list with notes. In short:

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | In production | Sends the order request form |
| `CONTACT_FROM_EMAIL` | No | Sender address. Defaults to `noreply@leeenterprisesunlimited.com`; set it to an address on a Resend-verified domain so delivery is not refused |
| `CONTACT_TO_EMAIL` | No | Recipient. Defaults to the Lee Enterprises inbox |
| `THREAD_TO_EMAIL` | No | Overrides the recipient for Thread requests only |
| `NEXT_PUBLIC_SITE_URL` | Once the domain is attached | Canonical origin for metadata and structured data |

## Deploying

The site is a standard Next.js app and deploys to Vercel with no extra
configuration:

1. In Vercel, **Add New → Project** and import this repository. The defaults
   (framework: Next.js, build: `next build`) are correct.
2. Add `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` as sensitive environment
   variables — the same values the Lee Enterprises Unlimited project uses. The
   form fails with `email_not_configured` until the key is set.
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
- Order requests deliver to the same inbox as the parent site's forms, with
  their own subject line. Set `THREAD_TO_EMAIL` to route them elsewhere.
- Invoicing, when a customer needs one, runs through the parent's Stripe
  integration, where Thread is the `thread` venture. This site takes no
  payment.
