import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { THREAD_PALETTE, threadCopy } from "@/data/thread";
import { orderRequestHref } from "@/data/navigation";
import {
  threadPrimaryButtonClass,
  threadSecondaryButtonClass,
} from "@/components/thread/ThreadUI";

// Overrides the layout's page metadata so a 404 does not advertise the home
// page's title, canonical and og:url or invite indexing. Next serves this route
// with an injected noindex already; this keeps the rest of the head honest.
export const metadata: Metadata = {
  title: "Page not found | Thread T-Shirts",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: { url: null },
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen items-center pt-20 focus:outline-none"
    >
      <div className="section-container py-20 text-center">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: THREAD_PALETTE.champagne }}
        >
          404
        </p>
        <h1 className="heading-lg mb-4" style={{ color: THREAD_PALETTE.bone }}>
          That page isn't here.
        </h1>
        <p
          className="mx-auto mb-10 max-w-xl text-lg leading-relaxed"
          style={{ color: THREAD_PALETTE.muted }}
        >
          Everything Thread makes — the collection, custom orders, and the order
          request form — is on the one page.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/" className={`group ${threadPrimaryButtonClass}`}>
            <ArrowLeft
              className="h-5 w-5 transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            Back to Thread
          </Link>
          <Link href={orderRequestHref} className={threadSecondaryButtonClass}>
            {threadCopy.finalCta.primaryCta}
          </Link>
        </div>
      </div>
    </main>
  );
}
