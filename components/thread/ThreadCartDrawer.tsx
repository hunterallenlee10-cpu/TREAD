"use client";

import { useEffect, useState } from "react";
import { Lock, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  THREAD_MAX_QUANTITY,
  THREAD_PALETTE,
  formatThreadCents,
  getThreadProductById,
} from "@/data/thread";
import { useThreadCart } from "@/components/thread/ThreadCartProvider";
import {
  threadPrimaryButtonClass,
} from "@/components/thread/ThreadUI";

/**
 * What the customer reads when checkout cannot start, keyed by the `code` the
 * route returns. Anything unlisted falls back to the generic line.
 */
const checkoutErrors: Record<string, string> = {
  invalid_item:
    "Something in your cart is no longer available as picked. Remove it and try again.",
  payments_not_configured:
    "Checkout isn't switched on yet. Please try again later.",
};
const genericCheckoutError =
  "Checkout couldn't start. Please try again in a moment.";

export function ThreadCartDrawer() {
  const {
    items,
    updateQuantity,
    removeItem,
    totalPieces,
    subtotalCents,
    isOpen,
    setOpen,
    hydrated,
  } = useThreadCart();

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setOpen]);

  // Sends ids and quantities only. The route prices everything from the
  // catalog, so nothing here — including the subtotal shown — is trusted.
  const checkout = async () => {
    setCheckingOut(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            colorId: item.colorId,
            sizeId: item.sizeId,
            quantity: item.quantity,
          })),
        }),
      });
      const data: { url?: string; code?: string } = await response
        .json()
        .catch(() => ({}));

      if (response.ok && data.url) {
        // Left in the "checking out" state on purpose: the page is about to
        // unload, and re-enabling the button would invite a second session.
        window.location.assign(data.url);
        return;
      }

      setCheckoutError(
        (data.code && checkoutErrors[data.code]) || genericCheckoutError
      );
    } catch {
      setCheckoutError(genericCheckoutError);
    }
    setCheckingOut(false);
  };

  // Rendered only after hydration so the piece count never flashes a stale
  // zero on load, and only when there is something to show.
  const showTrigger = hydrated && items.length > 0;

  return (
    <>
      {showTrigger && !isOpen && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Your cart — ${totalPieces} ${
            totalPieces === 1 ? "item" : "items"
          }. Review and check out.`}
          className="thread-cart-trigger fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full px-5 py-3 font-semibold transition-transform duration-200 hover:scale-105"
        >
          {/* Keyed on the count so adding a second piece remounts it and the
              ring fires again. Keying the button itself would remount the
              control and drop focus out from under anyone using the keyboard. */}
          <span key={totalPieces} className="thread-cart-trigger__ring" />
          <ShoppingBag className="h-5 w-5" />
          <span>Your Cart</span>
          <span
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold"
            style={{
              backgroundColor: THREAD_PALETTE.ink,
              color: THREAD_PALETTE.bone,
            }}
          >
            {totalPieces}
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            className="relative flex h-full w-full max-w-md flex-col border-l shadow-2xl"
            style={{
              backgroundColor: THREAD_PALETTE.charcoal,
              borderColor: THREAD_PALETTE.border,
            }}
          >
            <header
              className="flex items-center justify-between border-b px-6 py-5"
              style={{ borderColor: THREAD_PALETTE.border }}
            >
              <h2
                className="text-lg font-bold"
                style={{ color: THREAD_PALETTE.bone }}
              >
                Your Cart · {totalPieces}{" "}
                {totalPieces === 1 ? "item" : "items"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{ color: THREAD_PALETTE.muted }}
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <p style={{ color: THREAD_PALETTE.muted }}>
                  Nothing added yet. Pick a piece from the collection to start.
                </p>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => {
                    const unitCents =
                      getThreadProductById(item.productId)?.priceCents ?? 0;

                    return (
                      <li
                        key={item.key}
                        className="border-b pb-5 last:border-b-0"
                        style={{ borderColor: THREAD_PALETTE.border }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: THREAD_PALETTE.bone }}
                            >
                              {item.productName}
                            </p>
                            <p
                              className="mt-1 text-sm"
                              style={{ color: THREAD_PALETTE.muted }}
                            >
                              {item.colorName} · {item.sizeLabel}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            aria-label={`Remove ${item.productName}`}
                            style={{ color: THREAD_PALETTE.muted }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div
                            className="inline-flex items-center rounded-md border"
                            style={{ borderColor: THREAD_PALETTE.border }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                              className="px-3 py-1.5 disabled:opacity-30"
                              style={{ color: THREAD_PALETTE.bone }}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span
                              className="w-12 text-center text-sm font-semibold"
                              style={{ color: THREAD_PALETTE.bone }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.key, item.quantity + 1)
                              }
                              disabled={item.quantity >= THREAD_MAX_QUANTITY}
                              aria-label="Increase quantity"
                              className="px-3 py-1.5 disabled:opacity-30"
                              style={{ color: THREAD_PALETTE.bone }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p
                            className="text-sm font-semibold tabular-nums"
                            style={{ color: THREAD_PALETTE.bone }}
                          >
                            {formatThreadCents(unitCents * item.quantity)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <footer
              className="border-t px-6 py-5"
              style={{ borderColor: THREAD_PALETTE.border }}
            >
              <dl className="mb-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt style={{ color: THREAD_PALETTE.muted }}>Subtotal</dt>
                  <dd
                    className="font-semibold tabular-nums"
                    style={{ color: THREAD_PALETTE.bone }}
                  >
                    {formatThreadCents(subtotalCents)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: THREAD_PALETTE.muted }}>Shipping</dt>
                  <dd style={{ color: THREAD_PALETTE.bone }}>Free</dd>
                </div>
              </dl>

              {checkoutError && (
                <p
                  role="alert"
                  className="mb-4 text-sm"
                  style={{ color: THREAD_PALETTE.bone }}
                >
                  {checkoutError}
                </p>
              )}

              <button
                type="button"
                onClick={checkout}
                disabled={items.length === 0 || checkingOut}
                className={`${threadPrimaryButtonClass} w-full`}
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                {checkingOut ? "Opening Checkout…" : "Checkout"}
              </button>

              <p
                className="mt-3 text-center text-xs"
                style={{ color: THREAD_PALETTE.muted }}
              >
                Secure checkout by Stripe.
              </p>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
