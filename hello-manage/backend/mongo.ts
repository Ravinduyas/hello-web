import { MongoClient, type Collection, type Db } from 'mongodb';
import { MONGODB_URI, MONGODB_DB } from './env.ts';
import type { Booking, Bike, Category, Extra, Owner, Transaction, Unit } from './types.ts';

/**
 * The MongoDB connection, its collections, and the indexes they rely on.
 *
 * Documents are stored with the record's own id as `_id` — the same slugs and
 * UUIDs the rest of the system already passes around — so there is never a
 * second identity to keep in step. Nothing outside this module sees `_id`:
 * `strip` maps it back to `id` on the way out.
 */

/** A stored document: the record, minus its id, keyed by `_id` instead. */
export type Doc<T extends { id: string }> = Omit<T, 'id'> & { _id: string };

/** Record in, document out. */
export const toDoc = <T extends { id: string }>({ id, ...rest }: T): Doc<T> =>
  ({ ...rest, _id: id }) as Doc<T>;

/** Document in, record out — `_id` becomes `id` and does not survive the trip. */
export const fromDoc = <T extends { id: string }>(doc: Doc<T>): T => {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id } as unknown as T;
};

export const fromDocs = <T extends { id: string }>(docs: Doc<T>[]): T[] => docs.map(d => fromDoc<T>(d));

export const maybe = <T extends { id: string }>(doc: Doc<T> | null): T | null => (doc ? fromDoc<T>(doc) : null);

let client: MongoClient | null = null;
let database: Db | null = null;

export interface Collections {
  bookings: Collection<Doc<Booking>>;
  extras: Collection<Doc<Extra>>;
  bikes: Collection<Doc<Bike>>;
  /** Keyed by the category name itself; a category is only a name and an order. */
  categories: Collection<{ _id: string; sortOrder: number }>;
  units: Collection<Doc<Unit>>;
  owners: Collection<Doc<Owner>>;
  transactions: Collection<Doc<Transaction>>;
  /** Shop-editable configuration, one document per section. */
  settings: Collection<{ _id: string } & Record<string, unknown>>;
  /** Running numbers, one document per sequence (e.g. booking references). */
  counters: Collection<{ _id: string; seq: number }>;
}

let cols: Collections | null = null;

export function db(): Db {
  if (!database) throw new Error('MongoDB is not connected yet — call connect() first.');
  return database;
}

export function collections(): Collections {
  if (!cols) throw new Error('MongoDB is not connected yet — call connect() first.');
  return cols;
}

export function mongoClient(): MongoClient {
  if (!client) throw new Error('MongoDB is not connected yet — call connect() first.');
  return client;
}

/**
 * Opens the connection and makes sure the indexes exist.
 *
 * Called once at boot and awaited before the server listens, so no request can
 * arrive at a store function with nothing behind it.
 */
export async function connect(uri = MONGODB_URI, name = MONGODB_DB): Promise<Db> {
  if (database) return database;
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(name);
  cols = {
    bookings: database.collection('bookings'),
    extras: database.collection('extras'),
    bikes: database.collection('bikes'),
    categories: database.collection('categories'),
    units: database.collection('units'),
    owners: database.collection('owners'),
    transactions: database.collection('transactions'),
    settings: database.collection('settings'),
    counters: database.collection('counters'),
  };

  await Promise.all([
    cols.bookings.createIndex({ createdAt: -1 }),
    cols.bookings.createIndex({ unitId: 1 }),
    cols.bookings.createIndex({ pickupDate: 1 }),
    cols.units.createIndex({ bikeId: 1 }),
    // A plate is one physical machine, and "BVJ 6921" must not be able to
    // arrive a second time as "bvj 6921" — the SQLite schema enforced this
    // with UNIQUE plus a NOCASE lookup, and strength 2 is the same rule.
    cols.units.createIndex({ plate: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } }),
    cols.transactions.createIndex({ at: -1 }),
    cols.bikes.createIndex({ sortOrder: 1, title: 1 }),
    cols.extras.createIndex({ sortOrder: 1, label: 1 }),
    cols.owners.createIndex({ name: 1 }, { collation: { locale: 'en', strength: 2 } }),
  ]);

  await normaliseBookingReferences();
  // After the renumbering, so old random references can't collide mid-way.
  await cols.bookings.createIndex({ reference: 1 }, { unique: true });

  return database;
}

/* ------------------------------------------------------------------ */
/*  Booking references: HR-00001, HR-00002, …                         */
/* ------------------------------------------------------------------ */

/** Two capital letters, a dash, then the running number (at least five digits). */
export const REFERENCE_PREFIX = 'HR';
const REFERENCE_RE = new RegExp(`^${REFERENCE_PREFIX}-(\\d{5,})$`);
const formatReference = (n: number) => `${REFERENCE_PREFIX}-${String(n).padStart(5, '0')}`;

/**
 * The next booking reference. MongoDB increments the counter atomically, so
 * two bookings arriving at the same moment can never get the same number,
 * and numbers only ever go up — a cancelled or deleted booking's number is
 * not reused.
 */
export async function nextBookingReference(): Promise<string> {
  const doc = await collections().counters.findOneAndUpdate(
    { _id: 'bookingReference' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return formatReference(doc!.seq);
}

/**
 * Brings existing bookings into the scheme at startup: any booking whose
 * reference is not already HR-NNNNN is renumbered in the order it was made,
 * and the counter is moved past the highest number in use, so it can never
 * hand out one that already exists.
 */
async function normaliseBookingReferences(): Promise<void> {
  const c = collections();
  const all = await c.bookings.find({}, { projection: { _id: 1, reference: 1, createdAt: 1 } }).sort({ createdAt: 1 }).toArray();
  let max = 0;
  for (const b of all) {
    const m = REFERENCE_RE.exec(String(b.reference ?? ''));
    if (m) max = Math.max(max, Number(m[1]));
  }
  const counter = await c.counters.findOneAndUpdate(
    { _id: 'bookingReference' },
    { $max: { seq: max } },
    { upsert: true, returnDocument: 'after' },
  );
  let seq = counter!.seq;
  for (const b of all) {
    if (REFERENCE_RE.test(String(b.reference ?? ''))) continue;
    seq += 1;
    const ref = formatReference(seq);
    await c.bookings.updateOne({ _id: b._id }, { $set: { reference: ref } });
    console.log(`Booking reference ${b.reference} → ${ref}`);
  }
  await c.counters.updateOne({ _id: 'bookingReference' }, { $max: { seq } });
}

export async function close(): Promise<void> {
  await client?.close();
  client = null;
  database = null;
  cols = null;
}

/**
 * Runs a unit of work that touches more than one document as one transaction.
 *
 * Assigning a plate writes to both the booking and the unit; half of that
 * applied is a machine rented to nobody, or a booking holding a plate the
 * fleet thinks is free. MongoDB only offers this on a replica set, which is
 * why the local server runs as a single-node one.
 */
export async function withTransaction<T>(work: () => Promise<T>): Promise<T> {
  const session = mongoClient().startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await work();
    });
    return result!;
  } finally {
    await session.endSession();
  }
}
