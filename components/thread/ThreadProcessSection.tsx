import { THREAD_PALETTE, threadCopy, threadProcessSteps } from "@/data/thread";
import { ThreadReveal } from "@/components/thread/ThreadReveal";
import {
  ThreadHeading,
  ThreadSection,
} from "@/components/thread/ThreadUI";

export function ThreadProcessSection() {
  return (
    <ThreadSection id="process">
      <ThreadReveal>
        <ThreadHeading
          eyebrow={threadCopy.process.eyebrow}
          title={threadCopy.process.title}
          description={threadCopy.process.description}
        />
      </ThreadReveal>

      <ol className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-5">
        {threadProcessSteps.map((step, index) => (
          // Renders as the li itself: a wrapper div between ol and li is
          // invalid and would drop the list semantics.
          <ThreadReveal
            key={step.id}
            as="li"
            className="thread-card flex h-full flex-col rounded-lg p-6"
            delay={Math.min(index, 5) * 60}
          >
            <span
              className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: THREAD_PALETTE.bone,
                color: THREAD_PALETTE.ink,
              }}
            >
              {step.step}
            </span>
            <h3
              className="text-base font-bold"
              style={{ color: THREAD_PALETTE.bone }}
            >
              {step.title}
            </h3>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: THREAD_PALETTE.muted }}
            >
              {step.description}
            </p>
          </ThreadReveal>
        ))}
      </ol>
    </ThreadSection>
  );
}
