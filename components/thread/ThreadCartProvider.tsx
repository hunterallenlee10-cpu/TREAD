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
import type { ThreadCartItem } from "@/types";

/**
 * Holds the order request being assembled.
 *
 * This is not a shopping cart in the commerce sense — nothing here is priced,
 * reserved, or charged. It collects what the customer wants so the request form
 * can send it all at once, and the API route re-resolves every product against
 * the catalog before it reaches an inbox.
 */

const STORAGE_KEY = "thread-order-request-v1";

/** Kept in sync with the same limits enforced in app/api/thread-order/route.ts. */
const MAX_QUANTITY = 1000;
const MAX_LINES = 100;

interface ThreadCartContextValue {
  items: ThreadCartItem[];
  addItem: (item: Omit<ThreadCartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  totalPieces: number;
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
              .map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))
              .slice(0, MAX_LINES)
          );
        }
      }
    } catch {
      // A corrupt or blocked store isn't worth failing the page over — the
      // customer just starts with an empty request.
    }
    setHydrated(true);
  }, []);

  // Guarded on `hydrated`, otherwise the empty initial state would overwrite a
  // saved request on every page load before the read effect lands.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable. The in-memory request still works.
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

  const value = useMemo<ThreadCartContextValue>(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      totalPieces,
      isOpen,
      setOpen,
      hydrated,
    }),
    [items, addItem, updateQuantity, removeItem, clear, totalPieces, isOpen, hydrated]
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
