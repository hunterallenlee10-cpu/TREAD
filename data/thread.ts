/**
 * Thread T-Shirts — page content and placeholder catalog.
 *
 * EVERYTHING customer-facing on the page lives here. Replacing the
 * placeholder catalog with real inventory should never require touching a
 * component: swap the objects below and the page follows.
 *
 * Placeholder status (as of the pre-launch build):
 *
 *  - Every product carries `priceCents: null`, which renders as
 *    THREAD_PRICE_LABEL ("Price coming soon"). Set a real integer number of
 *    CENTS to show a price. Do not store dollars — `formatThreadPrice` at the
 *    bottom of this file divides by 100, and mixing the two silently shows
 *    $0.45 for a $45 shirt.
 *  - Every `image` points at a generated SVG in /public/thread/. They are
 *    deliberately obvious placeholders. Drop a real photo in /public/thread/
 *    and repoint the product's `image` — one product at a time is fine.
 *  - Product names, copy, and fabric specs are written to be plausible, not
 *    contractual. Confirm the fabric weights before any of this is advertised.
 *
 * Interfaces live in types/index.ts, matching how every other domain object in
 * this repo is typed.
 */

import type {
  ThreadCategory,
  ThreadColorOption,
  ThreadFaq,
  ThreadProcessStep,
  ThreadProduct,
  ThreadQualityPillar,
  ThreadSize,
  ThreadUseCase,
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
 * Typical production time, quoted to customers in three places — the process
 * section, the turnaround FAQ, and the order form's intro. All three read from
 * this constant, so this is the only line to change.
 *
 * Covers manufacture and shipping, and the clock starts at proof approval, not
 * at the request. Every sentence using it already says so; keep that framing if
 * the copy is reworded.
 */
export const THREAD_TURNAROUND = "2–4 weeks";

/** Thread is pre-launch: the page takes requests, it does not sell. */
export const THREAD_IS_PRELAUNCH = true;

/**
 * Every order request routes to the Lee Enterprises Unlimited inbox, the
 * address every form on the parent site uses.
 */
export const THREAD_CONTACT_EMAIL = "ceo@leeenterprisesunlimited.com";

/**
 * Every size Thread can print, in the order they render. A product opts into
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
  {
    id: "event",
    name: "Event Shirts",
    blurb:
      "Volunteer, staff, and fundraiser shirts turned around on an event timeline.",
    image: "/thread/event.svg",
  },
  {
    id: "custom",
    name: "Custom Design Packages",
    blurb:
      "Bring artwork or start from nothing — design, proofing, and production handled together.",
    image: "/thread/custom.svg",
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
  },

  // --- Hoodies & Pullovers ------------------------------------------------
  // Placeholders while the line is worked out, and the pattern the Long Sleeve
  // and Business Apparel blocks below follow: every field is withheld, names
  // included, so each card is nothing but THREAD_COMING_SOON_LABEL. Three
  // slots still appear, which says how many pieces are coming without naming
  // any of them. None of the fabric or fit copy that used to sit here was ever
  // confirmed (see the placeholder note at the top of this file).
  //
  // Event Shirts and Custom Design Packages went the other way and collapsed
  // to a single card each. Those two are open for requests today, so their
  // cards have something to say; these do not.
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
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
    customizable: false,
    comingSoon: true,
  },

  // --- Event Shirts -------------------------------------------------------
  // There is no standing event line to stock, so this is requestOnly rather
  // than comingSoon: the tagline states the current position and the whole
  // card links to the order request form. Nothing here is waiting on a launch
  // — an event order is taken whenever someone has an event.
  //
  // `tagline` is the line to edit when an event IS running. Swapping it for
  // the event's name turns this card into a live announcement without any
  // component change.
  {
    id: "event-request",
    name: "Event Shirts",
    categoryId: "event",
    tagline: "No current events",
    description:
      "Contact us if you'd like your own event apparel made.",
    fabric: "Chosen with you during the quote",
    fit: "Chosen with you during the quote",
    details: [
      "Volunteer, staff, and attendee shirts",
      "Turned around against a fixed date on the calendar",
      "Digital proof before anything is printed",
      "No payment taken and nothing committed at request time",
    ],
    image: "/thread/event.svg",
    imageAlt: "Event Shirts — request event apparel",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    customizable: true,
    requestOnly: true,
    ctaLabel: "Request Event Apparel",
  },

  // --- Custom Design Packages ---------------------------------------------
  // Open for requests rather than a fixed catalog line, so this uses
  // requestOnly: the whole card links to the order request form and no colour,
  // size, or quantity controls render. There is nothing to configure here —
  // the point is that the reader describes what they want.
  //
  // Empty colors/sizes are correct and never read. `fabric` and `fit` are only
  // surfaced in the details panel, which a requestOnly card does not render;
  // they say "chosen with you" rather than inventing a spec.
  //
  // This replaced three fixed packages (Starter, Brand Identity, Full
  // Production Run), which were the only products carrying `isPackage`. That
  // rendering path is still in ThreadProductCard — the includes list, the
  // "Estimated Pieces" label, and skipping the size picker — so bringing
  // tiered packages back is a data change and nothing more.
  {
    id: "custom-request",
    name: "Custom Design Packages",
    categoryId: "custom",
    tagline: "Whatever you'd like, we can make",
    description:
      "Bring a logo, a slogan, finished artwork, or nothing but a rough description. Tell Thread the garment, colors, placement, and quantities on the request form — in as much detail as you want — and you will get a written quote back before anything is produced.",
    fabric: "Chosen with you during the quote",
    fit: "Chosen with you during the quote",
    details: [
      "Any garment in the catalog, or one sourced for the run",
      "Design work handled from your description if you do not have artwork",
      "Digital proof before anything is printed",
      "No payment taken and nothing committed at request time",
    ],
    image: "/thread/custom.svg",
    imageAlt: "Custom Design Packages — describe a custom order",
    colors: [],
    sizes: [],
    priceCents: null,
    featured: false,
    customizable: true,
    requestOnly: true,
    ctaLabel: "Describe What You Want",
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
    badge: "Now Taking Orders",
    title: "Wear Your Style.",
    titleAccent: "Elevate Everyday Essentials.",
    description:
      "Thread is two things at once: an original apparel label, and a custom print service for anyone who needs their idea on a shirt. Premium blanks, careful prints, and a fit you can order for a whole team without guessing.",
    primaryCta: "Browse the Collection",
    secondaryCta: "Start a Custom Order",
    note: "Every piece you wear supports the ventures behind Lee Enterprises Unlimited.",
  },
  story: {
    eyebrow: "Two Ways to Work With Thread",
    title: "A Label and a Print Shop",
    lead: "Most apparel companies do one or the other. Thread does both, and they make each other better — the same standards that go into the original line go into every custom order.",
    paths: [
      {
        id: "shop",
        title: "Shop the Collection",
        description:
          "Original Thread pieces designed around fabric that holds up and a fit that stays consistent from tee to hoodie. Ready to wear, nothing to design.",
        cta: "Browse the Collection",
        href: "#catalog",
      },
      {
        id: "custom",
        title: "Order Custom Apparel",
        description:
          "Your logo, your design, your roster. For businesses, teams, schools, events, organizations, fundraisers, or one idea you want to see printed.",
        cta: "Start a Custom Order",
        href: "#order-request",
      },
    ],
  },
  quality: {
    eyebrow: "Why Thread",
    title: "Built to Outlast the First Wash",
    description:
      "Apparel is easy to make cheaply and hard to make well. These are the four things Thread refuses to compromise on.",
  },
  featured: {
    eyebrow: "Featured",
    title: "Start Here",
    description:
      "The pieces most orders are built around, across every category Thread produces.",
  },
  categories: {
    eyebrow: "Categories",
    title: "Find Your Piece",
    description:
      "Eight categories covering everyday wear, performance, business apparel, and full custom production.",
  },
  catalog: {
    eyebrow: "The Collection",
    title: "Every Piece Thread Makes",
    description:
      "Pick your colors, sizes, and quantities, then send the whole thing over as one request. Nothing is charged and nothing is committed.",
    allLabel: "All Products",
  },
  useCases: {
    eyebrow: "Custom Apparel",
    title: "Who Thread Prints For",
    description:
      "If it needs a logo, a roster, a date, or an idea on the front of it, Thread has printed something like it.",
  },
  process: {
    eyebrow: "The Process",
    title: "How an Order Works",
    description:
      "Five steps from first message to a box at your door. Nothing prints until you have seen it and approved it.",
  },
  faq: {
    eyebrow: "Questions",
    title: "Answers Before You Ask",
    description:
      "The things people want to know before sending a request. If yours is not here, ask in the form.",
  },
  order: {
    eyebrow: "Order Request",
    title: "Send Your Order Request",
    description:
      "Review what you picked, tell Thread how to reach you, and send it over. This takes no payment and no card details — you will get a written quote to approve first.",
  },
  finalCta: {
    title: "Have an Idea? Send It Over.",
    description:
      "Whether you know exactly what you want or have nothing but a rough concept, the fastest way to find out what it costs is to ask.",
    primaryCta: "Start Your Order",
    secondaryCta: "Browse the Collection",
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
      "Consistent sizing from S through 3XL, so ordering for a team means every person gets the fit they picked.",
  },
  {
    id: "proof",
    title: "Nothing Prints Unapproved",
    description:
      "Every custom order gets a digital proof first. Production does not start until you have signed off on exactly what you are getting.",
  },
];

export const threadUseCases: ThreadUseCase[] = [
  {
    id: "business",
    title: "Businesses",
    description:
      "Staff apparel, branded polos, and uniforms that make a team look established without looking corporate.",
  },
  {
    id: "teams",
    title: "Teams & Clubs",
    description:
      "Jerseys, warm-ups, and shooters with names and numbers handled per player across the full roster.",
  },
  {
    id: "schools",
    title: "Schools",
    description:
      "Class shirts, club apparel, spirit wear, and staff gear produced on a school-year timeline.",
  },
  {
    id: "events",
    title: "Events",
    description:
      "Volunteer, staff, and attendee shirts turned around against a fixed date on the calendar.",
  },
  {
    id: "organizations",
    title: "Organizations",
    description:
      "Member apparel and branded pieces that keep a consistent look across chapters and locations.",
  },
  {
    id: "fundraisers",
    title: "Fundraisers",
    description:
      "Campaign shirts structured so the margin actually funds the cause behind them.",
  },
  {
    id: "personal",
    title: "Personal Projects",
    description:
      "One idea, a small run, and a design team to get it from a sentence to a finished shirt.",
  },
  {
    id: "reorders",
    title: "Reorders",
    description:
      "Approved artwork stays on file, so a second run matches the first without starting over.",
  },
];

export const threadProcessSteps: ThreadProcessStep[] = [
  {
    id: "request",
    step: 1,
    title: "Send the Request",
    description:
      "Pick your pieces, sizes, and colors, then submit the request with what you have in mind. No payment is taken at this stage.",
  },
  {
    id: "reply",
    step: 2,
    title: "We Reply Within One Business Day",
    description:
      "Thread follows up to confirm quantities, garment choices, and artwork, and to answer anything the form did not cover.",
  },
  {
    id: "proof",
    step: 3,
    title: "Design & Digital Proof",
    description:
      "Send your artwork or have Thread design it. Either way you get a digital proof and a written quote before anything is printed.",
  },
  {
    id: "approve",
    step: 4,
    title: "You Approve, Then We Print",
    description:
      "Production starts only after you sign off on the proof and the quote. Nothing is printed on a guess.",
  },
  {
    id: "deliver",
    step: 5,
    title: "Production & Shipping",
    description: `Most orders are produced in ${THREAD_TURNAROUND} and shipped to you, sorted and packed by size.`,
  },
];

export const threadFaqs: ThreadFaq[] = [
  {
    id: "minimum",
    question: "Is there a minimum order?",
    answer:
      "No. Custom printing runs at any quantity, down to a single piece. Order one shirt to see how it comes out before committing to a full run, or one because one is all you need.",
  },
  {
    id: "turnaround",
    question: "How long does an order take?",
    answer: `Most orders are produced in ${THREAD_TURNAROUND} once artwork and quantities are approved. The clock starts at proof approval, not at the request — so getting artwork settled early is the fastest way to move a deadline up.`,
  },
  {
    id: "design",
    question: "What if I don't have a design?",
    answer:
      "Thread designs it for you. Come with a rough idea, a sketch, or nothing but a description, and you will get a concept back to react to. If you already have artwork, send it and Thread will prepare it for print.",
  },
  {
    id: "artwork",
    question: "How do I send my artwork?",
    answer:
      "Submit the order request first, and Thread will reply with an email address to send files to. Vector formats print best, but a high-resolution image works for most designs.",
  },
  {
    id: "printing",
    question: "Who actually prints the shirts?",
    answer:
      "Thread produces through a professional custom apparel supplier with commercial-grade equipment, which is what keeps quality consistent across a large run and reorders matching the original.",
  },
  {
    id: "shipping",
    question: "Do you ship?",
    answer:
      "Yes. Orders ship to you, sorted and packed by size. Shipping is quoted with the rest of the order so there is no surprise at the end.",
  },
  {
    id: "sizes",
    question: "What sizes are available?",
    answer:
      "S through 3XL across the line. Sizing stays consistent between styles, so a large in a tee matches a large in a hoodie.",
  },
  {
    id: "payment",
    question: "Am I paying anything by submitting this?",
    answer:
      "No. The request form takes no payment and no card details. It starts a conversation — you will get a written quote to approve before any money changes hands.",
  },
  {
    id: "reorder",
    question: "Can I reorder later?",
    answer:
      "Yes. Approved artwork stays on file, so a reorder matches the first run without redoing the design work.",
  },
];

export const threadGroupOrderInfo = {
  title: "Group & Bulk Orders",
  description:
    "Larger orders are quoted individually. Garment mix, print colors, placement count, and quantity all move the number, so a real conversation gets you a better price than a rate card would.",
  points: [
    "Sizes collected and sorted per person before delivery",
    "Names and numbers handled individually where you need them",
    "Consistent color matching across the full run",
    "Reorder pricing held so a second run matches the first",
  ],
  ctaLabel: "Contact Us for Group Pricing",
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getThreadProductById(id: string): ThreadProduct | undefined {
  return threadProducts.find((product) => product.id === id);
}

export function getThreadProductsByCategory(
  categoryId: string
): ThreadProduct[] {
  return threadProducts.filter((product) => product.categoryId === categoryId);
}

export function getFeaturedThreadProducts(): ThreadProduct[] {
  return threadProducts.filter((product) => product.featured);
}

export function getThreadCategoryById(
  id: string
): ThreadCategory | undefined {
  return threadCategories.find((category) => category.id === id);
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
 * Display price for a product. Returns THREAD_PRICE_LABEL while `priceCents`
 * is null, so setting a real price is the only change needed to show one.
 */
export function formatThreadPrice(product: ThreadProduct): string {
  if (product.priceCents === null) return THREAD_PRICE_LABEL;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: product.priceCents % 100 === 0 ? 0 : 2,
  }).format(product.priceCents / 100);
}
