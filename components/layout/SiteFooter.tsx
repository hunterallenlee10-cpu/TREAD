import Image from "next/image";
import { Mail } from "lucide-react";
import { THREAD_CONTACT_EMAIL, THREAD_PALETTE, threadCopy } from "@/data/thread";
import { orderRequestHref, siteNav } from "@/data/navigation";
import { PARENT_NAME, PARENT_SITE_URL, SITE_NAME } from "@/lib/site";

/**
 * Thread is a Lee Enterprises Unlimited venture, and order requests deliver to
 * LEU's inbox, so the policies that apply are the ones LEU publishes. They are
 * linked rather than copied: one set of terms, maintained in one place.
 */
const parentLinks = [
  { label: PARENT_NAME, href: PARENT_SITE_URL },
  { label: "Privacy Policy", href: `${PARENT_SITE_URL}/#privacy` },
  { label: "Terms of Service", href: `${PARENT_SITE_URL}/#terms` },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t"
      style={{
        borderColor: THREAD_PALETTE.border,
        backgroundColor: THREAD_PALETTE.ink,
      }}
    >
      <div className="section-container py-12 md:py-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            {/* Same crop as the header (lib/logo.ts): the lettering is the
                top 292 rows of a 720×522 canvas. 56px tall, 138px wide. */}
            <Image
              src="/thread/wordmark.png"
              alt={SITE_NAME}
              width={720}
              height={522}
              loading="lazy"
              className="mb-4 h-14 w-[138px] object-cover object-top"
              style={{ filter: "brightness(1.16) contrast(1.06)" }}
            />
            {/* Trimmed from the description the parent site keeps for Thread
                (`data/ventures.ts` in the LEU repo). */}
            <p
              className="max-w-xs text-sm leading-relaxed"
              style={{ color: THREAD_PALETTE.muted }}
            >
              Premium everyday apparel and custom designs for individuals,
              brands, teams, businesses, and events.
            </p>
            <a
              href={`mailto:${THREAD_CONTACT_EMAIL}`}
              className="thread-footer-link mt-5 inline-flex items-center gap-2 text-sm font-semibold"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {THREAD_CONTACT_EMAIL}
            </a>
          </div>

          {/* Labelled differently from the header's "Sections" nav so a
              screen reader's landmark list tells the two apart. */}
          <nav aria-label="On this page">
            <h2
              className="mb-4 text-sm font-semibold uppercase tracking-widest"
              style={{ color: THREAD_PALETTE.bone }}
            >
              On this page
            </h2>
            <ul className="space-y-2">
              {siteNav.map((item) => (
                <li key={item.id}>
                  <a href={item.href} className="thread-footer-link text-sm">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={orderRequestHref} className="thread-footer-link text-sm">
                  {threadCopy.finalCta.primaryCta}
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label={PARENT_NAME}>
            <h2
              className="mb-4 text-sm font-semibold uppercase tracking-widest"
              style={{ color: THREAD_PALETTE.bone }}
            >
              {PARENT_NAME}
            </h2>
            <ul className="space-y-2">
              {parentLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="thread-footer-link text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          className="flex flex-col items-center justify-between gap-2 border-t pt-8 text-center text-sm md:flex-row md:text-left"
          style={{ borderColor: THREAD_PALETTE.border, color: THREAD_PALETTE.muted }}
        >
          <p>
            © {year} {SITE_NAME}. All rights reserved.
          </p>
          <p>
            A{" "}
            <a href={PARENT_SITE_URL} className="thread-footer-link font-semibold">
              {PARENT_NAME}
            </a>{" "}
            venture.
          </p>
        </div>
      </div>
    </footer>
  );
}
