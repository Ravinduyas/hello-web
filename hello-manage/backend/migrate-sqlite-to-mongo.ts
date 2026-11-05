/**
 * Moves an existing SQLite database into MongoDB, once.
 *
 *     npm run migrate:mongo            # from hellorent.db next to this file
 *     npm run migrate:mongo -- --force # overwrite collections that already hold data
 *
 * The SQLite file is only read, never written or deleted: until someone is
 * satisfied the move worked, it is the copy that still has the business in it.
 *
 * Columns that held JSON strings — a booking's extras, its payments, a bike's
 * features — become real arrays here, and the 0/1 integers that stood in for
 * booleans become booleans, which is the whole point of the move.
 */
import './env.ts';
import { DatabaseSync } from 'node:sqlite';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { close, collections, connect } from './mongo.ts';

const here = dirname(fileURLToPath(import.meta.url));
const DB_FILE = join(here, 'data', 'hellorent.db');
const force = process.argv.includes('--force');

if (!existsSync(DB_FILE)) {
  console.error(`No SQLite database at ${DB_FILE} — nothing to migrate.`);
  process.exit(1);
}

const sqlite = new DatabaseSync(DB_FILE);
const rows = <T>(sql: string): T[] => sqlite.prepare(sql).all() as unknown as T[];

/** A JSON column that may be empty, malformed, or already gone. */
function parse<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

await connect();
const c = collections();

const plan: { name: string; collection: keyof ReturnType<typeof collections>; docs: unknown[] }[] = [
  {
    name: 'bookings',
    collection: 'bookings',
    docs: rows<Record<string, unknown>>('SELECT * FROM bookings').map(r => ({
      _id: r.id,
      reference: r.reference,
      status: r.status,
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
      extras: parse(r.extras, []),
      payments: parse(r.payments, []),
      deposit: r.deposit ?? 0,
      depositReturned: !!r.depositReturned,
      renter: parse(r.renter, {}),
    })),
  },
  {
    name: 'bikes',
    collection: 'bikes',
    docs: rows<Record<string, unknown>>('SELECT * FROM bikes').map(r => ({
      _id: r.id,
      title: r.title,
      category: r.category,
      pricePerDay: r.pricePerDay,
      image: r.image,
      features: parse(r.features, []),
      active: !!r.active,
      sortOrder: r.sortOrder,
    })),
  },
  {
    name: 'extras',
    collection: 'extras',
    docs: rows<Record<string, unknown>>('SELECT * FROM extras').map(r => ({
      _id: r.id,
      label: r.label,
      description: r.description,
      price: r.price,
      perDay: !!r.perDay,
      active: !!r.active,
      sortOrder: r.sortOrder,
    })),
  },
  {
    name: 'categories',
    collection: 'categories',
    docs: rows<Record<string, unknown>>('SELECT * FROM categories').map(r => ({
      _id: r.name,
      sortOrder: r.sortOrder,
    })),
  },
  {
    name: 'units',
    collection: 'units',
    docs: rows<Record<string, unknown>>('SELECT * FROM units').map(r => ({
      _id: r.id,
      bikeId: r.bikeId,
      plate: r.plate,
      status: r.status,
      ownerId: r.ownerId ?? '',
      notes: r.notes ?? '',
      createdAt: r.createdAt,
    })),
  },
  {
    name: 'owners',
    collection: 'owners',
    docs: rows<Record<string, unknown>>('SELECT * FROM owners').map(r => ({
      _id: r.id,
      name: r.name,
      phone: r.phone ?? '',
      email: r.email ?? '',
      nic: r.nic ?? '',
      notes: r.notes ?? '',
      commissionPct: r.commissionPct ?? 0,
      commissionFlat: r.commissionFlat ?? 0,
      createdAt: r.createdAt,
    })),
  },
  {
    name: 'transactions',
    collection: 'transactions',
    docs: rows<Record<string, unknown>>('SELECT * FROM transactions').map(r => ({
      _id: r.id,
      kind: r.kind === 'out' ? 'out' : 'in',
      category: r.category ?? '',
      amount: r.amount,
      at: r.at,
      note: r.note ?? '',
    })),
  },
];

console.log(`Migrating ${DB_FILE}\n`);
let moved = 0;
let skipped = 0;

for (const step of plan) {
  const target = c[step.collection] as unknown as {
    countDocuments: () => Promise<number>;
    deleteMany: (f: Record<string, never>) => Promise<unknown>;
    insertMany: (d: unknown[]) => Promise<unknown>;
  };
  const existing = await target.countDocuments();

  if (existing > 0 && !force) {
    console.log(`  · ${step.name.padEnd(13)} skipped — ${existing} document(s) already there (--force to replace)`);
    skipped++;
    continue;
  }
  if (existing > 0) await target.deleteMany({});
  if (step.docs.length) await target.insertMany(step.docs);

  console.log(`  ✓ ${step.name.padEnd(13)} ${step.docs.length} document(s)`);
  moved += step.docs.length;
}

sqlite.close();
await close();

console.log(
  `\n${moved} document(s) migrated${skipped ? `, ${skipped} collection(s) left alone` : ''}. ` +
    `The SQLite file is untouched at ${DB_FILE}.`,
);
