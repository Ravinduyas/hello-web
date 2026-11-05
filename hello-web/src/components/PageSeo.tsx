import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getBlogPostByPath } from '../data/blog';
import { seoFor } from '../data/seo';

/**
 * Keeps the document's metadata and article JSON-LD in step with the route.
 *
 * The build writes each route's title, description, canonical and structured
 * data into its own HTML file, which is what crawlers and link previews read on
 * direct arrival. Moving between pages in the browser never fetches a new
 * document, so this component keeps `<head>` accurate across SPA navigation too.
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

    og('og:type', seo.ogType ?? 'website');
    og('og:title', seo.title);
    og('og:description', seo.description);
    og('og:url', url);
    og('og:image', image);
    meta('twitter:title', seo.title);
    meta('twitter:description', seo.description);
    meta('twitter:image', image);

    // Keep dynamic BlogPosting + FAQPage JSON-LD synced on SPA navigation.
    remove('script[data-dynamic-seo="true"]');
    const post = getBlogPostByPath(pathname);
    if (post) {
      const schemas = [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.metaDescription,
          image: origin + post.heroImage,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          keywords: post.keywords.join(', '),
          author: {
            '@type': 'Organization',
            name: 'Hello Rent - Scooter & Tuktuk Rental',
            url: origin + '/about',
          },
          publisher: {
            '@type': 'AutoRental',
            name: 'Hello Rent',
            alternateName: 'Hello Rent - Scooter & Tuktuk Rental',
            url: origin + '/',
            logo: {
              '@type': 'ImageObject',
              url: origin + '/brand/logo.jpg',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ];

      for (const schema of schemas) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-dynamic-seo', 'true');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      }
    }
  }, [pathname]);

  return null;
}
