import { ImageResponse } from "next/og";
import { THREAD_PALETTE } from "@/data/thread";
import { initialCrop, readWordmarkDataUrl } from "@/lib/logo";

/**
 * Favicon, generated at build time. The full wordmark is illegible at tab
 * size, so this shows its "Th" (lib/logo.ts) on an ink tile — the artwork is
 * a pale grey on transparent and would vanish on a light tab bar without it.
 */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const BOX = 54;

export default async function Icon() {
  const logo = await readWordmarkDataUrl();
  const crop = initialCrop(BOX);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: THREAD_PALETTE.ink,
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: BOX,
            height: BOX,
            overflow: "hidden",
          }}
        >
          <img
            src={logo}
            alt=""
            width={crop.width}
            height={crop.height}
            style={{ position: "absolute", left: crop.left, top: crop.top }}
          />
        </div>
      </div>
    ),
    size
  );
}
