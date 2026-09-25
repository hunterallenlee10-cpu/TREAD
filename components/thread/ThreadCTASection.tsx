import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { THREAD_PALETTE, THREAD_CONTACT_EMAIL, threadCopy } from "@/data/thread";
import { ThreadReveal } from "@/components/thread/ThreadReveal";
import {
  ThreadSection,
  threadPrimaryButtonClass,
  threadSecondaryButtonClass,
} from "@/components/thread/ThreadUI";

const { finalCta } = threadCopy;

export function ThreadCTASection() {
  return (
    <ThreadSection>
      <ThreadReveal className="mx-auto max-w-2xl text-center">
        {/* Closes the page on the mark it opened with. Named in the alt, not
            decorative: unlike the hero, nothing in this block's copy says
            "Thread", so the mark is the only thing identifying the brand here.

            /thread/wordmark.png rather than the hero's /logos/thread-logo.png —
            that file is a 1024² canvas that is 94% transparent padding, so at
            this size object-contain would shrink the wordmark into the middle
            of a mostly empty box and sit it low, since the artwork is not
            vertically centred in its own canvas. */}
        <Image
          src="/thread/wordmark.png"
          alt="Thread T-Shirts"
          width={720}
          height={522}
          loading="lazy"
          className="mx-auto mb-8 h-auto w-52 opacity-90"
          // Brightness only. The hero pairs this lift with dark drop shadows to
          // separate the strokes from the strands moving behind them; this
          // section is flat ink, where a dark shadow has nothing to separate
          // the mark from and just pools into a soft box around it.
          style={{ filter: "brightness(1.16) contrast(1.06)" }}
        />
        <h2 className="heading-lg" style={{ color: THREAD_PALETTE.bone }}>
          {finalCta.title}
        </h2>
        <p
          className="mt-5 text-lg leading-relaxed"
          style={{ color: THREAD_PALETTE.muted }}
        >
          {finalCta.description}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="#order-request"
            className={threadPrimaryButtonClass}
          >
            {finalCta.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#catalog"
            className={threadSecondaryButtonClass}
          >
            {finalCta.secondaryCta}
          </a>
        </div>

        <p className="mt-8 text-sm" style={{ color: THREAD_PALETTE.muted }}>
          Prefer email?{" "}
          <a
            href={`mailto:${THREAD_CONTACT_EMAIL}`}
            className="underline underline-offset-4"
            style={{ color: THREAD_PALETTE.champagne }}
          >
            {THREAD_CONTACT_EMAIL}
          </a>
        </p>
      </ThreadReveal>
    </ThreadSection>
  );
}
