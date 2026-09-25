"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  THREAD_PALETTE,
  formatThreadPrice,
  getFeaturedThreadProducts,
  threadCopy,
} from "@/data/thread";
import { useThreadCatalogFilter } from "@/components/thread/ThreadCatalogFilterProvider";
import {
  ThreadHeading,
  ThreadSection,
} from "@/components/thread/ThreadUI";

const featured = getFeaturedThreadProducts();

/**
 * A showcase, not a second storefront. Cards here are deliberately compact and
 * send you to the catalog to configure — duplicating the color, size, and
 * quantity controls would put the same product on the page twice with two sets
 * of state that can disagree.
 */
export function ThreadFeaturedSection() {
  const { selectAndScroll } = useThreadCatalogFilter();

  return (
    <ThreadSection>
      <ThreadHeading
        eyebrow={threadCopy.featured.eyebrow}
        title={threadCopy.featured.title}
        description={threadCopy.featured.description}
      />

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
        {featured.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => selectAndScroll(product.categoryId)}
            className="thread-card thread-card--link group flex flex-col overflow-hidden rounded-lg text-left"
          >
            <div
              className="relative aspect-square w-full"
              style={{ backgroundColor: THREAD_PALETTE.ink }}
            >
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                sizes="(max-width: 1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3
                className="text-sm font-bold"
                style={{ color: THREAD_PALETTE.bone }}
              >
                {product.name}
              </h3>
              <p
                className="mt-1 flex-1 text-xs leading-relaxed"
                style={{ color: THREAD_PALETTE.muted }}
              >
                {product.tagline}
              </p>
              <span
                className="mt-3 text-xs font-semibold"
                style={{ color: THREAD_PALETTE.champagne }}
              >
                {formatThreadPrice(product)}
              </span>
              <span
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: THREAD_PALETTE.bone }}
              >
                Configure
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </ThreadSection>
  );
}
