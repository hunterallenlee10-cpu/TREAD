import { Check } from "lucide-react";
import { THREAD_PALETTE, threadGroupOrderInfo } from "@/data/thread";
import {
  ThreadEyebrow,
  ThreadSection,
  threadCardStyle,
  threadPrimaryButtonClass,
} from "@/components/thread/ThreadUI";

/**
 * No published rate card on purpose. Garment mix, print colors, placement
 * count, and quantity all move the number, so a posted tier would be wrong more
 * often than right.
 */
export function ThreadGroupOrderSection() {
  return (
    <ThreadSection alt>
      <div
        className="grid grid-cols-1 items-center gap-10 rounded-lg border p-8 md:p-12 lg:grid-cols-2"
        style={threadCardStyle}
      >
        <div>
          <ThreadEyebrow>Bulk Orders</ThreadEyebrow>
          <h2 className="heading-lg" style={{ color: THREAD_PALETTE.bone }}>
            {threadGroupOrderInfo.title}
          </h2>
          <p
            className="mt-5 leading-relaxed"
            style={{ color: THREAD_PALETTE.muted }}
          >
            {threadGroupOrderInfo.description}
          </p>
          <a
            href="#order-request"
            className={`${threadPrimaryButtonClass} mt-8`}
          >
            {threadGroupOrderInfo.ctaLabel}
          </a>
        </div>

        <ul className="space-y-4">
          {threadGroupOrderInfo.points.map((point) => (
            <li key={point} className="flex gap-3">
              <span
                className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${THREAD_PALETTE.champagne}33` }}
              >
                <Check
                  className="h-3.5 w-3.5"
                  style={{ color: THREAD_PALETTE.champagne }}
                />
              </span>
              <span style={{ color: THREAD_PALETTE.muted }}>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </ThreadSection>
  );
}
