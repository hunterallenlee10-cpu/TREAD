"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * useLayoutEffect warns when it runs during server rendering, and useEffect is
 * too late here — see the note in ThreadReveal about painting the hidden state
 * before the browser's first paint.
 */
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

interface ThreadRevealProps {
  children: ReactNode;
  /**
   * Stagger offset in milliseconds. Cap this at the call site — a long grid
   * staggered linearly leaves the last card arriving well after the reader has
   * already looked at it.
   */
  delay?: number;
  /**
   * Passed to the wrapper. When this wraps a grid child, the wrapper becomes
   * the grid item, so pass `h-full` here and on the child, or cards that relied
   * on grid stretch for equal heights will collapse to their content.
   */
  className?: string;
  /**
   * Element to render. Use `li` inside an ordered or unordered list — a `div`
   * between the list and its items is invalid HTML and drops the list
   * semantics screen readers rely on.
   */
  as?: "div" | "li";
  /** Merged with the stagger delay, so a card's own colours survive. */
  style?: CSSProperties;
}

/**
 * Fades and lifts its children into view once, the first time they scroll near
 * the viewport.
 *
 * Visibility is decided in JS rather than CSS so that the server HTML and
 * anyone who has asked for reduced motion always carry fully visible content.
 * Gating purely in CSS would leave the page blank for a visitor whose observer
 * never runs.
 *
 * The arming happens before the browser's first paint. With a plain useEffect
 * the content would paint visible, then hide, then fade back in — a flicker on
 * every load.
 *
 * Transitions only, no keyframes: the reduced-motion rule in globals.css
 * already collapses transition durations under prefers-reduced-motion.
 */
export function ThreadReveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  style,
}: ThreadRevealProps) {
  const [armed, setArmed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useBeforePaint(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !armed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      // Start slightly before the element is fully on screen so the movement
      // finishes about when the reader gets there.
      { rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [armed]);

  const hidden = armed && !revealed;

  // The transition is attached only for the reveal itself. Leaving it on
  // permanently means arming — which flips opacity 1 to 0 — animates too, so
  // every element on the page visibly fades *out* on load before fading back
  // in. Arming has to snap.
  const motion = revealed ? "transition-all duration-700 ease-out" : "";

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLLIElement>}
      // Stable hooks for tests and debugging: the class list changes with
      // state, so assertions should not key off it.
      data-reveal=""
      data-revealed={revealed}
      style={delay && revealed ? { ...style, transitionDelay: `${delay}ms` } : style}
      className={`${motion} ${
        hidden ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
