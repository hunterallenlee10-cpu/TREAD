import { THREAD_CONTACT_EMAIL } from "@/data/thread";
import { PARENT_NAME, PARENT_SITE_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import { ThreadCartProvider } from "@/components/thread/ThreadCartProvider";
import { ThreadCatalogFilterProvider } from "@/components/thread/ThreadCatalogFilterProvider";
import { ThreadCartDrawer } from "@/components/thread/ThreadCartDrawer";
import { ThreadHeroSection } from "@/components/thread/ThreadHeroSection";
import { ThreadBrandStorySection } from "@/components/thread/ThreadBrandStorySection";
import { ThreadQualitySection } from "@/components/thread/ThreadQualitySection";
import { ThreadCatalogSection } from "@/components/thread/ThreadCatalogSection";
import { ThreadFAQSection } from "@/components/thread/ThreadFAQSection";
import { ThreadCTASection } from "@/components/thread/ThreadCTASection";

/**
 * Structured data says who Thread is and nothing it cannot back up. No
 * products or offers yet: the tees are real and for sale, but the fabric
 * weights in their copy are still unconfirmed (docs/THREAD.md §10), and an
 * `Offer` would put that copy in front of search engines as fact.
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
 * The store: the collection, the cart, and a Stripe-hosted checkout reached
 * from the cart drawer. See docs/THREAD.md for the checkout contract and for
 * what has to be confirmed before the "Coming soon" lines go on sale.
 *
 * The header, footer, ThreadStyles and the ink background come from
 * app/layout.tsx.
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
            <ThreadFAQSection />
            <ThreadCTASection />
          </main>

          <ThreadCartDrawer />
        </ThreadCatalogFilterProvider>
      </ThreadCartProvider>
    </>
  );
}
