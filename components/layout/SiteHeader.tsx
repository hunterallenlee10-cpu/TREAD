"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { THREAD_PALETTE, threadCopy } from "@/data/thread";
import { orderRequestHref, siteNav } from "@/data/navigation";

/**
 * The header for a one-page site: the wordmark, an anchor bar for the
 * sections, and the one call to action.
 *
 * Section links are plain anchors on purpose. `html` carries `scroll-smooth`
 * and `scroll-padding-top: 80px` in globals.css, so `href="/#catalog"` scrolls
 * smoothly and lands under this header without any JavaScript — which also
 * means the nav works before hydration and with scripts off. The only client
 * state here is the scrolled surface and the phone menu.
 *
 * Exactly 80px tall, border included: the bar is `5rem - 1px` under a 1px
 * bottom border. `pt-20` on `<main>` and `scroll-padding-top` in globals.css
 * both assume 80px; change all three together or the sections land under the
 * bar.
 *
 * On the parent site this page wore the Lee Enterprises Unlimited header, with
 * LEU's own navigation. None of that belongs here; the footer links back to the
 * parent instead.
 */
export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        // Return focus to the control that opened the menu, so a keyboard user
        // is not dropped at the top of the document after dismissing it.
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const solid = isScrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300 ${
        solid ? "backdrop-blur-md" : "backdrop-blur-sm"
      }`}
      style={{
        // Ink at 95% once scrolled or open, 50% over the hero — the same
        // treatment the parent site's header used, in this palette.
        backgroundColor: solid ? `${THREAD_PALETTE.ink}F2` : `${THREAD_PALETTE.ink}80`,
        borderColor: solid ? THREAD_PALETTE.border : "transparent",
      }}
    >
      <div className="section-container flex h-[calc(5rem-1px)] items-center justify-between gap-6">
        <Link
          href="/"
          onClick={closeMenu}
          // The outline colour is champagne from globals.css; the width is all
          // this needs to add.
          className="flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
          aria-label="Thread T-Shirts — back to top"
        >
          {/* The file is 720×522 with the lettering in its top 292 rows
              (lib/logo.ts), so the box takes that ratio — 44px tall, 108px
              wide — and `object-top` crops away the empty canvas below. */}
          <Image
            src="/thread/wordmark.png"
            alt=""
            width={720}
            height={522}
            priority
            className="h-11 w-[108px] object-cover object-top"
            // The same lift the hero gives the mark: the artwork is a
            // near-bone grey only a few steps off `muted`.
            style={{ filter: "brightness(1.16) contrast(1.06)" }}
          />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-8 lg:flex">
          {siteNav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="thread-nav-link text-sm font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center sm:flex">
          <a
            href={orderRequestHref}
            className="thread-btn thread-btn--primary inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            {threadCopy.finalCta.primaryCta}
          </a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="thread-btn -mr-2 rounded-md p-2 lg:hidden"
          style={{ color: THREAD_PALETTE.bone }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
        >
          {menuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Phone and tablet menu. Always in the DOM so `aria-controls` above
          points at something; `hidden` does the toggling. It lists every
          section plus the call to action the bar shows on wider screens, so
          nothing reachable on desktop is unreachable on a phone.

          Capped at the viewport height below the 80px bar and allowed to
          scroll, so on a short viewport (a phone in landscape) the lower items
          cannot fall off the bottom out of reach. `overscroll-contain` keeps
          that inner scroll from chaining to the page behind it. */}
      <div
        id="site-menu"
        hidden={!menuOpen}
        className="max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain border-t lg:hidden"
        style={{
          borderColor: THREAD_PALETTE.border,
          backgroundColor: THREAD_PALETTE.ink,
        }}
      >
        <nav aria-label="Sections" className="section-container flex flex-col gap-1 py-4">
          {siteNav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-white/5"
              style={{ color: THREAD_PALETTE.bone }}
            >
              {item.label}
            </a>
          ))}
          <a
            href={orderRequestHref}
            onClick={closeMenu}
            className="thread-btn thread-btn--primary mt-3 inline-flex items-center justify-center rounded-lg px-5 py-3 text-base font-semibold sm:hidden"
          >
            {threadCopy.finalCta.primaryCta}
          </a>
        </nav>
      </div>
    </header>
  );
}
