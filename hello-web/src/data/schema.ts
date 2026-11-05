import { BLOG_POSTS, getBlogPostBySlug, type BlogFaq, type BlogPost } from './blog';
import { bikes } from './fleet';

/**
 * Shared Schema.org JSON-LD builders read both by Vite's static route generator
 * (`vite-plugin-seo-routes.ts`) and by `PageSeo.tsx` on client-side navigation.
 */

export const SHOP_SCHEMA_META = {
  name: 'Hello Rent - Scooter & Tuktuk Rental',
  shortName: 'Hello Rent',
  phone: '+94767073388',
  town: 'Weligama',
  region: 'Southern Province',
  country: 'LK',
  opens: '07:00',
  closes: '21:00',
  street: '',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Hello+Rent+-+Scooter+%26+Tuktuk+Rental',
} as const;

function absUrl(origin: string, path: string): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = '/' + path.replace(/^\/+/, '');
  try {
    const baseSubpath = new URL(cleanOrigin).pathname.replace(/\/+$/, '');
    if (baseSubpath && cleanPath.startsWith(baseSubpath + '/')) {
      return cleanOrigin + cleanPath.slice(baseSubpath.length);
    }
  } catch {
    // Fallback if origin is not a full URL
  }
  return cleanOrigin + cleanPath;
}

function estimateWordCount(post: BlogPost): number {
  const chunks: string[] = [
    post.title,
    post.excerpt,
    ...post.sections.flatMap(s => [
      s.heading,
      ...s.paragraphs,
      ...(s.bullets?.flatMap(b => [b.title, b.detail]) ?? []),
    ]),
    ...post.faqs.flatMap(f => [f.question, f.answer]),
  ];
  return chunks
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function localBusinessSchema(origin: string) {
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressLocality: SHOP_SCHEMA_META.town,
    addressRegion: SHOP_SCHEMA_META.region,
    addressCountry: SHOP_SCHEMA_META.country,
  };
  if (SHOP_SCHEMA_META.street) address.streetAddress = SHOP_SCHEMA_META.street;

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    '@id': absUrl(origin, '/') + '#shop',
    name: SHOP_SCHEMA_META.name,
    alternateName: SHOP_SCHEMA_META.shortName,
    description:
      'Local scooter, motorbike, self-drive tuk-tuk and car rental shop in Weligama, Sri Lanka. Daily rates from €5, helmets included, Sri Lankan driving permits arranged, and south-coast hotel delivery.',
    url: absUrl(origin, '/'),
    telephone: SHOP_SCHEMA_META.phone,
    image: absUrl(origin, '/photos/shop-front.jpg'),
    logo: absUrl(origin, '/brand/logo.jpg'),
    hasMap: SHOP_SCHEMA_META.mapUrl,
    priceRange: '€€',
    address,
    areaServed: [
      SHOP_SCHEMA_META.town,
      'Mirissa',
      'Midigama',
      'Ahangama',
      'Matara',
      'Hiriketiya',
      'Sri Lanka',
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: SHOP_SCHEMA_META.opens,
      closes: SHOP_SCHEMA_META.closes,
    },
  };
}

export function fleetSchema(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Hello Rent Weligama fleet — scooters, motorbikes, tuk-tuks and cars',
    itemListElement: bikes.slice(0, 25).map((bike, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: bike.title,
        category: bike.category,
        image: absUrl(origin, bike.image),
        offers: {
          '@type': 'Offer',
          price: bike.pricePerDay,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: absUrl(origin, '/book-now'),
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: bike.pricePerDay,
            priceCurrency: 'EUR',
            unitCode: 'DAY',
          },
        },
      },
    })),
  };
}

export function breadcrumbSchema(
  origin: string,
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: absUrl(origin, item.path),
    })),
  };
}

export function blogIndexSchema(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Hello Rent Weligama — Scooter, Bike & Tuk-Tuk Rental Blog',
    description:
      'Local guides on scooter rental in Weligama, bike rent, self-drive tuk-tuk rental in Sri Lanka, driving permits, prices, and south-coast routes.',
    url: absUrl(origin, '/blog'),
    publisher: {
      '@type': 'Organization',
      '@id': absUrl(origin, '/') + '#shop',
      name: SHOP_SCHEMA_META.name,
      logo: {
        '@type': 'ImageObject',
        url: absUrl(origin, '/brand/logo.jpg'),
      },
    },
    blogPost: BLOG_POSTS.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.seoDescription,
      url: absUrl(origin, `/blog/${post.slug}`),
      datePublished: post.publishedAt,
      image: absUrl(origin, post.image),
      keywords: post.keywords.join(', '),
    })),
  };
}

export function blogPostingSchema(origin: string, post: BlogPost) {
  const postUrl = absUrl(origin, `/blog/${post.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription,
    image: [absUrl(origin, post.image)],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    articleSection: post.category,
    keywords: post.keywords.join(', '),
    inLanguage: 'en',
    wordCount: estimateWordCount(post),
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: absUrl(origin, '/about'),
    },
    publisher: {
      '@type': 'Organization',
      '@id': absUrl(origin, '/') + '#shop',
      name: SHOP_SCHEMA_META.name,
      logo: {
        '@type': 'ImageObject',
        url: absUrl(origin, '/brand/logo.jpg'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };
}

export function faqPageSchema(faqs: BlogFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

const ROUTE_LABELS: Record<string, string> = {
  '/fleet': 'Our Fleet',
  '/book-now': 'Book Now',
  '/tours': 'Day Trips & Routes',
  '/driving-permit': 'Driving Permit',
  '/about': 'About Us',
  '/blog': 'Blog',
  '/contact': 'Contact Us',
};

/** All JSON-LD structured data blocks appropriate for a given public path. */
export function schemasForPath(origin: string, rawPath: string): unknown[] {
  const clean = '/' + rawPath.replace(/^\/+|\/+$/g, '');
  const schemas: unknown[] = [localBusinessSchema(origin)];

  if (clean === '/') {
    return schemas;
  }

  if (clean === '/fleet') {
    schemas.push(
      breadcrumbSchema(origin, [
        { name: 'Home', path: '/' },
        { name: 'Our Fleet', path: '/fleet' },
      ]),
      fleetSchema(origin),
    );
    return schemas;
  }

  if (clean === '/blog') {
    schemas.push(
      breadcrumbSchema(origin, [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
      ]),
      blogIndexSchema(origin),
    );
    return schemas;
  }

  if (clean.startsWith('/blog/')) {
    const slug = clean.slice('/blog/'.length);
    const post = getBlogPostBySlug(slug);
    if (post) {
      schemas.push(
        breadcrumbSchema(origin, [
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]),
        blogPostingSchema(origin, post),
      );
      if (post.faqs.length > 0) {
        schemas.push(faqPageSchema(post.faqs));
      }
      return schemas;
    }
  }

  const label = ROUTE_LABELS[clean];
  if (label) {
    schemas.push(
      breadcrumbSchema(origin, [
        { name: 'Home', path: '/' },
        { name: label, path: clean },
      ]),
    );
  }

  return schemas;
}
