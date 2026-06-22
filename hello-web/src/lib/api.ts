/** Public booking API client. Talks to the Hello Manage backend. */
import type { Bike } from '../data/fleet';

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

/** Active fleet bikes, managed from the admin (Hello Manage). */
export async function fetchBikes(): Promise<Bike[]> {
  const res = await fetch(`${API_BASE}/api/bikes`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<Bike[]>;
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
