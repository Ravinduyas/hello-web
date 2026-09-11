import { ROUTE_PATHS, type RoutePath } from './routes';

/**
 * What each page tells a search engine it is.
 *
 * Every route shared a single title and had no description at all, so eight
 * pages competed as one result and Google wrote its own snippets from text it
 * had not necessarily rendered. This is the one place that answers "what is
 * this page", and it is read twice: the build writes it into the HTML of each
 * pre-rendered route, and the running app applies it again on client-side
 * navigation, where no new document is ever fetched.
 *
 * Typed against the shared route list, so a new page is a type error here until
 * someone has said what it is for.
 */

export interface PageSeo {
  title: string;
  description: string;
  /** Relative to the site root; resolved to an absolute URL where one is needed. */
  image?: string;
}

/** Kept under ~60 characters where possible so titles survive the SERP. */
export const PAGE_SEO: Record<RoutePath, PageSeo> = {
  '/': {
    title: 'Scooter & Bike Rental in Weligama, Sri Lanka | Hello Rent',
    description:
      'Rent scooters, motorbikes and tuk-tuks in Weligama from €5 a day. Local shop, well-kept bikes, helmets included, delivery to your hotel. Open daily 07:00–21:00.',
    image: '/photos/scooters-weligama-bay.jpg',
  },
  '/fleet': {
    title: 'Our Fleet — Scooters, Bikes & Tuk-Tuks | Hello Rent Weligama',
    description:
      'Browse the Hello Rent fleet in Weligama: Honda Dio and TVS Ntorq scooters, Pulsar and FZ motorbikes, tuk-tuks and small cars. Daily rates from €5, helmets included.',
    image: '/photos/fleet-lineup.jpg',
  },
  '/book-now': {
    title: 'Book a Scooter or Bike in Weligama | Hello Rent',
    description:
      'Reserve your ride in a few taps. Pick your vehicle and dates, add a helmet or hotel delivery, and pay at pickup — no card needed to book.',
    image: '/photos/scooters-weligama-bay.jpg',
  },
  '/tours': {
    title: 'Day Trips & Riding Routes from Weligama | Hello Rent',
    description:
      'Where to ride from Weligama: coast roads to Mirissa and Dickwella, the tea country climb, and Yala. Real distances, real riding times, from people who ride them.',
    image: '/photos/ride-hill-road.jpg',
  },
  '/driving-permit': {
    title: 'Do You Need a Licence to Ride in Sri Lanka? (2026 Guide)',
    description:
      'What licence and permit you actually need to ride a scooter in Sri Lanka, what an IDP does and does not cover, what it costs, and how to get one once you land.',
    image: '/photos/rider-checking-phone.jpg',
  },
  '/about': {
    title: "About Hello Rent — Weligama's Local Rental Shop",
    description:
      'Hello Rent started on Weligama Beach with one scooter and a few borrowed helmets. Five years on, the same family still hands over every key. Here is the story.',
    image: '/photos/shop-front.jpg',
  },
  '/blog': {
    title: 'Sri Lanka Riding Guides & Travel Tips | Hello Rent',
    description:
      'Riding guides for the south coast: road conditions, where to fuel up, what the police check, and the routes worth the ride — written in Weligama, not copied.',
    image: '/photos/ride-hill-road.jpg',
  },
  '/contact': {
    title: 'Contact & Find Us in Weligama | Hello Rent',
    description:
      'Call or WhatsApp +94 76 707 3388, or find the shop in Weligama. Open daily 07:00–21:00. Hotel delivery across the south coast.',
    image: '/photos/weligama-road.jpg',
  },
};

/** Falls back to the homepage's copy for anything unrouted. */
export function seoFor(path: string): PageSeo {
  const clean = ('/' + path.replace(/^\/+|\/+$/g, '')) as RoutePath;
  return PAGE_SEO[clean] ?? PAGE_SEO['/'];
}

/** Every route with its metadata, for the build to walk. */
export const SEO_ROUTES = ROUTE_PATHS.map(path => ({ path, ...PAGE_SEO[path] }));
