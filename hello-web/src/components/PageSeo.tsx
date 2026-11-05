import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { seoFor } from '../data/seo';
import { schemasForPath } from '../data/schema';
import { BASE_URL } from '../lib/asset';

/**
 * Keeps the document's metadata and JSON-LD structured data in step with the route.
 *
 * The build writes each route's title, description, canonical, OpenGraph tags,
 * and Schema.org scripts into its own HTML file for crawlers and link previews.
 * On client-side navigation no new document is fetched, so this component keeps
 * the live `<head>` identical to what a fresh request would serve.
 *
 * Renders nothing. It only edits the head.
 */
export default function PageSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = seoFor(pathname);
    const siteRoot = window.location.origin + BASE_URL.replace(/\/+$/, '');
    const url = siteRoot + (pathname === '/' ? '/' : pathname);
    const image = siteRoot + '/' + (seo.image ?? '/photos/shop-front.jpg').replace(/^\/+/, '');
    const ogType = seo.type ?? 'website';

    document.title = seo.title;

    const set = (selector: string, create: () => HTMLElement, attr: string, value: string) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const remove = (selector: string) => {
      document.head.querySelectorAll(selector).forEach(el => el.remove());
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
    if (seo.keywords && seo.keywords.length > 0) {
      meta('keywords', seo.keywords.join(', '));
    } else {
      remove('meta[name="keywords"]');
    }

    set(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
      'href',
      url,
    );

    og('og:type', ogType);
    og('og:title', seo.title);
    og('og:description', seo.description);
    og('og:url', url);
    og('og:image', image);

    if (ogType === 'article' && seo.publishedTime) {
      og('article:published_time', seo.publishedTime);
    } else {
      remove('meta[property="article:published_time"]');
    }

    if (ogType === 'article' && seo.section) {
      og('article:section', seo.section);
    } else {
      remove('meta[property="article:section"]');
    }

    remove('meta[property="article:tag"]');
    if (ogType === 'article' && seo.keywords) {
      for (const kw of seo.keywords) {
        const el = document.createElement('meta');
        el.setAttribute('property', 'article:tag');
        el.setAttribute('content', kw);
        document.head.appendChild(el);
      }
    }

    meta('twitter:card', 'summary_large_image');
    meta('twitter:title', seo.title);
    meta('twitter:description', seo.description);
    meta('twitter:image', image);

    // Replace route-managed JSON-LD blocks cleanly so SPA navigations carry
    // accurate BlogPosting, FAQPage, BreadcrumbList, and AutoRental schemas.
    remove('script[type="application/ld+json"][data-hello-seo="true"]');
    for (const schema of schemasForPath(siteRoot, pathname)) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-hello-seo', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [pathname]);

  return null;
}
