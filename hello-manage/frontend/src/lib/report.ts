import { paidOf, dueOf, type Booking, type Bike, type Owner, type Unit } from './api';
import { ownerCommission, type OwnerCommission } from './commission';

/**
 * A month's trading, arranged the way it has to be paid out: by the person who
 * owns the machines, and under them by the machine itself.
 *
 * Built from the same numbers the Finance page already shows — the period is
 * cut on pickup date and only confirmed bookings count, exactly as
 * `ownerCommission` does — so a statement handed to an owner can never disagree
 * with the payout figure on screen.
 */

export interface PlateRow {
  unitId: string;
  plate: string;
  model: string;
  bookings: Booking[];
  rentals: number;
  days: number;
  revenue: number;
  paid: number;
  due: number;
}

export interface OwnerSection {
  /** null for machines nobody is down as owning. */
  owner: Owner | null;
  plates: PlateRow[];
  rentals: number;
  days: number;
  revenue: number;
  paid: number;
  due: number;
  /** Only where there is an owner to pay. */
  commission: OwnerCommission | null;
}

export interface MonthlyReport {
  month: string;
  from: string;
  to: string;
  sections: OwnerSection[];
  /** Confirmed rentals in the month that never had a plate assigned. */
  unplated: Booking[];
  rentals: number;
  revenue: number;
  paid: number;
  due: number;
  commission: number;
  payout: number;
  /** Said out loud on the report so nothing looks quietly dropped. */
  excluded: { pending: number; cancelled: number };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const pad = (n: number) => String(n).padStart(2, '0');

/** First and last day of a 'YYYY-MM' month, as ISO dates. */
export function monthBounds(month: string): [string, string] {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return [`${month}-01`, `${y}-${pad(m)}-${pad(last)}`];
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function buildMonthlyReport(
  month: string,
  owners: Owner[],
  units: Unit[],
  bikes: Bike[],
  bookings: Booking[],
): MonthlyReport {
  const [from, to] = monthBounds(month);
  const inMonth = bookings.filter(b => b.pickupDate >= from && b.pickupDate <= to);
  const counted = inMonth.filter(b => b.status === 'confirmed');

  const modelOf = (unit: Unit) => bikes.find(k => k.id === unit.bikeId)?.title ?? '—';
  const byUnit = new Map<string, Booking[]>();
  for (const b of counted) {
    if (!b.unitId) continue;
    byUnit.set(b.unitId, [...(byUnit.get(b.unitId) ?? []), b]);
  }

  const plateRow = (unit: Unit): PlateRow => {
    const list = (byUnit.get(unit.id) ?? []).slice().sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));
    return {
      unitId: unit.id,
      plate: unit.plate,
      model: modelOf(unit),
      bookings: list,
      rentals: list.length,
      days: list.reduce((s, b) => s + b.days, 0),
      revenue: round2(list.reduce((s, b) => s + b.total, 0)),
      paid: round2(list.reduce((s, b) => s + paidOf(b), 0)),
      due: round2(list.reduce((s, b) => s + dueOf(b), 0)),
    };
  };

  const sectionFor = (owner: Owner | null, ownUnits: Unit[]): OwnerSection => {
    // Every plate the owner has, earning or not: a bike that sat still all
    // month is a fact the owner is entitled to see, not an omission.
    const plates = ownUnits
      .map(plateRow)
      .sort((a, b) => b.revenue - a.revenue || a.plate.localeCompare(b.plate));
    return {
      owner,
      plates,
      rentals: plates.reduce((s, p) => s + p.rentals, 0),
      days: plates.reduce((s, p) => s + p.days, 0),
      revenue: round2(plates.reduce((s, p) => s + p.revenue, 0)),
      paid: round2(plates.reduce((s, p) => s + p.paid, 0)),
      due: round2(plates.reduce((s, p) => s + p.due, 0)),
      commission: owner ? ownerCommission(owner, units, counted) : null,
    };
  };

  const sections = owners
    .map(o => sectionFor(o, units.filter(u => u.ownerId === o.id)))
    .sort((a, b) => b.revenue - a.revenue);

  const orphanUnits = units.filter(u => !u.ownerId);
  if (orphanUnits.length) sections.push(sectionFor(null, orphanUnits));

  return {
    month,
    from,
    to,
    sections,
    unplated: counted.filter(b => !b.unitId),
    rentals: counted.length,
    revenue: round2(counted.reduce((s, b) => s + b.total, 0)),
    paid: round2(counted.reduce((s, b) => s + paidOf(b), 0)),
    due: round2(counted.reduce((s, b) => s + dueOf(b), 0)),
    commission: round2(sections.reduce((s, x) => s + (x.commission?.commission ?? 0), 0)),
    payout: round2(sections.reduce((s, x) => s + (x.commission?.payout ?? 0), 0)),
    excluded: {
      pending: inMonth.filter(b => b.status === 'pending').length,
      cancelled: inMonth.filter(b => b.status === 'cancelled').length,
    },
  };
}
