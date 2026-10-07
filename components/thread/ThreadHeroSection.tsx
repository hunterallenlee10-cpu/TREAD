import { ArrowRight } from "lucide-react";
import {
  formatThreadCents,
  getThreadLowestPriceCents,
  splitThreadAccent,
  THREAD_PALETTE,
  threadCopy,
} from "@/data/thread";
import { displayFont } from "@/lib/fonts";
import { ThreadHeroBackdrop } from "@/components/thread/ThreadHeroBackdrop";
import { threadAccentButtonClass } from "@/components/thread/ThreadUI";

const { hero } = threadCopy;

/**
 * Keyframes live beside the markup that uses them and carry a `thread-hero-`
 * prefix, the same convention as the rest of the site's page-scoped styles.
 *
 * The headline lines slide up from under their own clip rather than fading in.
 * Nothing starts at opacity 0, so the h1 — the largest thing on the page — is
 * painted from the first frame.
 *
 * The strip is two identical runs side by side; moving the pair by half its
 * width lands the second run exactly where the first began, so the loop has no
 * seam.
 */
const css = `
@keyframes thread-hero-line-up {
  from { transform: translateY(105%); }
  to   { transform: translateY(0); }
}
@keyframes thread-hero-rise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
@keyframes thread-hero-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.thread-hero__line > span {
  animation: thread-hero-line-up 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.thread-hero__aside {
  animation: thread-hero-rise 0.9s 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.thread-hero__track {
  animation: thread-hero-marquee 38s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .thread-hero__line > span,
  .thread-hero__aside,
  .thread-hero__track { animation: none; }
}
`;

export function ThreadHeroSection() {
  const lowest = getThreadLowestPriceCents();
  const priceNote =
    lowest === null
      ? "Free shipping on every order"
      : `From ${formatThreadCents(lowest)} · Free shipping on every order`;

  return (
    // `isolate` is load-bearing. Without a stacking context here, the -z-10
    // backdrop paints *behind* this section's own background rather than on
    // top of it, because position:relative with z-index:auto does not create
    // one. The backdrop would be in the markup but never visible.
    //
    // The height is the viewport less the fixed 80px header, so the strip
    // along the foot sits on the fold.
    <section
      className="relative isolate flex min-h-[calc(100svh-5rem)] flex-col overflow-hidden"
      style={{ backgroundColor: THREAD_PALETTE.ink }}
    >
      <style>{css}</style>
      <ThreadHeroBackdrop />

      <div className="section-container flex w-full flex-1 items-center py-16 md:py-20">
        <div className="grid w-full grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-12">
          <div>
            <p
              className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: THREAD_PALETTE.champagne }}
            >
              <span
                className="h-px w-8"
                style={{ backgroundColor: THREAD_PALETTE.champagne }}
                aria-hidden="true"
              />
              {hero.eyebrow}
            </p>

            <h1
              className={`${displayFont.className} mt-6 font-bold uppercase leading-[0.9] tracking-[-0.01em]`}
              style={{
                color: THREAD_PALETTE.bone,
                fontSize: "clamp(3.75rem, 10.5vw, 10.75rem)",
              }}
            >
              {hero.titleLines.map((line, i) => {
                const part = splitThreadAccent(line, hero.titleAccent);
                return (
                  // The space keeps the lines apart in the accessible name;
                  // the block spans put each one on its own row.
                  <span key={line}>
                    {i > 0 && " "}
                    <span className="thread-hero__line block overflow-hidden">
                      <span
                        className="inline-block"
                        style={{ animationDelay: `${i * 0.12}s` }}
                      >
                        {part.before}
                        {part.accent && (
                          <span style={{ color: THREAD_PALETTE.champagne }}>
                            {part.accent}
                          </span>
                        )}
                        {part.after}
                      </span>
                    </span>
                  </span>
                );
              })}
            </h1>
          </div>

          <div className="thread-hero__aside flex flex-col gap-6 lg:pb-3">
            <p
              className="text-lg leading-relaxed"
              style={{ color: THREAD_PALETTE.muted }}
            >
              {hero.description}
            </p>
            <div>
              <a href="#catalog" className={threadAccentButtonClass}>
                {hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm" style={{ color: THREAD_PALETTE.muted }}>
              {priceNote}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative: every name here is a card in the catalog below, so the
          strip repeats nothing a screen reader would miss. */}
      <div
        className={`${displayFont.className} overflow-hidden border-y py-4 text-lg font-medium uppercase tracking-[0.14em]`}
        style={{
          borderColor: "rgba(237, 231, 218, 0.1)",
          color: THREAD_PALETTE.muted,
        }}
        aria-hidden="true"
      >
        <div className="thread-hero__track flex w-max">
          {[0, 1].map((run) => (
            <div key={run} className="flex gap-10 pr-10">
              {hero.marquee.map((name) => (
                <span key={name} className="flex items-center gap-10">
                  {name}
                  <span style={{ color: THREAD_PALETTE.champagne }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
