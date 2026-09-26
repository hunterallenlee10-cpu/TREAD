import { THREAD_PALETTE, threadCopy, threadUseCases } from "@/data/thread";
import {
  ThreadHeading,
  ThreadSection,
} from "@/components/thread/ThreadUI";

export function ThreadUseCasesSection() {
  return (
    <ThreadSection id="custom-apparel" alt>
      <div>
        <ThreadHeading
          eyebrow={threadCopy.useCases.eyebrow}
          title={threadCopy.useCases.title}
          description={threadCopy.useCases.description}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {threadUseCases.map((useCase) => (
          <div
            key={useCase.id}
            className="h-full"
          >
            {/* Not a link, so it lights up on hover rather than lifting —
                see the note on `.thread-card` in ThreadStyles. */}
            <div className="thread-card h-full rounded-lg p-6">
              <h3
                className="text-base font-bold"
                style={{ color: THREAD_PALETTE.bone }}
              >
                {useCase.title}
              </h3>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: THREAD_PALETTE.muted }}
              >
                {useCase.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ThreadSection>
  );
}
