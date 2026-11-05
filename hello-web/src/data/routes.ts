import { BLOG_POSTS } from './blog';

/**
 * Every public page of the site, in one list.
 *
 * The router builds its routes from this and the build writes sitemap.xml from
 * ALL_ROUTE_PATHS (core pages + individual blog guides), so the two cannot
 * drift: a page that exists is a page search engines are told about.
 *
 * Not listed here: /locations, which redirects to /contact#store, and /book,
 * which redirects to /book-now after the page was renamed.
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

/** Core routes plus every individual `/blog/<slug>` article for sitemap & static HTML generation. */
export const ALL_ROUTE_PATHS: string[] = [
  ...ROUTE_PATHS,
  ...BLOG_POSTS.map(post => post.path),
];
