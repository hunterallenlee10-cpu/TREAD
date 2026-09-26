"use client";

import {
  THREAD_PALETTE,
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

export function ThreadCatalogSection() {
  const { activeCategory, setActiveCategory } = useThreadCatalogFilter();

  const visible =
    activeCategory === ALL_CATEGORIES
      ? threadProducts
      : threadProducts.filter(
          (product) => product.categoryId === activeCategory
        );

  const filters = [
    { id: ALL_CATEGORIES, name: threadCopy.catalog.allLabel },
    ...threadCategories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
  ];

  return (
    <ThreadSection id="catalog">
      <div>
        <ThreadHeading
          eyebrow={threadCopy.catalog.eyebrow}
          title={threadCopy.catalog.title}
          description={threadCopy.catalog.description}
        />
      </div>

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

      <p
        className="mb-8 text-center text-sm"
        style={{ color: THREAD_PALETTE.muted }}
      >
        Showing {visible.length} of {threadProducts.length} pieces
      </p>

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
    </ThreadSection>
  );
}
