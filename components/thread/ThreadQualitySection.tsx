import { Layers, Shirt, Ruler, ClipboardCheck } from "lucide-react";
import { THREAD_PALETTE, threadCopy, threadQualityPillars } from "@/data/thread";
import {
  ThreadHeading,
  ThreadSection,
} from "@/components/thread/ThreadUI";

/** Keyed to the pillar ids in data/thread.ts. */
const pillarIcons: Record<string, React.ElementType> = {
  fabric: Layers,
  print: Shirt,
  fit: Ruler,
  proof: ClipboardCheck,
};

export function ThreadQualitySection() {
  return (
    <ThreadSection>
      <div>
        <ThreadHeading
          eyebrow={threadCopy.quality.eyebrow}
          title={threadCopy.quality.title}
          description={threadCopy.quality.description}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {threadQualityPillars.map((pillar) => {
          const Icon = pillarIcons[pillar.id] ?? Layers;

          return (
            <div
              key={pillar.id}
              className="h-full"
            >
              <div className="thread-card h-full rounded-lg p-7">
                <span
                  className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${THREAD_PALETTE.champagne}22` }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: THREAD_PALETTE.champagne }}
                  />
                </span>
                <h3
                  className="text-lg font-bold"
                  style={{ color: THREAD_PALETTE.bone }}
                >
                  {pillar.title}
                </h3>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: THREAD_PALETTE.muted }}
                >
                  {pillar.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ThreadSection>
  );
}
