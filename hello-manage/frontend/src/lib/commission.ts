import type { Owner, Unit, Booking } from './api';

export interface OwnerCommission {
  rentals: number;
  revenue: number;
  commission: number; // shop's cut
  payout: number; // owner's share = revenue - commission
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Commission for one owner from the given bookings (only confirmed bookings on
 *  the owner's plates count). commission = pct% of revenue + flat per rental. */
export function ownerCommission(owner: Owner, units: Unit[], bookings: Booking[]): OwnerCommission {
  const myUnitIds = new Set(units.filter(u => u.ownerId === owner.id).map(u => u.id));
  const mine = bookings.filter(b => b.status === 'confirmed' && b.unitId && myUnitIds.has(b.unitId));
  const revenue = mine.reduce((s, b) => s + b.total, 0);
  const rentals = mine.length;
  const commission = revenue * (owner.commissionPct / 100) + owner.commissionFlat * rentals;
  return { rentals, revenue: round2(revenue), commission: round2(commission), payout: round2(revenue - commission) };
}
