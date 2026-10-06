import { ArrowRight } from "lucide-react";
import { THREAD_PALETTE, threadCopy } from "@/data/thread";
import {
  ThreadEyebrow,
  ThreadSection,
} from "@/components/thread/ThreadUI";

const { story } = threadCopy;

/**
 * Who Thread is, between the hero and the reasons to trust it. This used to be
 * a fork between the collection and custom printing; with the print service
 * gone there is one path, so it reads as a statement with one link rather than
 * a single card in a two-column grid.
 */
export function ThreadBrandStorySection() {
  return (
    <ThreadSection alt>
      <div className="mx-auto max-w-3xl text-center">
        <ThreadEyebrow>{story.eyebrow}</ThreadEyebrow>
        <h2 className="heading-lg" style={{ color: THREAD_PALETTE.bone }}>
          {story.title}
        </h2>
        <p
          className="mt-5 text-lg leading-relaxed"
          style={{ color: THREAD_PALETTE.muted }}
        >
          {story.lead}
        </p>
        <a
          href={story.href}
          className="group mt-8 inline-flex items-center gap-2 font-semibold"
          style={{ color: THREAD_PALETTE.champagne }}
        >
          {story.cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </ThreadSection>
  );
}
