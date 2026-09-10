/**
 * Every public page of the site, in one list.
 *
 * The router builds its routes from this and the build writes sitemap.xml from
 * it, so the two cannot drift: a page that exists is a page search engines are
 * told about. Adding a path here is a type error until App.tsx gives it an
 * element, and removing one is an error until that element goes too.
 *
 * Not listed here: /locations, which only redirects to /contact#store. A
 * redirect is not a page, and a sitemap that advertises one asks a crawler to
 * fetch a URL that immediately sends it somewhere else.
 *
 * The order is the order the pages are meant to be found in — the sitemap
 * keeps it, though no crawler reads anything into it.
 */
export const ROUTE_PATHS = [
  '/',
  '/fleet',
  '/book',
  '/tours',
  '/driving-permit',
  '/about',
  '/blog',
  '/contact',
] as const;

export type RoutePath = (typeof ROUTE_PATHS)[number];
