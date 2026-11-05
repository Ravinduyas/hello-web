import { getBlogPostByPath } from './blog';
import { ALL_ROUTE_PATHS, type RoutePath } from './routes';

/**
 * What each page tells a search engine it is.
 *
 * Read twice: the Vite build writes it into the pre-rendered HTML of every
 * route (including `/blog/<slug>`), and `PageSeo.tsx` applies it again on
 * client-side navigation so browser tabs, canonicals and Google's renderer stay
 * accurate across route transitions.
 */

export interface PageSeo {
  title: string;
  description: string;
  /** Relative to the site root; resolved to an absolute URL where one is needed. */
  image?: string;
  keywords?: string[];
  ogType?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
}

/** Kept under ~62 characters where possible so titles survive the SERP. */
export const PAGE_SEO: Record<RoutePath, PageSeo> = {
  '/': {
    title: 'Scooter, Bike & Tuk-Tuk Rental Weligama | Hello Rent',
    description:
      'Hello Rent - Scooter & Tuktuk Rental in Weligama, Sri Lanka. Rent scooters from €5/day, motorbikes €10/day & tuk-tuks €15/day. Permits arranged, hotel delivery.',
    image: '/photos/scooters-weligama-bay.jpg',
    keywords: [
      'hello rent',
      'hello rent - scooter & tuktuk rental',
      'scooter rental weligama',
      'weligama scooter rental',
      'bike rent weligama',
      'tuktuk rental weligama',
    ],
  },
  '/fleet': {
    title: 'Our Fleet — Scooters, Bikes & Tuk-Tuks | Hello Rent Weligama',
    description:
      'Browse the Hello Rent fleet in Weligama: Honda Dio and TVS Ntorq scooters (€5–€6), Pulsar & FZ motorbikes (€10), Bajaj RE tuk-tuks (€15) and automatic cars.',
    image: '/photos/fleet-lineup.jpg',
    keywords: [
      'weligama bike rental',
      'weligama scooter rental',
      'tuktuk rental weligama',
      'rent scooter sri lanka',
    ],
  },
  '/book-now': {
    title: 'Book a Scooter, Bike or Tuk-Tuk in Weligama | Hello Rent',
    description:
      'Reserve your scooter, motorbike or tuk-tuk in Weligama in two minutes. Add a Sri Lankan driving permit or hotel delivery and pay at pickup — no card needed.',
    image: '/photos/scooters-weligama-bay.jpg',
  },
  '/tours': {
    title: 'Day Trips & Riding Routes from Weligama | Hello Rent',
    description:
      'Where to ride from Weligama: coast roads to Mirissa and Hiriketiya, Sinharaja rainforest, Galle Fort and Udawalawe. Real riding notes from Hello Rent.',
    image: '/photos/ride-hill-road.jpg',
  },
  '/driving-permit': {
    title: 'Do You Need a Licence to Ride in Sri Lanka? (2026 Guide)',
    description:
      'What licence and permit you actually need to rent a scooter or tuk-tuk in Sri Lanka, why online IDPs fail, and how Hello Rent arranges your 6-month permit.',
    image: '/photos/rider-checking-phone.jpg',
  },
  '/about': {
    title: "About Hello Rent — Weligama's Local Scooter & Tuk-Tuk Shop",
    description:
      'Hello Rent started on Weligama Beach with one scooter and a hand-painted sign. Meet Bhagya ("Lucky") & Sandra and the 100 local families behind our fleet.',
    image: '/photos/shop-front.jpg',
  },
  '/blog': {
    title: 'Weligama Scooter, Bike & Tuk-Tuk Rental Blog | Hello Rent',
    description:
      'Local guides on Weligama scooter rental, bike rent in Weligama, and how to rent a scooter or self-drive tuk-tuk in Sri Lanka — real prices, permits & routes.',
    image: '/blog/hero.webp',
    keywords: [
      'bike rent weligama',
      'scooter rental weligama',
      'weligama bike rental',
      'weligama scooter rental',
      'hello rent - scooter & tuktuk rental',
      'hello rent',
      'rent scooter sri lanka',
      'rent a scooter sri lanka',
      'tuktuk rental weligama',
      'tuk tuk rental sri lanka',
    ],
  },
  '/contact': {
    title: 'Contact Hello Rent - Scooter & Tuktuk Rental in Weligama',
    description:
      'Call or WhatsApp +94 76 707 3388, or visit Hello Rent - Scooter & Tuktuk Rental in central Weligama. Open daily 07:00–21:00 with south-coast hotel delivery.',
    image: '/photos/weligama-road.jpg',
  },
};

/** Resolves metadata for both top-level routes and `/blog/<slug>` articles. */
export function seoFor(path: string): PageSeo {
  const clean = '/' + path.replace(/^\/+|\/+$/g, '');
  const post = getBlogPostByPath(clean);
  if (post) {
    return {
      title: post.seoTitle,
      description: post.metaDescription,
      image: post.heroImage,
      keywords: post.keywords,
      ogType: 'article',
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    };
  }
  return PAGE_SEO[clean as RoutePath] ?? PAGE_SEO['/'];
}

/** Every indexable route with its metadata, for the build to walk. */
export const SEO_ROUTES = ALL_ROUTE_PATHS.map(path => ({ path, ...seoFor(path) }));
