import { THREAD_PALETTE } from "@/data/thread";

/**
 * The Thread hero's animated backdrop: loose thread strands drawing themselves
 * across the frame and pulling away again, echoing the looped thread already
 * drawn through the `Th` in the wordmark.
 *
 * This replaced three blurred drifting orbs. Two things were wrong with those.
 * One orb sat behind the wordmark, and the logo PNG is a thin serif outline in
 * a near-bone grey (~#BCBBB7, measured off the artwork) — a blurred champagne
 * cloud behind it removes the only contrast the mark has. And the motion did
 * not read: at `blur-3xl` on near-black, translating a low-opacity blob 50px
 * changes almost no pixels, so what the eye caught was the opacity swing, which
 * looks like a slow flicker rather than drift.
 *
 * So the rule this file follows is that nothing warm is allowed behind the
 * wordmark. The light pool sits low and left, and the scrim pulls the logo
 * column back down to ink.
 *
 * The keyframes are declared here alongside the markup that uses them and
 * prefixed `thread-` so they cannot collide with a global set. (They were
 * written for the page inside the Lee Enterprises Unlimited site, whose
 * `globals.css` it was not to touch — docs/THREAD.md §11.) Reduced motion is
 * handled in the same block rather than left to the global rule in
 * `globals.css`.
 */

/**
 * Each strand: path, colour, opacity, dash pattern, and seconds per draw.
 *
 * Every pattern sums to 1060 so one keyframe can drive all six, and the
 * durations are mutually prime-ish so the strands never resynchronise into a
 * visible pulse. The dash is always shorter than the gap, which is what makes
 * a strand pull fully off screen before the next pass — the paths are long
 * enough that a strand is always mid-draw somewhere in the frame.
 */
const STRANDS = [
  { d: "M-60 96 C 260 20, 520 210, 800 120 S 1300 40, 1520 150", c: THREAD_PALETTE.champagne, o: 0.5, dash: "420 640", s: 19 },
  { d: "M-60 250 C 300 150, 560 330, 900 240 S 1320 190, 1520 280", c: THREAD_PALETTE.bone, o: 0.24, dash: "320 740", s: 27 },
  { d: "M-60 372 C 240 470, 620 300, 940 400 S 1340 470, 1520 380", c: THREAD_PALETTE.champagne, o: 0.34, dash: "500 560", s: 23 },
  { d: "M-60 520 C 340 600, 660 430, 1000 520 S 1360 580, 1520 470", c: THREAD_PALETTE.bone, o: 0.18, dash: "360 700", s: 31 },
  { d: "M-60 44 C 380 130, 700 -30, 1040 60 S 1380 130, 1520 60", c: THREAD_PALETTE.champagne, o: 0.22, dash: "280 780", s: 37 },
  { d: "M-60 600 C 300 540, 640 660, 980 590 S 1380 520, 1520 600", c: THREAD_PALETTE.champagne, o: 0.2, dash: "340 720", s: 41 },
] as const;

export function ThreadHeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <style>{`
        /* One full dash period per cycle. */
        @keyframes thread-strand-draw {
          from { stroke-dashoffset: 1060; }
          to   { stroke-dashoffset: 0; }
        }
        /* Applied to the group, not the strands, so the whole field breathes
           together rather than each path wandering on its own. */
        @keyframes thread-strand-sway {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50%      { transform: translateY(-14px) scaleY(1.02); }
        }
        @media (prefers-reduced-motion: reduce) {
          .thread-strands *, .thread-strands { animation: none !important; }
        }

        /* The scrim has to follow the layout, so it cannot be an inline style.
           Below lg the hero is one stacked column: the copy runs full width and
           the wordmark sits low and centred, so the copy wash runs top-to-bottom
           and the mark's pool moves under it. A horizontal wash here would just
           darken one side of a full-width paragraph. */
        .thread-scrim {
          background:
            radial-gradient(26rem 20rem at 50% 82%, ${THREAD_PALETTE.ink}E6 0%, ${THREAD_PALETTE.ink}99 45%, transparent 74%),
            linear-gradient(180deg, ${THREAD_PALETTE.ink}A6 0%, ${THREAD_PALETTE.ink}80 38%, transparent 58%),
            radial-gradient(120% 120% at 50% 50%, transparent 45%, ${THREAD_PALETTE.ink}CC 100%);
        }

        /* Matches the lg: breakpoint where the grid splits into two columns. */
        @media (min-width: 1024px) {
          .thread-scrim {
            background:
              radial-gradient(46rem 34rem at 72% 52%, ${THREAD_PALETTE.ink}E6 0%, ${THREAD_PALETTE.ink}99 42%, transparent 72%),
              linear-gradient(90deg, ${THREAD_PALETTE.ink}B3 0%, ${THREAD_PALETTE.ink}8C 32%, transparent 62%),
              radial-gradient(120% 120% at 50% 50%, transparent 45%, ${THREAD_PALETTE.ink}CC 100%);
          }
        }
      `}</style>

      <div className="thread-strands absolute inset-0">
        {/* `preserveAspectRatio="none"` stretches the viewBox to fill the
            section, which is what keeps strands spread across the frame at
            every width — `slice` would crop a 1440-wide viewBox down to a
            ~220-unit column on a phone and leave the hero nearly empty.

            The cost is a non-uniform scale: 1.8x vertical against 0.27x
            horizontal on a 390px viewport. Without `non-scaling-stroke` that
            scale lands on the stroke and the dash pattern too, so the same
            strand renders hairline where it runs flat and heavy where it runs
            steep. `non-scaling-stroke` resolves both in viewport units, so a
            1.5px strand is 1.5px everywhere. */}
        <svg
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 640"
          fill="none"
          style={{ animation: "thread-strand-sway 24s ease-in-out infinite" }}
        >
          {STRANDS.map((strand, i) => (
            <path
              key={strand.d}
              d={strand.d}
              stroke={strand.c}
              strokeOpacity={strand.o}
              strokeWidth={i % 2 === 0 ? 1.5 : 1}
              strokeLinecap="round"
              strokeDasharray={strand.dash}
              vectorEffect="non-scaling-stroke"
              style={{
                animation: `thread-strand-draw ${strand.s}s linear infinite`,
              }}
            />
          ))}
        </svg>

        {/* One warm pool, low and left. Without it the strands float on flat
            black; with it anywhere near the logo column the wordmark goes soft
            again, which is the failure this backdrop replaced. */}
        <div
          className="absolute -bottom-32 left-0 h-[28rem] w-[42rem] rounded-[50%] blur-3xl"
          style={{ backgroundColor: `${THREAD_PALETTE.champagne}1A` }}
        />
      </div>

      {/* Above the strands, below the content. Three jobs, one gradient each:
          pull the area behind the wordmark back down to ink so the thin light
          strokes have something to read against; keep strands from drawing
          through the paragraph, where linework reads as strikethrough; and
          darken the outer edges so the section has a centre. On lg the copy
          wash stops before the logo column so the two do not stack into a flat
          black band across the middle. */}
      <div className="thread-scrim pointer-events-none absolute inset-0" />
    </div>
  );
}
