// ---------------------------------------------------------------------------
// Thread T-Shirts
//
// Content for these lives in data/thread.ts. Part of the catalog is still
// "Coming soon" placeholder inventory — see that file's header before editing.
// ---------------------------------------------------------------------------

export interface ThreadSize {
  id: string;
  label: string;
}

export interface ThreadColorOption {
  id: string;
  name: string;
  /** Approximate swatch color for the UI dot. Decoration, not a fabric spec. */
  hex: string;
}

export interface ThreadCategory {
  id: string;
  name: string;
  blurb: string;
  image: string;
}

export interface ThreadProduct {
  id: string;
  name: string;
  categoryId: string;
  tagline: string;
  description: string;
  fabric: string;
  fit: string;
  /** Spec bullets shown in the product detail panel. */
  details: string[];
  image: string;
  imageAlt: string;
  /**
   * The garment's other side, for pieces photographed from both. When set, the
   * catalog card becomes a two-view gallery — swipe, tap, arrow, or dot, with
   * mouse hover peeking at it as before. When omitted the card renders the one
   * photo and no controls.
   *
   * Reachable on every device now, so it can carry detail a buyer needs rather
   * than only a second look. `details` is still the place for anything that has
   * to be readable without looking at a photograph at all.
   */
  imageBack?: string;
  /** Alt text for `imageBack`. Required whenever that is set. */
  imageBackAlt?: string;
  /**
   * Which side `image` shows. Defaults to the front. Set to "back" for a piece
   * that leads with its reverse — the gallery names its views from this, and a
   * control labelled "Front" that shows the back is worse than no label.
   */
  imageSide?: "front" | "back";
  /** Keys into THREAD_COLORS. Checkout accepts only these. */
  colors: string[];
  /** Keys into THREAD_SIZES. Checkout accepts only these. */
  sizes: string[];
  /**
   * Price in CENTS, or null to render "Price coming soon" and keep the product
   * out of the cart. Never store dollars here — checkout sends this number to
   * Stripe as the unit amount.
   */
  priceCents: number | null;
  featured: boolean;
  /**
   * Placeholder for a line that is not orderable yet. The card renders name and
   * a "Coming soon" line only — no colors, sizes, quantity, or cart button,
   * since there is nothing to configure or buy.
   */
  comingSoon?: boolean;
}

export interface ThreadQualityPillar {
  id: string;
  title: string;
  description: string;
}

export interface ThreadFaq {
  id: string;
  question: string;
  answer: string;
}

/** One configured line in the cart. Prices are looked up, never stored. */
export interface ThreadCartItem {
  /** `${productId}:${colorId}:${sizeId}` — the variant identity. */
  key: string;
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  sizeId: string;
  sizeLabel: string;
  quantity: number;
}
