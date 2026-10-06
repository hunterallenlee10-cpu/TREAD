"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Check, ChevronDown, Minus, Plus } from "lucide-react";
import type { ThreadProduct } from "@/types";
import {
  THREAD_COMING_SOON_LABEL,
  THREAD_MAX_QUANTITY as MAX_QUANTITY,
  THREAD_PALETTE,
  formatThreadPrice,
  getThreadColors,
  getThreadSizes,
  isThreadPurchasable,
} from "@/data/thread";
import { useThreadCart } from "@/components/thread/ThreadCartProvider";
import {
  ThreadProductGallery,
  type ThreadGalleryView,
} from "@/components/thread/ThreadProductGallery";
import {
  threadCardStyle,
  threadPrimaryButtonClass,
} from "@/components/thread/ThreadUI";

const CARD_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/**
 * Front and back as two views, in catalog order rather than assumed order —
 * one listing leads with its back, and a card that calls that photo "Front"
 * is worse than one that says nothing at all.
 */
function galleryViews(product: ThreadProduct): ThreadGalleryView[] {
  const leadsWithBack = product.imageSide === "back";

  const views: ThreadGalleryView[] = [
    {
      src: product.image,
      alt: product.imageAlt,
      label: leadsWithBack ? "Back" : "Front",
    },
  ];

  if (product.imageBack) {
    views.push({
      src: product.imageBack,
      alt: product.imageBackAlt ?? "",
      label: leadsWithBack ? "Front" : "Back",
    });
  }

  return views;
}

/**
 * Matches the lift the brand-story and category cards already use. The hover
 * border rides a custom property so the champagne token stays the single
 * source of truth — Tailwind cannot read THREAD_PALETTE, and a `:hover` rule
 * cannot be expressed as an inline style.
 */
// h-full because the catalog's wrapper div is the grid item; without it the card
// stops stretching and the row loses its even bottom edge.
// Both border colours ride custom properties rather than the inline style that
// threadCardStyle would normally supply. An inline `borderColor` outranks every
// class, so a hover utility against it silently does nothing — the rule is
// generated, it just never wins. Declaring both as properties puts the resting
// and hover colours on equal footing, and keeps THREAD_PALETTE the source.
const CARD_CLASS =
  "group flex h-full flex-col overflow-hidden rounded-lg border [border-color:var(--thread-card-border)] transition-all duration-300 hover:-translate-y-1 hover:[border-color:var(--thread-card-border-hover)]";

const cardStyle: CSSProperties = {
  backgroundColor: threadCardStyle.backgroundColor,
  ["--thread-card-border" as string]: THREAD_PALETTE.border,
  ["--thread-card-border-hover" as string]: THREAD_PALETTE.champagne,
};

export function ThreadProductCard({ product }: { product: ThreadProduct }) {
  const { addItem } = useThreadCart();

  const colors = getThreadColors(product.colors);
  const sizes = getThreadSizes(product.sizes);

  const [colorId, setColorId] = useState(colors[0]?.id ?? "");
  // Deliberately unset. A defaulted size is the kind of thing someone misses
  // at checkout, and a wrong size costs a return.
  const [sizeId, setSizeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const needsSize = !sizeId;

  const handleAdd = () => {
    const color = colors.find((option) => option.id === colorId);
    const size = sizes.find((option) => option.id === sizeId);
    // Checkout refuses a line without a real color and size, so one is never
    // added to the cart.
    if (!color || !size) return;

    addItem({
      productId: product.id,
      productName: product.name,
      colorId: color.id,
      colorName: color.name,
      sizeId: size.id,
      sizeLabel: size.label,
      quantity,
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  const adjust = (delta: number) =>
    setQuantity((current) =>
      Math.min(MAX_QUANTITY, Math.max(1, current + delta))
    );

  // Nothing to configure or add yet, so the placeholder stops at the name.
  // Rendering the swatches and a cart button would invite an order for a line
  // that does not exist. A piece with no price lands here too, since checkout
  // would refuse it (`isThreadPurchasable`).
  //
  // A product whose name IS the label — a piece with nothing announced yet,
  // not even what it is — gets the heading alone. Repeating the status
  // underneath it would read as a rendering bug rather than a placeholder.
  if (!isThreadPurchasable(product)) {
    const nameIsStatus = product.name === THREAD_COMING_SOON_LABEL;

    return (
      <div className={CARD_CLASS} style={cardStyle}>
        <div
          className="relative aspect-square w-full"
          style={{ backgroundColor: THREAD_PALETTE.ink }}
        >
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes={CARD_IMAGE_SIZES}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3
            className="text-lg font-bold"
            style={{ color: THREAD_PALETTE.bone }}
          >
            {product.name}
          </h3>
          {!nameIsStatus && (
            <p
              className="mt-1 text-sm font-semibold"
              style={{ color: THREAD_PALETTE.champagne }}
            >
              {THREAD_COMING_SOON_LABEL}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={CARD_CLASS} style={cardStyle}>
      {/*
       * Both sides are reachable by swipe, tap, arrow, and dot — a phone has no
       * hover, and the back is where half of these pieces carry their print.
       * Mouse hover still peeks at the second view, so the desktop card behaves
       * as it did until the reader takes hold of it.
       */}
      <ThreadProductGallery
        views={galleryViews(product)}
        sizes={CARD_IMAGE_SIZES}
        name={product.name}
      />

      <div className="flex flex-1 flex-col p-6">
        <h3
          className="text-lg font-bold"
          style={{ color: THREAD_PALETTE.bone }}
        >
          {product.name}
        </h3>
        <p
          className="mt-1 text-sm"
          style={{ color: THREAD_PALETTE.champagne }}
        >
          {product.tagline}
        </p>

        <p
          className="mt-4 text-sm leading-relaxed"
          style={{ color: THREAD_PALETTE.muted }}
        >
          {product.description}
        </p>

        <p
          className="mt-4 text-sm font-semibold"
          style={{ color: THREAD_PALETTE.bone }}
        >
          {formatThreadPrice(product)}
        </p>

        {colors.length > 0 && (
          <fieldset className="mt-6">
            <legend
              className="mb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: THREAD_PALETTE.muted }}
            >
              Color
            </legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const selected = color.id === colorId;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setColorId(color.id)}
                    title={color.name}
                    aria-label={color.name}
                    aria-pressed={selected}
                    className="thread-swatch h-8 w-8 rounded-full"
                    style={{ backgroundColor: color.hex }}
                  />
                );
              })}
            </div>
          </fieldset>
        )}

        {sizes.length > 0 && (
          <fieldset className="mt-5">
            <legend
              className="mb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: THREAD_PALETTE.muted }}
            >
              Size
            </legend>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const selected = size.id === sizeId;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSizeId(size.id)}
                    aria-pressed={selected}
                    className="thread-toggle min-w-11 rounded-md px-3 py-1.5 text-sm font-semibold"
                  >
                    {size.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="mt-5">
          <span
            className="mb-2 block text-xs font-semibold uppercase tracking-wider"
            style={{ color: THREAD_PALETTE.muted }}
          >
            Quantity
          </span>
          <div className="thread-stepper inline-flex items-center overflow-hidden rounded-md">
            <button
              type="button"
              onClick={() => adjust(-1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="thread-stepper__button self-stretch px-3 py-2"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              max={MAX_QUANTITY}
              value={quantity}
              onChange={(event) => {
                const next = Number(event.target.value);
                setQuantity(
                  Number.isFinite(next)
                    ? Math.min(MAX_QUANTITY, Math.max(1, Math.round(next)))
                    : 1
                );
              }}
              aria-label={`Quantity of ${product.name}`}
              className="w-16 bg-transparent py-2 text-center font-semibold focus:outline-none"
              style={{ color: THREAD_PALETTE.bone }}
            />
            <button
              type="button"
              onClick={() => adjust(1)}
              disabled={quantity >= MAX_QUANTITY}
              aria-label="Increase quantity"
              className="thread-stepper__button self-stretch px-3 py-2"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex-1" />

        <button
          type="button"
          onClick={handleAdd}
          disabled={needsSize}
          className={`${threadPrimaryButtonClass} w-full`}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added to Cart
            </>
          ) : (
            "Add to Cart"
          )}
        </button>

        {needsSize && (
          <p
            className="mt-2 text-center text-xs"
            style={{ color: THREAD_PALETTE.muted }}
          >
            Choose a size to continue
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowDetails((open) => !open)}
          aria-expanded={showDetails}
          className="mt-4 inline-flex items-center justify-center gap-1 text-sm font-semibold"
          style={{ color: THREAD_PALETTE.champagne }}
        >
          Product details
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </button>

        {showDetails && (
          <dl
            className="mt-4 space-y-3 border-t pt-4 text-sm"
            style={{ borderColor: THREAD_PALETTE.border }}
          >
            <div>
              <dt
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: THREAD_PALETTE.muted }}
              >
                Fabric
              </dt>
              <dd style={{ color: THREAD_PALETTE.bone }}>{product.fabric}</dd>
            </div>
            <div>
              <dt
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: THREAD_PALETTE.muted }}
              >
                Fit
              </dt>
              <dd style={{ color: THREAD_PALETTE.bone }}>{product.fit}</dd>
            </div>
            <div>
              <dt
                className="mb-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: THREAD_PALETTE.muted }}
              >
                Details
              </dt>
              <dd>
                <ul className="space-y-1.5">
                  {product.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex gap-2"
                      style={{ color: THREAD_PALETTE.muted }}
                    >
                      <span style={{ color: THREAD_PALETTE.champagne }}>—</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
