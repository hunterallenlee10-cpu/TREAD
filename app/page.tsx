import { THREAD_CONTACT_EMAIL } from "@/data/thread";
import { PARENT_NAME, PARENT_SITE_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import { ThreadCartProvider } from "@/components/thread/ThreadCartProvider";
import { ThreadCatalogFilterProvider } from "@/components/thread/ThreadCatalogFilterProvider";
import { ThreadCartDrawer } from "@/components/thread/ThreadCartDrawer";
import { ThreadHeroSection } from "@/components/thread/ThreadHeroSection";
import { ThreadBrandStorySection } from "@/components/thread/ThreadBrandStorySection";
import { ThreadQualitySection } from "@/components/thread/ThreadQualitySection";
import { ThreadCatalogSection } from "@/components/thread/ThreadCatalogSection";
import { ThreadUseCasesSection } from "@/components/thread/ThreadUseCasesSection";
import { ThreadProcessSection } from "@/components/thread/ThreadProcessSection";
import { ThreadGroupOrderSection } from "@/components/thread/ThreadGroupOrderSection";
import { ThreadFAQSection } from "@/components/thread/ThreadFAQSection";
import { ThreadOrderRequestForm } from "@/components/thread/ThreadOrderRequestForm";
import { ThreadCTASection } from "@/components/thread/ThreadCTASection";

/**
 * Structured data says who Thread is and nothing it cannot back up. No
 * products, offers, or prices: Thread is pre-launch and most of the catalog is
 * placeholder inventory (docs/THREAD.md §8), so an `Offer` here would advertise
 * what the page itself is careful not to.
 *
 * Every `@id` and `url` is built from SITE_URL, so attaching the custom domain
 * is one environment variable and nothing here.
 */
const organizationId = `${SITE_URL}/#organization`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/thread/wordmark.png`,
      email: THREAD_CONTACT_EMAIL,
      parentOrganization: {
        "@type": "Organization",
        name: PARENT_NAME,
        url: PARENT_SITE_URL,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": organizationId },
    },
  ],
};

/**
 * Thread is pre-launch: this page takes order requests, it does not sell.
 * See docs/THREAD.md for the reasoning and for what has to be confirmed before
 * any of the placeholder catalog is advertised as real.
 *
 * The sections and their order are exactly as they were at /thread-t-shirts on
 * the parent site. The header, footer, ThreadStyles and the ink background now
 * come from app/layout.tsx.
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ThreadCartProvider>
        <ThreadCatalogFilterProvider>
          {/* pt-20 clears the fixed 80px header. `id`/`tabIndex` make it the
              skip link's target (app/layout.tsx); it is not a control, so it
              takes focus without drawing a ring around the whole page. */}
          <main id="main-content" tabIndex={-1} className="pt-20 focus:outline-none">
            <ThreadHeroSection />
            <ThreadBrandStorySection />
            <ThreadQualitySection />
            <ThreadCatalogSection />
            <ThreadUseCasesSection />
            <ThreadProcessSection />
            <ThreadGroupOrderSection />
            <ThreadFAQSection />
            <ThreadOrderRequestForm />
            <ThreadCTASection />
          </main>

          <ThreadCartDrawer />
        </ThreadCatalogFilterProvider>
      </ThreadCartProvider>
    </>
  );
}
