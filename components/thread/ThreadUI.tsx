import type { CSSProperties, ReactNode } from "react";
import { THREAD_PALETTE } from "@/data/thread";

/**
 * Shared presentational pieces for the Thread page.
 *
 * No hooks here on purpose, so both server and client sections can import it.
 *
 * Everything runs on THREAD_PALETTE — see docs/THREAD.md §2. On the parent
 * site this also meant steering clear of its `.btn-primary` / `.btn-secondary`
 * utilities, which are hardcoded to the LEU amber; this site has no such
 * classes.
 */

/**
 * Colour, depth, and every interactive state come from `ThreadStyles`, which
 * the layout renders once. They cannot live in an inline `style` object here:
 * inline styles outrank class selectors, so an inline `borderColor` would make
 * the hover rules unreachable.
 */
export const threadButtonBase =
  "thread-btn inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg";

export const threadPrimaryButtonClass = `${threadButtonBase} thread-btn--primary`;

export const threadSecondaryButtonClass = `${threadButtonBase} thread-btn--secondary`;

export const threadCardStyle: CSSProperties = {
  backgroundColor: THREAD_PALETTE.charcoal,
  borderColor: THREAD_PALETTE.border,
};

interface ThreadSectionProps {
  id?: string;
  children: ReactNode;
  /** Uses the slightly lighter charcoal, for alternating bands. */
  alt?: boolean;
  className?: string;
}

export function ThreadSection({
  id,
  children,
  alt = false,
  className = "",
}: ThreadSectionProps) {
  return (
    <section
      id={id}
      className={`section-padding scroll-mt-24 ${className}`}
      style={{
        backgroundColor: alt ? THREAD_PALETTE.charcoal : THREAD_PALETTE.ink,
      }}
    >
      <div className="section-container">{children}</div>
    </section>
  );
}

export function ThreadEyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.25em] mb-4"
      style={{ color: THREAD_PALETTE.champagne }}
    >
      {children}
    </p>
  );
}

interface ThreadHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function ThreadHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: ThreadHeadingProps) {
  const alignment =
    align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-3xl mb-14 ${alignment}`}>
      {eyebrow && <ThreadEyebrow>{eyebrow}</ThreadEyebrow>}
      <h2 className="heading-lg" style={{ color: THREAD_PALETTE.bone }}>
        {title}
      </h2>
      {description && (
        <p
          className="mt-5 text-lg leading-relaxed"
          style={{ color: THREAD_PALETTE.muted }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** Hairline divider in the brand's warm border tone. */
export function ThreadRule({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px w-full ${className}`}
      style={{ backgroundColor: THREAD_PALETTE.border }}
    />
  );
}
