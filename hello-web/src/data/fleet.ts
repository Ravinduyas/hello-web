/**
 * The real Hello Rent fleet, from the client's fleet notes (command/fleet).
 *
 * Vehicle classes and models follow the owner's own breakdown:
 *   Scooter   — automatic transmission, 110cc and 125cc
 *   Motorbike — manual transmission ("big bike")
 *   Tuk Tuk   — manual transmission, Bajaj RE 4-stroke
 *   Car       — automatic transmission
 *
 * Prices are per day in EUR, as supplied by the client. The scooters are priced
 * by engine capacity exactly as the notes group them: every 110cc scooter is €5
 * (the Dio's rate) and the 125cc Ntorq is €6. Every automatic car is €31.
 */
import { asset } from '../lib/asset';

/** Rates are quoted in euros. */
export const CURRENCY = '€';

/** Format a rate for display, e.g. formatPrice(5) === "€5". */
export const formatPrice = (amount: number) => `${CURRENCY}${amount}`;

export interface Bike {
  id: string;
  title: string;
  /** Admin-managed category name (e.g. "Scooter", "Motorbike", "Tuk Tuk", "Car"). */
  category: string;
  /** Daily rental rate in EUR. */
  pricePerDay: number;
  image: string;
  features: string[];
}

export const bikes: Bike[] = [
  /* ---------------------------------------------------------------- */
  /*  Scooters — automatic                                            */
  /* ---------------------------------------------------------------- */
  {
    id: 'honda-dio-110',
    title: 'Honda Dio 110cc',
    category: 'Scooter',
    pricePerDay: 5,
    image: asset('/fleet/dio.png'),
    features: [
      'Automatic — twist and go',
      'Low 765mm seat, petite to average riders',
      'Combi Brake System (CBS)',
      '18L under-seat storage',
    ],
  },
  {
    id: 'honda-navi-110',
    title: 'Honda Navi 110cc',
    category: 'Scooter',
    pricePerDay: 5,
    image: asset('/fleet/navi.png'),
    features: [
      'Automatic with a mini-bike look',
      'True motorcycle riding posture',
      'Very narrow — great for short riders',
      'No under-seat storage (box on request)',
    ],
  },
  {
    id: 'yamaha-ray-zr',
    title: 'Yamaha Ray ZR',
    category: 'Scooter',
    pricePerDay: 5,
    image: asset('/fleet/rayzr.png'),
    features: [
      'Automatic hybrid engine',
      'Lightest in the fleet at 99kg',
      'Great knee clearance — petite to tall riders',
      '21L storage',
    ],
  },
  {
    id: 'tvs-ntorq-125',
    title: 'TVS Ntorq 125',
    category: 'Scooter',
    pricePerDay: 6,
    image: asset('/fleet/ntorq.png'),
    features: [
      '124.8cc, the most powerful scooter we rent',
      'Best for average to tall riders',
      'Digital console with Bluetooth',
      'Largest storage at 22L',
    ],
  },

  /* ---------------------------------------------------------------- */
  /*  Motorbikes — manual ("big bike")                                */
  /* ---------------------------------------------------------------- */
  {
    id: 'bajaj-pulsar',
    title: 'Bajaj Pulsar 150 / 200',
    category: 'Motorbike',
    pricePerDay: 10,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=800',
    features: [
      'Manual transmission',
      'Perimeter frame, agile on mountain roads',
      'Single-channel ABS option',
      '12L fuel tank for long days',
    ],
  },
  {
    id: 'yamaha-fz-160',
    title: 'Yamaha FZ 160',
    category: 'Motorbike',
    pricePerDay: 10,
    image: 'https://images.unsplash.com/photo-1653834048900-b5eeb9decd6a?auto=format&fit=crop&q=80&w=800',
    features: [
      'Manual transmission',
      'Fuel injection',
      'Comfortable upright riding position',
      'Best for Ella & Kandy routes',
    ],
  },
  {
    id: 'tvs-apache-200',
    title: 'TVS Apache 200',
    category: 'Motorbike',
    pricePerDay: 10,
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
    features: [
      'Manual transmission',
      'Sport touring',
      'Strong brakes for hill descents',
      'Pillion comfort seat',
    ],
  },
  {
    id: 'hero-hunk-200',
    title: 'Hero Hunk 200',
    category: 'Motorbike',
    pricePerDay: 10,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=800',
    features: [
      'Manual transmission',
      'Stable at highway speeds',
      'Built for long island rides',
      'Comfortable for two-up touring',
    ],
  },

  /* ---------------------------------------------------------------- */
  /*  Tuk-tuk — manual                                                */
  /* ---------------------------------------------------------------- */
  {
    id: 'bajaj-re-tuktuk',
    title: 'Bajaj RE 4-Stroke Tuk-Tuk',
    category: 'Tuk Tuk',
    pricePerDay: 15,
    image: asset('/couple-tuktuk-sigiriya.jpg'),
    features: [
      'Manual transmission (handlebar clutch)',
      'Bench seats three adults',
      'High roof — shade and rain cover',
      '60–80L luggage space',
    ],
  },

  /* ---------------------------------------------------------------- */
  /*  Cars & vans — automatic                                         */
  /* ---------------------------------------------------------------- */
  {
    id: 'suzuki-wagon-r',
    title: 'Suzuki Wagon R',
    category: 'Car',
    pricePerDay: 31,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
    features: ['Automatic transmission', 'Air conditioned', 'Tall cabin, easy to park', 'Great on fuel'],
  },
  {
    id: 'suzuki-spacia',
    title: 'Suzuki Spacia',
    category: 'Car',
    pricePerDay: 31,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
    features: ['Automatic transmission', 'Air conditioned', 'Sliding doors', 'Roomy for luggage'],
  },
  {
    id: 'toyota-roomy',
    title: 'Toyota Roomy',
    category: 'Car',
    pricePerDay: 31,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
    features: ['Automatic transmission', 'Air conditioned', 'High roof, tall cabin', 'Comfortable for families'],
  },
  {
    id: 'toyota-raize',
    title: 'Toyota Raize',
    category: 'Car',
    pricePerDay: 31,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
    features: ['Automatic transmission', 'Air conditioned', 'Compact SUV, higher ride height', 'Confident on rough roads'],
  },
  {
    id: 'toyota-prius',
    title: 'Toyota Prius',
    category: 'Car',
    pricePerDay: 31,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
    features: ['Automatic transmission', 'Air conditioned', 'Hybrid — very low fuel use', 'Comfortable for long drives'],
  },
  {
    id: 'toyota-kdh',
    title: 'Toyota KDH Van',
    category: 'Car',
    pricePerDay: 31,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
    features: ['Automatic transmission', 'Air conditioned', 'Seats a group with luggage', 'Room for surfboards'],
  },
];

export const getBike = (id: string | null | undefined) =>
  bikes.find(b => b.id === id);

/* ------------------------------------------------------------------ */
/*  How each class is presented                                        */
/* ------------------------------------------------------------------ */

/**
 * Most of our guests have never heard of a Dio or a Pulsar — what they need to
 * know first is "does it have gears?". So the fleet is presented by class and
 * transmission ("Scooters — Automatic"), with the model names underneath.
 */
export interface CategoryMeta {
  /** Plural heading for the group. */
  label: string;
  transmission: 'Automatic' | 'Manual' | null;
  blurb: string;
}

export const categoryMeta: Record<string, CategoryMeta> = {
  Scooter: {
    label: 'Scooters',
    transmission: 'Automatic',
    blurb:
      'Twist and go — no gears, no clutch. The easiest thing to ride if you have never ridden in Sri Lanka before.',
  },
  Motorbike: {
    label: 'Motorbikes',
    transmission: 'Manual',
    blurb:
      'Gears and a clutch, and a lot more power for hill country and long distances. For riders with real experience.',
  },
  'Tuk Tuk': {
    label: 'Three wheelers',
    transmission: 'Manual',
    blurb:
      'The tuk-tuk: three seats, a roof over your head and room for luggage. Manual, but the clutch is on the handlebar — not at your foot.',
  },
  Car: {
    label: 'Cars & vans',
    transmission: 'Automatic',
    blurb:
      'Air conditioned and automatic. The choice for families, for the rain, and for long drives across the island.',
  },
};

/** Falls back gracefully for any category added later in the admin. */
export const getCategoryMeta = (category: string): CategoryMeta =>
  categoryMeta[category] ?? { label: category, transmission: null, blurb: '' };

/** The single shop location where every vehicle is picked up and returned. */
export const shopLocation = {
  name: 'Weligama',
  address: 'Weligama, Southern Province, Sri Lanka',
};

export interface Extra {
  id: string;
  label: string;
  description: string;
  /** Price in EUR. `perDay` extras multiply by rental length; otherwise flat. */
  price: number;
  perDay: boolean;
}

export const extras: Extra[] = [
  {
    id: 'driving-permit',
    label: 'Sri Lankan driving permit',
    description:
      'We arrange the legal permit for you — no queueing at government offices. Valid six months.',
    price: 57,
    perDay: false,
  },
  {
    id: 'extra-helmet',
    label: 'Extra helmet',
    description: 'A second helmet for your passenger.',
    price: 2,
    perDay: true,
  },
  {
    id: 'phone-mount',
    label: 'Phone / GPS mount',
    description: 'Handlebar mount so you can navigate hands-free.',
    price: 1,
    perDay: true,
  },
  {
    id: 'luggage-box',
    label: 'Rear luggage box',
    description: 'Lockable top box for bags and groceries.',
    price: 3,
    perDay: true,
  },
  {
    id: 'delivery',
    label: 'Hotel delivery',
    description: 'We bring the vehicle to your hotel and collect it after.',
    price: 15,
    perDay: false,
  },
];
