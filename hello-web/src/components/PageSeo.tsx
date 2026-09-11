import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { seoFor } from '../data/seo';

/**
 * Keeps the document's metadata in step with the route.
 *
 * The build writes each route's title, description and canonical into its own
 * HTML file, which is what a crawler and a link preview read. But moving
 * between pages in the browser never fetches a new document, so without this
 * the tab, the bookmark and the history entry would all keep whichever page was
 * loaded first — and anything that reads the DOM after navigation, including
 * Google's renderer, would see the wrong page described.
 *
 * Renders nothing. It only edits the head.
 */
export default function PageSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = seoFor(pathname);
    const origin = window.location.origin;
    const url = origin + pathname;
    const image = origin + (seo.image ?? '/photos/shop-front.jpg');

    document.title = seo.title;

    const set = (selector: string, create: () => HTMLElement, attr: string, value: string) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const meta = (name: string, content: string) =>
      set(
        `meta[name="${name}"]`,
        () => Object.assign(document.createElement('meta'), { name }),
        'content',
        content,
      );

    const og = (property: string, content: string) =>
      set(
        `meta[property="${property}"]`,
        () => {
          const el = document.createElement('meta');
          el.setAttribute('property', property);
          return el;
        },
        'content',
        content,
      );

    meta('description', seo.description);
    set(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
      'href',
      url,
    );

    og('og:title', seo.title);
    og('og:description', seo.description);
    og('og:url', url);
    og('og:image', image);
    meta('twitter:title', seo.title);
    meta('twitter:description', seo.description);
    meta('twitter:image', image);
  }, [pathname]);

  return null;
}
