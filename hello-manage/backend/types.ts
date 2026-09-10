/**
 * The shapes the whole system agrees on.
 *
 * Lifted out of the store when it moved to MongoDB: the connection layer needs
 * them to type its collections, and the store needs them for its signatures, so
 * neither can be the one that owns them without the two importing each other.
 */

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingExtra {
  id: string;
  label: string;
  amount: number;
}

/** A single customer payment against a booking. */
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
  /** Customer payments toward the rental total (paid = sum, due = total - paid). */
  payments: Payment[];
  /** Refundable security deposit held while the bike is out. */
  deposit: number;
  depositReturned: boolean;
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

/** A manually-recorded business payment: money in (income) or out (expense). */
export interface Transaction {
  id: string;
  kind: 'in' | 'out';
  category: string;
  amount: number;
  at: string;
  note: string;
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
