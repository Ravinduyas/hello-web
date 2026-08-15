import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top whenever the route changes.
 * Without this, navigating between pages keeps the previous scroll offset.
 *
 * When the destination carries a hash (e.g. /about#story) we scroll to that
 * section instead, so cross-page anchor links from the homepage land where
 * they point rather than at the top of the page.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const behavior = prefersReduced ? 'auto' : 'smooth';

    if (hash) {
      // The target only exists after the new route has painted, so defer a frame.
      const id = requestAnimationFrame(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior, block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior });
        }
      });
      return () => cancelAnimationFrame(id);
    }

    window.scrollTo({ top: 0, behavior });
  }, [pathname, hash]);

  return null;
}
