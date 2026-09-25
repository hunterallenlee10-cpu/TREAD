import { ImageResponse } from "next/og";
import { THREAD_PALETTE, threadCopy } from "@/data/thread";
import { readWordmarkDataUrl, WORDMARK } from "@/lib/logo";

/**
 * The link preview, generated at build time. Same hierarchy as the hero: the
 * mark, then the headline with its second half in champagne. The hero's "Now
 * Taking Orders" badge is left off on purpose — a preview is cached by the
 * sites that show it for weeks, and a live claim would outlast the truth of
 * it. Rendered in next/og's bundled sans-serif; loading Geist here would mean
 * fetching a font at build time for one image.
 *
 * next/og lays out with flexbox and needs `display: flex` on every element
 * that has more than one child.
 */
export const alt =
  "Thread T-Shirts — premium everyday apparel and custom printed apparel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The lockup's rendered width; its height follows from lib/logo.ts. */
const LOCKUP_WIDTH = 380;
const LOCKUP_HEIGHT = Math.round(
  (LOCKUP_WIDTH * WORDMARK.lockupHeight) / WORDMARK.width
);

export default async function OpenGraphImage() {
  const logo = await readWordmarkDataUrl();
  const { hero } = threadCopy;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          backgroundColor: THREAD_PALETTE.ink,
          backgroundImage: `linear-gradient(135deg, ${THREAD_PALETTE.charcoal} 0%, ${THREAD_PALETTE.ink} 60%)`,
          color: THREAD_PALETTE.bone,
        }}
      >
        {/* Cropped to the lettering: the file's bottom 45% is empty canvas. */}
        <div
          style={{
            display: "flex",
            width: LOCKUP_WIDTH,
            height: LOCKUP_HEIGHT,
            overflow: "hidden",
          }}
        >
          <img
            src={logo}
            alt=""
            width={LOCKUP_WIDTH}
            height={Math.round((LOCKUP_WIDTH * WORDMARK.height) / WORDMARK.width)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 48 }}>
          <div style={{ fontSize: 68, lineHeight: 1.08 }}>{hero.title}</div>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.08,
              color: THREAD_PALETTE.champagne,
            }}
          >
            {hero.titleAccent}
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            lineHeight: 1.4,
            color: THREAD_PALETTE.muted,
          }}
        >
          Custom apparel for businesses, teams, schools, events, and
          fundraisers.
        </div>
      </div>
    ),
    size
  );
}
