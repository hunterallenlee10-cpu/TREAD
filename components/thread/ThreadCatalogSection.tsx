"use client";

import {
  THREAD_PALETTE,
  isThreadPurchasable,
  threadCategories,
  threadCopy,
  threadProducts,
} from "@/data/thread";
import {
  ALL_CATEGORIES,
  useThreadCatalogFilter,
} from "@/components/thread/ThreadCatalogFilterProvider";
import { ThreadProductCard } from "@/components/thread/ThreadProductCard";
import { ThreadHeading, ThreadSection } from "@/components/thread/ThreadUI";

/**
 * Only pieces that can be bought are listed. The "Coming soon" entries stay in
 * data/thread.ts so launching one is a data edit, but a grid of empty
 * placeholder cards reads as a demo, so they stay off the page until then.
 * One line under the grid says what is on the way instead.
 */
const forSale = threadProducts.filter(isThreadPurchasable);

/** Categories with something in them. A filter that empties the grid is a dead end. */
const stockedCategories = threadCategories.filter((category) =>
  forSale.some((product) => product.categoryId === category.id)
);

export function ThreadCatalogSection() {
  const { activeCategory, setActiveCategory } = useThreadCatalogFilter();

  const visible =
    activeCategory === ALL_CATEGORIES
      ? forSale
      : forSale.filter((product) => product.categoryId === activeCategory);

  // With one stocked category, "All" and that category are the same list,
  // so the filter row is hidden until there is a second one.
  const filters =
    stockedCategories.length > 1
      ? [
          { id: ALL_CATEGORIES, name: threadCopy.catalog.allLabel },
          ...stockedCategories.map((category) => ({
            id: category.id,
            name: category.name,
          })),
        ]
      : [];

  return (
    <ThreadSection id="catalog">
      <div>
        <ThreadHeading
          eyebrow={threadCopy.catalog.eyebrow}
          title={threadCopy.catalog.title}
          description={threadCopy.catalog.description}
        />
      </div>

      {filters.length > 0 && (
        <div
          className="mb-10 flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Filter products by category"
        >
          {filters.map((filter) => {
            const selected = filter.id === activeCategory;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveCategory(filter.id)}
                aria-pressed={selected}
                className="thread-toggle rounded-full px-4 py-2 text-sm font-semibold"
              >
                {filter.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((product) => (
          // Keyed by product id, so switching category remounts these and the
          // incoming set fades in rather than snapping into place.
          <div
            key={product.id}
            className="h-full"
          >
            <ThreadProductCard product={product} />
          </div>
        ))}
      </div>

      <p
        className="mt-12 text-center text-sm"
        style={{ color: THREAD_PALETTE.muted }}
      >
        {threadCopy.catalog.comingNext}
      </p>
    </ThreadSection>
  );
}
