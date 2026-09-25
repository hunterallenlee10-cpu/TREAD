"use client";

import { useRef, useState, type PointerEvent, type TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { THREAD_PALETTE } from "@/data/thread";

/**
 * The photo panel on a product card, for pieces shot from more than one side.
 *
 * The card used to cross-fade to the back on hover, which is the whole reason
 * `data/thread.ts` also spells out back prints in `details` — a phone has no
 * hover, so half the garment was simply unreachable there. This makes the
 * second side a first-class view instead: swipe it, tap it, click an arrow, or
 * pick a dot. Hover still peeks, so nothing about the desktop card changes
 * until the reader takes hold of it.
 *
 * The slides live in one translated track rather than a stack of cross-fading
 * layers. A swipe has to follow the finger to feel like a swipe, and a track
 * can be offset by the drag distance mid-gesture where an opacity pair cannot.
 */

export interface ThreadGalleryView {
  src: string;
  alt: string;
  /** Names the side in the controls — "Front", "Back". */
  label: string;
}

interface ThreadProductGalleryProps {
  views: ThreadGalleryView[];
  /** `next/image` sizes for the panel. */
  sizes: string;
  /** Product name, so each card's controls are distinguishable to a screen reader. */
  name: string;
}

/** How far a finger has to travel before the swipe commits to the next view. */
const SWIPE_COMMIT_PX = 48;

/**
 * Slack before the gesture is judged horizontal or vertical. Below this a
 * touch is still ambiguous, and stealing it early turns a scroll down the page
 * into a flipped shirt.
 */
const AXIS_LOCK_PX = 12;

/** Drag past the first or last view is damped rather than blocked, so the
 *  panel answers the finger but reads as having nothing behind it. */
const EDGE_RESISTANCE = 3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

interface TouchState {
  startX: number;
  startY: number;
  axis: "none" | "x" | "y";
  dx: number;
  width: number;
  /** Set once a drag actually moves, so the click it may synthesize is ignored. */
  moved: boolean;
}

const IDLE_TOUCH: TouchState = {
  startX: 0,
  startY: 0,
  axis: "none",
  dx: 0,
  width: 1,
  moved: false,
};

const PANEL_CLASS = "relative aspect-square w-full overflow-hidden";

export function ThreadProductGallery({
  views,
  sizes,
  name,
}: ThreadProductGalleryProps) {
  const [index, setIndex] = useState(0);
  /**
   * True once the reader has flipped the panel themselves. Hover peek stops
   * there: a card that snaps back to the front when the mouse drifts off is
   * fighting the click that just asked for the back.
   */
  const [taken, setTaken] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const touch = useRef<TouchState>({ ...IDLE_TOUCH });

  // A single photo renders exactly what the card rendered before this
  // component existed — no track, no controls, nothing to interact with.
  if (views.length < 2) {
    const only = views[0];
    return (
      <div
        className={PANEL_CLASS}
        style={{ backgroundColor: THREAD_PALETTE.ink }}
      >
        {only && (
          <Image
            src={only.src}
            alt={only.alt}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
    );
  }

  const last = views.length - 1;
  const shown = taken ? index : peeking ? 1 : index;

  /**
   * Every move is measured from `shown`, never from `index`. Mid-peek the two
   * disagree — the reader is looking at the back while the committed index is
   * still 0 — and stepping from the index would spend the click getting back
   * to the view already on screen.
   */
  const go = (delta: number) => {
    setTaken(true);
    setIndex(clamp(shown + delta, 0, last));
  };

  const select = (next: number) => {
    setTaken(true);
    setIndex(next);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;
    const point = event.touches[0];
    touch.current = {
      ...IDLE_TOUCH,
      startX: point.clientX,
      startY: point.clientY,
      width: event.currentTarget.clientWidth || 1,
    };
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const state = touch.current;
    if (state.axis === "y" || event.touches.length !== 1) return;

    const point = event.touches[0];
    const dx = point.clientX - state.startX;
    const dy = point.clientY - state.startY;

    if (state.axis === "none") {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      // A vertical verdict is final for the rest of the gesture. `touch-action:
      // pan-y` has already handed that one to the page, and re-deciding
      // halfway down a scroll would flip the card under the reader's thumb.
      state.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (state.axis !== "x") return;
      setTaken(true);
      setDragging(true);
    }

    const atEdge = (shown === 0 && dx > 0) || (shown === last && dx < 0);
    state.dx = clamp(
      atEdge ? dx / EDGE_RESISTANCE : dx,
      -state.width,
      state.width
    );
    state.moved = true;
    setDragX(state.dx);
  };

  const handleTouchEnd = () => {
    const state = touch.current;
    // Read the gesture out of the ref before resetting it. A `setIndex`
    // updater that reached back into `touch.current` would run after this
    // function returns and find the cleared values, which is a swipe that
    // animates the whole way across and then quietly lands where it started.
    const { axis, dx } = state;

    state.axis = "none";
    state.dx = 0;
    setDragging(false);
    setDragX(0);

    if (axis === "x" && Math.abs(dx) > SWIPE_COMMIT_PX) {
      setTaken(true);
      setIndex(clamp(shown + (dx < 0 ? 1 : -1), 0, last));
    }
  };

  // Tap anywhere on the photo cycles it. The arrows and dots are the keyboard
  // and screen-reader path; this is the one a thumb finds without aiming.
  const handleClick = () => {
    const state = touch.current;
    if (state.moved) {
      state.moved = false;
      return;
    }
    setTaken(true);
    setIndex((shown + 1) % views.length);
  };

  // A mouse press is always a fresh gesture. On a laptop with a touchscreen a
  // swipe can end without the browser synthesizing a click, which leaves the
  // suppression flag set — without this the next click of the mouse is the one
  // that pays for it.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") touch.current.moved = false;
  };

  // Only a mouse peeks. Touch browsers leave `:hover` stuck on the last thing
  // tapped, which on a grid of cards means one of them silently holding the
  // back photo after the reader has moved on.
  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setPeeking(true);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setPeeking(false);
  };

  const prev = views[clamp(shown - 1, 0, last)];
  const next = views[clamp(shown + 1, 0, last)];

  return (
    <div
      className={`thread-gallery ${PANEL_CLASS} cursor-pointer select-none`}
      style={{ backgroundColor: THREAD_PALETTE.ink }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className="thread-gallery__track flex h-full w-full"
        data-dragging={dragging ? "true" : undefined}
        style={{
          transform: `translate3d(calc(${-shown * 100}% + ${dragX}px), 0, 0)`,
        }}
      >
        {views.map((view) => (
          <div key={view.src} className="relative h-full w-full flex-shrink-0">
            <Image
              src={view.src}
              alt={view.alt}
              fill
              sizes={sizes}
              draggable={false}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* Names the side on screen, and announces it after a swipe, which is the
          one path here with no button to carry the state. */}
      <span
        aria-live="polite"
        className="thread-gallery__label pointer-events-none absolute right-3 top-3 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider"
      >
        {views[shown].label}
      </span>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          go(-1);
        }}
        disabled={shown === 0}
        aria-label={`Show ${prev.label.toLowerCase()} of ${name}`}
        className="thread-gallery__arrow absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          go(1);
        }}
        disabled={shown === last}
        aria-label={`Show ${next.label.toLowerCase()} of ${name}`}
        className="thread-gallery__arrow absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-1 flex justify-center">
        {views.map((view, position) => (
          <button
            key={view.src}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              select(position);
            }}
            aria-pressed={position === shown}
            aria-label={`Show ${view.label.toLowerCase()} of ${name}`}
            className="thread-gallery__dot flex h-9 w-9 items-center justify-center"
          >
            <span className="thread-gallery__dot-mark" />
          </button>
        ))}
      </div>
    </div>
  );
}
