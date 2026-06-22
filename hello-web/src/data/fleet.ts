export interface Bike {
  id: string;
  title: string;
  /** Admin-managed category name (e.g. "Scooter", "Motorbike", "Three Wheeler"). */
  category: string;
  /** Daily rental rate in USD. */
  pricePerDay: number;
  image: string;
  features: string[];
}

export const bikes: Bike[] = [
  {
    id: 'honda-dio-110',
    title: 'Honda Dio 110cc',
    category: 'Scooter',
    pricePerDay: 9,
    image: 'https://images.unsplash.com/photo-1681765656650-e0c87babdfe6?auto=format&fit=crop&q=80&w=800',
    features: ['Automatic', 'Ideal for city & beach roads', 'Fuel efficient', 'Helmet included'],
  },
  {
    id: 'honda-wave-125',
    title: 'Honda Wave 125',
    category: 'Scooter',
    pricePerDay: 11,
    image: 'https://images.unsplash.com/photo-1708975477606-e19484f6fd45?auto=format&fit=crop&q=80&w=800',
    features: ['Semi-automatic', 'Under-seat storage', 'USB charging port', 'Helmet included'],
  },
  {
    id: 'bajaj-pulsar-150',
    title: 'Bajaj Pulsar 150',
    category: 'Motorbike',
    pricePerDay: 15,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=800',
    features: ['Manual 5-speed', 'Great for hill country roads', 'GPS mount included', 'Helmet included'],
  },
  {
    id: 'tvs-apache-160',
    title: 'TVS Apache 160',
    category: 'Motorbike',
    pricePerDay: 16,
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
    features: ['Manual 5-speed', 'Sport touring', 'GPS mount included', 'Helmet included'],
  },
  {
    id: 'yamaha-fz-150',
    title: 'Yamaha FZ 150',
    category: 'Motorbike',
    pricePerDay: 18,
    image: 'https://images.unsplash.com/photo-1653834048900-b5eeb9decd6a?auto=format&fit=crop&q=80&w=800',
    features: ['Manual 5-speed', 'Fuel injection', 'Best for Ella & Kandy routes', 'Helmet included'],
  },
  {
    id: 'honda-cb-125',
    title: 'Honda CB 125',
    category: 'Scooter',
    pricePerDay: 10,
    image: 'https://images.unsplash.com/photo-1554223789-df81106a45ed?auto=format&fit=crop&q=80&w=800',
    features: ['Automatic', 'Lightweight city bike', 'Under-seat storage', 'Helmet included'],
  },
];

export const getBike = (id: string | null | undefined) =>
  bikes.find(b => b.id === id);

/** The single shop location where every bike is picked up and returned. */
export const shopLocation = {
  name: 'Colombo',
  address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
};

export interface Extra {
  id: string;
  label: string;
  description: string;
  /** Price in USD. `perDay` extras multiply by rental length; otherwise flat. */
  price: number;
  perDay: boolean;
}

export const extras: Extra[] = [
  {
    id: 'extra-helmet',
    label: 'Extra helmet',
    description: 'A second DOT-certified helmet for your passenger.',
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
    id: 'insurance',
    label: 'Damage protection',
    description: 'Reduces your excess to zero on accidental damage.',
    price: 4,
    perDay: true,
  },
  {
    id: 'delivery',
    label: 'Hotel delivery',
    description: 'We bring the bike to your hotel and collect it after.',
    price: 15,
    perDay: false,
  },
];
