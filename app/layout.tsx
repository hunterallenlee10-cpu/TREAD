import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ThreadStyles } from "@/components/thread/ThreadStyles";
import { THREAD_PALETTE } from "@/data/thread";
import {
  PARENT_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });

/**
 * On the parent site the page set only a title, description and keywords, so
 * its link previews fell through to the Lee Enterprises Unlimited Open Graph
 * card. Here the site is Thread, and the preview says so.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // Verbatim from the page's metadata on the parent site.
  keywords: [
    "custom t-shirts",
    "custom apparel",
    "team apparel",
    "business apparel",
    "screen printing",
    "event shirts",
    "custom hoodies",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: PARENT_NAME,
  robots: "index, follow",
  alternates: {
    canonical: "/",
  },
  // The image comes from app/opengraph-image.tsx, which Next attaches here and
  // to the Twitter card automatically.
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: THREAD_PALETTE.ink,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

/**
 * The palette as custom properties, on `<html>`, for the handful of rules in
 * globals.css that cannot be classes: the page background, the default border
 * and outline colours, and `::selection`. Everything interactive reads
 * THREAD_PALETTE directly through ThreadStyles.
 */
const paletteVars = {
  "--thread-ink": THREAD_PALETTE.ink,
  "--thread-border": THREAD_PALETTE.border,
  "--thread-champagne": THREAD_PALETTE.champagne,
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={paletteVars}>
      <body className={`${geistSans.className} antialiased`}>
        {/* Every interactive state on the site — hover, press, focus,
            disabled, and the pressed state of a toggle — comes from here.
            Rendered once, above everything that uses it. */}
        <ThreadStyles />

        {/* Skip link: the first focusable thing on the page, off-screen until
            focused, so a keyboard or screen-reader user can jump past the fixed
            header straight to the content. Targets the `<main id="main-content">`
            each route renders. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:px-4 focus:py-2 focus:font-semibold focus:outline-none focus:ring-2"
          style={{
            backgroundColor: THREAD_PALETTE.bone,
            color: THREAD_PALETTE.ink,
          }}
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
