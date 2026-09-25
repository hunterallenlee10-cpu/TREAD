/**
 * The header and footer navigation. One page, so every entry is a fragment link
 * to a section on it.
 *
 * The hrefs are root-anchored (`/#…`, not `#…`) so they resolve from any route,
 * not just the home page: on the 404 page a bare `#catalog` would be inert,
 * while `/#catalog` navigates home and lands on the section. On the home page
 * itself the browser treats a `/#…` click as an in-page fragment navigation —
 * no reload — and `scroll-smooth` plus `scroll-padding-top: 80px` in globals.css
 * carry the scroll, so the same links work smoothly everywhere with no
 * JavaScript. The `/#` prefix is enforced by the type so a bare hash cannot
 * sneak back in.
 *
 * Every id here (the part after `/#`) must exist on a section in
 * `components/thread/`. The order is the order the sections appear down the
 * page. The page's own buttons still use bare `#catalog` / `#order-request`
 * hrefs, as they did on the parent site; they only ever render on the page
 * that carries those sections.
 */
export interface SiteNavItem {
  id: string;
  label: string;
  href: `/#${string}`;
}

export const siteNav: readonly SiteNavItem[] = [
  { id: "nav-collection", label: "Collection", href: "/#catalog" },
  { id: "nav-custom", label: "Custom Apparel", href: "/#custom-apparel" },
  { id: "nav-process", label: "How It Works", href: "/#process" },
  { id: "nav-faq", label: "FAQ", href: "/#faq" },
];

/** Where every "start an order" control outside the page's sections lands. */
export const orderRequestHref = "/#order-request" as const;
