# Thread T-Shirts — Build Spec

Execution plan and settled decisions for the Thread T-Shirts site. Every
decision below is settled — this document exists so a build session writes
components instead of re-deriving choices.

The page was built as `/thread-t-shirts` inside the Lee Enterprises Unlimited
repo and moved here on 2026-09-25, as the homepage of its own repo and site.
§11 records what changed in the move. On 2026-10-06 it became a store: the
custom printing service came off the site and Stripe Checkout went in — §12
records that change. Every path below is relative to this repo.

**Status:** built. The store passes a production build; what remains is
Stripe dashboard setup and business confirmation, not code — see §10.

| Done | File |
| --- | --- |
| ✅ | `data/thread.ts` — palette, catalog, all page copy, cart limits |
| ✅ | `types/index.ts` — the Thread interfaces |
| ✅ | `public/thread/*` — product photos, SVG placeholders, and the wordmark |
| ✅ | `components/thread/`, `app/page.tsx` (§3, §4) |
| ✅ | Checkout: `lib/checkout.ts`, `lib/stripe.ts`, `app/api/checkout/route.ts`, `app/order/success/page.tsx` (§6) |
| ✅ | Wiring on the parent site (§7) |

---

## 1. Settled decisions

| | |
| --- | --- |
| Route | `/`, on its own site. `leeenterprisesunlimited.com/thread-t-shirts` redirects here |
| What it sells | **Thread's own products only.** No custom printing, group orders, or quotes |
| Launch state | **Selling.** The Signature Tees are for sale; the other categories are "Coming soon" |
| Prices | Per product, in cents. `priceCents: null` renders "Price coming soon" and cannot be bought |
| Checkout | **Stripe Checkout, hosted.** The customer pays on checkout.stripe.com |
| Stripe account | The **Lee Enterprises Unlimited** account. Every session and payment is tagged `metadata.site = "thread"` |
| Shipping | **Free**, US addresses only |
| Tax | Not collected (Stripe Tax is off) |
| Product photos | Real photos for the tees; generated SVG placeholders elsewhere, swappable per product |
| Sizes | S, M, L, XL, 2XL, 3XL (4XL is a per-product opt-in) |
| Cart limits | 1–50 per line, 100 lines (`THREAD_MAX_QUANTITY`, `THREAD_MAX_LINES`) |
| Order records | The Stripe dashboard. There is no database and no webhook |
| Contact | `ceo@leeenterprisesunlimited.com` |

### Why hosted Checkout and no webhook

Hosted Checkout keeps every card field off this site: the cart posts ids to
`/api/checkout`, the route creates a session, and the browser navigates to
Stripe. Stripe collects the card, the shipping address, and the phone number,
offers Apple Pay and Google Pay where the device supports them, and emails the
receipt. Nothing from Stripe loads on these pages, so the Content Security
Policy stays `'self'`-only (§8).

There is no webhook in v1. Orders are fulfilled by hand from the Stripe
dashboard, where each line item's name carries its color and size, and the
parent's Stripe notes warn against automated fulfillment until webhook
idempotency is persisted somewhere. A packing-slip email on
`checkout.session.completed` is the natural next step; it needs a webhook
secret, signature verification on the raw body, and a filter on
`metadata.site === "thread"`, since the account is shared.

---

## 2. Brand

`VENTURE_COLORS.thread` in the parent repo's `lib/colors.ts` is byte-identical
to the LEU gold, which leaves Thread with no identity of its own. It still
belongs to Thread's venture record on the parent site and is not in this repo;
leave it alone from here.

`THREAD_PALETTE` from `data/thread.ts` is the palette for everything on this
site:

| Token | Hex | Use |
| --- | --- | --- |
| `bone` | `#EDE7DA` | Primary buttons, headline accents. Always with `ink` text |
| `champagne` | `#C2A878` | Category labels, hovers, hairlines, icon strokes, focus rings |
| `ink` | `#0B0B0B` | Deepest background, and text on bone buttons |
| `charcoal` | `#141414` | Cards, alternating section backgrounds |
| `border` | `#2A2724` | Warm-tinted borders, distinct from `neutral-800` |
| `muted` | `#8A8378` | Secondary body copy |

Bone-on-near-black is the standard premium apparel signature, and champagne
keeps Thread visibly related to the LEU gold without repeating it.

**Applying it:** inline `style={{ }}` for brand colours, Tailwind `neutral-*`
utilities for structure, and `ThreadStyles` for anything with a state (hover,
active, focus-visible, disabled, pressed). `ThreadStyles` interpolates every
value from `THREAD_PALETTE`; `app/globals.css` reads the three colours it needs
(`ink`, `border`, `champagne`) as `--thread-*` custom properties that
`app/layout.tsx` sets on `<html>`, with literal fallbacks that match the
palette. A palette edit that changes one of those three wants its fallback in
`globals.css` changed too; nothing else holds a hex of its own.

Thread's buttons are the `threadPrimaryButtonClass` / `threadSecondaryButtonClass`
recipes in `ThreadUI.tsx`, styled by `ThreadStyles`:

```tsx
<a href="#catalog" className={threadPrimaryButtonClass}>…</a>
<Link href="/" className={threadSecondaryButtonClass}>…</Link>
```

Stripe's hosted Checkout page shows the LEU account's name, logo, and brand
colour (Stripe **Settings → Branding**), not Thread's. Those settings are
account-wide, so changing them changes LEU's own checkout pages too.

Shared utilities in `app/globals.css`, verbatim from the parent: `.section-container`,
`.section-padding`, `.heading-xl`, `.heading-lg`, `.heading-md`.

---

## 3. Page composition

`app/page.tsx` — a server component wrapping everything in the client cart and
catalog-filter providers. Metadata lives in `app/layout.tsx`.

| # | Section | Content source |
| --- | --- | --- |
| 1 | Hero | `threadCopy.hero` — statement headline, one CTA → `#catalog`, "From $…" line read off the catalog, a strip of product names |
| 2 | Brand story | `threadCopy.story` — one statement and a link to the collection |
| 3 | Quality | `threadQualityPillars` (3) |
| 4 | Catalog | `threadProducts` + category filter. `id="catalog"` |
| 5 | FAQ | `threadFaqs`, accordion. `id="faq"` |
| 6 | Closing CTA | → `#catalog` |

Plus `ThreadCartDrawer`, fixed-position, rendered once at page level. It is
where checkout starts.

`ThreadFeaturedSection` and `ThreadCategoriesSection` are built — featured
products, and category cards that filter the catalog and scroll to it — but
the page does not render them. Adding either back is one line in
`app/page.tsx`.

`app/order/success/page.tsx` is the one other page: the order confirmation
Stripe returns the customer to (§6).

Shell: `app/layout.tsx` renders `ThreadStyles`, a skip link, `SiteHeader`, the
route, and `SiteFooter`. Each page's `<main id="main-content" className="pt-20">`
clears the fixed 80px header and is the skip link's target.

---

## 4. Files

```
app/page.tsx
app/api/checkout/route.ts
app/order/success/page.tsx
lib/checkout.ts
lib/stripe.ts
components/thread/ThreadCartProvider.tsx          "use client"
components/thread/ThreadCatalogFilterProvider.tsx "use client"
components/thread/ThreadCartDrawer.tsx            "use client"
components/thread/ThreadClearCartOnMount.tsx      "use client"
components/thread/ThreadProductCard.tsx           "use client"
components/thread/ThreadProductGallery.tsx        "use client"
components/thread/ThreadCatalogSection.tsx        "use client"
components/thread/ThreadCategoriesSection.tsx     "use client"
components/thread/ThreadFeaturedSection.tsx       "use client"
components/thread/ThreadFAQSection.tsx            "use client"
components/thread/ThreadUI.tsx
components/thread/ThreadStyles.tsx
components/thread/ThreadHeroSection.tsx
components/thread/ThreadHeroBackdrop.tsx
components/thread/ThreadBrandStorySection.tsx
components/thread/ThreadQualitySection.tsx
components/thread/ThreadCTASection.tsx
```

`ThreadUI.tsx` holds the shared button, heading, and section shells so the
sections don't each re-declare the palette recipe.
`ThreadCatalogFilterProvider.tsx` shares the active category between the
categories section and the catalog grid, which are siblings — clicking a
category card filters the grid and scrolls to it. `ThreadProductGallery.tsx` is
the card's photo panel: a product carrying an `imageBack` gets both sides as
views the reader can swipe, tap, or step through with an arrow or a dot, and a
mouse still peeks at the second one on hover. A product with one photo renders
with no controls at all. Which side is which comes from the product's
`imageSide`, not from photo order — one listing leads with its back.

---

## 5. Cart contract

`ThreadCartProvider` — React context, no new dependencies.

```ts
interface ThreadCartContext {
  items: ThreadCartItem[];          // types/index.ts
  addItem(item: Omit<ThreadCartItem, "key">): void;
  updateQuantity(key: string, quantity: number): void;
  removeItem(key: string): void;
  clear(): void;
  totalPieces: number;
  subtotalCents: number;            // display only
  isOpen: boolean;
  setOpen(open: boolean): void;
  hydrated: boolean;
}
```

- **Variant identity** is `` `${productId}:${colorId}:${sizeId}` ``. Adding an
  existing variant increments quantity rather than appending a row.
- **Lines carry no price.** `subtotalCents` looks every price up in
  `data/thread.ts` on each render, so it always matches the catalog — and it
  is still only a display. The checkout route prices the order itself.
- **What can be added** is decided by `isThreadPurchasable` in
  `data/thread.ts`: a `priceCents` and no `comingSoon`. The product card
  renders anything else as a "Coming soon" card with no cart button, and only
  adds a line with a real color and size.
- **Persistence:** `localStorage`, key `thread-cart-v2`. Read inside
  `useEffect`, never during render — reading during render desyncs SSR and
  client HTML and throws a hydration error. On load, lines whose product is no
  longer for sale, or whose color or size it no longer runs, are dropped so
  they cannot fail at checkout. v1 (`thread-order-request-v1`) held order
  requests and is ignored.
- **Quantity bounds:** 1–`THREAD_MAX_QUANTITY` (50) per line and
  `THREAD_MAX_LINES` (100) lines, clamped in the provider. The route enforces
  the same constants. 100 is Stripe's line-item cap for a Checkout Session.
- **Cleared after payment** by `ThreadClearCartOnMount` on the confirmation
  page, and only there — a customer who backs out of Stripe keeps their cart.

---

## 6. Checkout

### `POST /api/checkout`

**Request:** `{ items: { productId, colorId, sizeId, quantity }[] }`. Any other
field — a price, a name, a label — is ignored.

**The rule:** prices resolve on the server. `resolveCheckoutLines` in
`lib/checkout.ts` rebuilds every line from `data/thread.ts`: the product must
exist and pass `isThreadPurchasable`, the color and size must be ones the
product lists, and the quantity must be a whole number in bounds. Duplicate
variants are merged, and the merged quantity is bounded too. One bad line
rejects the whole cart — the browser validates the same things, so a bad line
means a stale or edited cart, and charging for part of it would surprise the
customer either way.

Each line becomes a `price_data` line item: `unit_amount` from `priceCents`,
`name` as `"Product — Color / Size"` (what the dashboard and receipt show),
the product photo when the site is on https, and `{ productId, colorId,
sizeId }` as product metadata.

**The session:** `mode: "payment"`, US shipping address collection, one free
shipping rate, phone number collection, `metadata.site = "thread"` on the
session and the PaymentIntent, and statement descriptor suffix `THREAD`.
`success_url` is `/order/success?session_id={CHECKOUT_SESSION_ID}` and
`cancel_url` is `/#catalog`, both on the origin the request came in on — so a
preview deployment on test keys returns to itself, not to production.

**Responses:**

| Status | Body | When |
| --- | --- | --- |
| 200 | `{ url }` | The browser goes there with `location.assign` |
| 400 | `{ code: "bad_request" }` | Body is not JSON |
| 400 | `{ code: "empty_cart" \| "too_many_lines" }` | |
| 400 | `{ code: "invalid_item", invalidIndexes }` | A line failed validation |
| 500 | `{ code: "payments_not_configured" }` | `STRIPE_SECRET_KEY` unset. Checked after validation |
| 502 | `{ code: "checkout_failed" }` | Stripe refused or failed. Logged as `type`, `code`, `message` |

### `/order/success`

A server page that reads the session back from Stripe with its line items. It
renders only a session that carries `metadata.site = "thread"` and is paid;
anything else — a made-up id, an unpaid session, another LEU flow's session —
is a 404. It shows the items, the total paid, the shipping address, and the
receipt email, and clears the saved cart. `noindex`, no canonical.

---

## 7. Wiring on the parent site

Everything that reaches this site from `leeenterprisesunlimited.com` lives in
the Lee Enterprises Unlimited repo, and all of it resolves to one value: that
deployment's `NEXT_PUBLIC_THREAD_SITE_URL` environment variable
(`config/thread-site.mjs` and `lib/thread-site.ts` there). Set it to this
site's origin and everything below follows.

1. `next.config.mjs` redirects `/thread-t-shirts`, anything under it, and the
   old `/thread/*` image paths here. The redirect is temporary (307) until the
   variable is set and permanent (308) after, so nothing caches a redirect to a
   host that may not be final.
2. `data/navigation.ts` — Thread's top-level nav entry and its row in the
   footer's "Our Ventures" list link to this site. `MainHeader` treats an
   absolute URL as a full navigation rather than a scroll target.
3. `data/websites.ts` — Thread stays in the portfolio of LEU's own sites on the
   LMM websites page, linked at this address.
4. `MarketingTraditionalSection` — the "Branded Apparel & Team Gear" card on
   the LMM marketing page links here.

Unset, the variable falls back to `https://thread.leeenterprisesunlimited.com`,
a subdomain of LEU's own domain. That is deliberate: Vercel's default alias for
a project named `thread` or `tread` is almost certainly someone else's site, and
a guess there would send LEU's visitors to it. A wrong guess on LEU's own
domain can only fail to resolve. So either attach that subdomain to this
project, or set the variable to wherever this site lives — and do one of them
before the parent's branch that removed the page is deployed.

The parent keeps its own copy of `public/logos/thread-logo.png` because its
`data/ventures.ts` still names it. This repo carries the logo and every photo
for its own use.

---

## 8. Constraints

- **No external image hosts.** The CSP is `img-src 'self' data: blob:`
  (`next.config.mjs`). A Shopify/Printful/Unsplash URL will be blocked. Real
  photos go in `/public/thread/`.
- **No Stripe origins in the CSP, on purpose.** Hosted Checkout is a top-level
  navigation, which the policy does not govern. Embedded Checkout or Stripe
  Elements would need `js.stripe.com` in `script-src` and `frame-src` and
  `api.stripe.com` in `connect-src` first.
- **`images: { unoptimized: true }`** — `next/image` passes files through. SVG
  placeholders work as-is.
- **No database.** Orders live in Stripe. There is no order history or status
  page on this site; never promise "track your order" here.
- **Type errors fail the build here.** Still run `pnpm typecheck` and
  `pnpm lint` before pushing.
- **Honest copy.** No delivery-time promise until one is decided, no claim
  about print methods (screen print vs. DTG was never confirmed, so copy stays
  method-agnostic), and no return policy until one is written. Placeholder
  fabric weights in `data/thread.ts` must be confirmed — they are now on
  products people pay for.
- **No `Product`/`Offer` structured data** until the fabric copy is confirmed;
  it would put that copy in front of search engines as fact.

---

## 9. Build order

Each step was independently verifiable in the browser.

1. `ThreadCartProvider` — foundation everything else consumes
2. Page + Hero + BrandStory + Quality — page renders and routes
3. `ThreadProductCard` → Catalog → Categories → Featured — the largest step
4. `ThreadCartDrawer` + `/api/checkout` + `/order/success` — the flow, end to end
5. FAQ + CTA — remaining content sections
6. The parent-site wiring in §7
7. `pnpm typecheck`, `pnpm lint` and `pnpm build`

---

## 10. Going live

In Stripe (the LEU account):

- [ ] Set `STRIPE_SECRET_KEY` in this project's Vercel environment: the live
      key for Production, the test key for Preview
- [ ] In test mode, buy something with card `4242 4242 4242 4242`, land on
      `/order/success`, and find the payment in the dashboard filtered by
      `metadata.site = thread`
- [ ] **Settings → Emails:** turn on receipts for successful payments, so
      customers get one
- [ ] **Settings → Payment methods:** confirm cards, Apple Pay and Google Pay
      are on for Checkout (the FAQ promises them)
- [ ] **Settings → Public details:** check the statement descriptor; with the
      `THREAD` suffix, charges read `<LEU prefix>* THREAD`
- [ ] If the parent LEU site has a Stripe webhook, confirm it ignores
      `checkout.session.completed` events whose `metadata.site` is `thread` —
      the account is shared, so it will receive them
- [ ] Decide on sales tax; Stripe Tax is one setting plus `automatic_tax` on
      the session

On the site:

- [ ] Confirm the fabric weights in `data/thread.ts` or replace them
- [ ] Write a return/exchange policy, then add it to the FAQ
- [ ] Replace the remaining placeholder images with real photos as the
      "Coming soon" lines launch, and give each a `priceCents`
- [ ] Decide whether the parent site's nav keeps linking to Thread at launch

---

## 11. Its own repo and site (2026-09-25)

The page moved out of the Lee Enterprises Unlimited repo into this one, and its
route changed from `/thread-t-shirts` to `/`.

**Moved byte-for-byte:** every file in `public/thread/`,
`public/logos/thread-logo.png`, `app/api/thread-order/route.ts`, and 14 of the
21 components.

**Moved with local edits, and it is worth being exact:**

- `ThreadUseCasesSection`, `ThreadProcessSection`, `ThreadFAQSection` each
  gained an `id` (`custom-apparel`, `process`, `faq`) so the header can link to
  them. Nothing else in them changed.
- `ThreadStyles` gained the header and footer link treatment
  (`.thread-nav-link`, `.thread-footer-link`) and is rendered from
  `app/layout.tsx` instead of the page, so the header, footer and 404 page
  share it. Its comments no longer cite the parent's `globals.css` line
  numbers.
- `ThreadHeroBackdrop`, `ThreadReveal`, `ThreadUI` — comments only. They cited
  the parent's stylesheet and the rule, which no longer applies here, that the
  page could not touch it.
- `data/thread.ts` — comments only: paths that exist only in the parent
  (`/thread-t-shirts`, `lib/colors.ts`, `lib/money.ts`) were rewritten. No
  product, price, or line of copy changed.
- `types/index.ts` is the Thread interfaces alone, unchanged, under a new
  header comment.
- This spec. Paths now point at this repo, and the parent-only constraints
  (its Stripe CSP, `ignoreBuildErrors`, its `.btn-*` classes) became this
  site's own. Two rows of §1 and two items in §10 were also brought up to date
  with the catalog, which already carried real prices and photos for the tees
  before the move: the spec still said every price was hidden and every photo
  a placeholder. No decision changed.
- `app/page.tsx` is the parent's `app/thread-t-shirts/page.tsx` with the
  `metadata` export moved to `app/layout.tsx`, and the palette wrapper `<div>`,
  `ThreadStyles`, and the parent's `MainHeader`/`MainFooter` gone (the layout
  owns those now). The sections and their order are unchanged. It gained a
  small `Organization`/`WebSite` structured-data block and no product data.

**Written new for the move:**

- `components/layout/SiteHeader.tsx` and `SiteFooter.tsx`. On the parent the
  page wore LEU's header — its own navigation, Support Us, Get Started,
  Partners — none of which belongs on a site about Thread. The replacement is
  the wordmark, an anchor bar for this page's sections (`data/navigation.ts`),
  and one call to action. The footer links back to the parent and to the
  parent's privacy and terms, which are the policies that apply.
- `app/layout.tsx` — metadata, the skip link, the palette as `--thread-*`
  custom properties, and a real Open Graph card. On the parent the page set no
  Open Graph of its own, so its link previews showed LEU's card.
- `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, generated
  at build time with `next/og` from the wordmark (`lib/logo.ts`). The icons
  show its "Th" on an ink tile.
- `app/not-found.tsx`, in Thread's palette.
- `lib/site.ts`: `SITE_URL` resolves `NEXT_PUBLIC_SITE_URL`, then Vercel's
  `VERCEL_PROJECT_PRODUCTION_URL`, then localhost. Nothing hardcodes a domain.
- `app/globals.css` carries only what the page uses: Tailwind, the parent's
  border radii inlined, the base layer on Thread's palette, and the five shared
  utilities. None of the parent's shadcn tokens, `tw-animate-css`, or its LMM
  and Business Mastery styles came across.
- `next.config.mjs`: the parent's security headers minus every Stripe
  allowance, since nothing here loads from another origin; and a permanent
  redirect from `/thread-t-shirts` to `/` for anyone who swapped the host but
  kept the path.

**Checked against the parent before the move:** full-page screenshots of the
old `/thread-t-shirts` and the new `/`, at 1440px and 390px, are pixel-identical
from the hero to the closing CTA for a visitor whose device is in dark mode;
only the header and footer differ. For a visitor in light mode, one thing
changed on purpose: the parent's shadcn theme set `color-scheme: light` in that
case, so the form's native controls (radio buttons, the date picker's icon,
select menus, scrollbars) rendered light against the dark page. Here they
follow the dark scheme both sites declare, the way they already did for
dark-mode visitors. Anchor offsets, the cart, the drawer, and the order API's
responses match the parent exactly.

---

## 12. The store (2026-10-06)

Thread stopped offering custom printing and started taking payment.

**Removed:** the use-cases, process, and group-order sections; the order
request form and `POST /api/thread-order`; the Event Shirts and Custom Design
Packages categories and their request-only cards; the `proof` quality pillar;
the FAQs about minimums, turnaround, design, artwork, the print supplier, and
reorders; `THREAD_TURNAROUND`, `THREAD_IS_PRELAUNCH`; the `customizable`,
`isPackage`, `includes`, `requestOnly`, and `ctaLabel` product fields; the
`resend` dependency and its environment variables; four placeholder SVGs
(`event`, `custom`, `team`, `performance`). The header nav lost "Custom
Apparel" and "How It Works".

**Added:** Stripe Checkout (§6), prices and a subtotal in the cart drawer,
"Add to Cart", the confirmation page, and `stripe` as a dependency.

**Rewritten:** the hero, brand story, catalog intro, FAQ, closing CTA, site
title and description, keywords, link-preview text, footer tagline, and 404
copy — all now about a label selling its own pieces. Every call to action
points at the collection.

**Unchanged:** the catalog's real tees — names, prices, photos, sizes, and
copy — and the "Coming soon" hoodies, long sleeves, and business wear.
