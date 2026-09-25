import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { THREAD_PALETTE, threadCopy } from "@/data/thread";
import { ThreadReveal } from "@/components/thread/ThreadReveal";
import { ThreadHeroBackdrop } from "@/components/thread/ThreadHeroBackdrop";
import {
  threadPrimaryButtonClass,
  threadSecondaryButtonClass,
} from "@/components/thread/ThreadUI";

const { hero } = threadCopy;

export function ThreadHeroSection() {
  return (
    // `isolate` is load-bearing. Without a stacking context here, the -z-10
    // backdrop paints *behind* this section's own background rather than on
    // top of it, because position:relative with z-index:auto does not create
    // one. The backdrop would be in the markup but never visible.
    <section
      className="relative isolate overflow-hidden py-24 md:py-32"
      style={{ backgroundColor: THREAD_PALETTE.ink }}
    >
      <ThreadHeroBackdrop />

      <div className="section-container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Above the fold, so these resolve on mount rather than on scroll.
              Staggered top to bottom so the eye is led down to the CTAs. */}
          <div>
            <ThreadReveal>
              {/* A live claim, so it carries a live indicator. The dot is what
                  makes this read from across the hero — a hairline outline in
                  champagne on ink does not. */}
              <span className="thread-badge inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
                <span
                  className="thread-badge__dot h-1.5 w-1.5 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                {hero.badge}
              </span>
            </ThreadReveal>

            <ThreadReveal delay={80}>
              <h1
                className="heading-xl mt-6"
                style={{ color: THREAD_PALETTE.bone }}
              >
                {hero.title}
                <span
                  className="block"
                  style={{ color: THREAD_PALETTE.champagne }}
                >
                  {hero.titleAccent}
                </span>
              </h1>
            </ThreadReveal>

            <ThreadReveal delay={160}>
              <p
                className="mt-6 max-w-xl text-lg leading-relaxed"
                style={{ color: THREAD_PALETTE.muted }}
              >
                {hero.description}
              </p>
            </ThreadReveal>

            <ThreadReveal delay={240}>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#catalog"
                  className={threadPrimaryButtonClass}
                >
                  {hero.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#order-request"
                  className={threadSecondaryButtonClass}
                >
                  {hero.secondaryCta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </ThreadReveal>

            {/* Prices are quoted per order rather than listed, so this line
                stops the missing prices from reading as an oversight. */}
            <ThreadReveal delay={320}>
              <p
                className="mt-6 text-sm"
                style={{ color: THREAD_PALETTE.muted }}
              >
                {hero.note}
              </p>
            </ThreadReveal>
          </div>

          {/* The source PNG is square with the wordmark banded across the middle,
              so object-contain sizes it off this height until the column width
              takes over. Height is what makes the logo read larger. */}
          <div className="relative flex h-80 items-center justify-center md:h-[26rem] lg:h-[32rem]">
            {/* The artwork is a thin serif outline in a near-bone grey measured
                at roughly #BCBBB7, which is only a few steps off `muted`. The
                filter opens that gap: the shadows separate the strokes from the
                strands passing behind them, and the brightness lift carries the
                hairlines in the flourish.

                Two tight shadows rather than one wide one. A wide blur on a
                wordmark this broad merges into a rectangular plate behind the
                mark, which is visible against the strands. */}
            <Image
              src="/logos/thread-logo.png"
              alt="Thread T-Shirts logo"
              fill
              priority
              className="object-contain"
              style={{
                filter:
                  "brightness(1.16) contrast(1.06) drop-shadow(0 0 1.75rem rgba(11,11,11,0.95)) drop-shadow(0 0 0.4rem rgba(11,11,11,0.85))",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
