import { randomUUID } from 'node:crypto';
import { FLEET_BIKES, FLEET_CATEGORIES, FLEET_EXTRAS } from './fleet-data.ts';
import { collections, fromDoc, fromDocs, maybe, toDoc, withTransaction, type Doc } from './mongo.ts';
import type {
  Bike,
  Booking,
  BookingStatus,
  Category,
  Extra,
  Owner,
  Transaction,
  Unit,
  UnitStatus,
} from './types.ts';

export * from './types.ts';

/* ================================================================== */
/*  Store — MongoDB                                                    */
/* ================================================================== */

/**
 * Every read and write the system makes, over MongoDB.
 *
 * The shapes are the ones SQLite served: what used to be a JSON column —
 * a booking's extras, its payments, a bike's features — is now a real array in
 * the document, so nothing is stringified on the way in or parsed on the way
 * out. Booleans are booleans rather than 0 and 1 for the same reason.
 *
 * Anything that has to change two documents at once goes through
 * `withTransaction`, which is the whole reason the server runs as a
 * single-node replica set rather than standalone.
 */

const c = collections;

/* ================================================================== */
/*  Seeding — first run only                                           */
/* ================================================================== */

/**
 * Fills empty collections the way the SQLite build did on a fresh file.
 *
 * Each is guarded on being empty rather than on a flag, so it is safe to run at
 * every boot and never overwrites a shop's own edits.
 */
export async function seed(): Promise<void> {
  if ((await c().extras.countDocuments()) === 0 && FLEET_EXTRAS.length) {
    await c().extras.insertMany(FLEET_EXTRAS.map(e => toDoc<Extra>({ ...e, active: true })));
  }

  if ((await c().bikes.countDocuments()) === 0 && FLEET_BIKES.length) {
    await c().bikes.insertMany(FLEET_BIKES.map(b => toDoc<Bike>({ ...b, active: true })));
  }

  if ((await c().categories.countDocuments()) === 0) {
    // Take the categories the fleet actually uses, so an existing fleet keeps
    // its own; fall back to the defaults for a truly empty database.
    const used = (await c().bikes.distinct('category')).filter(Boolean) as string[];
    const names = used.length ? used : FLEET_CATEGORIES;
    if (names.length) {
      await c().categories.insertMany(names.map((name, i) => ({ _id: name, sortOrder: i })));
    }
  }
}

/* ================================================================== */
/*  Bookings                                                          */
/* ================================================================== */

const bookingStatus = (s: string): BookingStatus =>
  s === 'confirmed' ? 'confirmed' : s === 'cancelled' ? 'cancelled' : 'pending';

/** Guards against a document written before a field existed. */
const readBooking = (doc: Doc<Booking>): Booking => {
  const b = fromDoc<Booking>(doc);
  return {
    ...b,
    status: bookingStatus(b.status),
    unitId: b.unitId ?? '',
    plate: b.plate ?? '',
    extras: b.extras ?? [],
    payments: b.payments ?? [],
    deposit: b.deposit ?? 0,
    depositReturned: !!b.depositReturned,
  };
};

export async function listBookings(): Promise<Booking[]> {
  const docs = await c().bookings.find().sort({ createdAt: -1 }).toArray();
  return docs.map(readBooking);
}

export async function getBooking(id: string): Promise<Booking | null> {
  const doc = await c().bookings.findOne({ _id: id });
  return doc ? readBooking(doc) : null;
}

export async function addBooking(booking: Booking): Promise<Booking> {
  await c().bookings.insertOne(toDoc(booking));
  return booking;
}

/**
 * Create an already-confirmed booking against a chosen plate in one shot — for
 * walk-in rentals booked at the shop counter. Reserves the unit atomically.
 * `booking.unitId` must be set; `plate` is filled from the unit.
 */
export async function createConfirmedBooking(booking: Booking): Promise<Booking> {
  const unit = await getUnit(booking.unitId);
  if (!unit) throw new Error('Pick an available plate.');
  if (unit.bikeId !== booking.bikeId) throw new Error('That plate belongs to a different model.');
  if (unit.status !== 'available') throw new Error(`Plate ${unit.plate} is already ${unit.status}.`);

  const confirmed: Booking = { ...booking, status: 'confirmed', plate: unit.plate };
  await withTransaction(async () => {
    await c().bookings.insertOne(toDoc(confirmed));
    await c().units.updateOne({ _id: confirmed.unitId }, { $set: { status: 'rented' } });
  });
  return confirmed;
}

/**
 * Move a booking between statuses without touching which plate it holds.
 *
 * Leaving the confirmed state frees the physical bike; confirming does not
 * demand one. A booking is confirmed when the shop has agreed to the rental,
 * which is a promise about a model and some dates — the machine that will
 * actually go out is chosen later, when the customer is at the counter paying.
 */
export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
  const booking = await c().bookings.findOne({ _id: id });
  if (!booking) return null;

  if (booking.unitId && status !== 'confirmed') {
    await withTransaction(async () => {
      await c().units.updateOne({ _id: booking.unitId }, { $set: { status: 'available' } });
      await c().bookings.updateOne({ _id: id }, { $set: { status, unitId: '', plate: '' } });
    });
  } else {
    await c().bookings.updateOne({ _id: id }, { $set: { status } });
  }

  return getBooking(id);
}

/**
 * Confirm a booking against a specific physical unit (plate), marking that unit
 * rented. Throws on an invalid/unavailable/mismatched plate. Returns null if the
 * booking doesn't exist.
 */
export async function assignAndConfirm(bookingId: string, unitId: string): Promise<Booking | null> {
  const booking = await c().bookings.findOne({ _id: bookingId });
  if (!booking) return null;
  const unit = await getUnit(unitId);
  if (!unit) throw new Error('That plate no longer exists — refresh and try again.');
  if (unit.bikeId !== booking.bikeId) throw new Error('That plate belongs to a different model.');
  if (unit.status !== 'available' && unit.id !== booking.unitId) {
    throw new Error(`Plate ${unit.plate} is already ${unit.status}.`);
  }

  await withTransaction(async () => {
    // Release a previously assigned (different) unit before taking the new one.
    if (booking.unitId && booking.unitId !== unitId) {
      await c().units.updateOne({ _id: booking.unitId }, { $set: { status: 'available' } });
    }
    await c().units.updateOne({ _id: unitId }, { $set: { status: 'rented' } });
    await c().bookings.updateOne(
      { _id: bookingId },
      { $set: { status: 'confirmed', unitId, plate: unit.plate } },
    );
  });

  return getBooking(bookingId);
}

/** Add/remove payments and set deposit fields on a booking. */
export async function updateBookingBilling(
  id: string,
  ops: {
    addPayment?: { amount: number; note: string };
    removePaymentId?: string;
    deposit?: number;
    depositReturned?: boolean;
  },
): Promise<Booking | null> {
  const current = await getBooking(id);
  if (!current) return null;

  /*
   * Taking money is the point at which a particular machine leaves the yard, so
   * that is where the plate is required — not at confirmation, which only
   * promises a model and some dates. Enforced here rather than in the route so
   * it holds for anything that bills a booking.
   */
  if (ops.addPayment && !current.unitId) {
    throw new Error('Assign a plate before taking payment for this booking.');
  }

  let payments = current.payments;
  if (ops.addPayment && ops.addPayment.amount > 0) {
    payments = [
      ...payments,
      { id: randomUUID(), amount: ops.addPayment.amount, at: new Date().toISOString(), note: ops.addPayment.note || '' },
    ];
  }
  if (ops.removePaymentId) payments = payments.filter(p => p.id !== ops.removePaymentId);

  await c().bookings.updateOne(
    { _id: id },
    {
      $set: {
        payments,
        deposit: ops.deposit !== undefined ? ops.deposit : current.deposit,
        depositReturned: ops.depositReturned !== undefined ? ops.depositReturned : current.depositReturned,
      },
    },
  );

  return getBooking(id);
}

export async function deleteBooking(id: string): Promise<boolean> {
  const booking = await c().bookings.findOne({ _id: id });
  if (!booking) return false;

  await withTransaction(async () => {
    if (booking.unitId) {
      await c().units.updateOne({ _id: booking.unitId }, { $set: { status: 'available' } });
    }
    await c().bookings.deleteOne({ _id: id });
  });
  return true;
}

/* ================================================================== */
/*  Extras                                                            */
/* ================================================================== */

export async function listExtras(opts: { activeOnly?: boolean } = {}): Promise<Extra[]> {
  const docs = await c()
    .extras.find(opts.activeOnly ? { active: true } : {})
    .sort({ sortOrder: 1, label: 1 })
    .toArray();
  return fromDocs<Extra>(docs).map(e => ({ ...e, perDay: !!e.perDay, active: !!e.active }));
}

export async function getExtra(id: string): Promise<Extra | null> {
  return maybe<Extra>(await c().extras.findOne({ _id: id }));
}

export async function addExtra(e: Extra): Promise<Extra> {
  await c().extras.insertOne(toDoc(e));
  return e;
}

export async function updateExtra(id: string, patch: Partial<Omit<Extra, 'id'>>): Promise<Extra | null> {
  const current = await getExtra(id);
  if (!current) return null;
  const next: Extra = { ...current, ...patch, id };
  const { id: _drop, ...fields } = next;
  await c().extras.updateOne({ _id: id }, { $set: fields });
  return next;
}

export async function deleteExtra(id: string): Promise<boolean> {
  return (await c().extras.deleteOne({ _id: id })).deletedCount > 0;
}

/* ================================================================== */
/*  Bikes (fleet)                                                     */
/* ================================================================== */

export async function listBikes(opts: { activeOnly?: boolean } = {}): Promise<Bike[]> {
  const docs = await c()
    .bikes.find(opts.activeOnly ? { active: true } : {})
    .sort({ sortOrder: 1, title: 1 })
    .toArray();
  return fromDocs<Bike>(docs).map(b => ({ ...b, features: b.features ?? [], active: !!b.active }));
}

export async function getBikeById(id: string): Promise<Bike | null> {
  return maybe<Bike>(await c().bikes.findOne({ _id: id }));
}

export async function addBike(b: Bike): Promise<Bike> {
  await c().bikes.insertOne(toDoc(b));
  return b;
}

export async function updateBike(id: string, patch: Partial<Omit<Bike, 'id'>>): Promise<Bike | null> {
  const current = await getBikeById(id);
  if (!current) return null;
  const next: Bike = { ...current, ...patch, id };
  const { id: _drop, ...fields } = next;
  await c().bikes.updateOne({ _id: id }, { $set: fields });
  return next;
}

export async function deleteBike(id: string): Promise<boolean> {
  // Remove the model's individual bikes (units) along with it.
  let removed = false;
  await withTransaction(async () => {
    await c().units.deleteMany({ bikeId: id });
    removed = (await c().bikes.deleteOne({ _id: id })).deletedCount > 0;
  });
  return removed;
}

/* ================================================================== */
/*  Categories                                                        */
/* ================================================================== */

export async function listCategories(): Promise<Category[]> {
  const docs = await c().categories.find().sort({ sortOrder: 1, _id: 1 }).toArray();
  return docs.map(d => ({ name: d._id, sortOrder: d.sortOrder }));
}

export async function addCategory(name: string): Promise<Category> {
  const sortOrder = await c().categories.countDocuments();
  // Insert-if-absent, which is what INSERT OR IGNORE did.
  await c().categories.updateOne({ _id: name }, { $setOnInsert: { sortOrder } }, { upsert: true });
  const doc = await c().categories.findOne({ _id: name });
  return { name, sortOrder: doc?.sortOrder ?? sortOrder };
}

export async function deleteCategory(name: string): Promise<boolean> {
  return (await c().categories.deleteOne({ _id: name })).deletedCount > 0;
}

/** How many bikes currently use a category — used to warn before deleting. */
export async function bikesUsingCategory(name: string): Promise<number> {
  return c().bikes.countDocuments({ category: name });
}

/* ================================================================== */
/*  Units — individual physical bikes (number plates)                 */
/* ================================================================== */

const unitStatus = (s: string): UnitStatus =>
  s === 'rented' ? 'rented' : s === 'maintenance' ? 'maintenance' : 'available';

const readUnit = (doc: Doc<Unit>): Unit => {
  const u = fromDoc<Unit>(doc);
  return { ...u, status: unitStatus(u.status), ownerId: u.ownerId ?? '', notes: u.notes ?? '' };
};

export async function listUnits(bikeId?: string): Promise<Unit[]> {
  const docs = await c()
    .units.find(bikeId ? { bikeId } : {})
    .sort({ createdAt: 1 })
    .toArray();
  return docs.map(readUnit);
}

export async function getUnit(id: string): Promise<Unit | null> {
  const doc = await c().units.findOne({ _id: id });
  return doc ? readUnit(doc) : null;
}

export async function findUnitByPlate(plate: string): Promise<Unit | null> {
  const doc = await c()
    .units.find({ plate }, { collation: { locale: 'en', strength: 2 } })
    .limit(1)
    .next();
  return doc ? readUnit(doc) : null;
}

export async function addUnit(unit: Unit): Promise<Unit> {
  await c().units.insertOne(toDoc(unit));
  return unit;
}

export async function updateUnit(
  id: string,
  patch: Partial<Pick<Unit, 'plate' | 'status' | 'ownerId' | 'notes'>>,
): Promise<Unit | null> {
  const current = await getUnit(id);
  if (!current) return null;
  const next: Unit = { ...current, ...patch };
  await c().units.updateOne(
    { _id: id },
    { $set: { plate: next.plate, status: next.status, ownerId: next.ownerId, notes: next.notes } },
  );
  return next;
}

export async function deleteUnit(id: string): Promise<boolean> {
  return (await c().units.deleteOne({ _id: id })).deletedCount > 0;
}

/* ================================================================== */
/*  Owners (fleet owners)                                             */
/* ================================================================== */

export async function listOwners(): Promise<Owner[]> {
  const docs = await c().owners.find().collation({ locale: 'en', strength: 2 }).sort({ name: 1 }).toArray();
  return fromDocs<Owner>(docs);
}

export async function getOwner(id: string): Promise<Owner | null> {
  return maybe<Owner>(await c().owners.findOne({ _id: id }));
}

export async function addOwner(owner: Owner): Promise<Owner> {
  await c().owners.insertOne(toDoc(owner));
  return owner;
}

export async function updateOwner(
  id: string,
  patch: Partial<Omit<Owner, 'id' | 'createdAt'>>,
): Promise<Owner | null> {
  const current = await getOwner(id);
  if (!current) return null;
  const next: Owner = { ...current, ...patch, id };
  const { id: _drop, createdAt: _keep, ...fields } = next;
  await c().owners.updateOne({ _id: id }, { $set: fields });
  return next;
}

export async function deleteOwner(id: string): Promise<boolean> {
  return (await c().owners.deleteOne({ _id: id })).deletedCount > 0;
}

/** How many physical bikes are assigned to an owner — used to block deletion. */
export async function bikesOwnedBy(id: string): Promise<number> {
  return c().units.countDocuments({ ownerId: id });
}

/* ================================================================== */
/*  Transactions — manual business payments (income / expense)        */
/* ================================================================== */

export async function listTransactions(): Promise<Transaction[]> {
  const docs = await c().transactions.find().sort({ at: -1 }).toArray();
  return fromDocs<Transaction>(docs).map(t => ({ ...t, kind: t.kind === 'out' ? 'out' : 'in' }));
}

export async function addTransaction(t: Transaction): Promise<Transaction> {
  await c().transactions.insertOne(toDoc(t));
  return t;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  return (await c().transactions.deleteOne({ _id: id })).deletedCount > 0;
}
