import { THREAD_PALETTE } from "@/data/thread";

/**
 * Thread's interactive styling, in one stylesheet.
 *
 * Rendered once from `app/layout.tsx`, so the header, the footer and the 404
 * page share it with the sections. It exists because the controls need states
 * — hover, active, focus-visible, disabled, and the pressed state of a toggle
 * — and an inline `style` object cannot express any of them. It also cannot be
 * overridden by one: inline styles beat every selector short of `!important`,
 * so a hover rule and an inline `borderColor` on the same element is a fight
 * the hover rule always loses. The colours therefore live here rather than in
 * the call sites.
 *
 * It began as a page-scoped `<style>` because the page lived inside the Lee
 * Enterprises Unlimited site, whose `globals.css` it was not to touch
 * (docs/THREAD.md §11). It stays one on its own site because every value is
 * interpolated from THREAD_PALETTE, the single source of truth, and a CSS file
 * cannot import it. The rules are unlayered, so they outrank Tailwind's
 * utilities; keep element-wide rules out of here (globals.css, `@layer base`).
 *
 * The thing making these read as raised rather than painted on is the warm
 * ambient shadow: a wide, low-alpha champagne glow with negative spread. On a
 * near-black ground that reads as the surface throwing light onto the page,
 * which is what the flat originals were missing. Keep the alpha low — past
 * about 0.3 on the outer layer it stops looking like light and starts looking
 * like a coloured halo.
 */

/** `#RRGGBB` to `"r, g, b"`, so the palette can feed `rgba()` alpha values. */
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const CHAMPAGNE = rgb(THREAD_PALETTE.champagne);
const BONE = rgb(THREAD_PALETTE.bone);
const INK = rgb(THREAD_PALETTE.ink);

const css = `
/* --------------------------------------------------------------------------
   Buttons
   -------------------------------------------------------------------------- */

.thread-btn {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.thread-btn:focus-visible {
  outline: 2px solid ${THREAD_PALETTE.champagne};
  outline-offset: 3px;
}

/* Primary — bone fill. The inset top highlight and the darker inset bottom
   edge give the fill a lit top and a shaded lower lip, so it reads as a
   physical key rather than a filled rectangle. */
.thread-btn--primary {
  background-color: ${THREAD_PALETTE.bone};
  background-image: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.6),
    rgba(255, 255, 255, 0) 55%
  );
  color: ${THREAD_PALETTE.ink};
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(${CHAMPAGNE}, 0.35),
    0 2px 6px rgba(0, 0, 0, 0.5),
    0 14px 34px -16px rgba(${CHAMPAGNE}, 0.55);
}

.thread-btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(${CHAMPAGNE}, 0.4),
    0 4px 10px rgba(0, 0, 0, 0.55),
    0 20px 44px -18px rgba(${CHAMPAGNE}, 0.8);
}

/* Press collapses the lift and pulls the shadow in tight, so the button reads
   as travelling toward the page rather than just getting smaller. */
.thread-btn--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.25),
    0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Disabled is its own surface, not the enabled one at 40% opacity — a
   translucent bone button over ink turns the muddy grey this replaced. */
.thread-btn--primary:disabled {
  background-color: ${THREAD_PALETTE.charcoal};
  background-image: none;
  color: ${THREAD_PALETTE.muted};
  border: 1px solid ${THREAD_PALETTE.border};
  box-shadow: none;
  transform: none;
  cursor: not-allowed;
}

/* Secondary — champagne outline. The originals were hollow, which on ink is
   indistinguishable from a border with nothing in it. A faint warm fill gives
   it a surface to be. */
.thread-btn--secondary {
  border: 2px solid rgba(${CHAMPAGNE}, 0.55);
  background-color: rgba(${CHAMPAGNE}, 0.08);
  color: ${THREAD_PALETTE.champagne};
  box-shadow:
    inset 0 1px 0 rgba(${CHAMPAGNE}, 0.18),
    0 12px 30px -18px rgba(${CHAMPAGNE}, 0.6);
}

.thread-btn--secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: ${THREAD_PALETTE.champagne};
  background-color: rgba(${CHAMPAGNE}, 0.16);
  color: ${THREAD_PALETTE.bone};
  box-shadow:
    inset 0 1px 0 rgba(${CHAMPAGNE}, 0.3),
    0 20px 40px -18px rgba(${CHAMPAGNE}, 0.85);
}

.thread-btn--secondary:active:not(:disabled) {
  transform: translateY(0);
  background-color: rgba(${CHAMPAGNE}, 0.22);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.35);
}

/* --------------------------------------------------------------------------
   Status badge
   -------------------------------------------------------------------------- */

/* "Now taking orders" is a live claim, so it gets a live indicator. The dot
   is the pop here — a pulsing point of warm light reads at a glance from
   across the hero, where a hairline outline did not. */
.thread-badge {
  border: 1px solid rgba(${CHAMPAGNE}, 0.5);
  background-image: linear-gradient(
    180deg,
    rgba(${CHAMPAGNE}, 0.18),
    rgba(${CHAMPAGNE}, 0.06)
  );
  color: ${THREAD_PALETTE.champagne};
  box-shadow:
    inset 0 1px 0 rgba(${CHAMPAGNE}, 0.22),
    0 10px 28px -16px rgba(${CHAMPAGNE}, 0.7);
}

.thread-badge__dot {
  background-color: ${THREAD_PALETTE.champagne};
  animation: thread-badge-pulse 2.6s ease-out infinite;
}

/* Ring expands and fades rather than the dot scaling, so nothing in the pill
   shifts the text baseline while it runs. */
@keyframes thread-badge-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(${CHAMPAGNE}, 0.6); }
  70%  { box-shadow: 0 0 0 0.5rem rgba(${CHAMPAGNE}, 0); }
  100% { box-shadow: 0 0 0 0 rgba(${CHAMPAGNE}, 0); }
}

/* --------------------------------------------------------------------------
   Cart trigger — the floating pill that appears once something is selected
   -------------------------------------------------------------------------- */

/* This carried shadow-2xl and no background, so it rendered as bare white text
   floating over the page — the one element that has to be found after an add
   was the least visible thing on screen. It now takes the primary button's
   surface: bone with ink text, which is the loudest pairing the palette has
   against near-black.

   Sits above the page but below the drawer (z-40 vs z-50), set on the element
   so the stacking stays with the component that owns it. */
.thread-cart-trigger {
  background-color: ${THREAD_PALETTE.bone};
  background-image: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.6),
    rgba(255, 255, 255, 0) 55%
  );
  color: ${THREAD_PALETTE.ink};
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(${CHAMPAGNE}, 0.35),
    0 4px 12px rgba(0, 0, 0, 0.6),
    0 18px 44px -18px rgba(${CHAMPAGNE}, 0.75);
  animation: thread-cart-trigger-in 420ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
}

.thread-cart-trigger:hover {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(${CHAMPAGNE}, 0.4),
    0 6px 16px rgba(0, 0, 0, 0.65),
    0 24px 56px -20px rgba(${CHAMPAGNE}, 0.95);
}

/* Rises into place rather than appearing, so the movement is what catches the
   eye — a static pill in a corner the reader was not looking at is easy to
   miss no matter how bright it is. */
@keyframes thread-cart-trigger-in {
  from { opacity: 0; transform: translateY(1.25rem) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* One-shot ring, remounted on every count change so a second add re-fires it.
   Decorative and non-interactive: it must never sit between the reader and the
   button underneath it. */
.thread-cart-trigger__ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  pointer-events: none;
  animation: thread-cart-trigger-ring 900ms ease-out 1 both;
}

@keyframes thread-cart-trigger-ring {
  0%   { box-shadow: 0 0 0 0 rgba(${BONE}, 0.65); }
  100% { box-shadow: 0 0 0 1.15rem rgba(${BONE}, 0); }
}

/* --------------------------------------------------------------------------
   Toggles — catalog filters, size and colour pickers
   -------------------------------------------------------------------------- */

/* Driven off aria-pressed, which the components already set, so the selected
   look cannot drift out of sync with the accessible state. */
/* The resting state is deliberately louder than the border-on-muted pairing
   these used to carry: a #2A2724 hairline with #8A8378 text on ink is legible
   in isolation and disappears in a row of seven. Warming the border and
   lifting the label toward bone makes an unselected filter read as a control
   that has not been chosen, rather than as a disabled one. */
.thread-toggle {
  border: 1px solid rgba(${CHAMPAGNE}, 0.3);
  background-color: rgba(${BONE}, 0.04);
  color: rgba(${BONE}, 0.72);
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    box-shadow 150ms ease;
}

.thread-toggle:hover {
  border-color: rgba(${CHAMPAGNE}, 0.65);
  background-color: rgba(${CHAMPAGNE}, 0.08);
  color: ${THREAD_PALETTE.champagne};
}

.thread-toggle:focus-visible {
  outline: 2px solid ${THREAD_PALETTE.champagne};
  outline-offset: 2px;
}

.thread-toggle[aria-pressed="true"] {
  border-color: ${THREAD_PALETTE.bone};
  background-color: ${THREAD_PALETTE.bone};
  color: ${THREAD_PALETTE.ink};
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 2px 6px rgba(0, 0, 0, 0.45),
    0 12px 26px -16px rgba(${CHAMPAGNE}, 0.7);
}

/* Colour swatches carry their own fill, so only the ring and lift apply. */
.thread-swatch {
  border: 2px solid rgba(${BONE}, 0.28);
  transition:
    transform 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.thread-swatch:hover { transform: scale(1.12); border-color: rgba(${CHAMPAGNE}, 0.8); }

.thread-swatch:focus-visible {
  outline: 2px solid ${THREAD_PALETTE.champagne};
  outline-offset: 2px;
}

.thread-swatch[aria-pressed="true"] {
  border-color: ${THREAD_PALETTE.bone};
  box-shadow:
    0 0 0 2px ${THREAD_PALETTE.ink},
    0 0 0 3px rgba(${BONE}, 0.55),
    0 8px 20px -10px rgba(${CHAMPAGNE}, 0.7);
}

/* --------------------------------------------------------------------------
   Quantity stepper
   -------------------------------------------------------------------------- */

.thread-stepper {
  border: 1px solid rgba(${CHAMPAGNE}, 0.3);
  background-color: rgba(${BONE}, 0.04);
  transition: border-color 150ms ease;
}

.thread-stepper:focus-within { border-color: rgba(${CHAMPAGNE}, 0.7); }

.thread-stepper__button {
  color: ${THREAD_PALETTE.bone};
  transition: background-color 150ms ease, color 150ms ease;
}

.thread-stepper__button:hover:not(:disabled) {
  background-color: rgba(${CHAMPAGNE}, 0.14);
  color: ${THREAD_PALETTE.champagne};
}

.thread-stepper__button:focus-visible {
  outline: 2px solid ${THREAD_PALETTE.champagne};
  outline-offset: -2px;
}

.thread-stepper__button:disabled { opacity: 0.3; cursor: not-allowed; }

/* --------------------------------------------------------------------------
   Cards
   -------------------------------------------------------------------------- */

/* Two vocabularies, deliberately kept apart.
 *
 * A card that links somewhere RISES on hover. A card that does not link
 * anywhere only LIGHTS UP — its border warms and the surface brightens, but it
 * never moves. Giving both the same lift is what trains someone to click a
 * panel that has nowhere to go, and this page has both kinds sitting in
 * near-identical grids a section apart.
 *
 * The surface lift is a bone overlay rather than a second background colour,
 * so charcoal stays the only declared surface in the palette.
 */
.thread-card {
  border: 1px solid ${THREAD_PALETTE.border};
  background-color: ${THREAD_PALETTE.charcoal};
  transition:
    transform 300ms ease,
    border-color 300ms ease,
    background-image 300ms ease,
    box-shadow 300ms ease;
}

.thread-card:hover {
  border-color: rgba(${CHAMPAGNE}, 0.5);
  background-image: linear-gradient(rgba(${BONE}, 0.035), rgba(${BONE}, 0.035));
  box-shadow:
    inset 0 1px 0 rgba(${CHAMPAGNE}, 0.14),
    0 14px 34px -24px rgba(${CHAMPAGNE}, 0.55);
}

/* Focus follows hover for the linked variant, so tabbing through the grid
   surfaces the same card the mouse would. */
.thread-card--link:hover,
.thread-card--link:focus-visible {
  transform: translateY(-4px);
  border-color: ${THREAD_PALETTE.champagne};
  box-shadow:
    inset 0 1px 0 rgba(${CHAMPAGNE}, 0.2),
    0 24px 48px -26px rgba(${CHAMPAGNE}, 0.75);
}

.thread-card--link:focus-visible {
  outline: 2px solid ${THREAD_PALETTE.champagne};
  outline-offset: 3px;
}

/* --------------------------------------------------------------------------
   Product gallery — the front/back panel on a catalog card
   -------------------------------------------------------------------------- */

/* pan-y hands vertical drags straight to the page. Without it the browser
   spends the first frames of every scroll deciding whether the gallery wanted
   the gesture, and a flick down a grid of cards feels like it catches. */
.thread-gallery {
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
}

.thread-gallery__track {
  transition: transform 450ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* A tracked drag is already at the finger's position — easing it there too
   would put the photo behind the thumb by a fixed lag the whole way across.
   will-change is scoped to the drag rather than declared on every track: the
   catalog renders two dozen of these, and a standing hint on all of them asks
   the compositor for two dozen layers nothing is animating. */
.thread-gallery__track[data-dragging="true"] {
  transition: none;
  will-change: transform;
}

/* Dark plate under the overlays. The panel behind them is a photograph, and
   these are shot on white, so nothing here can rely on the palette's ground
   for contrast. Near-opaque ink rather than a half-transparent black: at 0.55
   over a white studio background the chips turn mid-grey and read as a smudge
   on the photo instead of a control sitting above it. */
.thread-gallery__label,
.thread-gallery__arrow {
  border: 1px solid rgba(${CHAMPAGNE}, 0.4);
  background-color: rgba(${INK}, 0.78);
  backdrop-filter: blur(2px);
}

.thread-gallery__label { color: rgba(${BONE}, 0.9); }

.thread-gallery__arrow {
  color: ${THREAD_PALETTE.bone};
  transition:
    opacity 200ms ease,
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.thread-gallery__arrow:hover:not(:disabled) {
  background-color: rgba(${INK}, 0.92);
  border-color: ${THREAD_PALETTE.champagne};
  color: ${THREAD_PALETTE.champagne};
}

.thread-gallery__arrow:disabled { opacity: 0.25; cursor: default; }

.thread-gallery__arrow:focus-visible,
.thread-gallery__dot:focus-visible {
  outline: 2px solid ${THREAD_PALETTE.champagne};
  outline-offset: -2px;
  border-radius: 9999px;
}

/* On a phone the arrows are the sign that there is a second side at all, so
   they stay put. A mouse already has hover to discover it, and a permanent
   pair of chevrons on every card in a three-across grid is noise — they fade
   in with the card, and with focus, so tabbing surfaces them too. */
/* The disabled rule is repeated inside the query on purpose. A :disabled
   selector is one class more specific than the bare arrow selector, so an
   unqualified opacity: 0 here loses to it, and the dead end-of-run arrow ends
   up the one thing still showing on every resting card. */
@media (hover: hover) and (pointer: fine) {
  .thread-gallery__arrow,
  .thread-gallery__arrow:disabled { opacity: 0; }
  .thread-gallery:hover .thread-gallery__arrow,
  .thread-gallery:focus-within .thread-gallery__arrow { opacity: 1; }
  .thread-gallery:hover .thread-gallery__arrow:disabled,
  .thread-gallery:focus-within .thread-gallery__arrow:disabled { opacity: 0.25; }
}

/* The mark is the dot; the button around it is the 36px target a thumb needs.
   Sizing the dot itself to the target would put two saucers on the photo. */
.thread-gallery__dot-mark {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: rgba(${BONE}, 0.55);
  box-shadow: 0 0 0 1px rgba(${INK}, 0.7);
  transition: background-color 150ms ease, transform 150ms ease;
}

.thread-gallery__dot:hover .thread-gallery__dot-mark {
  background-color: rgba(${BONE}, 0.75);
}

.thread-gallery__dot[aria-pressed="true"] .thread-gallery__dot-mark {
  background-color: ${THREAD_PALETTE.champagne};
  transform: scale(1.3);
}

/* --------------------------------------------------------------------------
   FAQ rows
   -------------------------------------------------------------------------- */

/* An FAQ row is interactive but goes nowhere — it discloses in place — so it
   takes the illumination half of the card vocabulary and never the lift.
   Lifting a full-width row would also read as the row detaching from the
   stack, which is not what opening one does.
 *
 * The open row keeps a warm border after the pointer leaves. In a stack of
 * nine, a rotated chevron is the only thing marking which one is open, and it
 * is 20px of a 900px-wide row.
 */
.thread-faq:has(.thread-faq__trigger[aria-expanded="true"]) {
  border-color: rgba(${CHAMPAGNE}, 0.5);
  background-image: linear-gradient(rgba(${BONE}, 0.03), rgba(${BONE}, 0.03));
}

/* The divider between question and answer, warmed to match the open row's
   border so the panel does not look stitched on with a colder seam. */
.thread-faq__panel {
  border-top: 1px solid rgba(${CHAMPAGNE}, 0.28);
  color: ${THREAD_PALETTE.muted};
}

.thread-faq__trigger:focus-visible {
  outline: 2px solid ${THREAD_PALETTE.champagne};
  outline-offset: -3px;
  border-radius: 0.5rem;
}

.thread-faq__icon {
  color: ${THREAD_PALETTE.champagne};
  transition: transform 200ms ease, color 200ms ease;
}

.thread-faq:hover .thread-faq__icon { color: ${THREAD_PALETTE.bone}; }

.thread-faq__trigger[aria-expanded="true"] .thread-faq__icon {
  transform: rotate(180deg);
}

/* The chevron leans the way the action goes: down to open, up to close. The
   open row is already rotated, so the same +2px lands as a nudge upward. */
.thread-faq:hover .thread-faq__icon { transform: translateY(2px); }

.thread-faq:hover .thread-faq__trigger[aria-expanded="true"] .thread-faq__icon {
  transform: rotate(180deg) translateY(2px);
}

/* --------------------------------------------------------------------------
   Header and footer links
   -------------------------------------------------------------------------- */

/* The header's section links: bone at rest, champagne on hover and focus, and
   an underline that grows in from the left — the treatment the parent site's
   header gave its own links, in this palette. They lead to places on the page
   rather than acting on it, which is why they are not .thread-btn buttons. */
.thread-nav-link {
  position: relative;
  color: ${THREAD_PALETTE.bone};
  transition: color 160ms ease;
}

.thread-nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.3rem;
  height: 2px;
  width: 0;
  background-color: ${THREAD_PALETTE.champagne};
  transition: width 300ms ease;
}

.thread-nav-link:hover,
.thread-nav-link:focus-visible { color: ${THREAD_PALETTE.champagne}; }

.thread-nav-link:hover::after,
.thread-nav-link:focus-visible::after { width: 100%; }

/* Footer links: muted at rest, champagne when pointed at. No underline; the
   footer is a list, not a bar. */
.thread-footer-link {
  color: ${THREAD_PALETTE.muted};
  transition: color 160ms ease;
}

.thread-footer-link:hover,
.thread-footer-link:focus-visible { color: ${THREAD_PALETTE.champagne}; }

.thread-nav-link:focus-visible,
.thread-footer-link:focus-visible {
  outline: 2px solid ${THREAD_PALETTE.champagne};
  outline-offset: 4px;
  border-radius: 0.25rem;
}

/* --------------------------------------------------------------------------
   Reduced motion
   -------------------------------------------------------------------------- */

/* The global rule in globals.css collapses durations but these keyframes are
   declared here, so the pulse is stopped explicitly. Hover and
   press feedback stay: they are responses to the reader's own input, not
   ambient movement, and removing them would leave the controls feeling dead.
   Only the transform part is dropped, since that is the piece that moves
   without being asked. */
@media (prefers-reduced-motion: reduce) {
  .thread-badge__dot { animation: none; }
  .thread-cart-trigger__ring { animation: none; }
  /* The trigger still needs to arrive, it just arrives without travelling —
     dropping the animation entirely would leave it at the keyframe's starting
     opacity of 0 and hide the control outright. */
  .thread-cart-trigger { animation: thread-cart-trigger-fade 200ms ease-out both; }
  .thread-btn:hover,
  .thread-btn:active,
  .thread-swatch:hover,
  .thread-card--link:hover,
  .thread-card--link:focus-visible { transform: none; }
  /* The gallery still changes view — it just cuts to it. The transform itself
     has to stay: it is what selects the slide, not decoration on top of one.
     Declared here because this stylesheet's rule sets the duration, and the
     global reduced-motion rule in globals.css cannot reach a page-scoped
     class it never sees. */
  .thread-gallery__track { transition: none; }
}

@keyframes thread-cart-trigger-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

export function ThreadStyles() {
  return <style>{css}</style>;
}
