"use client";

import { useEffect } from "react";
import { clearSavedThreadCart } from "@/components/thread/ThreadCartProvider";

/**
 * Rendered only once the confirmation page has seen a paid session, so a
 * customer who backs out of Stripe still finds their cart waiting.
 */
export function ThreadClearCartOnMount() {
  useEffect(() => {
    clearSavedThreadCart();
  }, []);

  return null;
}
