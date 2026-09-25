"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { THREAD_PALETTE, threadCategories, threadCopy } from "@/data/thread";
import { useThreadCatalogFilter } from "@/components/thread/ThreadCatalogFilterProvider";
import {
  ThreadHeading,
  ThreadSection,
} from "@/components/thread/ThreadUI";

/** Doubles as the catalog's filter control — picking one scrolls to the grid. */
export function ThreadCategoriesSection() {
  const { selectAndScroll } = useThreadCatalogFilter();

  return (
    <ThreadSection alt>
      <ThreadHeading
        eyebrow={threadCopy.categories.eyebrow}
        title={threadCopy.categories.title}
        description={threadCopy.categories.description}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {threadCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => selectAndScroll(category.id)}
            className="thread-card thread-card--link group flex flex-col overflow-hidden rounded-lg text-left"
          >
            <div
              className="relative aspect-[4/3] w-full"
              style={{ backgroundColor: THREAD_PALETTE.ink }}
            >
              <Image
                src={category.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3
                className="text-lg font-bold"
                style={{ color: THREAD_PALETTE.bone }}
              >
                {category.name}
              </h3>
              <p
                className="mt-2 flex-1 text-sm leading-relaxed"
                style={{ color: THREAD_PALETTE.muted }}
              >
                {category.blurb}
              </p>
              <span
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: THREAD_PALETTE.champagne }}
              >
                View pieces
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </ThreadSection>
  );
}
