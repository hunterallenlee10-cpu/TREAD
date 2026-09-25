"use client";

import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { THREAD_PALETTE } from "@/data/thread";
import { useThreadCart } from "@/components/thread/ThreadCartProvider";
import {
  threadPrimaryButtonClass,
} from "@/components/thread/ThreadUI";

export function ThreadCartDrawer() {
  const {
    items,
    updateQuantity,
    removeItem,
    totalPieces,
    isOpen,
    setOpen,
    hydrated,
  } = useThreadCart();

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setOpen]);

  const goToForm = () => {
    setOpen(false);
    document
      .getElementById("order-request")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          aria-label={`Your request — ${totalPieces} ${
            totalPieces === 1 ? "piece" : "pieces"
          }. Review and send.`}
          className="thread-cart-trigger fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full px-5 py-3 font-semibold transition-transform duration-200 hover:scale-105"
        >
          {/* Keyed on the count so adding a second piece remounts it and the
              ring fires again. Keying the button itself would remount the
              control and drop focus out from under anyone using the keyboard. */}
          <span key={totalPieces} className="thread-cart-trigger__ring" />
          <ShoppingBag className="h-5 w-5" />
          <span>Your Request</span>
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
            aria-label="Your order request"
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
                Your Request · {totalPieces}{" "}
                {totalPieces === 1 ? "piece" : "pieces"}
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
                  {items.map((item) => (
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

                      <div
                        className="mt-3 inline-flex items-center rounded-md border"
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
                          aria-label="Increase quantity"
                          className="px-3 py-1.5"
                          style={{ color: THREAD_PALETTE.bone }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer
              className="border-t px-6 py-5"
              style={{ borderColor: THREAD_PALETTE.border }}
            >
              <p
                className="mb-4 text-xs"
                style={{ color: THREAD_PALETTE.muted }}
              >
                No payment is taken. You will get a written quote to approve
                first.
              </p>

              <button
                type="button"
                onClick={goToForm}
                disabled={items.length === 0}
                className={`${threadPrimaryButtonClass} w-full`}
              >
                Review &amp; Send Request
              </button>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
