import { Oswald } from "next/font/google";

/**
 * The hero's display face: a heavy condensed sans for the one statement line
 * and the strip under it. Declared once here so the hero and its backdrop share
 * a single font instance rather than each loading their own.
 */
export const displayFont = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
});
