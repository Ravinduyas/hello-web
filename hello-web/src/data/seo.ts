import { BLOG_POSTS, getBlogPostBySlug } from './blog';
import { ROUTE_PATHS, type RoutePath } from './routes';

/**
 * What each page tells a search engine it is.
 *
 * Read twice: the build writes it into the HTML of each pre-rendered route
 * (both core pages and individual `/blog/:slug` articles), and the running app
 * applies it again on client-side navigation.
 */

export interface PageSeo {
  title: string;
  description: string;
  /** Relative to the site root; resolved to an absolute URL where one is needed. */
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: string;
  section?: string;
}

/** Kept under ~60 characters where possible so titles survive the SERP. */
export const PAGE_SEO: Record<RoutePath, PageSeo> = {
  '/': {
    title: 'Scooter, Bike & Tuk-Tuk Rental Weligama | Hello Rent',
    description:
      'Hello Rent - Scooter & Tuktuk Rental in Weligama, Sri Lanka. Rent scooters from €5/day, motorbikes €10/day & tuk-tuks €15/day. Helmets included, hotel delivery.',
    image: '/photos/scooters-weligama-bay.jpg',
    keywords: [
      'hello rent',
      'hello rent - scooter & tuktuk rental',
      'scooter rental weligama',
      'weligama scooter rental',
      'bike rent weligama',
      'weligama bike rental',
      'tuktuk rental weligama',
      'tuk tuk rental sri lanka',
      'rent scooter sri lanka',
      'rent a scooter sri lanka',
    ],
  },
  '/fleet': {
    title: 'Weligama Scooter, Bike & Tuk-Tuk Fleet | Hello Rent',
    description:
      'Compare Hello Rent’s Weligama fleet: €5 Honda Dio & Yamaha Ray ZR scooters, €6 TVS Ntorq 125, €10 Pulsar & FZ motorbikes, €15 Bajaj RE tuk-tuks & A/C cars.',
    image: '/photos/fleet-lineup.jpg',
    keywords: [
      'scooter rental weligama',
      'weligama bike rental',
      'bike rent weligama',
      'tuktuk rental weligama',
      'tuk tuk rental sri lanka',
      'hello rent',
    ],
  },
  '/book-now': {
    title: 'Book a Scooter, Bike or Tuk-Tuk in Weligama | Hello Rent',
    description:
      'Reserve your scooter, motorbike, or tuk-tuk in Weligama in two minutes. Add an extra helmet, Sri Lankan permit, or hotel delivery — pay at pickup, no card needed.',
    image: '/photos/scooters-weligama-bay.jpg',
    keywords: [
      'scooter rental weligama',
      'bike rent weligama',
      'tuktuk rental weligama',
      'rent a scooter sri lanka',
      'hello rent',
    ],
  },
  '/tours': {
    title: 'Day Trips & Riding Routes from Weligama | Hello Rent',
    description:
      'Where to ride from Weligama by scooter, motorbike or tuk-tuk: coast roads to Mirissa, Hiriketiya and Galle Fort, Sinharaja rainforest, and wildlife parks.',
    image: '/photos/ride-hill-road.jpg',
    keywords: [
      'weligama scooter rental',
      'weligama bike rental',
      'rent scooter sri lanka',
      'tuk tuk rental sri lanka',
    ],
  },
  '/driving-permit': {
    title: 'Sri Lanka Scooter & Tuk-Tuk Driving Permit (2026 Guide)',
    description:
      'What licence and Sri Lankan permit you legally need to rent a scooter or tuk-tuk in Sri Lanka, what an IDP covers, and how Hello Rent arranges yours in advance.',
    image: '/photos/rider-checking-phone.jpg',
    keywords: [
      'rent a scooter sri lanka',
      'rent scooter sri lanka',
      'tuk tuk rental sri lanka',
      'scooter rental weligama',
    ],
  },
  '/about': {
    title: 'About Hello Rent — Scooter & Tuk-Tuk Rental Weligama',
    description:
      'Meet Bhagya (“Lucky”) & Sandra behind Hello Rent - Scooter & Tuktuk Rental in Weligama. Started with three scooters in 2017, now supporting ~100 local families.',
    image: '/photos/shop-front.jpg',
    keywords: [
      'hello rent',
      'hello rent - scooter & tuktuk rental',
      'weligama scooter rental',
      'tuktuk rental weligama',
    ],
  },
  '/blog': {
    title: 'Weligama Scooter, Bike & Tuk-Tuk Rental Blog | Hello Rent',
    description:
      'Local guides on scooter rental in Weligama, bike rent, self-drive tuk-tuk rental in Sri Lanka, driving permits, daily rates, and south-coast riding routes.',
    image: '/photos/ride-hill-road.jpg',
    keywords: [
      'bike rent weligama',
      'scooter rental weligama',
      'weligama bike rental',
      'hello rent - scooter & tuktuk rental',
      'hello rent',
      'weligama scooter rental',
      'rent scooter sri lanka',
      'rent a scooter sri lanka',
      'tuktuk rental weligama',
      'tuk tuk rental sri lanka',
    ],
  },
  '/contact': {
    title: 'Contact Hello Rent Weligama | Scooter & Tuk-Tuk Rental',
    description:
      'Call or WhatsApp +94 76 707 3388, or visit Hello Rent - Scooter & Tuktuk Rental in central Weligama. Open daily 07:00–21:00 with hotel delivery across the south coast.',
    image: '/photos/weligama-road.jpg',
    keywords: [
      'hello rent - scooter & tuktuk rental',
      'hello rent',
      'scooter rental weligama',
      'tuktuk rental weligama',
    ],
  },
};

export function blogPostToSeo(slug: string): PageSeo | undefined {
  const post = getBlogPostBySlug(slug);
  if (!post) return undefined;
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    image: post.image,
    keywords: post.keywords,
    type: 'article',
    publishedTime: post.publishedAt,
    section: post.category,
  };
}

/** Resolves metadata for static routes and `/blog/:slug` articles alike. */
export function seoFor(path: string): PageSeo {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  const clean = (trimmed ? '/' + trimmed : '/') as string;

  if (clean in PAGE_SEO) {
    return PAGE_SEO[clean as RoutePath];
  }

  if (clean.startsWith('/blog/')) {
    const slug = clean.slice('/blog/'.length);
    const postSeo = blogPostToSeo(slug);
    if (postSeo) return postSeo;
  }

  return PAGE_SEO['/'];
}

/** Every route (core pages + individual blog articles) with its metadata, for the build to walk. */
export const SEO_ROUTES: Array<{ path: string } & PageSeo> = [
  ...ROUTE_PATHS.map(path => ({ path, ...PAGE_SEO[path] })),
  ...BLOG_POSTS.map(post => ({
    path: `/blog/${post.slug}`,
    title: post.seoTitle,
    description: post.seoDescription,
    image: post.image,
    keywords: post.keywords,
    type: 'article' as const,
    publishedTime: post.publishedAt,
    section: post.category,
  })),
];
