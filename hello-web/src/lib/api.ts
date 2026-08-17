/** Public booking API client. Talks to the Hello Manage backend. */
import { bikes as localBikes, type Bike } from '../data/fleet';
import { asset } from './asset';

// In dev this is '' and the Vite proxy forwards /api to the backend.
// In production set VITE_API_BASE to the backend origin (CORS is enabled there).
const ENV = (import.meta as { env?: Record<string, string | boolean> }).env ?? {};
const API_BASE = (ENV.VITE_API_BASE as string) ?? '';

/**
 * Whether there is anything to call.
 *
 * In dev, yes — the proxy forwards to the local backend, and if it is not
 * running the calls fail and the bundled fleet is used. In a build, only if
 * VITE_API_BASE names a backend. Without it the site is static: every request
 * to /api would hit the static host, come back as the 404 page, and fail after
 * a round trip that could never have worked.
 */
const API_ENABLED = Boolean(API_BASE) || ENV.DEV === true;

/** Thrown when a booking is attempted with no backend configured to take it. */
export const NO_BACKEND =
  "Online booking isn't switched on yet. Send us a WhatsApp message and we'll confirm your booking straight away.";

export interface Extra {
  id: string;
  label: string;
  description: string;
  price: number;
  perDay: boolean;
}

export interface BookingPayload {
  bikeId: string;
  bikeTitle: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  days: number;
  extras: { id: string; label: string; amount: number }[];
  total: number;
  renter: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    license?: string;
  };
}

async function parseError(res: Response): Promise<string> {
  try {
    return (await res.json()).error || res.statusText;
  } catch {
    return res.statusText;
  }
}

/**
 * Active booking extras, managed from the admin (Hello Manage).
 *
 * Returns null when there is no backend to ask — which is a different thing
 * from an empty list. An empty list is an answer: the operator has deactivated
 * everything, and the site must show nothing. Conflating the two meant
 * switching an extra off brought the bundled copy back instead.
 */
export async function fetchExtras(): Promise<Extra[] | null> {
  if (!API_ENABLED) return null;
  const res = await fetch(`${API_BASE}/api/extras`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * Active fleet bikes, managed from the admin (Hello Manage).
 *
 * The admin owns inventory, pricing, titles and photographs. What it has no
 * column for gets merged back in from `fleet.ts` by id: the engine capacity the
 * booking step groups scooters by, the card crop focal point, and the body type
 * that stops the KDH being labelled a car. Without this the API silently strips
 * all three the moment the backend is reachable.
 */
export async function fetchBikes(): Promise<Bike[] | null> {
  if (!API_ENABLED) return null;
  const res = await fetch(`${API_BASE}/api/bikes`);
  if (!res.ok) throw new Error(await parseError(res));
  const list = (await res.json()) as Bike[];

  const localById = new Map(localBikes.map(b => [b.id, b]));
  return list.map(bike => {
    const local = localById.get(bike.id);
    return {
      ...bike,
      image: resolveImage(bike.image),
      engineCc: bike.engineCc ?? local?.engineCc,
      bodyType: bike.bodyType ?? local?.bodyType,
      imagePosition: bike.imagePosition ?? local?.imagePosition,
    };
  });
}

/**
 * The admin stores image paths from the site root ("/fleet/dio.png"), but the
 * site is served from a sub-path on GitHub Pages — so those would 404. Rewrite
 * anything root-relative through the base; leave absolute URLs alone.
 */
function resolveImage(image: string): string {
  if (!image || /^https?:\/\//i.test(image) || image.startsWith('data:')) return image;
  return asset(image);
}

/** Create a booking. Returns the server-issued reference. */
export async function createBooking(payload: BookingPayload): Promise<{ reference: string; id: string }> {
  // Reading the fleet degrades quietly to the bundled copy; taking a booking
  // cannot. Say so plainly rather than surfacing a network error.
  if (!API_ENABLED) throw new Error(NO_BACKEND);

  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
