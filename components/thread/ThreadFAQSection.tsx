"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { THREAD_PALETTE, threadCopy, threadFaqs } from "@/data/thread";
import {
  ThreadHeading,
  ThreadSection,
} from "@/components/thread/ThreadUI";

export function ThreadFAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ThreadSection id="faq">
      <div>
        <ThreadHeading
          eyebrow={threadCopy.faq.eyebrow}
          title={threadCopy.faq.title}
          description={threadCopy.faq.description}
        />
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {threadFaqs.map((faq) => {
          const open = openId === faq.id;

          return (
            <div
              key={faq.id}
              className="thread-card thread-faq overflow-hidden rounded-lg"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : faq.id)}
                aria-expanded={open}
                aria-controls={`faq-panel-${faq.id}`}
                className="thread-faq__trigger flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span
                  className="font-semibold"
                  style={{ color: THREAD_PALETTE.bone }}
                >
                  {faq.question}
                </span>
                {/* Rotation is driven off aria-expanded in the stylesheet
                    rather than a conditional class, so it can compose with the
                    hover nudge instead of one transform clobbering the other. */}
                <ChevronDown className="thread-faq__icon h-5 w-5 flex-shrink-0" />
              </button>

              {open && (
                <div
                  id={`faq-panel-${faq.id}`}
                  className="thread-faq__panel px-6 py-5 leading-relaxed"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ThreadSection>
  );
}
