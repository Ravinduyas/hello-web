/**
 * The canonical Hello Rent fleet — the single source of truth for what we rent
 * and what it costs. Transcribed from the owner's fleet notes; the full
 * reference lives in `command/fleet/FLEET-REFERENCE.md`.
 *
 * Vehicles are grouped by class and transmission, because that is how a visitor
 * who has never heard of a Dio or a Pulsar actually chooses:
 *
 *   Scooter    — automatic   (110cc €5, 125cc €6)
 *   Motorbike  — manual      (€10, "big bike")
 *   Tuk Tuk    — manual      (€15)
 *   Car        — automatic   (€31, every model)
 *
 * All prices are per day in EUR.
 *
 * Used two ways: `store.ts` seeds a brand-new database from it, and
 * `seed-fleet.ts` syncs an existing one onto it.
 */

export interface SeedBike {
  id: string;
  title: string;
  category: string;
  pricePerDay: number;
  image: string;
  features: string[];
  sortOrder: number;
}

export interface SeedExtra {
  id: string;
  label: string;
  description: string;
  price: number;
  perDay: boolean;
  sortOrder: number;
}

/** Ordered easiest-to-ride first — the fleet page renders groups in this order. */
export const FLEET_CATEGORIES = ['Scooter', 'Motorbike', 'Tuk Tuk', 'Car'];

export const FLEET_BIKES: SeedBike[] = [
  /* ---- Scooters — automatic ------------------------------------- */
  {
    id: 'honda-dio-110',
    title: 'Honda Dio 110cc',
    category: 'Scooter',
    pricePerDay: 5,
    image: '/fleet/honda-dio.jpg',
    features: [
      'Automatic — twist and go',
      'Low 765mm seat, petite to average riders',
      'Combi Brake System (CBS)',
      '18L under-seat storage',
    ],
    sortOrder: 0,
  },
  {
    id: 'honda-navi-110',
    title: 'Honda Navi 110cc',
    category: 'Scooter',
    pricePerDay: 5,
    image: '/fleet/honda-navi.jpg',
    features: [
      'Automatic with a mini-bike look',
      'True motorcycle riding posture',
      'Very narrow — great for short riders',
      'No under-seat storage (box on request)',
    ],
    sortOrder: 1,
  },
  {
    id: 'yamaha-ray-zr',
    title: 'Yamaha Ray ZR',
    category: 'Scooter',
    pricePerDay: 5,
    image: '/fleet/yamaha-rayzr.jpg',
    features: [
      'Automatic hybrid engine',
      'Lightest in the fleet at 99kg',
      'Great knee clearance — petite to tall riders',
      '21L storage',
    ],
    sortOrder: 2,
  },
  {
    id: 'tvs-ntorq-125',
    title: 'TVS Ntorq 125',
    category: 'Scooter',
    pricePerDay: 6,
    image: '/fleet/tvs-ntorq.jpg',
    features: [
      '124.8cc, the most powerful scooter we rent',
      'Best for average to tall riders',
      'Digital console with Bluetooth',
      'Largest storage at 22L',
    ],
    sortOrder: 3,
  },

  /* ---- Motorbikes — manual ("big bike") -------------------------- */
  {
    id: 'bajaj-pulsar',
    title: 'Bajaj Pulsar 150 / 200',
    category: 'Motorbike',
    pricePerDay: 10,
    image: '/fleet/bajaj-pulsar.jpg',
    features: [
      'Manual transmission',
      'Perimeter frame, agile on mountain roads',
      'Single-channel ABS option',
      '12L fuel tank for long days',
    ],
    sortOrder: 4,
  },
  {
    id: 'yamaha-fz-160',
    title: 'Yamaha FZ 160',
    category: 'Motorbike',
    pricePerDay: 10,
    image: '/fleet/yamaha-fz.jpg',
    features: [
      'Manual transmission',
      'Fuel injection',
      'Comfortable upright riding position',
      'Best for Ella & Kandy routes',
    ],
    sortOrder: 5,
  },
  {
    id: 'tvs-apache-200',
    title: 'TVS Apache 200',
    category: 'Motorbike',
    pricePerDay: 10,
    image: '/fleet/tvs-apache.jpg',
    features: [
      'Manual transmission',
      'Sport touring',
      'Strong brakes for hill descents',
      'Pillion comfort seat',
    ],
    sortOrder: 6,
  },
  {
    id: 'hero-hunk-200',
    title: 'Hero Hunk 200',
    category: 'Motorbike',
    pricePerDay: 10,
    image: '/fleet/placeholder-motorbike.svg',
    features: [
      'Manual transmission',
      'Stable at highway speeds',
      'Built for long island rides',
      'Comfortable for two-up touring',
    ],
    sortOrder: 7,
  },

  /* ---- Three wheeler — manual ------------------------------------ */
  {
    id: 'bajaj-re-tuktuk',
    title: 'Bajaj RE 4-Stroke Tuk-Tuk',
    category: 'Tuk Tuk',
    pricePerDay: 15,
    image: '/fleet/bajaj-re-tuktuk.jpg',
    features: [
      'Manual transmission (handlebar clutch)',
      'Bench seats three adults',
      'High roof — shade and rain cover',
      '60–80L luggage space',
    ],
    sortOrder: 8,
  },

  /* ---- Cars & vans — automatic ----------------------------------- */
  {
    id: 'suzuki-wagon-r',
    title: 'Suzuki Wagon R',
    category: 'Car',
    pricePerDay: 31,
    image: '/fleet/suzuki-wagon-r.jpg',
    features: ['Automatic transmission', 'Air conditioned', 'Tall cabin, easy to park', 'Great on fuel'],
    sortOrder: 9,
  },
  {
    id: 'suzuki-spacia',
    title: 'Suzuki Spacia',
    category: 'Car',
    pricePerDay: 31,
    image: '/fleet/suzuki-spacia.jpg',
    features: ['Automatic transmission', 'Air conditioned', 'Sliding doors', 'Roomy for luggage'],
    sortOrder: 10,
  },
  {
    id: 'toyota-roomy',
    title: 'Toyota Roomy',
    category: 'Car',
    pricePerDay: 31,
    image: '/fleet/toyota-roomy.webp',
    features: ['Automatic transmission', 'Air conditioned', 'High roof, tall cabin', 'Comfortable for families'],
    sortOrder: 11,
  },
  {
    id: 'toyota-raize',
    title: 'Toyota Raize',
    category: 'Car',
    pricePerDay: 31,
    image: '/fleet/toyota-raize.jpg',
    features: ['Automatic transmission', 'Air conditioned', 'Compact SUV, higher ride height', 'Confident on rough roads'],
    sortOrder: 12,
  },
  {
    id: 'toyota-prius',
    title: 'Toyota Prius',
    category: 'Car',
    pricePerDay: 31,
    image: '/fleet/toyota-prius.png',
    features: ['Automatic transmission', 'Air conditioned', 'Hybrid — very low fuel use', 'Comfortable for long drives'],
    sortOrder: 13,
  },
  {
    id: 'toyota-kdh',
    title: 'Toyota KDH Van',
    category: 'Car',
    pricePerDay: 31,
    image: '/fleet/toyota-kdh.jpg',
    features: ['Automatic transmission', 'Air conditioned', 'Seats a group with luggage', 'Room for surfboards'],
    sortOrder: 14,
  },
];

export const FLEET_EXTRAS: SeedExtra[] = [
  {
    id: 'driving-permit',
    label: 'Sri Lankan driving permit',
    description:
      'We arrange the legal permit for you — no queueing at government offices. Valid six months.',
    price: 57,
    perDay: false,
    sortOrder: 0,
  },
  {
    id: 'extra-helmet',
    label: 'Extra helmet',
    description: 'A second helmet for your passenger.',
    price: 2,
    perDay: true,
    sortOrder: 1,
  },
  {
    id: 'phone-mount',
    label: 'Phone / GPS mount',
    description: 'Handlebar mount so you can navigate hands-free.',
    price: 1,
    perDay: true,
    sortOrder: 2,
  },
  {
    id: 'luggage-box',
    label: 'Rear luggage box',
    description: 'Lockable top box for bags and groceries.',
    price: 3,
    perDay: true,
    sortOrder: 3,
  },
  {
    id: 'delivery',
    label: 'Hotel delivery',
    description: 'We bring the vehicle to your hotel and collect it after.',
    price: 15,
    perDay: false,
    sortOrder: 4,
  },
];
