"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  THREAD_MAX_LINES as MAX_LINES,
  THREAD_MAX_QUANTITY as MAX_QUANTITY,
  getThreadProductById,
  isThreadPurchasable,
} from "@/data/thread";
import type { ThreadCartItem } from "@/types";

/**
 * The shopping cart.
 *
 * Lines hold ids and labels, never prices: `subtotalCents` looks each price up
 * in the catalog on every render, so a price change in data/thread.ts shows in
 * carts that were filled before it. What the customer is charged is decided
 * separately, on the server, by app/api/checkout — this subtotal is for
 * display.
 */

/**
 * v2 since checkout. v1 held order requests, which could include pieces that
 * are not for sale; starting fresh is simpler than migrating a quote list
 * into a cart.
 */
const STORAGE_KEY = "thread-cart-v2";

/**
 * Empties the saved cart without needing the provider mounted — the order
 * confirmation page has no cart of its own, and the customer arrives there
 * straight from Stripe.
 */
export function clearSavedThreadCart(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked. Nothing was saved, so there is nothing to clear.
  }
}

interface ThreadCartContextValue {
  items: ThreadCartItem[];
  addItem: (item: Omit<ThreadCartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  totalPieces: number;
  /** Display only. The checkout route prices the order itself. */
  subtotalCents: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  /** False until localStorage has been read, so counts don't flash on load. */
  hydrated: boolean;
}

const ThreadCartContext = createContext<ThreadCartContextValue | null>(null);

/** Variant identity. Two different sizes of one shirt are two separate lines. */
export function buildCartKey(
  productId: string,
  colorId: string,
  sizeId: string
): string {
  return `${productId}:${colorId}:${sizeId}`;
}

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)));
}

/** The line's product, if it is still for sale. */
function purchasableProduct(item: ThreadCartItem) {
  const product = getThreadProductById(item.productId);
  return product && isThreadPurchasable(product) ? product : undefined;
}

/**
 * Whether a saved line can still be bought exactly as saved. A product taken
 * off sale, or a color or size it no longer runs, would only fail at checkout,
 * so the line is dropped on load instead.
 */
function isStillAvailable(item: ThreadCartItem): boolean {
  const product = purchasableProduct(item);
  return Boolean(
    product &&
      product.colors.includes(item.colorId) &&
      product.sizes.includes(item.sizeId)
  );
}

/** Guards against a hand-edited or stale localStorage payload. */
function isCartItem(value: unknown): value is ThreadCartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.key === "string" &&
    typeof item.productId === "string" &&
    typeof item.productName === "string" &&
    typeof item.colorId === "string" &&
    typeof item.colorName === "string" &&
    typeof item.sizeId === "string" &&
    typeof item.sizeLabel === "string" &&
    typeof item.quantity === "number"
  );
}

export function ThreadCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ThreadCartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read after mount, never during render. Reading localStorage while
  // rendering makes the server and client produce different HTML, which React
  // reports as a hydration error on first paint.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Deliberate: the mount-time render this triggers is exactly how the
          // hydration mismatch described above is avoided.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(
            parsed
              .filter(isCartItem)
              .filter(isStillAvailable)
              .map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))
              .slice(0, MAX_LINES)
          );
        }
      }
    } catch {
      // A corrupt or blocked store isn't worth failing the page over — the
      // customer just starts with an empty cart.
    }
    setHydrated(true);
  }, []);

  // Guarded on `hydrated`, otherwise the empty initial state would overwrite a
  // saved cart on every page load before the read effect lands.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable. The in-memory cart still works.
    }
  }, [items, hydrated]);

  const addItem = useCallback((incoming: Omit<ThreadCartItem, "key">) => {
    const key = buildCartKey(
      incoming.productId,
      incoming.colorId,
      incoming.sizeId
    );

    setItems((current) => {
      const existing = current.find((item) => item.key === key);

      if (existing) {
        return current.map((item) =>
          item.key === key
            ? { ...item, quantity: clampQuantity(item.quantity + incoming.quantity) }
            : item
        );
      }

      if (current.length >= MAX_LINES) return current;

      return [
        ...current,
        { ...incoming, key, quantity: clampQuantity(incoming.quantity) },
      ];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.key === key ? { ...item, quantity: clampQuantity(quantity) } : item
      )
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalPieces = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotalCents = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (purchasableProduct(item)?.priceCents ?? 0) * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo<ThreadCartContextValue>(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      totalPieces,
      subtotalCents,
      isOpen,
      setOpen,
      hydrated,
    }),
    [
      items,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      totalPieces,
      subtotalCents,
      isOpen,
      hydrated,
    ]
  );

  return (
    <ThreadCartContext.Provider value={value}>
      {children}
    </ThreadCartContext.Provider>
  );
}

export function useThreadCart(): ThreadCartContextValue {
  const context = useContext(ThreadCartContext);
  if (!context) {
    throw new Error("useThreadCart must be used inside a ThreadCartProvider");
  }
  return context;
}
