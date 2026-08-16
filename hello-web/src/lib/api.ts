/** Public booking API client. Talks to the Hello Manage backend. */
import { bikes as localBikes, type Bike } from '../data/fleet';
import { asset } from './asset';

// In dev this is '' and the Vite proxy forwards /api to the backend.
// In production set VITE_API_BASE to the backend origin (CORS is enabled there).
const API_BASE = (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE ?? '';

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

/** Active booking extras, managed from the admin (Hello Manage). */
export async function fetchExtras(): Promise<Extra[]> {
  const res = await fetch(`${API_BASE}/api/extras`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * Active fleet bikes, managed from the admin (Hello Manage).
 *
 * The admin owns inventory, pricing, titles and photographs. Two things it has
 * no column for get merged back in from `fleet.ts` by id: the engine capacity
 * the booking step groups scooters by, and the card crop focal point. Without
 * this the API silently strips both, and the capacity chooser disappears the
 * moment the backend is reachable.
 */
export async function fetchBikes(): Promise<Bike[]> {
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
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
