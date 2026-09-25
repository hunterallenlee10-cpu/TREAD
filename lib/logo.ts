import { readFile } from "node:fs/promises";
import { join } from "node:path";

let cached: Promise<string> | undefined;

/**
 * The Thread wordmark as a data URL, for the icon and Open Graph image routes.
 *
 * Those routes render at build time with `next/og`, which accepts a data URL
 * for `<img src>` but cannot fetch `/thread/...` from a site that does not
 * exist yet. The file is read once and shared between the three routes.
 *
 * `/thread/wordmark.png` rather than `/logos/thread-logo.png`: the latter is a
 * 1024² canvas that is 94% transparent padding. The wordmark is 720×522 with
 * the lettering in its top ~300px, which is what `WORDMARK` below describes.
 *
 * Server only: this imports `node:fs`, so it must never be pulled into a
 * client component.
 */
export function readWordmarkDataUrl(): Promise<string> {
  cached ??= readFile(
    join(process.cwd(), "public", "thread", "wordmark.png")
  ).then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);
  return cached;
}

/**
 * The wordmark file's geometry, measured from its alpha channel. The image
 * routes crop to these rather than showing the whole canvas, whose bottom 45%
 * is empty. SiteHeader and SiteFooter crop the same lockup with CSS
 * (`aspect-[720/292]` plus `object-top`), so change those with this.
 */
export const WORDMARK = {
  width: 720,
  height: 522,
  /** Rows 2–285 carry ink: "Thread" to row 219, "T-SHIRTS" from 257 to 285. */
  lockupHeight: 292,
  /**
   * A square around "Th" for the icons. The T's crossbar runs on over the h,
   * so the T cannot be cut out alone; x 90–300 takes both letters whole and
   * lets the thread line run off either edge.
   */
  initial: { x: 90, y: 25, size: 210 },
} as const;

/**
 * Size and offset for the whole wordmark image inside a `box`-pixel square
 * with `overflow: hidden`, so that `WORDMARK.initial` exactly fills the box.
 */
export function initialCrop(box: number) {
  const scale = box / WORDMARK.initial.size;
  return {
    width: Math.round(WORDMARK.width * scale),
    height: Math.round(WORDMARK.height * scale),
    left: -Math.round(WORDMARK.initial.x * scale),
    top: -Math.round(WORDMARK.initial.y * scale),
  };
}
