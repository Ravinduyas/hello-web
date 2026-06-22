import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Check, X, Trash2, Calendar, MapPin, Mail, Phone, ChevronDown } from 'lucide-react';
import {
  fetchBookings,
  setBookingStatus,
  deleteBooking,
  fetchUnits,
  UnauthorizedError,
  type Booking,
  type BookingStatus,
  type Unit,
} from '../lib/api';

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

type DateRange = 'all' | 'today' | 'week' | 'month' | 'custom';
const RANGES: { key: DateRange; label: string }[] = [
  { key: 'all', label: 'All dates' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'custom', label: 'Custom' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const isoLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Inclusive [from, to] ISO bounds for a range; '' means unbounded. Pickup date is matched against these. */
function rangeBounds(range: DateRange, from: string, to: string): [string, string] {
  const now = new Date();
  switch (range) {
    case 'today': {
      const s = isoLocal(now);
      return [s, s];
    }
    case 'week': {
      const off = (now.getDay() + 6) % 7; // Monday-first
      const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - off);
      const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
      return [isoLocal(mon), isoLocal(sun)];
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [isoLocal(first), isoLocal(last)];
    }
    case 'custom':
      return [from, to];
    default:
      return ['', ''];
  }
}

export default function Bookings({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');
  const [range, setRange] = useState<DateRange>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [b, u] = await Promise.all([fetchBookings(), fetchUnits()]);
      setBookings(b);
      setUnits(u);
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: string, status: BookingStatus, unitId?: string) {
    try {
      const updated = await setBookingStatus(id, status, unitId);
      setBookings(prev => prev.map(b => (b.id === id ? updated : b)));
      // Unit statuses change as plates are reserved/released — keep them fresh.
      setUnits(await fetchUnits());
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await deleteBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const [rangeFrom, rangeTo] = rangeBounds(range, customFrom, customTo);
  const dateFiltered = bookings.filter(
    b => (!rangeFrom || b.pickupDate >= rangeFrom) && (!rangeTo || b.pickupDate <= rangeTo),
  );
  const visible = filter === 'all' ? dateFiltered : dateFiltered.filter(b => b.status === filter);
  const counts = {
    all: dateFiltered.length,
    pending: dateFiltered.filter(b => b.status === 'pending').length,
    confirmed: dateFiltered.filter(b => b.status === 'confirmed').length,
    cancelled: dateFiltered.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="eyebrow">[ Bookings ]</span>
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range menu (by pickup date) */}
          <div className="relative">
            <select
              value={range}
              onChange={e => setRange(e.target.value as DateRange)}
              aria-label="Date range"
              className="appearance-none cursor-pointer bg-white border border-dark/15 rounded-full pl-4 pr-9 py-2 text-sm font-bold text-dark hover:border-dark/30 focus:outline-none focus:border-brand"
            >
              {RANGES.map(r => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark/40" />
          </div>

          {/* Status menu */}
          <div className="relative">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as 'all' | BookingStatus)}
              aria-label="Status"
              className="appearance-none cursor-pointer bg-white border border-dark/15 rounded-full pl-4 pr-9 py-2 text-sm font-bold text-dark hover:border-dark/30 focus:outline-none focus:border-brand"
            >
              <option value="all">All ({counts.all})</option>
              <option value="pending">Pending ({counts.pending})</option>
              <option value="confirmed">Confirmed ({counts.confirmed})</option>
              <option value="cancelled">Cancelled ({counts.cancelled})</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark/40" />
          </div>

          <button onClick={load} className="btn-outline" disabled={loading} aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom date range inputs */}
      {range === 'custom' && (
        <div className="flex flex-wrap items-center justify-end gap-2 mb-6">
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="input max-w-[170px]" aria-label="From date" />
          <span className="text-dark/40">→</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="input max-w-[170px]" aria-label="To date" />
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {loading ? (
        <p className="text-dark/50">Loading bookings…</p>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-dark/50">No bookings here yet.</div>
      ) : (
        <div className="space-y-4">
          {visible.map(b => (
            <div key={b.id} className="bg-white rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${statusStyles[b.status]}`}>
                      {b.status}
                    </span>
                    {b.plate && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-dark/5 text-dark/70">
                        Plate {b.plate}
                      </span>
                    )}
                  </div>
                  <p className="font-bold">{b.bikeTitle}</p>
                  <p className="text-sm text-dark/50">
                    {b.renter.firstName} {b.renter.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-black text-brand">${b.total}</p>
                  <p className="text-[10px] text-dark/40 uppercase tracking-wide">{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-4 border-t border-dark/10 text-sm text-dark/60">
                <Detail icon={Calendar} text={`${b.pickupDate} → ${b.dropoffDate} (${b.days}d)`} />
                <Detail icon={MapPin} text={b.pickupLocation} />
                <Detail icon={Mail} text={b.renter.email} />
                <Detail icon={Phone} text={b.renter.phone} />
              </div>

              {b.extras.length > 0 && (
                <p className="text-xs text-dark/40 mt-3">Extras: {b.extras.map(e => e.label).join(', ')}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-5">
                {b.status !== 'confirmed' && (
                  <ConfirmControl
                    plates={units.filter(u => u.bikeId === b.bikeId && u.status === 'available')}
                    onConfirm={unitId => changeStatus(b.id, 'confirmed', unitId)}
                  />
                )}
                {b.status !== 'cancelled' && (
                  <button
                    onClick={() => changeStatus(b.id, 'cancelled')}
                    className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-dark/5 text-dark hover:bg-dark/10 transition"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
                <button
                  onClick={() => remove(b.id)}
                  className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-red-600 hover:bg-red-50 transition ml-auto"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Confirm button that expands into a plate picker. The admin must choose an
 *  available plate (physical unit) of the booking's model before confirming. */
function ConfirmControl({ plates, onConfirm }: { plates: Unit[]; onConfirm: (unitId: string) => Promise<void> | void }) {
  const [open, setOpen] = useState(false);
  const [unitId, setUnitId] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white hover:brightness-110 transition"
      >
        <Check className="w-4 h-4" /> Confirm
      </button>
    );
  }

  if (plates.length === 0) {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
        No available plates for this model — add one in Fleet.
        <button onClick={() => setOpen(false)} aria-label="Cancel" className="text-amber-800/70 hover:text-amber-900">
          <X className="w-3.5 h-3.5" />
        </button>
      </span>
    );
  }

  async function confirm() {
    if (!unitId) return;
    setBusy(true);
    try {
      await onConfirm(unitId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <select
        value={unitId}
        onChange={e => setUnitId(e.target.value)}
        aria-label="Plate to assign"
        className="text-sm rounded-full border border-dark/15 bg-white px-3 py-1.5 focus:outline-none focus:border-brand"
      >
        <option value="">Select plate…</option>
        {plates.map(u => (
          <option key={u.id} value={u.id}>
            {u.plate}
          </option>
        ))}
      </select>
      <button
        onClick={confirm}
        disabled={!unitId || busy}
        className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white hover:brightness-110 transition disabled:opacity-40 disabled:pointer-events-none"
      >
        <Check className="w-4 h-4" /> {busy ? 'Assigning…' : 'Assign & confirm'}
      </button>
      <button
        onClick={() => setOpen(false)}
        aria-label="Cancel"
        className="text-sm font-bold inline-flex items-center justify-center w-9 h-9 rounded-full bg-dark/5 text-dark hover:bg-dark/10 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </span>
  );
}

function Detail({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-brand shrink-0" /> {text}
    </span>
  );
}
