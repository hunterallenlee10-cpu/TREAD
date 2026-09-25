import { ImageResponse } from "next/og";
import { THREAD_PALETTE } from "@/data/thread";
import { initialCrop, readWordmarkDataUrl } from "@/lib/logo";

/** Home-screen icon. iOS rounds the corners itself, so this tile is square. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BOX = 136;

export default async function AppleIcon() {
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
