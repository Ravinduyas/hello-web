import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top whenever the route changes.
 * Without this, navigating between pages keeps the previous scroll offset.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }, [pathname]);

  return null;
}
