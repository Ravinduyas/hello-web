import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Check, X, Trash2, Calendar, MapPin, Mail, Phone, ChevronDown, Wallet, Plus } from 'lucide-react';
import Drawer from '../components/Drawer';
import {
  fetchBookings,
  setBookingStatus,
  deleteBooking,
  fetchUnits,
  updateBilling,
  paidOf,
  dueOf,
  UnauthorizedError,
  type Booking,
  type BookingStatus,
  type Unit,
} from '../lib/api';

const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, '')}`;

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
  const [payId, setPayId] = useState<string | null>(null);

  // `silent` polls update data without the spinner or clobbering the UI with a
  // transient error if a single background fetch fails.
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [b, u] = await Promise.all([fetchBookings(), fetchUnits()]);
      setBookings(b);
      setUnits(u);
      setError('');
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      if (!silent) setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 15000); // auto-refresh every 15s
    return () => clearInterval(id);
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

  async function applyBilling(id: string, ops: Parameters<typeof updateBilling>[1]) {
    try {
      const updated = await updateBilling(id, ops);
      setBookings(prev => prev.map(b => (b.id === id ? updated : b)));
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Could not update payment');
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
  const payBooking = payId ? bookings.find(b => b.id === payId) ?? null : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="flex items-center gap-2">
          <span className="eyebrow">[ Bookings ]</span>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-dark/40" title="Auto-refreshing every 15s">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </span>
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

          <button onClick={() => load()} className="btn-outline" disabled={loading} aria-label="Refresh">
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

              {/* Billing summary */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs">
                <span className="text-dark/50">Paid <b className="text-emerald-700">{money(paidOf(b))}</b></span>
                <span className="text-dark/50">Due <b className={dueOf(b) > 0 ? 'text-red-600' : 'text-dark/60'}>{money(dueOf(b))}</b></span>
                {b.deposit > 0 && (
                  <span className="text-dark/50">
                    Deposit <b className="text-dark">{money(b.deposit)}</b>
                    {b.depositReturned && <span className="text-dark/40"> · returned</span>}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-5">
                {b.status !== 'confirmed' && (
                  <ConfirmControl
                    plates={units.filter(u => u.bikeId === b.bikeId && u.status === 'available')}
                    onConfirm={unitId => changeStatus(b.id, 'confirmed', unitId)}
                  />
                )}
                <button
                  onClick={() => setPayId(b.id)}
                  className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition"
                >
                  <Wallet className="w-4 h-4" /> Payments
                </button>
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

      <Drawer
        open={!!payBooking}
        onClose={() => setPayId(null)}
        title="Payments & deposit"
        subtitle={payBooking ? `${payBooking.bikeTitle} · ${payBooking.renter.firstName} ${payBooking.renter.lastName}`.trim() : ''}
        widthClass="max-w-md"
      >
        {payBooking && <PaymentsForm booking={payBooking} onApply={ops => applyBilling(payBooking.id, ops)} />}
      </Drawer>
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

/** Payments & deposit manager (drawer body). Operates on the live booking and
 *  applies each change immediately via onApply. */
function PaymentsForm({ booking, onApply }: { booking: Booking; onApply: (ops: Parameters<typeof updateBilling>[1]) => Promise<void> }) {
  const paid = paidOf(booking);
  const due = dueOf(booking);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [deposit, setDeposit] = useState(String(booking.deposit || ''));
  const [busy, setBusy] = useState(false);

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    const a = Number(amount) || 0;
    if (a <= 0) return;
    setBusy(true);
    try {
      await onApply({ addPayment: { amount: a, note: note.trim() } });
      setAmount('');
      setNote('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-dark text-beige rounded-2xl p-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-[10px] uppercase tracking-widest text-beige/50">Total</p><p className="font-display text-xl font-black mt-1">{money(booking.total)}</p></div>
          <div><p className="text-[10px] uppercase tracking-widest text-beige/50">Paid</p><p className="font-display text-xl font-black mt-1 text-emerald-300">{money(paid)}</p></div>
          <div><p className="text-[10px] uppercase tracking-widest text-beige/50">Due</p><p className={`font-display text-xl font-black mt-1 ${due > 0 ? 'text-amber-300' : 'text-beige/60'}`}>{money(due)}</p></div>
        </div>
      </div>

      {/* Add payment */}
      <form onSubmit={addPayment} className="space-y-3">
        <p className="label">Record a payment</p>
        <div className="flex gap-2">
          <input type="number" min={0} step="0.5" className="input max-w-[130px]" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <input className="input flex-1" placeholder="Note (cash, card…)" value={note} onChange={e => setNote(e.target.value)} />
          <button type="submit" className="btn-primary shrink-0" disabled={busy || !(Number(amount) > 0)}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {due > 0 && (
          <button type="button" onClick={() => setAmount(String(due))} className="text-xs font-bold text-brand hover:underline">
            Pay full due ({money(due)})
          </button>
        )}
      </form>

      {/* History */}
      {booking.payments.length > 0 && (
        <div className="space-y-2">
          <p className="label">Payment history</p>
          {booking.payments.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-beige rounded-xl px-3 py-2 text-sm">
              <span className="font-bold tabular-nums">{money(p.amount)}</span>
              <span className="text-dark/50 flex-1 truncate">{p.note || '—'}</span>
              <span className="text-[10px] text-dark/40">{new Date(p.at).toLocaleDateString()}</span>
              <button onClick={() => onApply({ removePaymentId: p.id })} title="Remove payment" className="text-red-600 hover:bg-red-50 rounded-full p-1 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Deposit */}
      <div className="space-y-3 pt-2 border-t border-dark/10">
        <p className="label">Security deposit</p>
        <div className="flex gap-2 items-center">
          <input type="number" min={0} step="0.5" className="input max-w-[130px]" placeholder="0" value={deposit} onChange={e => setDeposit(e.target.value)} />
          <button onClick={() => onApply({ deposit: Number(deposit) || 0 })} className="btn-outline shrink-0">Save</button>
        </div>
        {booking.deposit > 0 && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={booking.depositReturned} onChange={e => onApply({ depositReturned: e.target.checked })} className="w-4 h-4 accent-brand" />
            Deposit returned to customer
          </label>
        )}
      </div>
    </div>
  );
}

function Detail({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-brand shrink-0" /> {text}
    </span>
  );
}
