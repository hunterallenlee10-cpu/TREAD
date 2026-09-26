# Thread T-Shirts — Build Spec

Execution plan and settled decisions for the Thread T-Shirts site. Every
decision below is settled — this document exists so a build session writes
components instead of re-deriving choices.

The page was built as `/thread-t-shirts` inside the Lee Enterprises Unlimited
repo and moved here on 2026-09-25, as the homepage of its own repo and site.
§11 records what changed in the move and what stayed behind. Every path below
is relative to this repo, and every content decision still stands.

**Status:** built. The page passes a production build; what remains is business
confirmation, not code — see §10.

| Done | File |
| --- | --- |
| ✅ | `data/thread.ts` — palette, catalog, all page copy |
| ✅ | `types/index.ts` — the Thread interfaces (the whole file in this repo; they were one section of a shared file in the parent) |
| ✅ | `public/thread/*` — product photos, SVG placeholders, and the wordmark |
| ✅ | 21 files in `components/thread/`, `app/page.tsx`, and `app/api/thread-order/route.ts` (§4) |
| ✅ | Wiring on the parent site (§7) |

---

## 1. Settled decisions

| | |
| --- | --- |
| Route | `/`, on its own site. `leeenterprisesunlimited.com/thread-t-shirts` redirects here |
| Launch state | **Pre-launch.** Takes requests, does not sell |
| Prices | Per product. `priceCents: null` renders "Price coming soon" |
| Product photos | Real photos for the tees; generated SVG placeholders elsewhere, swappable per product |
| Turnaround | 2–4 weeks, from **proof approval** (`THREAD_TURNAROUND`) |
| Custom minimum | **None.** Custom printing runs at any quantity, down to one piece |
| Printing | "Professional custom apparel supplier with commercial-grade equipment" |
| Fulfillment | Shipping |
| Sizes | S, M, L, XL, 2XL, 3XL (4XL is a per-product opt-in) |
| Design | Both — Thread designs it, or the customer submits artwork |
| Group pricing | "Contact us for group pricing." No tiers, no numbers |
| Contact | `ceo@leeenterprisesunlimited.com`, same as every form on the parent site |
| Checkout | **Order request only.** No payment, no card fields |

### Why no real checkout

This site has no payment integration at all. On the parent site, Stripe is
wired for exactly two flows, neither of which is a product catalog: a single
pay-what-you-choose support payment, and an admin-only invoicing route that
must never be called from a browser (`docs/STRIPE.md` §2 in the Lee
Enterprises Unlimited repo). Fixed-price Checkout items were built there and
removed. There is no database, and the parent's Stripe notes warn against
automated fulfillment until webhook idempotency is persisted. Thread customers
who need an invoice are invoiced from the parent's Stripe account, tagged
`thread`.

If real checkout is added later: **prices must resolve server-side from a SKU.**
A cart that posts prices from `data/thread.ts` is exploitable. The parent's
support flow inverts the usual "client never sends a price" rule specifically
because it is pay-what-you-choose — that exemption does not transfer to a
catalog. A checkout also needs its payment origin added to the Content
Security Policy in `next.config.mjs`, which currently allows nothing outside
this site.

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
<a href="#order-request" className={threadSecondaryButtonClass}>…</a>
```

Shared utilities in `app/globals.css`, verbatim from the parent: `.section-container`,
`.section-padding`, `.heading-xl`, `.heading-lg`, `.heading-md`.

---

## 3. Page composition

`app/page.tsx` — a server component wrapping everything in the client cart and
catalog-filter providers. Metadata lives in `app/layout.tsx`.

| # | Section | Content source |
| --- | --- | --- |
| 1 | Hero | Status badge, headline, two CTAs → `#catalog` and `#order-request` |
| 2 | Brand story | The two paths: original label **and** custom print service |
| 3 | Quality | `threadQualityPillars` (4) |
| 4 | Catalog | `threadProducts` + category filter. `id="catalog"` |
| 5 | Use cases | `threadUseCases` (8). `id="custom-apparel"` |
| 6 | Process | `threadProcessSteps` (5). `id="process"` |
| 7 | Group orders | `threadGroupOrderInfo` |
| 8 | FAQ | `threadFaqs`, accordion. `id="faq"` |
| 9 | Order request | Cart review + contact form. `id="order-request"` |
| 10 | Closing CTA | — |

Plus `ThreadCartDrawer`, fixed-position, rendered once at page level.

`ThreadFeaturedSection` and `ThreadCategoriesSection` are built — featured
products, and category cards that filter the catalog and scroll to it — but
the page does not render them, and had already stopped rendering them on the
parent site before the move. Adding either back is one line in `app/page.tsx`.

Shell: `app/layout.tsx` renders `ThreadStyles`, a skip link, `SiteHeader`, the
route, and `SiteFooter`. The page's `<main id="main-content" className="pt-20">`
clears the fixed 80px header and is the skip link's target.

---

## 4. Files

```
app/page.tsx
app/api/thread-order/route.ts
components/thread/ThreadCartProvider.tsx          "use client"
components/thread/ThreadCatalogFilterProvider.tsx "use client"
components/thread/ThreadCartDrawer.tsx            "use client"
components/thread/ThreadProductCard.tsx           "use client"
components/thread/ThreadProductGallery.tsx        "use client"
components/thread/ThreadCatalogSection.tsx        "use client"
components/thread/ThreadCategoriesSection.tsx     "use client"
components/thread/ThreadFeaturedSection.tsx       "use client"
components/thread/ThreadOrderRequestForm.tsx      "use client"
components/thread/ThreadFAQSection.tsx            "use client"
components/thread/ThreadUI.tsx
components/thread/ThreadStyles.tsx
components/thread/ThreadHeroSection.tsx
components/thread/ThreadHeroBackdrop.tsx
components/thread/ThreadBrandStorySection.tsx
components/thread/ThreadQualitySection.tsx
components/thread/ThreadUseCasesSection.tsx
components/thread/ThreadProcessSection.tsx
components/thread/ThreadGroupOrderSection.tsx
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
  isOpen: boolean;
  setOpen(open: boolean): void;
}
```

- **Variant identity** is `` `${productId}:${colorId}:${sizeId}` ``. Adding an
  existing variant increments quantity rather than appending a row.
- **Persistence:** `localStorage`, key `thread-order-request-v1`. Read inside
  `useEffect`, never during render — reading during render desyncs SSR and
  client HTML and throws a hydration error. `localStorage` is per origin, so a
  selection made on the parent site's old `/thread-t-shirts` page does not
  carry over to this domain.
- **Quantity bounds:** 1–1000 per line, clamped in the provider so the UI cannot
  post something the API will reject.
- **There is no minimum order.** Custom printing runs at any quantity, down to
  a single piece, and the UI says nothing about quantity rules. There was a
  5-piece minimum with a `meetsCustomMinimum` flag and notices in the cart
  drawer, the request form, and the catalog header; all of it is gone. Do not
  reintroduce a quantity gate or notice without a product decision behind it.
- Design packages (`isPackage: true`) have no colors. Use `colorId: ""`,
  `colorName: "—"` so the variant key stays well-formed.

---

## 6. `POST /api/thread-order`

Same Resend construction, honeypot, server-side validation, plain-text email,
and generic error messages as the form routes on the parent site.

**Request:**

```ts
{
  fullName: string;          // required, >= 2 chars
  email: string;             // required — the reply channel for artwork
  phone: string;             // required, >= 10 digits
  organization?: string;
  orderType: "ready-made" | "custom" | "both";
  useCase?: string;          // business | team | school | event | ...
  preferredContact: "email" | "phone" | "text";
  needByDate?: string;
  hasArtwork: "yes" | "no" | "unsure";
  designNotes?: string;
  additionalNotes?: string;
  items: ThreadCartItem[];   // may be empty — custom-only requests are valid
  honeypot?: string;
}
```

**Two rules that matter:**

1. **Re-resolve every `productId` against `threadProducts` server-side and use
   the server's product name in the email.** Never interpolate the client's
   `productName` — that is an open channel for writing arbitrary text into your
   inbox.
2. **Bound the payload** before formatting: reject more than 100 line items, and
   clamp each quantity to 1–1000. An unbounded cart becomes an unbounded email.

**Email is required** — artwork exchange happens over email, so a phone-only
request cannot complete the flow.

**Delivery:** `THREAD_TO_EMAIL || CONTACT_TO_EMAIL || ceo@leeenterprisesunlimited.com`.
Default behavior is the shared Lee Enterprises inbox, as decided. The env var
exists purely as an escape hatch, and carries the Resend caveat in
`.env.example`: until a domain is verified in Resend, any recipient other than
the account's own address is refused. These variables are set in this
project's Vercel environment, not the parent's.

Subject: `New Thread Order Request — ${fullName}`. Set `replyTo` to the
customer's email.

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
- **`images: { unoptimized: true }`** — `next/image` passes files through. SVG
  placeholders work as-is.
- **No database.** Requests are email-only: no order numbers, no history, no
  status lookup. Say "we'll reply within one business day," never "track your
  order."
- **Type errors fail the build here.** The parent's `ignoreBuildErrors` did not
  come across. Still run `pnpm typecheck` and `pnpm lint` before pushing.
- **Pre-launch honesty.** No delivery promise beyond "2–4 weeks from proof
  approval," no claim about equipment beyond the agreed supplier language, and
  no capability claim about print methods — screen print vs. DTG vs.
  embroidery was never confirmed, so all copy stays method-agnostic. Placeholder
  fabric weights in `data/thread.ts` must be confirmed before they are
  advertised.

---

## 9. Build order

Each step was independently verifiable in the browser.

1. `ThreadCartProvider` — foundation everything else consumes
2. Page + Hero + BrandStory + Quality — page renders and routes
3. `ThreadProductCard` → Catalog → Categories → Featured — the largest step
4. `ThreadCartDrawer` + `ThreadOrderRequestForm` + API route — the flow, end to end
5. UseCases + Process + GroupOrder + FAQ + CTA — remaining content sections
6. The parent-site wiring in §7
7. `pnpm typecheck`, `pnpm lint` and `pnpm build`

---

## 10. Before this goes public

- [ ] Confirm the fabric weights in `data/thread.ts` or replace them
- [ ] Confirm the supplier language in the `printing` FAQ is accurate
- [ ] Replace the remaining placeholder images with real photos
- [ ] Set real `priceCents` values where they are still null, or leave "Price
      coming soon" until launch
- [ ] Set `RESEND_API_KEY` in this project, send one live test request, and
      confirm it lands in the inbox
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
