import './env.ts'; // must be first: loads backend/.env before any env var is read
import express, { type Request, type Response, type NextFunction } from 'express';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  addBooking,
  listBookings,
  updateBookingStatus,
  assignAndConfirm,
  deleteBooking,
  listExtras,
  getExtra,
  addExtra,
  updateExtra,
  deleteExtra,
  listBikes,
  getBikeById,
  addBike,
  updateBike,
  deleteBike,
  listCategories,
  addCategory,
  deleteCategory,
  bikesUsingCategory,
  listUnits,
  getUnit,
  findUnitByPlate,
  addUnit,
  updateUnit,
  deleteUnit,
  listOwners,
  getOwner,
  addOwner,
  updateOwner,
  deleteOwner,
  bikesOwnedBy,
  type Booking,
  type BookingStatus,
  type Extra,
  type Bike,
  type Unit,
  type UnitStatus,
  type Owner,
} from './store.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 4000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
const AUTH_SECRET = process.env.ADMIN_SECRET || 'dev-insecure-secret-change-me';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

const app = express();
app.use(express.json());

/* ------------------------------------------------------------------ */
/*  CORS — the public site may call this API from another origin       */
/* ------------------------------------------------------------------ */

const ALLOWED = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.header('origin');
  if (ALLOWED.includes('*')) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (origin && ALLOWED.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

/* ------------------------------------------------------------------ */
/*  Auth — stateless HMAC bearer tokens                               */
/* ------------------------------------------------------------------ */

function sign(payload: string): string {
  return createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
}
function issueToken(username: string): string {
  const body = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${body}.${sign(body)}`;
}
function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

/* ================================================================== */
/*  PUBLIC API                                                        */
/* ================================================================== */

/** Customer-facing extras list — only active ones, minimal shape. */
app.get('/api/extras', (_req: Request, res: Response) => {
  const extras = listExtras({ activeOnly: true }).map(e => ({
    id: e.id,
    label: e.label,
    description: e.description,
    price: e.price,
    perDay: e.perDay,
  }));
  res.json(extras);
});

/** Category names, in admin order — used for the public fleet filter. */
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(listCategories().map(c => c.name));
});

/** Customer-facing fleet — only active bikes, minimal shape. */
app.get('/api/bikes', (_req: Request, res: Response) => {
  const bikes = listBikes({ activeOnly: true }).map(b => ({
    id: b.id,
    title: b.title,
    category: b.category,
    pricePerDay: b.pricePerDay,
    image: b.image,
    features: b.features,
  }));
  res.json(bikes);
});

function makeReference(): string {
  return 'HR-' + randomUUID().replace(/-/g, '').slice(0, 5).toUpperCase();
}

app.post('/api/bookings', (req: Request, res: Response) => {
  const b = req.body ?? {};
  const renter = b.renter ?? {};
  const invalid =
    !b.bikeId ||
    !b.pickupDate ||
    !b.dropoffDate ||
    !(Number(b.days) > 0) ||
    !renter.firstName ||
    !renter.lastName ||
    !/\S+@\S+\.\S+/.test(renter.email || '') ||
    !renter.phone;
  if (invalid) return res.status(400).json({ error: 'Missing or invalid booking fields' });

  const booking: Booking = {
    id: randomUUID(),
    reference: makeReference(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    bikeId: String(b.bikeId),
    bikeTitle: String(b.bikeTitle ?? ''),
    unitId: '', // a physical plate is assigned later, by the admin, on confirm
    plate: '',
    pickupLocation: String(b.pickupLocation ?? ''),
    dropoffLocation: String(b.dropoffLocation ?? ''),
    pickupDate: String(b.pickupDate),
    dropoffDate: String(b.dropoffDate),
    days: Number(b.days),
    extras: Array.isArray(b.extras)
      ? b.extras.map((e: any) => ({ id: String(e.id), label: String(e.label), amount: Number(e.amount) || 0 }))
      : [],
    total: Number(b.total) || 0,
    renter: {
      firstName: String(renter.firstName),
      lastName: String(renter.lastName),
      email: String(renter.email),
      phone: String(renter.phone),
      license: renter.license ? String(renter.license) : undefined,
    },
  };
  addBooking(booking);
  res.status(201).json({ id: booking.id, reference: booking.reference, status: booking.status });
});

/* ================================================================== */
/*  ADMIN API                                                         */
/* ================================================================== */

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({ token: issueToken(username) });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

/* ---- Bookings ---- */
app.get('/api/admin/bookings', requireAuth, (_req: Request, res: Response) => {
  res.json(listBookings());
});

app.patch('/api/admin/bookings/:id', requireAuth, (req: Request, res: Response) => {
  const status = req.body?.status as BookingStatus;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    let updated: Booking | null;
    if (status === 'confirmed') {
      // Confirming requires picking a physical plate to assign.
      const unitId = typeof req.body?.unitId === 'string' ? req.body.unitId.trim() : '';
      if (!unitId) return res.status(400).json({ error: 'Select a plate to confirm this booking.' });
      updated = assignAndConfirm(req.params.id, unitId);
    } else {
      updated = updateBookingStatus(req.params.id, status);
    }
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(409).json({ error: err instanceof Error ? err.message : 'Could not update booking' });
  }
});

app.delete('/api/admin/bookings/:id', requireAuth, (req: Request, res: Response) => {
  if (!deleteBooking(req.params.id)) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

/* ---- Extras (full CRUD) ---- */
function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'extra';
}

app.get('/api/admin/extras', requireAuth, (_req: Request, res: Response) => {
  res.json(listExtras());
});

app.post('/api/admin/extras', requireAuth, (req: Request, res: Response) => {
  const b = req.body ?? {};
  if (!b.label || typeof b.label !== 'string') {
    return res.status(400).json({ error: 'Label is required' });
  }
  // Unique id from the label slug.
  let id = slugify(b.label);
  let n = 2;
  while (getExtra(id)) id = `${slugify(b.label)}-${n++}`;

  const extra: Extra = {
    id,
    label: String(b.label),
    description: String(b.description ?? ''),
    price: Number(b.price) || 0,
    perDay: b.perDay !== false, // default per-day
    active: b.active !== false, // default active
    sortOrder: Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : listExtras().length,
  };
  addExtra(extra);
  res.status(201).json(extra);
});

app.patch('/api/admin/extras/:id', requireAuth, (req: Request, res: Response) => {
  const b = req.body ?? {};
  const patch: Partial<Omit<Extra, 'id'>> = {};
  if (b.label !== undefined) patch.label = String(b.label);
  if (b.description !== undefined) patch.description = String(b.description);
  if (b.price !== undefined) patch.price = Number(b.price) || 0;
  if (b.perDay !== undefined) patch.perDay = !!b.perDay;
  if (b.active !== undefined) patch.active = !!b.active;
  if (b.sortOrder !== undefined) patch.sortOrder = Number(b.sortOrder) || 0;

  const updated = updateExtra(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/admin/extras/:id', requireAuth, (req: Request, res: Response) => {
  if (!deleteExtra(req.params.id)) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

/* ---- Bikes / fleet (full CRUD) ---- */
function normCategory(v: unknown): string {
  const s = typeof v === 'string' ? v.trim() : '';
  if (s) return s;
  // Fall back to the first managed category so a bike always has one.
  return listCategories()[0]?.name ?? 'Scooter';
}
function normFeatures(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  return [];
}

app.get('/api/admin/bikes', requireAuth, (_req: Request, res: Response) => {
  res.json(listBikes());
});

app.post('/api/admin/bikes', requireAuth, (req: Request, res: Response) => {
  const b = req.body ?? {};
  if (!b.title || typeof b.title !== 'string') {
    return res.status(400).json({ error: 'Title is required' });
  }
  let id = slugify(b.title);
  let n = 2;
  while (getBikeById(id)) id = `${slugify(b.title)}-${n++}`;

  const bike: Bike = {
    id,
    title: String(b.title),
    category: normCategory(b.category),
    pricePerDay: Number(b.pricePerDay) || 0,
    image: String(b.image ?? ''),
    features: normFeatures(b.features),
    active: b.active !== false,
    sortOrder: Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : listBikes().length,
  };
  addBike(bike);
  res.status(201).json(bike);
});

app.patch('/api/admin/bikes/:id', requireAuth, (req: Request, res: Response) => {
  const b = req.body ?? {};
  const patch: Partial<Omit<Bike, 'id'>> = {};
  if (b.title !== undefined) patch.title = String(b.title);
  if (b.category !== undefined) patch.category = normCategory(b.category);
  if (b.pricePerDay !== undefined) patch.pricePerDay = Number(b.pricePerDay) || 0;
  if (b.image !== undefined) patch.image = String(b.image);
  if (b.features !== undefined) patch.features = normFeatures(b.features);
  if (b.active !== undefined) patch.active = !!b.active;
  if (b.sortOrder !== undefined) patch.sortOrder = Number(b.sortOrder) || 0;

  const updated = updateBike(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/admin/bikes/:id', requireAuth, (req: Request, res: Response) => {
  if (!deleteBike(req.params.id)) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

/* ---- Categories ---- */
app.get('/api/admin/categories', requireAuth, (_req: Request, res: Response) => {
  res.json(listCategories());
});

app.post('/api/admin/categories', requireAuth, (req: Request, res: Response) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  res.status(201).json(addCategory(name));
});

app.delete('/api/admin/categories/:name', requireAuth, (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name);
  // Block deleting a category still in use, so no bike is orphaned.
  const inUse = bikesUsingCategory(name);
  if (inUse > 0) {
    return res.status(409).json({ error: `${inUse} bike(s) still use "${name}". Reassign them first.` });
  }
  if (!deleteCategory(name)) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

/* ---- Units (individual bikes by number plate) ---- */
function normStatus(v: unknown): UnitStatus {
  return v === 'rented' ? 'rented' : v === 'maintenance' ? 'maintenance' : 'available';
}

app.get('/api/admin/units', requireAuth, (req: Request, res: Response) => {
  const bikeId = typeof req.query.bikeId === 'string' ? req.query.bikeId : undefined;
  res.json(listUnits(bikeId));
});

app.post('/api/admin/units', requireAuth, (req: Request, res: Response) => {
  const b = req.body ?? {};
  const bikeId = String(b.bikeId ?? '');
  const plate = typeof b.plate === 'string' ? b.plate.trim() : '';
  if (!bikeId || !getBikeById(bikeId)) return res.status(400).json({ error: 'Unknown model' });
  if (!plate) return res.status(400).json({ error: 'Plate number is required' });
  if (findUnitByPlate(plate)) return res.status(409).json({ error: `Plate "${plate}" already exists` });

  const ownerId = typeof b.ownerId === 'string' ? b.ownerId.trim() : '';
  if (ownerId && !getOwner(ownerId)) return res.status(400).json({ error: 'Unknown owner' });

  const unit: Unit = {
    id: randomUUID(),
    bikeId,
    plate,
    status: normStatus(b.status),
    ownerId,
    notes: String(b.notes ?? ''),
    createdAt: new Date().toISOString(),
  };
  addUnit(unit);
  res.status(201).json(unit);
});

app.patch('/api/admin/units/:id', requireAuth, (req: Request, res: Response) => {
  const b = req.body ?? {};
  const patch: Partial<Pick<Unit, 'plate' | 'status' | 'ownerId' | 'notes'>> = {};
  if (b.plate !== undefined) {
    const plate = String(b.plate).trim();
    if (!plate) return res.status(400).json({ error: 'Plate cannot be empty' });
    const existing = findUnitByPlate(plate);
    if (existing && existing.id !== req.params.id) {
      return res.status(409).json({ error: `Plate "${plate}" already exists` });
    }
    patch.plate = plate;
  }
  if (b.status !== undefined) patch.status = normStatus(b.status);
  if (b.ownerId !== undefined) {
    const ownerId = typeof b.ownerId === 'string' ? b.ownerId.trim() : '';
    if (ownerId && !getOwner(ownerId)) return res.status(400).json({ error: 'Unknown owner' });
    patch.ownerId = ownerId;
  }
  if (b.notes !== undefined) patch.notes = String(b.notes);

  const updated = updateUnit(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

/* ---- Owners (fleet owners) ---- */
app.get('/api/admin/owners', requireAuth, (_req: Request, res: Response) => {
  res.json(listOwners());
});

app.post('/api/admin/owners', requireAuth, (req: Request, res: Response) => {
  const b = req.body ?? {};
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) return res.status(400).json({ error: 'Owner name is required' });
  const owner: Owner = {
    id: randomUUID(),
    name,
    phone: String(b.phone ?? ''),
    email: String(b.email ?? ''),
    nic: String(b.nic ?? ''),
    notes: String(b.notes ?? ''),
    createdAt: new Date().toISOString(),
  };
  addOwner(owner);
  res.status(201).json(owner);
});

app.patch('/api/admin/owners/:id', requireAuth, (req: Request, res: Response) => {
  const b = req.body ?? {};
  const patch: Partial<Omit<Owner, 'id' | 'createdAt'>> = {};
  if (b.name !== undefined) {
    const name = String(b.name).trim();
    if (!name) return res.status(400).json({ error: 'Name cannot be empty' });
    patch.name = name;
  }
  if (b.phone !== undefined) patch.phone = String(b.phone);
  if (b.email !== undefined) patch.email = String(b.email);
  if (b.nic !== undefined) patch.nic = String(b.nic);
  if (b.notes !== undefined) patch.notes = String(b.notes);

  const updated = updateOwner(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/admin/owners/:id', requireAuth, (req: Request, res: Response) => {
  const inUse = bikesOwnedBy(req.params.id);
  if (inUse > 0) {
    return res.status(409).json({ error: `${inUse} bike(s) are assigned to this owner. Reassign them first.` });
  }
  if (!deleteOwner(req.params.id)) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

app.delete('/api/admin/units/:id', requireAuth, (req: Request, res: Response) => {
  if (!getUnit(req.params.id)) return res.status(404).json({ error: 'Not found' });
  deleteUnit(req.params.id);
  res.status(204).end();
});

/* ------------------------------------------------------------------ */
/*  Serve the admin SPA in production (same origin as the admin API)   */
/* ------------------------------------------------------------------ */

const adminDist = join(__dirname, '..', 'frontend', 'dist');
if (existsSync(adminDist)) {
  app.use(express.static(adminDist));
  app.get(/^(?!\/api\/).*/, (_req: Request, res: Response) => {
    res.sendFile(join(adminDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Hello Manage API listening on http://localhost:${PORT}`);
});
