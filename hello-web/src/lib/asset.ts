/** The base path the site is served from, and a helper for files in `public/`. */

// On GitHub Pages the site lives under a sub-path (e.g. '/hello-rent/'), so a
// root-absolute literal like '/hero.jpg' would 404 there. Vite exposes the
// configured base as import.meta.env.BASE_URL — '/' in dev, the project path in
// a production build — so the same call works in both.
export const BASE_URL = (import.meta as { env?: Record<string, string> }).env?.BASE_URL ?? '/';

export function asset(path: string): string {
  return `${BASE_URL}${path.replace(/^\//, '')}`;
}
