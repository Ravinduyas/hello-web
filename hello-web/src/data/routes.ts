import { BLOG_POSTS } from './blog';

/**
 * Every public page of the site, in one list.
 *
 * The router builds its routes from this and the build writes sitemap.xml from
 * it, so the two cannot drift: a page that exists is a page search engines are
 * told about. Adding a path here is a type error until App.tsx gives it an
 * element, and removing one is an error until that element goes too.
 *
 * Not listed here: /locations, which redirects to /contact#store, and /book,
 * which redirects to /book-now after the page was renamed. A redirect is not a
 * page, and a sitemap that advertises one asks a crawler to fetch a URL that
 * immediately sends it somewhere else.
 *
 * The order is the order the pages are meant to be found in — the sitemap
 * keeps it, though no crawler reads anything into it.
 */
export const ROUTE_PATHS = [
  '/',
  '/fleet',
  '/book-now',
  '/tours',
  '/driving-permit',
  '/about',
  '/blog',
  '/contact',
] as const;

export type RoutePath = (typeof ROUTE_PATHS)[number];

/** Individual blog article paths generated from the shared blog dataset. */
export const BLOG_ROUTE_PATHS: readonly string[] = BLOG_POSTS.map(
  post => `/blog/${post.slug}`,
);

/** Every indexable public URL across static pages and blog articles. */
export const ALL_PUBLIC_PATHS: readonly string[] = [
  ...ROUTE_PATHS,
  ...BLOG_ROUTE_PATHS,
];
