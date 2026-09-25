"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Shares the active category between the categories section and the catalog
 * grid, which are separate sections of the page. Clicking a category card
 * filters the grid below it and scrolls there.
 */

export const ALL_CATEGORIES = "all";

interface ThreadCatalogFilterValue {
  activeCategory: string;
  setActiveCategory: (categoryId: string) => void;
  /** Sets the filter and scrolls the catalog into view. */
  selectAndScroll: (categoryId: string) => void;
}

const ThreadCatalogFilterContext =
  createContext<ThreadCatalogFilterValue | null>(null);

export function ThreadCatalogFilterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);

  const selectAndScroll = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    document
      .getElementById("catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = useMemo(
    () => ({ activeCategory, setActiveCategory, selectAndScroll }),
    [activeCategory, selectAndScroll]
  );

  return (
    <ThreadCatalogFilterContext.Provider value={value}>
      {children}
    </ThreadCatalogFilterContext.Provider>
  );
}

export function useThreadCatalogFilter(): ThreadCatalogFilterValue {
  const context = useContext(ThreadCatalogFilterContext);
  if (!context) {
    throw new Error(
      "useThreadCatalogFilter must be used inside a ThreadCatalogFilterProvider"
    );
  }
  return context;
}
