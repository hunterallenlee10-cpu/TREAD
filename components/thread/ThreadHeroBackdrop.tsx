import { THREAD_PALETTE } from "@/data/thread";
import { displayFont } from "@/lib/fonts";

/** `#RRGGBB` to `"r, g, b"`, so the palette can feed `rgba()` alpha values. */
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

/**
 * The hero's backdrop: four still layers under a statement headline.
 *
 * This replaced the animated thread strands, which were drawn for a hero with
 * the wordmark in it. With no logo to echo, the backdrop's job is depth rather
 * than motion — the headline and the strip under it carry the movement — so
 * nothing here animates.
 *
 * Order, back to front: one warm pool high on the right, away from the
 * headline so the bone type keeps its contrast; an outlined THREAD set behind
 * it as texture, at an alpha low enough that it never competes with the h1;
 * film grain, so the black reads as a surface rather than an empty fill; and a
 * vignette that gives the section a centre.
 */
export function ThreadHeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 40% 50% at 85% 20%, rgba(${rgb(THREAD_PALETTE.champagne)}, 0.13), transparent 70%)`,
        }}
      />

      <div
        className={`${displayFont.className} absolute -right-[2%] top-4 select-none font-bold uppercase leading-[0.8] tracking-[-0.02em]`}
        style={{
          fontSize: "clamp(10rem, 26vw, 26rem)",
          color: "transparent",
          WebkitTextStroke: `1px rgba(${rgb(THREAD_PALETTE.bone)}, 0.06)`,
        }}
      >
        Thread
      </div>

      {/* Fractal noise, blended so it lifts the black a hair rather than
          laying grey dots on it. */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.08] mix-blend-overlay">
        <filter id="thread-hero-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={3}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#thread-hero-grain)" />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 120% at 40% 40%, transparent 50%, rgba(0, 0, 0, 0.85) 100%)",
        }}
      />
    </div>
  );
}
