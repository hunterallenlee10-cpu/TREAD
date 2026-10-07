import { ImageResponse } from "next/og";
import { splitThreadAccent, THREAD_PALETTE, threadCopy } from "@/data/thread";
import { readWordmarkDataUrl, WORDMARK } from "@/lib/logo";

/**
 * The link preview, generated at build time. The mark, then the hero's
 * headline line for line with the same word in champagne. Rendered in
 * next/og's bundled sans-serif; loading the hero's display face here would
 * mean fetching a font at build time for one image.
 *
 * next/og lays out with flexbox and needs `display: flex` on every element
 * that has more than one child.
 */
export const alt =
  "Thread T-Shirts — original premium everyday apparel";
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
          {hero.titleLines.map((line) => {
            const part = splitThreadAccent(line, hero.titleAccent);
            return (
              // `pre` keeps the space at the edge of each piece, which flex
              // layout would otherwise collapse.
              <div
                key={line}
                style={{ display: "flex", fontSize: 64, lineHeight: 1.08, whiteSpace: "pre" }}
              >
                <span>{part.before}</span>
                {part.accent && (
                  <span style={{ color: THREAD_PALETTE.champagne }}>{part.accent}</span>
                )}
                <span>{part.after}</span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            lineHeight: 1.4,
            color: THREAD_PALETTE.muted,
          }}
        >
          Original premium tees. Free shipping on every order.
        </div>
      </div>
    ),
    size
  );
}
