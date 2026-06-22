import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const DB_FILE = process.env.DB_FILE || join(DATA_DIR, 'hellorent.db');

/* ================================================================== */
/*  Types                                                             */
/* ================================================================== */

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingExtra {
  id: string;
  label: string;
  amount: number;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  createdAt: string;
  bikeId: string;
  bikeTitle: string;
  /** Physical unit (plate) assigned when the booking is confirmed. '' = none. */
  unitId: string;
  /** Denormalised plate of the assigned unit, for display. '' = none. */
  plate: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  days: number;
  extras: BookingExtra[];
  total: number;
  renter: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    license?: string;
  };
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

/** Categories are admin-managed, so this is a free-form string (a category name). */
export type BikeCategory = string;

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

export interface Category {
  name: string;
  sortOrder: number;
}

export type UnitStatus = 'available' | 'rented' | 'maintenance';

/** A single physical bike (one number plate) belonging to a model (bikes row). */
export interface Unit {
  id: string;
  bikeId: string;
  plate: string;
  status: UnitStatus;
  /** Fleet owner that owns this physical bike. '' = unassigned. */
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
  createdAt: string;
}

/* ================================================================== */
/*  Database — embedded SQLite (node:sqlite, no native build)          */
/* ================================================================== */

mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id              TEXT PRIMARY KEY,
    reference       TEXT NOT NULL,
    status          TEXT NOT NULL,
    createdAt       TEXT NOT NULL,
    bikeId          TEXT NOT NULL,
    bikeTitle       TEXT NOT NULL,
    pickupLocation  TEXT NOT NULL,
    dropoffLocation TEXT NOT NULL,
    pickupDate      TEXT NOT NULL,
    dropoffDate     TEXT NOT NULL,
    days            INTEGER NOT NULL,
    total           REAL NOT NULL,
    extras          TEXT NOT NULL,
    renter          TEXT NOT NULL,
    unitId          TEXT NOT NULL DEFAULT '',
    plate           TEXT NOT NULL DEFAULT ''
  );
`);
db.exec('CREATE INDEX IF NOT EXISTS idx_bookings_createdAt ON bookings(createdAt);');

// Migration: add unit assignment columns to bookings for DBs created before
// plates were tied to bookings.
const bookingCols = db.prepare('PRAGMA table_info(bookings)').all() as unknown as { name: string }[];
if (!bookingCols.some(c => c.name === 'unitId')) {
  db.exec("ALTER TABLE bookings ADD COLUMN unitId TEXT NOT NULL DEFAULT ''");
}
if (!bookingCols.some(c => c.name === 'plate')) {
  db.exec("ALTER TABLE bookings ADD COLUMN plate TEXT NOT NULL DEFAULT ''");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS extras (
    id          TEXT PRIMARY KEY,
    label       TEXT NOT NULL,
    description TEXT NOT NULL,
    price       REAL NOT NULL,
    perDay      INTEGER NOT NULL,
    active      INTEGER NOT NULL DEFAULT 1,
    sortOrder   INTEGER NOT NULL DEFAULT 0
  );
`);

/* ---- Seed default extras on first run --------------------------- */
const DEFAULT_EXTRAS: Omit<Extra, 'active'>[] = [
  { id: 'extra-helmet', label: 'Extra helmet', description: 'A second DOT-certified helmet for your passenger.', price: 2, perDay: true, sortOrder: 0 },
  { id: 'phone-mount', label: 'Phone / GPS mount', description: 'Handlebar mount so you can navigate hands-free.', price: 1, perDay: true, sortOrder: 1 },
  { id: 'luggage-box', label: 'Rear luggage box', description: 'Lockable top box for bags and groceries.', price: 3, perDay: true, sortOrder: 2 },
  { id: 'insurance', label: 'Damage protection', description: 'Reduces your excess to zero on accidental damage.', price: 4, perDay: true, sortOrder: 3 },
  { id: 'delivery', label: 'Hotel delivery', description: 'We bring the bike to your hotel and collect it after.', price: 15, perDay: false, sortOrder: 4 },
];

const extrasCount = (db.prepare('SELECT COUNT(*) AS n FROM extras').get() as { n: number }).n;
if (extrasCount === 0) {
  const seed = db.prepare(
    'INSERT INTO extras (id, label, description, price, perDay, active, sortOrder) VALUES (?, ?, ?, ?, ?, 1, ?)',
  );
  for (const e of DEFAULT_EXTRAS) {
    seed.run(e.id, e.label, e.description, e.price, e.perDay ? 1 : 0, e.sortOrder);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS bikes (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    category    TEXT NOT NULL,
    pricePerDay REAL NOT NULL,
    image       TEXT NOT NULL,
    features    TEXT NOT NULL,
    active      INTEGER NOT NULL DEFAULT 1,
    sortOrder   INTEGER NOT NULL DEFAULT 0
  );
`);

/* ---- Seed default fleet on first run ---------------------------- */
const DEFAULT_BIKES: Omit<Bike, 'active'>[] = [
  { id: 'honda-dio-110', title: 'Honda Dio 110cc', category: 'Scooter', pricePerDay: 9, image: 'https://images.unsplash.com/photo-1681765656650-e0c87babdfe6?auto=format&fit=crop&q=80&w=800', features: ['Automatic', 'Ideal for city & beach roads', 'Fuel efficient', 'Helmet included'], sortOrder: 0 },
  { id: 'honda-wave-125', title: 'Honda Wave 125', category: 'Scooter', pricePerDay: 11, image: 'https://images.unsplash.com/photo-1708975477606-e19484f6fd45?auto=format&fit=crop&q=80&w=800', features: ['Semi-automatic', 'Under-seat storage', 'USB charging port', 'Helmet included'], sortOrder: 1 },
  { id: 'bajaj-pulsar-150', title: 'Bajaj Pulsar 150', category: 'Motorbike', pricePerDay: 15, image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=800', features: ['Manual 5-speed', 'Great for hill country roads', 'GPS mount included', 'Helmet included'], sortOrder: 2 },
  { id: 'tvs-apache-160', title: 'TVS Apache 160', category: 'Motorbike', pricePerDay: 16, image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800', features: ['Manual 5-speed', 'Sport touring', 'GPS mount included', 'Helmet included'], sortOrder: 3 },
  { id: 'yamaha-fz-150', title: 'Yamaha FZ 150', category: 'Motorbike', pricePerDay: 18, image: 'https://images.unsplash.com/photo-1653834048900-b5eeb9decd6a?auto=format&fit=crop&q=80&w=800', features: ['Manual 5-speed', 'Fuel injection', 'Best for Ella & Kandy routes', 'Helmet included'], sortOrder: 4 },
  { id: 'honda-cb-125', title: 'Honda CB 125', category: 'Scooter', pricePerDay: 10, image: 'https://images.unsplash.com/photo-1554223789-df81106a45ed?auto=format&fit=crop&q=80&w=800', features: ['Automatic', 'Lightweight city bike', 'Under-seat storage', 'Helmet included'], sortOrder: 5 },
];

const bikesCount = (db.prepare('SELECT COUNT(*) AS n FROM bikes').get() as { n: number }).n;
if (bikesCount === 0) {
  const seed = db.prepare(
    'INSERT INTO bikes (id, title, category, pricePerDay, image, features, active, sortOrder) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
  );
  for (const b of DEFAULT_BIKES) {
    seed.run(b.id, b.title, b.category, b.pricePerDay, b.image, JSON.stringify(b.features), b.sortOrder);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    name      TEXT PRIMARY KEY,
    sortOrder INTEGER NOT NULL DEFAULT 0
  );
`);

/* Seed categories from whatever categories the existing bikes already use, so the
   current fleet keeps its categories. Falls back to the two defaults. */
const categoriesCount = (db.prepare('SELECT COUNT(*) AS n FROM categories').get() as { n: number }).n;
if (categoriesCount === 0) {
  const used = (db.prepare('SELECT DISTINCT category FROM bikes').all() as unknown as { category: string }[])
    .map(r => r.category)
    .filter(Boolean);
  const seedNames = used.length ? used : ['Scooter', 'Motorbike'];
  const seed = db.prepare('INSERT OR IGNORE INTO categories (name, sortOrder) VALUES (?, ?)');
  seedNames.forEach((name, i) => seed.run(name, i));
}

db.exec(`
  CREATE TABLE IF NOT EXISTS units (
    id        TEXT PRIMARY KEY,
    bikeId    TEXT NOT NULL,
    plate     TEXT NOT NULL UNIQUE,
    status    TEXT NOT NULL DEFAULT 'available',
    notes     TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL
  );
`);
db.exec('CREATE INDEX IF NOT EXISTS idx_units_bikeId ON units(bikeId);');

// Migration: add ownerId to units if an older DB predates fleet owners.
const unitCols = db.prepare('PRAGMA table_info(units)').all() as unknown as { name: string }[];
if (!unitCols.some(c => c.name === 'ownerId')) {
  db.exec("ALTER TABLE units ADD COLUMN ownerId TEXT NOT NULL DEFAULT ''");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS owners (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    phone     TEXT NOT NULL DEFAULT '',
    email     TEXT NOT NULL DEFAULT '',
    nic       TEXT NOT NULL DEFAULT '',
    notes     TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL
  );
`);

/* ================================================================== */
/*  Bookings                                                          */
/* ================================================================== */

interface BookingRow {
  id: string;
  reference: string;
  status: string;
  createdAt: string;
  bikeId: string;
  bikeTitle: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  days: number;
  total: number;
  extras: string;
  renter: string;
  unitId: string;
  plate: string;
}

function rowToBooking(r: BookingRow): Booking {
  return {
    id: r.id,
    reference: r.reference,
    status: r.status as BookingStatus,
    createdAt: r.createdAt,
    bikeId: r.bikeId,
    bikeTitle: r.bikeTitle,
    unitId: r.unitId ?? '',
    plate: r.plate ?? '',
    pickupLocation: r.pickupLocation,
    dropoffLocation: r.dropoffLocation,
    pickupDate: r.pickupDate,
    dropoffDate: r.dropoffDate,
    days: r.days,
    total: r.total,
    extras: JSON.parse(r.extras) as BookingExtra[],
    renter: JSON.parse(r.renter) as Booking['renter'],
  };
}

function getBookingRow(id: string): BookingRow | undefined {
  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as unknown as BookingRow | undefined;
}

const insertBooking = db.prepare(`
  INSERT INTO bookings (
    id, reference, status, createdAt, bikeId, bikeTitle, unitId, plate,
    pickupLocation, dropoffLocation, pickupDate, dropoffDate,
    days, total, extras, renter
  ) VALUES (
    :id, :reference, :status, :createdAt, :bikeId, :bikeTitle, :unitId, :plate,
    :pickupLocation, :dropoffLocation, :pickupDate, :dropoffDate,
    :days, :total, :extras, :renter
  )
`);

function runInsertBooking(booking: Booking): void {
  insertBooking.run({
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    createdAt: booking.createdAt,
    bikeId: booking.bikeId,
    bikeTitle: booking.bikeTitle,
    unitId: booking.unitId,
    plate: booking.plate,
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation,
    pickupDate: booking.pickupDate,
    dropoffDate: booking.dropoffDate,
    days: booking.days,
    total: booking.total,
    extras: JSON.stringify(booking.extras),
    renter: JSON.stringify(booking.renter),
  });
}

export function listBookings(): Booking[] {
  const rows = db.prepare('SELECT * FROM bookings ORDER BY createdAt DESC').all() as unknown as BookingRow[];
  return rows.map(rowToBooking);
}

export function addBooking(booking: Booking): Booking {
  runInsertBooking(booking);
  return booking;
}

/** Create an already-confirmed booking against a chosen plate in one shot — for
 *  walk-in rentals booked at the shop counter. Reserves the unit atomically.
 *  `booking.unitId` must be set; `plate` is filled from the unit. */
export function createConfirmedBooking(booking: Booking): Booking {
  const unit = getUnit(booking.unitId);
  if (!unit) throw new Error('Pick an available plate.');
  if (unit.bikeId !== booking.bikeId) throw new Error('That plate belongs to a different model.');
  if (unit.status !== 'available') throw new Error(`Plate ${unit.plate} is already ${unit.status}.`);
  const confirmed: Booking = { ...booking, status: 'confirmed', plate: unit.plate };
  db.exec('BEGIN IMMEDIATE');
  try {
    runInsertBooking(confirmed);
    db.prepare("UPDATE units SET status = 'rented' WHERE id = ?").run(confirmed.unitId);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return confirmed;
}

/** Move a booking to pending/cancelled. Releases any assigned plate back to the
 *  fleet (confirm is handled separately by assignAndConfirm). */
export function updateBookingStatus(id: string, status: BookingStatus): Booking | null {
  const booking = getBookingRow(id);
  if (!booking) return null;
  db.exec('BEGIN IMMEDIATE');
  try {
    if (booking.unitId) {
      // Leaving the confirmed state frees the physical bike.
      db.prepare("UPDATE units SET status = 'available' WHERE id = ?").run(booking.unitId);
      db.prepare("UPDATE bookings SET status = ?, unitId = '', plate = '' WHERE id = ?").run(status, id);
    } else {
      db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return rowToBooking(getBookingRow(id)!);
}

/** Confirm a booking against a specific physical unit (plate), marking that unit
 *  rented. Throws on an invalid/unavailable/mismatched plate. Returns null if the
 *  booking doesn't exist. */
export function assignAndConfirm(bookingId: string, unitId: string): Booking | null {
  const booking = getBookingRow(bookingId);
  if (!booking) return null;
  const unit = getUnit(unitId);
  if (!unit) throw new Error('That plate no longer exists — refresh and try again.');
  if (unit.bikeId !== booking.bikeId) throw new Error('That plate belongs to a different model.');
  if (unit.status !== 'available' && unit.id !== booking.unitId) {
    throw new Error(`Plate ${unit.plate} is already ${unit.status}.`);
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    // Release a previously assigned (different) unit before taking the new one.
    if (booking.unitId && booking.unitId !== unitId) {
      db.prepare("UPDATE units SET status = 'available' WHERE id = ?").run(booking.unitId);
    }
    db.prepare("UPDATE units SET status = 'rented' WHERE id = ?").run(unitId);
    db.prepare("UPDATE bookings SET status = 'confirmed', unitId = ?, plate = ? WHERE id = ?").run(unitId, unit.plate, bookingId);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return rowToBooking(getBookingRow(bookingId)!);
}

export function deleteBooking(id: string): boolean {
  const booking = getBookingRow(id);
  if (!booking) return false;
  db.exec('BEGIN IMMEDIATE');
  try {
    if (booking.unitId) {
      db.prepare("UPDATE units SET status = 'available' WHERE id = ?").run(booking.unitId);
    }
    db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return true;
}

/* ================================================================== */
/*  Extras                                                            */
/* ================================================================== */

interface ExtraRow {
  id: string;
  label: string;
  description: string;
  price: number;
  perDay: number;
  active: number;
  sortOrder: number;
}

function rowToExtra(r: ExtraRow): Extra {
  return {
    id: r.id,
    label: r.label,
    description: r.description,
    price: r.price,
    perDay: !!r.perDay,
    active: !!r.active,
    sortOrder: r.sortOrder,
  };
}

export function listExtras(opts: { activeOnly?: boolean } = {}): Extra[] {
  const sql = opts.activeOnly
    ? 'SELECT * FROM extras WHERE active = 1 ORDER BY sortOrder, label'
    : 'SELECT * FROM extras ORDER BY sortOrder, label';
  return (db.prepare(sql).all() as unknown as ExtraRow[]).map(rowToExtra);
}

export function getExtra(id: string): Extra | null {
  const row = db.prepare('SELECT * FROM extras WHERE id = ?').get(id) as unknown as ExtraRow | undefined;
  return row ? rowToExtra(row) : null;
}

export function addExtra(e: Extra): Extra {
  db.prepare(
    'INSERT INTO extras (id, label, description, price, perDay, active, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(e.id, e.label, e.description, e.price, e.perDay ? 1 : 0, e.active ? 1 : 0, e.sortOrder);
  return e;
}

export function updateExtra(id: string, patch: Partial<Omit<Extra, 'id'>>): Extra | null {
  const current = getExtra(id);
  if (!current) return null;
  const next: Extra = { ...current, ...patch, id };
  db.prepare(
    'UPDATE extras SET label = ?, description = ?, price = ?, perDay = ?, active = ?, sortOrder = ? WHERE id = ?',
  ).run(next.label, next.description, next.price, next.perDay ? 1 : 0, next.active ? 1 : 0, next.sortOrder, id);
  return next;
}

export function deleteExtra(id: string): boolean {
  return db.prepare('DELETE FROM extras WHERE id = ?').run(id).changes > 0;
}

/* ================================================================== */
/*  Bikes (fleet)                                                     */
/* ================================================================== */

interface BikeRow {
  id: string;
  title: string;
  category: string;
  pricePerDay: number;
  image: string;
  features: string;
  active: number;
  sortOrder: number;
}

function rowToBike(r: BikeRow): Bike {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    pricePerDay: r.pricePerDay,
    image: r.image,
    features: JSON.parse(r.features) as string[],
    active: !!r.active,
    sortOrder: r.sortOrder,
  };
}

export function listBikes(opts: { activeOnly?: boolean } = {}): Bike[] {
  const sql = opts.activeOnly
    ? 'SELECT * FROM bikes WHERE active = 1 ORDER BY sortOrder, title'
    : 'SELECT * FROM bikes ORDER BY sortOrder, title';
  return (db.prepare(sql).all() as unknown as BikeRow[]).map(rowToBike);
}

export function getBikeById(id: string): Bike | null {
  const row = db.prepare('SELECT * FROM bikes WHERE id = ?').get(id) as unknown as BikeRow | undefined;
  return row ? rowToBike(row) : null;
}

export function addBike(b: Bike): Bike {
  db.prepare(
    'INSERT INTO bikes (id, title, category, pricePerDay, image, features, active, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(b.id, b.title, b.category, b.pricePerDay, b.image, JSON.stringify(b.features), b.active ? 1 : 0, b.sortOrder);
  return b;
}

export function updateBike(id: string, patch: Partial<Omit<Bike, 'id'>>): Bike | null {
  const current = getBikeById(id);
  if (!current) return null;
  const next: Bike = { ...current, ...patch, id };
  db.prepare(
    'UPDATE bikes SET title = ?, category = ?, pricePerDay = ?, image = ?, features = ?, active = ?, sortOrder = ? WHERE id = ?',
  ).run(next.title, next.category, next.pricePerDay, next.image, JSON.stringify(next.features), next.active ? 1 : 0, next.sortOrder, id);
  return next;
}

export function deleteBike(id: string): boolean {
  // Remove the model's individual bikes (units) along with it.
  db.prepare('DELETE FROM units WHERE bikeId = ?').run(id);
  return db.prepare('DELETE FROM bikes WHERE id = ?').run(id).changes > 0;
}

/* ================================================================== */
/*  Categories                                                        */
/* ================================================================== */

export function listCategories(): Category[] {
  return db.prepare('SELECT * FROM categories ORDER BY sortOrder, name').all() as unknown as Category[];
}

export function addCategory(name: string): Category {
  const sortOrder = listCategories().length;
  db.prepare('INSERT OR IGNORE INTO categories (name, sortOrder) VALUES (?, ?)').run(name, sortOrder);
  const row = db.prepare('SELECT * FROM categories WHERE name = ?').get(name) as unknown as Category;
  return row;
}

export function deleteCategory(name: string): boolean {
  return db.prepare('DELETE FROM categories WHERE name = ?').run(name).changes > 0;
}

/** How many bikes currently use a category — used to warn before deleting. */
export function bikesUsingCategory(name: string): number {
  return (db.prepare('SELECT COUNT(*) AS n FROM bikes WHERE category = ?').get(name) as { n: number }).n;
}

/* ================================================================== */
/*  Units — individual physical bikes (number plates)                 */
/* ================================================================== */

interface UnitRow {
  id: string;
  bikeId: string;
  plate: string;
  status: string;
  ownerId: string | null;
  notes: string;
  createdAt: string;
}

function rowToUnit(r: UnitRow): Unit {
  const status: UnitStatus =
    r.status === 'rented' ? 'rented' : r.status === 'maintenance' ? 'maintenance' : 'available';
  return { id: r.id, bikeId: r.bikeId, plate: r.plate, status, ownerId: r.ownerId ?? '', notes: r.notes, createdAt: r.createdAt };
}

export function listUnits(bikeId?: string): Unit[] {
  const rows = bikeId
    ? (db.prepare('SELECT * FROM units WHERE bikeId = ? ORDER BY createdAt').all(bikeId) as unknown as UnitRow[])
    : (db.prepare('SELECT * FROM units ORDER BY createdAt').all() as unknown as UnitRow[]);
  return rows.map(rowToUnit);
}

export function getUnit(id: string): Unit | null {
  const row = db.prepare('SELECT * FROM units WHERE id = ?').get(id) as unknown as UnitRow | undefined;
  return row ? rowToUnit(row) : null;
}

export function findUnitByPlate(plate: string): Unit | null {
  const row = db.prepare('SELECT * FROM units WHERE plate = ? COLLATE NOCASE').get(plate) as unknown as UnitRow | undefined;
  return row ? rowToUnit(row) : null;
}

export function addUnit(unit: Unit): Unit {
  db.prepare('INSERT INTO units (id, bikeId, plate, status, ownerId, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    unit.id,
    unit.bikeId,
    unit.plate,
    unit.status,
    unit.ownerId,
    unit.notes,
    unit.createdAt,
  );
  return unit;
}

export function updateUnit(id: string, patch: Partial<Pick<Unit, 'plate' | 'status' | 'ownerId' | 'notes'>>): Unit | null {
  const current = getUnit(id);
  if (!current) return null;
  const next: Unit = { ...current, ...patch };
  db.prepare('UPDATE units SET plate = ?, status = ?, ownerId = ?, notes = ? WHERE id = ?').run(
    next.plate,
    next.status,
    next.ownerId,
    next.notes,
    id,
  );
  return next;
}

export function deleteUnit(id: string): boolean {
  return db.prepare('DELETE FROM units WHERE id = ?').run(id).changes > 0;
}

/* ================================================================== */
/*  Owners (fleet owners)                                             */
/* ================================================================== */

interface OwnerRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  nic: string;
  notes: string;
  createdAt: string;
}

export function listOwners(): Owner[] {
  return db.prepare('SELECT * FROM owners ORDER BY name COLLATE NOCASE').all() as unknown as OwnerRow[];
}

export function getOwner(id: string): Owner | null {
  const row = db.prepare('SELECT * FROM owners WHERE id = ?').get(id) as unknown as OwnerRow | undefined;
  return row ?? null;
}

export function addOwner(owner: Owner): Owner {
  db.prepare(
    'INSERT INTO owners (id, name, phone, email, nic, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(owner.id, owner.name, owner.phone, owner.email, owner.nic, owner.notes, owner.createdAt);
  return owner;
}

export function updateOwner(id: string, patch: Partial<Omit<Owner, 'id' | 'createdAt'>>): Owner | null {
  const current = getOwner(id);
  if (!current) return null;
  const next: Owner = { ...current, ...patch, id };
  db.prepare('UPDATE owners SET name = ?, phone = ?, email = ?, nic = ?, notes = ? WHERE id = ?').run(
    next.name,
    next.phone,
    next.email,
    next.nic,
    next.notes,
    id,
  );
  return next;
}

export function deleteOwner(id: string): boolean {
  return db.prepare('DELETE FROM owners WHERE id = ?').run(id).changes > 0;
}

/** How many physical bikes are assigned to an owner — used to block deletion. */
export function bikesOwnedBy(id: string): number {
  return (db.prepare('SELECT COUNT(*) AS n FROM units WHERE ownerId = ?').get(id) as { n: number }).n;
}
