import type Stripe from "stripe";

import {
  THREAD_MAX_LINES,
  THREAD_MAX_QUANTITY,
  getThreadColors,
  getThreadProductById,
  getThreadSizes,
  isThreadPurchasable,
} from "@/data/thread";

/**
 * Turns what the browser posts into Stripe line items, using nothing from the
 * browser but ids and a quantity.
 *
 * This is the rule docs/THREAD.md §1 set before checkout existed: prices
 * resolve on the server from the catalog. The cart in localStorage is entirely
 * under the customer's control, so a price, a name, or a label in the payload
 * is ignored rather than trusted — only `productId`, `colorId`, `sizeId`, and
 * `quantity` are read, and each id must name something the product actually
 * offers.
 *
 * Kept free of any Stripe client so it can be exercised without a key.
 */

export interface CheckoutRequestItem {
  productId?: unknown;
  colorId?: unknown;
  sizeId?: unknown;
  quantity?: unknown;
}

export type CheckoutResolution =
  | {
      ok: true;
      lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
      subtotalCents: number;
      totalPieces: number;
    }
  | {
      ok: false;
      code: "empty_cart" | "too_many_lines" | "invalid_item";
      /** Zero-based positions of the rejected lines, for `invalid_item`. */
      invalidIndexes?: number[];
    };

interface ResolvedLine {
  productId: string;
  colorId: string;
  sizeId: string;
  name: string;
  unitAmount: number;
  image: string;
  quantity: number;
}

function parseQuantity(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 1 || value > THREAD_MAX_QUANTITY) return null;
  return value;
}

function resolveLine(item: CheckoutRequestItem): ResolvedLine | null {
  if (
    typeof item.productId !== "string" ||
    typeof item.colorId !== "string" ||
    typeof item.sizeId !== "string"
  ) {
    return null;
  }

  const product = getThreadProductById(item.productId);
  if (!product || !isThreadPurchasable(product) || product.priceCents === null) {
    return null;
  }

  const color = getThreadColors(product.colors).find(
    (option) => option.id === item.colorId
  );
  const size = getThreadSizes(product.sizes).find(
    (option) => option.id === item.sizeId
  );
  const quantity = parseQuantity(item.quantity);
  if (!color || !size || quantity === null) return null;

  return {
    productId: product.id,
    colorId: color.id,
    sizeId: size.id,
    name: `${product.name} — ${color.name} / ${size.label}`,
    unitAmount: product.priceCents,
    image: product.image,
    quantity,
  };
}

/**
 * `siteUrl` makes product photos absolute for the Checkout page. Images are
 * only sent over https: Stripe fetches them itself, so a localhost URL would
 * show a broken image at best.
 */
export function resolveCheckoutLines(
  items: unknown,
  siteUrl: string
): CheckoutResolution {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, code: "empty_cart" };
  }
  if (items.length > THREAD_MAX_LINES) {
    return { ok: false, code: "too_many_lines" };
  }

  const merged = new Map<string, ResolvedLine>();
  const invalidIndexes: number[] = [];

  items.forEach((raw, index) => {
    const line =
      typeof raw === "object" && raw !== null
        ? resolveLine(raw as CheckoutRequestItem)
        : null;

    if (!line) {
      invalidIndexes.push(index);
      return;
    }

    // The cart never produces two lines for one variant, but a hand-built
    // payload can. Merged, the per-line cap still applies to the total.
    const key = `${line.productId}:${line.colorId}:${line.sizeId}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += line.quantity;
      if (existing.quantity > THREAD_MAX_QUANTITY) invalidIndexes.push(index);
    } else {
      merged.set(key, line);
    }
  });

  // All or nothing. A cart the browser validated never gets here with a bad
  // line, so one that does is stale or edited, and charging for part of it
  // would be a surprise either way.
  if (invalidIndexes.length > 0) {
    return { ok: false, code: "invalid_item", invalidIndexes };
  }

  const sendImages = siteUrl.startsWith("https://");
  let subtotalCents = 0;
  let totalPieces = 0;

  const lineItems = [...merged.values()].map(
    (line): Stripe.Checkout.SessionCreateParams.LineItem => {
      subtotalCents += line.unitAmount * line.quantity;
      totalPieces += line.quantity;

      return {
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: line.unitAmount,
          product_data: {
            name: line.name,
            ...(sendImages ? { images: [`${siteUrl}${line.image}`] } : {}),
            metadata: {
              productId: line.productId,
              colorId: line.colorId,
              sizeId: line.sizeId,
            },
          },
        },
      };
    }
  );

  return { ok: true, lineItems, subtotalCents, totalPieces };
}
