/**
 * Thread T-Shirts — page content and catalog.
 *
 * EVERYTHING customer-facing on the page lives here. Changing the catalog
 * should never require touching a component: edit the objects below and the
 * page, the cart, and checkout all follow.
 *
 * What a product needs to be for sale:
 *
 *  - A real `priceCents` — an integer number of CENTS. Do not store dollars:
 *    `formatThreadCents` divides by 100 for display, and the checkout route
 *    hands this exact number to Stripe as the unit amount, so $45 entered as
 *    `45` charges the customer 45 cents. `null` renders THREAD_PRICE_LABEL and
 *    keeps the product out of the cart.
 *  - No `comingSoon`. See `isThreadPurchasable` at the bottom of this file —
 *    the browser and the checkout route both decide what is for sale with it.
 *  - At least one color and one size. Checkout rejects any color or size id a
 *    product does not list, so these are the variants a customer can pay for.
 *
 * The Signature Tees are real: confirmed prices, size runs, and photography.
 * The other categories are "Coming soon" placeholders on generated SVG art in
 * /public/thread/. Fabric copy is written to be plausible, not contractual —
 * confirm the fabric weights in `fabric` and `details` (docs/THREAD.md §10).
 *
 * Interfaces live in types/index.ts, matching how every other domain object in
 * this repo is typed.
 */

import type {
  ThreadCategory,
  ThreadColorOption,
  ThreadFaq,
  ThreadProduct,
  ThreadQualityPillar,
  ThreadSize,
} from "@/types";

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

/**
 * Thread's palette.
 *
 * It began scoped to the one page while Thread lived inside the Lee
 * Enterprises Unlimited site, where the shared `VENTURE_COLORS.thread` token
 * is byte-identical to the parent LEU gold and gave Thread no identity of its
 * own. That token stayed in the parent repo. On its own site this palette is
 * Thread's everywhere — header, footer and base stylesheet included.
 *
 * The logic: bone as the primary action color with near-black text is the
 * standard premium-apparel signature, and champagne keeps Thread visibly
 * related to the LEU gold without repeating it.
 */
export const THREAD_PALETTE = {
  /** Primary. Buttons, headline accents. Pair with `ink` text. */
  bone: "#EDE7DA",
  /** Secondary. Category labels, hovers, hairline accents. */
  champagne: "#C2A878",
  /** Deepest background. */
  ink: "#0B0B0B",
  /** Card and alternating section background. */
  charcoal: "#141414",
  /** Warm-tinted border, distinct from the parent site's neutral-800. */
  border: "#2A2724",
  /** Secondary body copy. */
  muted: "#8A8378",
  glassBg: "rgba(237, 231, 218, 0.06)",
} as const;

// ---------------------------------------------------------------------------
// Ordering constants
// ---------------------------------------------------------------------------

/** Shown wherever a price would go until real pricing lands. */
export const THREAD_PRICE_LABEL = "Price coming soon";

/**
 * The status line on a `comingSoon` card. Also usable as a product `name` for
 * a piece with nothing announced yet, not even what it is — the card drops the
 * status line when the name already carries it rather than saying it twice.
 */
export const THREAD_COMING_SOON_LABEL = "Coming Soon";

/**
 * Cart limits, enforced in the browser by the cart and again on the server by
 * the checkout route, which reads these same constants. MAX_LINES matches the
 * line-item cap on a Stripe Checkout Session, so raising it past 100 turns an
 * oversized cart into a failed checkout rather than a longer one.
 */
export const THREAD_MAX_QUANTITY = 50;
export const THREAD_MAX_LINES = 100;

/**
 * The contact address shown on the page — the Lee Enterprises Unlimited
 * inbox, the address every form on the parent site uses.
 */
export const THREAD_CONTACT_EMAIL = "ceo@leeenterprisesunlimited.com";

/**
 * Every size Thread runs, in the order they render. A product opts into
 * the ones it actually runs, so adding to this list never changes an existing
 * listing — `getThreadSizes` filters by the product's own ids.
 */
export const THREAD_SIZES: ThreadSize[] = [
  { id: "s", label: "S" },
  { id: "m", label: "M" },
  { id: "l", label: "L" },
  { id: "xl", label: "XL" },
  { id: "2xl", label: "2XL" },
  { id: "3xl", label: "3XL" },
  { id: "4xl", label: "4XL" },
];

/**
 * Garment colorways. `hex` drives the swatch dot in the product card, so it
 * should approximate the real fabric — it is decoration, not a spec.
 */
export const THREAD_COLORS: Record<string, ThreadColorOption> = {
  black: { id: "black", name: "Black", hex: "#111111" },
  bone: { id: "bone", name: "Bone", hex: "#EDE7DA" },
  white: { id: "white", name: "White", hex: "#FFFFFF" },
  heather: { id: "heather", name: "Heather Grey", hex: "#9A9A96" },
  navy: { id: "navy", name: "Navy", hex: "#1E2A3A" },
  forest: { id: "forest", name: "Forest", hex: "#2A3B2F" },
  sand: { id: "sand", name: "Sand", hex: "#C9BBA2" },
  burgundy: { id: "burgundy", name: "Burgundy", hex: "#4A2028" },
  charcoal: { id: "charcoal", name: "Charcoal", hex: "#3A3A38" },
  royal: { id: "royal", name: "Royal", hex: "#1E3A8A" },
};

/**
 * The standard run. Deliberately stops at 3XL — 4XL is a per-product opt-in
 * (`[...ALL_SIZES, "4xl"]`), not something every piece is cut in.
 */
const ALL_SIZES = ["s", "m", "l", "xl", "2xl", "3xl"];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const threadCategories: ThreadCategory[] = [
  {
    id: "tees",
    name: "Signature Tees",
    blurb:
      "The foundation of the line. Combed cotton, clean necklines, and a fit that holds its shape past the first wash.",
    image: "/thread/tee.svg",
  },
  {
    id: "hoodies",
    name: "Hoodies & Pullovers",
    blurb:
      "Brushed interiors and structured hoods built for daily wear, not a single season.",
    image: "/thread/hoodie.svg",
  },
  {
    id: "long-sleeve",
    name: "Long Sleeve",
    blurb:
      "Layering pieces that work on their own — waffle knits, henleys, and everyday crews.",
    image: "/thread/long-sleeve.svg",
  },
  {
    id: "business",
    name: "Business Apparel",
    blurb:
      "Polos, button-downs, and quarter-zips that carry a logo without looking like a uniform.",
    image: "/thread/business.svg",
  },
];

// ---------------------------------------------------------------------------
// Catalog
//
// Signature Tees is entirely real now — confirmed prices, fabrics, size runs,
// and photography, every piece printed front and back. Everything after it is
// still placeholder inventory; see the note at the top of this file before
// treating any of it as fact.
// ---------------------------------------------------------------------------

export const threadProducts: ThreadProduct[] = [
  // --- Signature Tees -----------------------------------------------------
  //
  // Catalog order is display order, so this block is what a reader meets
  // first under both "All Products" and "Signature Tees".
  //
  // Two conventions run through every listing here. Each carries an
  // `imageBack` — all of them are printed on both sides — which the card
  // shows as a second view, reachable by swipe, tap, arrow, or dot on any
  // device. And `details` describes only what the photos show and what was
  // confirmed: collar and seam construction were not, and these listings
  // carry real prices, so they do not guess at them. Back prints are listed
  // there as well as shown, so the copy stands on its own for a reader who
  // never flips the photo.
  {
    id: "tee-h1-leave-no-doubt",
    name: "H1 “Leave No Doubt” T-Shirt",
    categoryId: "tees",
    tagline: "Chest logo, back statement",
    description:
      "The H1 Performance mark sits small on the left chest, with “Leave No Doubt” across the back in white script. A 5.5 oz cotton tee cut for training days and everything after them.",
    fabric: "5.5 oz cotton",
    fit: "Classic unisex fit",
    details: [
      "Left-chest H1 Performance logo",
      "“Leave No Doubt” script across the back",
      "Unisex sizing, M through 3XL",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/h1-leave-no-doubt-front.jpg",
    imageAlt:
      "Front of the black H1 “Leave No Doubt” t-shirt, with a white H1 Performance logo on the left chest",
    imageBack: "/thread/h1-leave-no-doubt-back.jpg",
    imageBackAlt:
      "Back of the black H1 “Leave No Doubt” t-shirt, with “Leave No Doubt” across the upper back in white script",
    colors: ["black"],
    sizes: ["m", "l", "xl", "2xl", "3xl"],
    priceCents: 2499,
    featured: true,
  },
  // Same blank and same front as the tee above — black, left-chest mark — so
  // the back is the only thing separating them, and the copy leads with it.
  // Both cards therefore look identical until the photo is flipped.
  //
  // The id comes from the artwork's opening line rather than the product
  // name. `tee-h1-achieve-your-dream` is already taken by the white athletic
  // shirt, and an id differing from it by a single trailing "s" is the kind
  // of thing that silently points at the wrong product.
  {
    id: "tee-h1-push-limits",
    name: "H1 “Achieve Your Dreams” T-Shirt",
    categoryId: "tees",
    tagline: "The progression, spelled out",
    description:
      "The H1 Performance mark sits small on the left chest. The back carries the whole progression — “PUSH LIMITS.” to “EXCEED EXPECTATIONS.” to “ACHIEVE YOUR DREAMS.” — stacked in white block capitals on 5.5 oz cotton.",
    fabric: "5.5 oz cotton",
    fit: "Classic unisex fit",
    details: [
      "Left-chest H1 Performance logo",
      "Three-line back print: PUSH LIMITS. / EXCEED EXPECTATIONS. / ACHIEVE YOUR DREAMS.",
      "Unisex sizing, M through 3XL",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/h1-achieve-tee-black-front.jpg",
    imageAlt:
      "Front of the black H1 “Achieve Your Dreams” t-shirt, with a white H1 Performance logo on the left chest",
    imageBack: "/thread/h1-achieve-tee-black-back.jpg",
    imageBackAlt:
      "Back of the black H1 “Achieve Your Dreams” t-shirt, with “PUSH LIMITS.”, “EXCEED EXPECTATIONS.” and “ACHIEVE YOUR DREAMS.” stacked in white block capitals and joined by downward arrows",
    colors: ["black"],
    sizes: ["m", "l", "xl", "2xl", "3xl"],
    priceCents: 2499,
    featured: true,
  },
  // The one listing here whose `image` is the back of the garment, and
  // deliberately so. This piece is printed on one side only, so its front is a
  // blank black tee — as a card thumbnail that is indistinguishable from an
  // unprinted blank, and from the two listings above until you flip it. Leading
  // with the back puts the only thing identifying the product on the card, and
  // the plain front becomes the second view.
  //
  // That inversion is safe because nothing here depends on photo order: the
  // featured strip renders `image` alone, `imageSide` tells the card which side
  // it is looking at, and both sides are described in `details`. The alt text
  // on each says which side it is rather than assuming front-then-back.
  //
  // Third cotton tee at 5.5 oz and $24.99, so it sits with the other two
  // rather than with the polyester athletic shirts below.
  {
    id: "tee-h1-back-logo",
    name: "H1 Back Logo Only T-Shirt",
    categoryId: "tees",
    tagline: "Plain front, logo back",
    description:
      "The H1 Performance mark alone, printed large and centered high on the back — the flexed arm and rising arrow over “H1 PERFORMANCE” in white. The front is left completely plain, so the shirt reads as a black tee until you turn around. 5.5 oz cotton in a standard fit.",
    fabric: "5.5 oz cotton",
    fit: "Standard fit",
    details: [
      "Large H1 Performance logo centered on the upper back",
      "No print on the front",
      "Unisex sizing, S through 2XL",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/h1-back-logo-tee-black-back.jpg",
    imageAlt:
      "Back of the black H1 Back Logo Only t-shirt, with the white H1 Performance logo — a flexed arm and rising arrow above “H1 PERFORMANCE” — centered high on the back",
    // The only listing that needs this. Without it the card's gallery would
    // label the lead photo "Front" and the plain front "Back", which is the
    // one thing worse on this piece than showing no label at all.
    imageSide: "back",
    imageBack: "/thread/h1-back-logo-tee-black-front.jpg",
    imageBackAlt:
      "Front of the black H1 Back Logo Only t-shirt, left plain with no print",
    colors: ["black"],
    sizes: ["s", "m", "l", "xl", "2xl"],
    priceCents: 2499,
    featured: true,
  },
  // The performance counterpart to the cotton tees above — same slogan,
  // different garment, and a size run that goes a step further in both
  // directions. 4XL is not part of the standard run, which is why `sizes`
  // spreads ALL_SIZES rather than using it directly.
  //
  // These two are the same product in two colourways, so
  // the colour is carried in the name. Without it the catalog shows two cards
  // with an identical title and only a swatch to tell them apart. The `id`s
  // carry it too, so nothing here is distinguished by colour in one place and
  // not the other.
  //
  // The artwork is not identical across the two: royal takes the mark
  // centred with LEAVE NO DOUBT in brush capitals, black takes it on the left
  // chest with the same words in script. Each description states its own.
  {
    id: "tee-h1-athletic-royal",
    name: "H1 “Leave No Doubt” Athletic Shirt — Royal",
    categoryId: "tees",
    tagline: "Ultra light, built to move",
    description:
      "A 2.5 oz polyester training shirt light enough to forget you have it on. The H1 Performance mark sits centered on the chest, with “LEAVE NO DOUBT” across the back in brush capitals.",
    fabric: "2.5 oz polyester",
    fit: "Men’s Ultra Light Athletic",
    details: [
      "Centered H1 Performance logo",
      "“LEAVE NO DOUBT” across the back in brush capitals",
      "Men’s sizing, S through 4XL",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/h1-athletic-royal-front.jpg",
    imageAlt:
      "Front of the royal blue H1 “Leave No Doubt” athletic shirt, with a white H1 Performance logo centered on the chest",
    imageBack: "/thread/h1-athletic-royal-back.jpg",
    imageBackAlt:
      "Back of the royal blue H1 “Leave No Doubt” athletic shirt, with “LEAVE NO DOUBT” across the upper back in white brush lettering",
    colors: ["royal"],
    sizes: [...ALL_SIZES, "4xl"],
    priceCents: 2999,
    featured: true,
  },
  {
    id: "tee-h1-athletic-black",
    name: "H1 “Leave No Doubt” Athletic Shirt — Black",
    categoryId: "tees",
    tagline: "Ultra light, built to move",
    description:
      "The same 2.5 oz polyester build as the royal, in black with the mark moved to the left chest. “Leave No Doubt” runs across the back in white script.",
    fabric: "2.5 oz polyester",
    fit: "Men’s Ultra Light Athletic",
    details: [
      "Left-chest H1 Performance logo",
      "“Leave No Doubt” script across the back",
      "Men’s sizing, S through 4XL",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/h1-athletic-black-front.jpg",
    imageAlt:
      "Front of the black H1 “Leave No Doubt” athletic shirt, with a white H1 Performance logo on the left chest",
    imageBack: "/thread/h1-athletic-black-back.jpg",
    imageBackAlt:
      "Back of the black H1 “Leave No Doubt” athletic shirt, with “Leave No Doubt” across the upper back in white script",
    colors: ["black"],
    sizes: [...ALL_SIZES, "4xl"],
    priceCents: 2999,
    featured: true,
  },
  // Same garment and price as the royal above, but a different piece rather
  // than a colorway of it: the back print reads ACHIEVE YOUR DREAM., so it is
  // named for its own artwork the way the royal is named for LEAVE NO DOUBT.
  // Filing it as a second colour of one product would put two different
  // slogans behind a single swatch row with no way to tell them apart.
  //
  // Hence the id keyed to the slogan rather than the colour.
  {
    id: "tee-h1-achieve-your-dream",
    name: "H1 “Achieve Your Dream” Athletic Shirt",
    categoryId: "tees",
    tagline: "Clean white, bold statement",
    description:
      "The same 2.5 oz polyester build as its royal counterpart, in white with the artwork reversed to black. “ACHIEVE YOUR DREAM.” sits across the back in block capitals.",
    fabric: "2.5 oz polyester",
    fit: "Men’s Ultra Light Athletic",
    details: [
      "Centered H1 Performance logo in black",
      "“ACHIEVE YOUR DREAM.” across the back",
      "Men’s sizing, S through 4XL",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/h1-athletic-white-front.jpg",
    imageAlt:
      "Front of the white H1 “Achieve Your Dream” athletic shirt, with a black H1 Performance logo centered on the chest",
    imageBack: "/thread/h1-athletic-white-back.jpg",
    imageBackAlt:
      "Back of the white H1 “Achieve Your Dream” athletic shirt, with “ACHIEVE YOUR DREAM.” across the upper back in black block capitals",
    colors: ["white"],
    sizes: [...ALL_SIZES, "4xl"],
    priceCents: 2999,
    featured: true,
  },
  // First real piece that is not H1 Performance, and the first to run the
  // standard S-3XL set, so it uses ALL_SIZES directly.
  //
  // "Snow washed" suggested the Black swatch might misrepresent it — a wash
  // that mottled usually reads as faded grey. Sampled the garment instead of
  // guessing: mean #1a1a1a across 750k fabric pixels, with 74% of them below
  // level 48. That is nine levels off the #111111 the palette already has,
  // which is nothing at swatch size, so this reuses `black` rather than
  // adding a near-duplicate to THREAD_COLORS.
  {
    id: "tee-crusader-snow-washed",
    name: "Crusader Snow Washed T-Shirt",
    categoryId: "tees",
    tagline: "Washed black, full-back print",
    description:
      "A snow-washed black tee carrying a red cross on the chest and a full-back Templar battle scene. Cut slightly oversized on 5.5 oz cotton, with the mottled finish the wash leaves behind.",
    fabric: "5.5 oz cotton",
    fit: "Slight oversize unisex fit",
    details: [
      "Red cross centered on the chest",
      "Full-back Templar battle print",
      "Snow-washed finish, mottled by design",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/crusader-snow-washed-black-front.jpg",
    imageAlt:
      "Front of the snow-washed black Crusader t-shirt, with a red cross centered on the chest",
    imageBack: "/thread/crusader-snow-washed-black-back.jpg",
    imageBackAlt:
      "Back of the snow-washed black Crusader t-shirt, with a full-back print of Templar knights in battle carrying red-cross shields and a banner",
    colors: ["black"],
    sizes: ALL_SIZES,
    priceCents: 2999,
    featured: true,
  },
  // The first piece carrying the parent brand's own mark rather than a
  // venture's, which is why it closes the block instead of opening it: catalog
  // order is display order, and appending leaves what a reader currently meets
  // first untouched. Worth promoting to the top of the catalog if the house
  // shirt should lead the collection — that is a merchandising call, not a
  // technical one.
  //
  // Exactly the inverse of the H1 Back Logo Only tee above, so the image order
  // is the ordinary one: the printed side is the front here, and the second
  // view is the clean back. `imageBack` earns its place even though that back
  // is blank — it is what confirms the piece is unprinted behind, and
  // `details` says so too, for a reader who never flips it.
  //
  // The mark is greyscale, not the parent site's gold: sampled across the chest print
  // it runs #323233 to pure white with no colour cast at all (mean RGB
  // 203.5/203.6/203.5). The copy calls it silver on that basis. It describes
  // how the artwork looks and stops there — whether that is a foil, a metallic
  // ink, or a printed gradient was not confirmed.
  {
    id: "tee-leu-chest-logo",
    name: "LEU Chest Logo T-Shirt",
    categoryId: "tees",
    tagline: "Silver mark, clean back",
    description:
      "The Lee Enterprises Unlimited mark on the left chest, rendered in a silver-to-white gradient against black. The back is left plain, so the house mark is the only thing on the shirt. 5.5 oz cotton in a standard fit.",
    fabric: "5.5 oz cotton",
    fit: "Standard fit",
    details: [
      "Left-chest Lee Enterprises Unlimited mark in silver",
      "No print on the back",
      "Unisex sizing, S through 2XL",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/leu-chest-logo-tee-black-front.jpg",
    imageAlt:
      "Front of the black LEU t-shirt, with the angular Lee Enterprises Unlimited mark on the left chest in a silver-to-white gradient",
    imageBack: "/thread/leu-chest-logo-tee-black-back.jpg",
    imageBackAlt:
      "Back of the black LEU t-shirt, left plain with no print",
    colors: ["black"],
    sizes: ["s", "m", "l", "xl", "2xl"],
    priceCents: 2799,
    featured: true,
  },
  // The performance counterpart to the cotton tee above, and the same
  // relationship the H1 athletic shirts have to the H1 cotton tees: same mark,
  // different garment, and a size run that goes a step further. 4XL is not part
  // of the standard run, which is why `sizes` spreads ALL_SIZES rather than
  // using it directly.
  //
  // Filed under Signature Tees rather than a performance category of its own,
  // matching where the three H1 athletic shirts already sit.
  //
  // Placement keeps the two LEU pieces adjacent, so the cotton and performance
  // versions of the house shirt read as a pair rather than being separated by
  // whatever lands next.
  //
  // The mark is the same silver as the cotton tee, not merely a similar one:
  // sampled across this print it means RGB 203.2/203.4/203.4 against the cotton
  // tee's 203.5/203.6/203.5, greyscale in both cases. The copy says so.
  //
  // The garment carries small diagonal flashes at each shoulder. They look like
  // reflective detail, and the sampled pixels do run slightly blue
  // (161/164/170, peaking at #d7dbe2) rather than neutral — but a photograph
  // cannot establish retroreflectivity, and this listing carries a real price,
  // so `details` leaves them out. Same call the H1 athletic shirts made about
  // the same flashes.
  {
    id: "tee-leu-athletic-logo",
    name: "LEU Athletic T-Shirt Logo Only",
    categoryId: "tees",
    tagline: "Ultra light, mark centered",
    description:
      "The Lee Enterprises Unlimited mark centered on the chest in the same silver-to-white gradient as the cotton tee, on a 2.5 oz polyester training shirt light enough to forget you have it on. The back is left plain, so the mark is the only thing on the shirt.",
    fabric: "2.5 oz polyester",
    fit: "Athletic fit",
    details: [
      "Lee Enterprises Unlimited mark centered on the chest in silver",
      "No print on the back",
      "Sizes S through 4XL",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/leu-athletic-black-front.jpg",
    imageAlt:
      "Front of the black LEU athletic shirt, with the angular Lee Enterprises Unlimited mark centered on the chest in a silver-to-white gradient",
    imageBack: "/thread/leu-athletic-black-back.jpg",
    imageBackAlt:
      "Back of the black LEU athletic shirt, left plain with no print",
    colors: ["black"],
    sizes: [...ALL_SIZES, "4xl"],
    priceCents: 2899,
    featured: true,
  },
  // Runs the standard S-3XL set, so it uses ALL_SIZES directly.
  //
  // The first listing built around a named third party rather than a mark this
  // company owns: the artwork carries a real athlete's name, jersey number, and
  // a drawn likeness. That is a licensing question, not a technical one, and it
  // is flagged here because nothing else in this file raises it — every other
  // piece prints an H1, LEU, or original design. Nothing in the code depends on
  // the answer.
  //
  // The copy stays on the garment. It describes the lettering, the
  // illustration, and the fabric, and takes no position on the subject or the
  // circumstances the slogan refers to. Product copy is the wrong place for it,
  // and the request was for a listing, not for advocacy.
  //
  // Ordinary image order — the front is printed, so it leads and the full-back
  // illustration is the second view. Same shape as the Crusader tee: small
  // chest hit, large back print.
  //
  // Colours sampled rather than eyeballed: the chest hit is white over royal
  // (#0040a0) and the back arch is white with a navy (#202040) outline, so the
  // copy names those two rather than calling the whole thing blue.
  {
    id: "tee-free-bauer",
    name: "Free Trevor Bauer T-Shirt",
    categoryId: "tees",
    tagline: "Chest hit, full-back print",
    description:
      "“FREE TREVOR BAUER” stacked small on the left chest in collegiate block letters, white over royal. The back arches “FREE BAUER” in white above a full-length illustration of a uniformed player with a bat raised overhead, number 27. 5.5 oz cotton in a standard fit.",
    fabric: "5.5 oz cotton",
    fit: "Standard fit",
    details: [
      "Left-chest “FREE TREVOR BAUER” in white and royal block letters",
      "Arched “FREE BAUER” over a full-back player illustration, number 27",
      "Unisex sizing, S through 3XL",
      "Machine wash cold, tumble dry low",
    ],
    image: "/thread/free-bauer-tee-black-front.jpg",
    imageAlt:
      "Front of the black Free Trevor Bauer t-shirt, with “FREE TREVOR BAUER” stacked on the left chest in white and royal blue collegiate block letters",
    imageBack: "/thread/free-bauer-tee-black-back.jpg",
    imageBackAlt:
      "Back of the black Free Trevor Bauer t-shirt, with “FREE BAUER” arched in white across the upper back above a full-length illustration of a player in a white and royal uniform holding a bat overhead, number 27 on the jersey",
    colors: ["black"],
    sizes: ALL_SIZES,
    priceCents: 2499,
    featured: true,
  },

  // --- Hoodies & Pullovers ------------------------------------------------
  // Placeholders while the line is worked out, and the pattern the Long Sleeve
  // and Business Apparel blocks below follow: every field is withheld, names
  // included, so each card is nothing but THREAD_COMING_SOON_LABEL. Three
  // slots still appear, which says how many pieces are coming without naming
  // any of them. None of the fabric or fit copy that used to sit here was ever
  // confirmed (see the placeholder note at the top of this file).
  //
  // comingSoon strips each card to its name and status line, so the empty
  // colors/sizes here are never read. The `id`s stay descriptive — they are
  // React keys and the cart's product identity, never rendered — so restoring
  // a name is a one-line edit per product when the line is confirmed.
  {
    id: "hoodie-classic",
    name: THREAD_COMING_SOON_LABEL,
    categoryId: "hoodies",
    tagline: "Coming soon",
    description: "Coming soon",
    fabric: "Coming soon",
    fit: "Coming soon",
    details: ["Coming soon"],
    image: "/thread/hoodie.svg",
    imageAlt: "Hooded pullover — coming soon",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    comingSoon: true,
  },
  {
    id: "hoodie-heavy",
    name: THREAD_COMING_SOON_LABEL,
    categoryId: "hoodies",
    tagline: "Coming soon",
    description: "Coming soon",
    fabric: "Coming soon",
    fit: "Coming soon",
    details: ["Coming soon"],
    image: "/thread/hoodie.svg",
    imageAlt: "Hooded pullover — coming soon",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    comingSoon: true,
  },
  {
    id: "crew-fleece",
    name: THREAD_COMING_SOON_LABEL,
    categoryId: "hoodies",
    tagline: "Coming soon",
    description: "Coming soon",
    fabric: "Coming soon",
    fit: "Coming soon",
    details: ["Coming soon"],
    image: "/thread/hoodie.svg",
    imageAlt: "Hooded pullover — coming soon",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    comingSoon: true,
  },

  // --- Long Sleeve --------------------------------------------------------
  // Withheld the same way as Hoodies & Pullovers above — see that block.
  //
  // The Core Long Sleeve also gave up `featured` when it went placeholder:
  // those cards quote a price and link to "Configure", and a piece with
  // nothing to configure has no business in that list.
  {
    id: "ls-core",
    name: THREAD_COMING_SOON_LABEL,
    categoryId: "long-sleeve",
    tagline: "Coming soon",
    description: "Coming soon",
    fabric: "Coming soon",
    fit: "Coming soon",
    details: ["Coming soon"],
    image: "/thread/long-sleeve.svg",
    imageAlt: "Long sleeve piece — coming soon",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    comingSoon: true,
  },
  {
    id: "ls-thermal",
    name: THREAD_COMING_SOON_LABEL,
    categoryId: "long-sleeve",
    tagline: "Coming soon",
    description: "Coming soon",
    fabric: "Coming soon",
    fit: "Coming soon",
    details: ["Coming soon"],
    image: "/thread/long-sleeve.svg",
    imageAlt: "Long sleeve piece — coming soon",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    comingSoon: true,
  },
  {
    id: "ls-henley",
    name: THREAD_COMING_SOON_LABEL,
    categoryId: "long-sleeve",
    tagline: "Coming soon",
    description: "Coming soon",
    fabric: "Coming soon",
    fit: "Coming soon",
    details: ["Coming soon"],
    image: "/thread/long-sleeve.svg",
    imageAlt: "Long sleeve piece — coming soon",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    comingSoon: true,
  },

  // --- Business Apparel ---------------------------------------------------
  // Withheld the same way as Hoodies & Pullovers above — see that block.
  //
  // The Corporate Polo also gave up `featured` for the same reason the Core
  // Long Sleeve did.
  {
    id: "biz-polo",
    name: THREAD_COMING_SOON_LABEL,
    categoryId: "business",
    tagline: "Coming soon",
    description: "Coming soon",
    fabric: "Coming soon",
    fit: "Coming soon",
    details: ["Coming soon"],
    image: "/thread/business.svg",
    imageAlt: "Business apparel piece — coming soon",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    comingSoon: true,
  },
  {
    id: "biz-oxford",
    name: THREAD_COMING_SOON_LABEL,
    categoryId: "business",
    tagline: "Coming soon",
    description: "Coming soon",
    fabric: "Coming soon",
    fit: "Coming soon",
    details: ["Coming soon"],
    image: "/thread/business.svg",
    imageAlt: "Business apparel piece — coming soon",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    comingSoon: true,
  },
  {
    id: "biz-quarterzip",
    name: THREAD_COMING_SOON_LABEL,
    categoryId: "business",
    tagline: "Coming soon",
    description: "Coming soon",
    fabric: "Coming soon",
    fit: "Coming soon",
    details: ["Coming soon"],
    image: "/thread/business.svg",
    imageAlt: "Business apparel piece — coming soon",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    comingSoon: true,
  },
];

// ---------------------------------------------------------------------------
// Section copy
//
// Headings and intros live here rather than inline in components so the whole
// page reads — and edits — from one file.
// ---------------------------------------------------------------------------

export const threadCopy = {
  hero: {
    eyebrow: "Thread T-Shirts",
    /** One entry per rendered line, at every width. */
    titleLines: ["Wear what", "you stand", "for."],
    /** The word inside `titleLines` set in champagne. */
    titleAccent: "stand",
    description:
      "Original tees with something to say. Premium blanks, careful prints, a fit that holds — shipped free on every order.",
    primaryCta: "Shop the Collection",
    /** The strip along the hero's foot. Short names of pieces on sale now. */
    marquee: [
      "Leave No Doubt",
      "Achieve Your Dreams",
      "Crusader",
      "H1 Performance",
      "LEU Athletic",
      "Free Trevor Bauer",
    ],
  },
  story: {
    eyebrow: "The Label",
    title: "Original Pieces, Made to Last",
    lead: "Thread makes its own apparel and nothing else. Every design starts here, goes onto fabric chosen to hold up, and is cut to a fit that stays consistent from one piece to the next.",
    cta: "Shop the Collection",
    href: "#catalog",
  },
  quality: {
    eyebrow: "Why Thread",
    title: "Built to Outlast the First Wash",
    description:
      "Apparel is easy to make cheaply and hard to make well. These are the three things Thread refuses to compromise on.",
  },
  featured: {
    eyebrow: "Featured",
    title: "Start Here",
    description: "The pieces to start with, picked from across the line.",
  },
  categories: {
    eyebrow: "Categories",
    title: "Find Your Piece",
    description:
      "Signature tees today, with hoodies, long sleeves, and business wear on the way.",
  },
  catalog: {
    eyebrow: "The Collection",
    title: "Every Piece Thread Makes",
    description:
      "Pick your color, size, and quantity, add it to your cart, and check out securely. Shipping is free on every order.",
    allLabel: "All Products",
  },
  faq: {
    eyebrow: "Questions",
    title: "Answers Before You Ask",
    description:
      "The things people want to know before they order. If yours is not here, send an email.",
  },
  finalCta: {
    title: "Find Your Next Favorite Shirt.",
    description:
      "Pick your piece, check out in a minute, and it ships free to your door.",
    primaryCta: "Shop the Collection",
  },
};

// ---------------------------------------------------------------------------
// Supporting content
// ---------------------------------------------------------------------------

export const threadQualityPillars: ThreadQualityPillar[] = [
  {
    id: "fabric",
    title: "Fabric That Holds Up",
    description:
      "Combed and ringspun cotton, pre-shrunk before it is cut. The shirt you get back from the third wash should still be the shirt you ordered.",
  },
  {
    id: "print",
    title: "Prints That Stay Put",
    description:
      "Designs are cured properly so they flex with the fabric instead of cracking off it. No peeling edges after a season of wear.",
  },
  {
    id: "fit",
    title: "Fit You Can Predict",
    description:
      "Consistent sizing from S through 3XL, so the size you pick is the fit you get.",
  },
];

export const threadFaqs: ThreadFaq[] = [
  {
    id: "shipping",
    question: "How much is shipping?",
    answer:
      "Nothing. Shipping is free on every order to an address in the United States, with no minimum.",
  },
  {
    id: "payment",
    question: "How do I pay?",
    answer:
      "At checkout, by card — or Apple Pay or Google Pay where your device supports it. Payment is handled by Stripe, so your card details never touch this site.",
  },
  {
    id: "confirmation",
    question: "How do I know my order went through?",
    answer:
      "You land on an order confirmation page as soon as payment goes through, and a receipt is emailed to the address you entered at checkout.",
  },
  {
    id: "sizes",
    question: "What sizes are available?",
    answer:
      "S through 3XL across the line. Sizing stays consistent between styles, so a large in a tee matches a large in a hoodie.",
  },
];

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getThreadProductById(id: string): ThreadProduct | undefined {
  return threadProducts.find((product) => product.id === id);
}

export function getFeaturedThreadProducts(): ThreadProduct[] {
  return threadProducts.filter((product) => product.featured);
}

/** Resolves a product's color IDs to full swatch objects, skipping unknowns. */
export function getThreadColors(colorIds: string[]): ThreadColorOption[] {
  return colorIds
    .map((id) => THREAD_COLORS[id])
    .filter((color): color is ThreadColorOption => Boolean(color));
}

/** Resolves a product's size IDs to labels, preserving THREAD_SIZES order. */
export function getThreadSizes(sizeIds: string[]): ThreadSize[] {
  return THREAD_SIZES.filter((size) => sizeIds.includes(size.id));
}

/**
 * Whether a product can go in the cart and through checkout. The checkout
 * route applies this same test on the server, so the two cannot disagree about
 * what is for sale.
 */
export function isThreadPurchasable(product: ThreadProduct): boolean {
  return !product.comingSoon && product.priceCents !== null;
}

/** Formats an integer number of cents as US dollars, dropping a bare ".00". */
export function formatThreadCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/**
 * The lowest price in the store, or null while nothing is for sale. Read off
 * the catalog so the hero's "From $…" line cannot drift from the real prices.
 */
export function getThreadLowestPriceCents(): number | null {
  const prices = threadProducts
    .filter(isThreadPurchasable)
    .map((product) => product.priceCents as number);
  return prices.length > 0 ? Math.min(...prices) : null;
}

/**
 * Splits a headline line around its accent word, so the hero and the link
 * preview colour the same word. A line without the accent comes back whole.
 */
export function splitThreadAccent(
  line: string,
  accent: string
): { before: string; accent: string | null; after: string } {
  const at = line.indexOf(accent);
  if (at === -1) return { before: line, accent: null, after: "" };
  return {
    before: line.slice(0, at),
    accent,
    after: line.slice(at + accent.length),
  };
}

/**
 * Display price for a product. Returns THREAD_PRICE_LABEL while `priceCents`
 * is null, so setting a real price is the only change needed to show one.
 */
export function formatThreadPrice(product: ThreadProduct): string {
  if (product.priceCents === null) return THREAD_PRICE_LABEL;
  return formatThreadCents(product.priceCents);
}
