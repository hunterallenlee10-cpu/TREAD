import { ArrowRight } from "lucide-react";
import { THREAD_PALETTE, threadCopy } from "@/data/thread";
import { ThreadReveal } from "@/components/thread/ThreadReveal";
import {
  ThreadEyebrow,
  ThreadSection,
} from "@/components/thread/ThreadUI";

const { story } = threadCopy;

/**
 * The fork in the page: shoppers go one way, custom orders the other. Everything
 * below this section serves one path or the other, so it comes early.
 */
export function ThreadBrandStorySection() {
  return (
    <ThreadSection alt>
      <ThreadReveal>
        <div className="mx-auto mb-14 max-w-3xl text-center">
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
        </div>
      </ThreadReveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {story.paths.map((path, index) => (
          <ThreadReveal key={path.id} className="h-full" delay={index * 80}>
            <a
              href={path.href}
              className="thread-card thread-card--link group flex h-full flex-col rounded-lg p-8"
            >
              <h3
                className="text-2xl font-bold"
                style={{ color: THREAD_PALETTE.bone }}
              >
                {path.title}
              </h3>
              <p
                className="mt-4 flex-1 leading-relaxed"
                style={{ color: THREAD_PALETTE.muted }}
              >
                {path.description}
              </p>
              <span
                className="mt-6 inline-flex items-center gap-2 font-semibold"
                style={{ color: THREAD_PALETTE.champagne }}
              >
                {path.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </a>
          </ThreadReveal>
        ))}
      </div>
    </ThreadSection>
  );
}
