/** Admin API client for the Hello Manage backend (same origin via Vite proxy / static serve). */

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Payment {
  id: string;
  amount: number;
  at: string;
  note: string;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  createdAt: string;
  bikeId: string;
  bikeTitle: string;
  /** Physical unit (plate) assigned on confirm. '' = none yet. */
  unitId: string;
  plate: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  days: number;
  total: number;
  extras: { id: string; label: string; amount: number }[];
  payments: Payment[];
  deposit: number;
  depositReturned: boolean;
  renter: { firstName: string; lastName: string; email: string; phone: string; license?: string };
}

export interface Extra {
  id: string;
  label: string;
  description: string;
  price: number;
  perDay: boolean;
  active: boolean;
  sortOrder: number;
}

export type ExtraInput = Omit<Extra, 'id' | 'sortOrder'> & { sortOrder?: number };

/** Categories are admin-managed, so any string is valid. */
export type BikeCategory = string;

export interface Category {
  name: string;
  sortOrder: number;
}

export interface Bike {
  id: string;
  title: string;
  category: BikeCategory;
  pricePerDay: number;
  image: string;
  features: string[];
  active: boolean;
  sortOrder: number;
}

export type BikeInput = Omit<Bike, 'id' | 'sortOrder'> & { sortOrder?: number };

export type UnitStatus = 'available' | 'rented' | 'maintenance';

/** A single physical bike (one number plate) under a model. */
export interface Unit {
  id: string;
  bikeId: string;
  plate: string;
  status: UnitStatus;
  ownerId: string;
  notes: string;
  createdAt: string;
}

/** A fleet owner — a person whose bikes the company rents out. */
export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  nic: string;
  notes: string;
  /** Shop commission on this owner's rentals: a % of revenue plus a flat amount per rental. */
  commissionPct: number;
  commissionFlat: number;
  createdAt: string;
}

export type OwnerInput = Omit<Owner, 'id' | 'createdAt'>;

const TOKEN_KEY = 'hm_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class UnauthorizedError extends Error {}

async function parseError(res: Response): Promise<string> {
  // The backend always sends `{ error }` on a handled failure. A 5xx with no
  // such JSON almost always means the API is unreachable — e.g. the dev proxy
  // got a connection refused and synthesised a bare 500 "Internal Server Error".
  // Surface that as actionable guidance instead of a scary generic message.
  try {
    const body = await res.json();
    if (body?.error) return body.error;
  } catch {
    /* non-JSON body — fall through */
  }
  if (res.status >= 500) return "Can't reach the API. Is the backend running? (npm run backend in hello-manage)";
  return res.statusText;
}

function authHeaders(json = false): HeadersInit {
  const h: Record<string, string> = {};
  const token = getToken();
  if (token) h.Authorization = `Bearer ${token}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new UnauthorizedError('Session expired');
  if (!res.ok && res.status !== 204) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const { token } = await res.json();
  setToken(token);
  return token;
}

/* ---- Bookings ---- */
export interface WalkInBookingInput {
  bikeId: string;
  unitId: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate: string;
  dropoffDate: string;
  days: number;
  extras: { id: string; label: string; amount: number }[];
  total: number;
  deposit?: number;
  paidNow?: number;
  renter: { firstName: string; lastName: string; email: string; phone: string; license?: string };
}

export const fetchBookings = () =>
  fetch('/api/admin/bookings', { headers: authHeaders() }).then(r => handle<Booking[]>(r));

/** Create a walk-in rental at the counter (confirmed + plate reserved in one shot). */
export const createWalkInBooking = (input: WalkInBookingInput) =>
  fetch('/api/admin/bookings', { method: 'POST', headers: authHeaders(true), body: JSON.stringify(input) }).then(r =>
    handle<Booking>(r),
  );

/** Update a booking's payments/deposit (add/remove a payment, set deposit, mark returned). */
export const updateBilling = (
  id: string,
  ops: { addPayment?: { amount: number; note?: string }; removePaymentId?: string; deposit?: number; depositReturned?: boolean },
) => fetch(`/api/admin/bookings/${id}/billing`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify(ops) }).then(r => handle<Booking>(r));

/** paid = sum of payments, due = total - paid (never below 0). */
export const paidOf = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);
export const dueOf = (b: Booking) => Math.max(0, b.total - paidOf(b));

export const setBookingStatus = (id: string, status: BookingStatus, unitId?: string) =>
  fetch(`/api/admin/bookings/${id}`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify(unitId ? { status, unitId } : { status }),
  }).then(r => handle<Booking>(r));

export const deleteBooking = (id: string) =>
  fetch(`/api/admin/bookings/${id}`, { method: 'DELETE', headers: authHeaders() }).then(r => handle<void>(r));

/* ---- Extras ---- */
export const fetchExtras = () =>
  fetch('/api/admin/extras', { headers: authHeaders() }).then(r => handle<Extra[]>(r));

export const createExtra = (input: ExtraInput) =>
  fetch('/api/admin/extras', { method: 'POST', headers: authHeaders(true), body: JSON.stringify(input) }).then(r =>
    handle<Extra>(r),
  );

export const updateExtra = (id: string, patch: Partial<ExtraInput>) =>
  fetch(`/api/admin/extras/${id}`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify(patch) }).then(r =>
    handle<Extra>(r),
  );

export const deleteExtra = (id: string) =>
  fetch(`/api/admin/extras/${id}`, { method: 'DELETE', headers: authHeaders() }).then(r => handle<void>(r));

/* ---- Bikes (fleet) ---- */
export const fetchBikes = () =>
  fetch('/api/admin/bikes', { headers: authHeaders() }).then(r => handle<Bike[]>(r));

export const createBike = (input: BikeInput) =>
  fetch('/api/admin/bikes', { method: 'POST', headers: authHeaders(true), body: JSON.stringify(input) }).then(r =>
    handle<Bike>(r),
  );

export const updateBike = (id: string, patch: Partial<BikeInput>) =>
  fetch(`/api/admin/bikes/${id}`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify(patch) }).then(r =>
    handle<Bike>(r),
  );

export const deleteBike = (id: string) =>
  fetch(`/api/admin/bikes/${id}`, { method: 'DELETE', headers: authHeaders() }).then(r => handle<void>(r));

/* ---- Categories ---- */
export const fetchCategories = () =>
  fetch('/api/admin/categories', { headers: authHeaders() }).then(r => handle<Category[]>(r));

export const createCategory = (name: string) =>
  fetch('/api/admin/categories', { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ name }) }).then(r =>
    handle<Category>(r),
  );

export const deleteCategory = (name: string) =>
  fetch(`/api/admin/categories/${encodeURIComponent(name)}`, { method: 'DELETE', headers: authHeaders() }).then(r =>
    handle<void>(r),
  );

/* ---- Units (individual bikes by number plate) ---- */
export const fetchUnits = () =>
  fetch('/api/admin/units', { headers: authHeaders() }).then(r => handle<Unit[]>(r));

export const createUnit = (input: { bikeId: string; plate: string; status?: UnitStatus; ownerId?: string; notes?: string }) =>
  fetch('/api/admin/units', { method: 'POST', headers: authHeaders(true), body: JSON.stringify(input) }).then(r =>
    handle<Unit>(r),
  );

export const updateUnit = (id: string, patch: Partial<Pick<Unit, 'plate' | 'status' | 'ownerId' | 'notes'>>) =>
  fetch(`/api/admin/units/${id}`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify(patch) }).then(r =>
    handle<Unit>(r),
  );

export const deleteUnit = (id: string) =>
  fetch(`/api/admin/units/${id}`, { method: 'DELETE', headers: authHeaders() }).then(r => handle<void>(r));

/* ---- Owners (fleet owners) ---- */
export const fetchOwners = () =>
  fetch('/api/admin/owners', { headers: authHeaders() }).then(r => handle<Owner[]>(r));

export const createOwner = (input: OwnerInput) =>
  fetch('/api/admin/owners', { method: 'POST', headers: authHeaders(true), body: JSON.stringify(input) }).then(r =>
    handle<Owner>(r),
  );

export const updateOwner = (id: string, patch: Partial<OwnerInput>) =>
  fetch(`/api/admin/owners/${id}`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify(patch) }).then(r =>
    handle<Owner>(r),
  );

export const deleteOwner = (id: string) =>
  fetch(`/api/admin/owners/${id}`, { method: 'DELETE', headers: authHeaders() }).then(r => handle<void>(r));
