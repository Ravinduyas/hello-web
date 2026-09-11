import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Check, X, Trash2, Calendar, MapPin, Mail, Phone, ChevronDown, Wallet, Plus, Search, ArrowUpDown, AlertTriangle, SlidersHorizontal, MoreHorizontal } from 'lucide-react';
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

import { money } from '../lib/money';

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

/**
 * Where a booking stands against today, which its status does not say.
 *
 * A booking is "confirmed" whether the bike went out this morning or was due
 * back a week ago — the shop only finds out by reading dates off every row.
 * These are worked out from the dates each time they are needed rather than
 * stored, because the answer changes at midnight on its own.
 */
type Timing = 'upcoming' | 'out' | 'due' | 'latePickup' | 'lateReturn';

const TIMING_FILTERS: { key: Timing | 'all'; label: string }[] = [
  { key: 'all', label: 'Any timing' },
  { key: 'out', label: 'Out now' },
  { key: 'due', label: 'Back today' },
  { key: 'lateReturn', label: 'Return overdue' },
  { key: 'latePickup', label: 'Pickup passed' },
  { key: 'upcoming', label: 'Upcoming' },
];

/** Only the states worth interrupting someone about are drawn on a row. */
const timingStyles: Partial<Record<Timing, string>> = {
  latePickup: 'bg-amber-100 text-amber-800',
  lateReturn: 'bg-red-100 text-red-700',
  due: 'bg-brand/10 text-brand',
  out: 'bg-dark/5 text-dark/70',
};

/**
 * Which of a booking's dates the range applies to.
 *
 * It was always the pickup, which answers "who is collecting this week" and
 * nothing else. The shop also needs "what comes back this week" to plan the
 * yard, and "what was booked this week" to see the week's trade.
 */
type DateField = 'pickup' | 'dropoff' | 'created';
const DATE_FIELDS: { key: DateField; label: string }[] = [
  { key: 'pickup', label: 'By pickup' },
  { key: 'dropoff', label: 'By return' },
  { key: 'created', label: 'By booked' },
];

/** Where a booking stands on money, derived rather than stored. */
type PayState = 'unpaid' | 'part' | 'paid';
const PAY_FILTERS: { key: PayState | 'all'; label: string }[] = [
  { key: 'all', label: 'Any payment' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'part', label: 'Part paid' },
  { key: 'paid', label: 'Paid in full' },
];

/** How the list is ordered. */
type Sort = 'newest' | 'oldest' | 'pickup' | 'dropoff' | 'due' | 'name';
const SORTS: { key: Sort; label: string }[] = [
  { key: 'newest', label: 'Newest booked' },
  { key: 'oldest', label: 'Oldest booked' },
  { key: 'pickup', label: 'Pickup soonest' },
  { key: 'dropoff', label: 'Return soonest' },
  { key: 'due', label: 'Most owed' },
  { key: 'name', label: 'Customer A–Z' },
];

/** How many rows to put on screen before asking whether more are wanted. */
const PAGE = 20;

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

/** Whole days between two ISO dates, for saying how late something is. */
const daysBetween = (from: string, to: string) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);

/**
 * A booking's standing against today.
 *
 * A cancelled booking has none: nothing is owed and nothing is out, so
 * flagging it as overdue would be noise on a row that is already closed.
 * A pickup date that has passed only matters while a booking is still
 * pending — once confirmed, the bike is out and the return is what counts.
 */
/** "Thu 17 Sep" — a date someone can picture, rather than 2026-09-17. */
const dayLabel = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

function timingOf(b: Booking, today: string): Timing | null {
  if (b.status === 'cancelled') return null;
  if (b.status === 'pending' && b.pickupDate < today) return 'latePickup';
  if (b.status === 'confirmed' && b.dropoffDate < today) return 'lateReturn';
  if (b.pickupDate > today) return 'upcoming';
  if (b.pickupDate <= today && today <= b.dropoffDate) return today === b.dropoffDate ? 'due' : 'out';
  return null;
}

/** What the badge says, including how late where lateness is the point. */
function timingLabel(t: Timing, b: Booking, today: string): string {
  switch (t) {
    case 'lateReturn': {
      const late = daysBetween(b.dropoffDate, today);
      return `Return overdue · ${late} day${late === 1 ? '' : 's'}`;
    }
    case 'latePickup': {
      const late = daysBetween(b.pickupDate, today);
      return `Pickup passed · ${late} day${late === 1 ? '' : 's'}`;
    }
    case 'due':
      return 'Back today';
    case 'out':
      return 'Out now';
    default:
      return '';
  }
}

/** The date a booking is filtered on. createdAt is a timestamp; cut it to a day. */
const dateOf = (b: Booking, field: DateField) =>
  field === 'created' ? b.createdAt.slice(0, 10) : field === 'dropoff' ? b.dropoffDate : b.pickupDate;

const payStateOf = (b: Booking): PayState => {
  if (paidOf(b) <= 0) return 'unpaid';
  return dueOf(b) > 0 ? 'part' : 'paid';
};

/**
 * What a search looks at: the reference someone quotes on the phone, the person,
 * the machine, and the plate — whichever of those the counter happens to have.
 */
const haystack = (b: Booking) =>
  [b.reference, b.renter.firstName, b.renter.lastName, b.renter.email, b.renter.phone, b.bikeTitle, b.plate]
    .join(' ')
    .toLowerCase();

const nameOf = (b: Booking) => `${b.renter.firstName} ${b.renter.lastName}`.trim();

function compare(a: Booking, b: Booking, sort: Sort): number {
  switch (sort) {
    case 'oldest':
      return a.createdAt.localeCompare(b.createdAt);
    case 'pickup':
      return a.pickupDate.localeCompare(b.pickupDate) || a.createdAt.localeCompare(b.createdAt);
    case 'dropoff':
      return a.dropoffDate.localeCompare(b.dropoffDate) || a.createdAt.localeCompare(b.createdAt);
    case 'due':
      return dueOf(b) - dueOf(a);
    case 'name':
      return nameOf(a).localeCompare(nameOf(b));
    default:
      return b.createdAt.localeCompare(a.createdAt);
  }
}

/** A pill-shaped select with the chevron laid over it. */
function PillSelect<T extends string>({
  value,
  onChange,
  label,
  options,
  icon: Icon,
}: {
  value: T;
  onChange: (v: T) => void;
  label: string;
  options: { key: T; label: string }[];
  icon?: typeof ChevronDown;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-dark/40" />}
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        aria-label={label}
        className={`appearance-none cursor-pointer bg-white border border-dark/15 rounded-full ${Icon ? 'pl-9' : 'pl-4'} pr-9 py-2 text-sm font-bold text-dark hover:border-dark/30 focus:outline-none focus:border-brand`}
      >
        {options.map(o => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark/40" />
    </div>
  );
}

export default function Bookings({ onLogout }: { onLogout: () => void }) {
  /*
   * The dashboard sends people here already asking a question — "the six that
   * are late", "the one waiting to be confirmed" — so the filters can be set
   * from the link. Read once, as the initial state: after that the controls on
   * this page own them, and changing one must not fight with the URL.
   */
  const [params] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | BookingStatus>(() => {
    const s = params.get('status');
    return s === 'pending' || s === 'confirmed' || s === 'cancelled' ? s : 'all';
  });
  const [range, setRange] = useState<DateRange>('all');
  const [dateField, setDateField] = useState<DateField>('pickup');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const [pay, setPay] = useState<PayState | 'all'>(() => {
    const p = params.get('pay');
    return PAY_FILTERS.some(o => o.key === p) ? (p as PayState) : 'all';
  });
  const [timing, setTiming] = useState<Timing | 'all'>(() => {
    const t = params.get('timing');
    return TIMING_FILTERS.some(o => o.key === t) ? (t as Timing) : 'all';
  });
  const [showFilters, setShowFilters] = useState(false);
  /*
   * Rows are shut by default and opened one at a time. Eleven full cards is
   * already more scrolling than reading; the line that identifies a booking is
   * what people scan for, and the rest is what they open when they have found
   * the one they want.
   */
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [shown, setShown] = useState(PAGE);

  const toggleRow = (id: string) =>
    setOpenIds(prev => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const [sort, setSort] = useState<Sort>('newest');
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

  // A narrowed list starts from the top again — holding a deep page position
  // across a filter change shows a stranger's bookings.
  useEffect(() => {
    setShown(PAGE);
  }, [search, filter, range, customFrom, customTo, pay, timing, sort, dateField]);

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

  /*
   * Dates, then text, then money, then status, then order. Status is applied
   * last of the filters so the counts beside it can be taken from the set just
   * before — each number then says what that status would actually show,
   * rather than counting rows the other filters have already excluded.
   */
  const today = isoLocal(new Date());
  const [rangeFrom, rangeTo] = rangeBounds(range, customFrom, customTo);
  const query = search.trim().toLowerCase();
  const dateFiltered = bookings.filter(b => {
    const d = dateOf(b, dateField);
    return (!rangeFrom || d >= rangeFrom) && (!rangeTo || d <= rangeTo);
  });
  const searched = query ? dateFiltered.filter(b => haystack(b).includes(query)) : dateFiltered;
  const paid_ = pay === 'all' ? searched : searched.filter(b => payStateOf(b) === pay);
  const narrowed = timing === 'all' ? paid_ : paid_.filter(b => timingOf(b, today) === timing);
  const visible = (filter === 'all' ? narrowed : narrowed.filter(b => b.status === filter))
    .slice()
    .sort((a, b) => compare(a, b, sort));
  const counts = {
    all: narrowed.length,
    pending: narrowed.filter(b => b.status === 'pending').length,
    confirmed: narrowed.filter(b => b.status === 'confirmed').length,
    cancelled: narrowed.filter(b => b.status === 'cancelled').length,
  };
  const filtering = !!query || range !== 'all' || pay !== 'all' || timing !== 'all' || filter !== 'all';
  // Only the ones folded away behind the button — the badge counts what is on
  // but out of sight, which is exactly what someone needs warning about.
  const extraFilters = [range !== 'all', pay !== 'all', timing !== 'all'].filter(Boolean).length;
  // Counted before any filter, so the warning is the same number whatever the
  // list is currently showing — and does not vanish because of a filter.
  const overdue = bookings.filter(b => timingOf(b, today) === 'lateReturn').length;
  function clearFilters() {
    setSearch('');
    setRange('all');
    setCustomFrom('');
    setCustomTo('');
    setPay('all');
    setTiming('all');
    setFilter('all');
  }
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
        <button onClick={() => load()} className="btn-outline" disabled={loading} aria-label="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* One line of controls, not six.
          Searching and picking a status is nearly all anyone does here, so
          those stay out in the open; the rest fold away behind one button
          that says how many of them are switched on. */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark/35" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search a name, phone, reference or plate…"
            aria-label="Search bookings"
            className="w-full bg-white border border-dark/15 rounded-full pl-11 pr-10 py-2.5 text-sm hover:border-dark/30 focus:outline-none focus:border-brand"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(v => !v)}
          aria-expanded={showFilters}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition ${
            showFilters || extraFilters > 0
              ? 'bg-dark text-white border-dark'
              : 'bg-white text-dark border-dark/15 hover:border-dark/30'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {extraFilters > 0 && (
            <span className="bg-white/25 rounded-full px-1.5 text-[11px] leading-5">{extraFilters}</span>
          )}
        </button>

        <PillSelect value={sort} onChange={setSort} label="Sort by" options={SORTS} icon={ArrowUpDown} />
      </div>

      {/* Status is the one filter worth seeing all of at once: four numbers
          that add up to the whole list, each a click away. */}
      <div className="flex flex-wrap gap-2 mb-3">
        {([
          { key: 'all' as const, label: 'All', n: counts.all },
          { key: 'pending' as const, label: 'Pending', n: counts.pending },
          { key: 'confirmed' as const, label: 'Confirmed', n: counts.confirmed },
          { key: 'cancelled' as const, label: 'Cancelled', n: counts.cancelled },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
              filter === t.key
                ? 'bg-brand text-white'
                : 'bg-white text-dark/70 border border-dark/10 hover:border-dark/30'
            }`}
          >
            {t.label}
            <span className={`text-xs tabular-nums ${filter === t.key ? 'text-white/70' : 'text-dark/40'}`}>{t.n}</span>
          </button>
        ))}
      </div>

      {/* Every control here says what it is. Unlabelled pills reading "By
          pickup" and "Any timing" meant opening each one to find out. */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-5 mb-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="label">Dates to filter on</span>
            <select value={dateField} onChange={e => setDateField(e.target.value as DateField)} className="input mt-1">
              {DATE_FIELDS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">Date range</span>
            <select value={range} onChange={e => setRange(e.target.value as DateRange)} className="input mt-1">
              {RANGES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">Payment</span>
            <select value={pay} onChange={e => setPay(e.target.value as PayState | 'all')} className="input mt-1">
              {PAY_FILTERS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">Where it stands today</span>
            <select value={timing} onChange={e => setTiming(e.target.value as Timing | 'all')} className="input mt-1">
              {TIMING_FILTERS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </label>

          {range === 'custom' && (
            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-2">
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="input max-w-[170px]" aria-label="From date" />
              <span className="text-dark/40">→</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="input max-w-[170px]" aria-label="To date" />
            </div>
          )}
        </div>
      )}

      {/* A bike that has not come back is the one thing on this page worth
          interrupting someone about, so it is said once at the top rather than
          left to be noticed row by row. */}
      {overdue > 0 && timing !== 'lateReturn' && (
        <button
          onClick={() => setTiming('lateReturn')}
          className="flex items-center gap-2 w-full text-left bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-3 text-sm font-bold hover:bg-red-100 transition"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {overdue} booking{overdue === 1 ? ' is' : 's are'} past their return date — show
          {overdue === 1 ? ' it' : ' them'}
        </button>
      )}

      {/* What is narrowing the list, said in words, each one removable on its
          own. A count alone left people guessing which control was doing it. */}
      <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
        <span className="text-dark/45">
          Showing {visible.length} of {bookings.length} booking{bookings.length === 1 ? '' : 's'}
        </span>
        {query && <Chip label={'“' + search.trim() + '”'} onClear={() => setSearch('')} />}
        {filter !== 'all' && <Chip label={filter} onClear={() => setFilter('all')} />}
        {range !== 'all' && (
          <Chip
            label={
              (RANGES.find(r => r.key === range)?.label ?? '') +
              ' ' +
              (DATE_FIELDS.find(d => d.key === dateField)?.label ?? '').toLowerCase()
            }
            onClear={() => setRange('all')}
          />
        )}
        {pay !== 'all' && <Chip label={PAY_FILTERS.find(p => p.key === pay)!.label} onClear={() => setPay('all')} />}
        {timing !== 'all' && <Chip label={TIMING_FILTERS.find(t => t.key === timing)!.label} onClear={() => setTiming('all')} />}
        {filtering && (
          <button onClick={clearFilters} className="font-bold text-brand hover:underline">
            Clear all
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {loading ? (
        <p className="text-dark/50">Loading bookings…</p>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-dark/50">No bookings here yet.</div>
      ) : (
        <div className="space-y-3">
          {visible.slice(0, shown).map(b => (
            <div key={b.id} className="bg-white rounded-2xl">
              {/* The line that identifies a booking, and nothing else until it
                  is asked for. The customer's name leads, because that is who
                  is standing at the counter or on the phone; the machine, the
                  plate and the reference follow on one quiet line beneath. */}
              <button
                type="button"
                onClick={() => toggleRow(b.id)}
                aria-expanded={openIds.has(b.id)}
                aria-controls={`booking-${b.id}`}
                className="w-full text-left p-5 md:p-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 rounded-2xl hover:bg-dark/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-lg leading-tight">
                      {b.renter.firstName} {b.renter.lastName}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${statusStyles[b.status]}`}>
                      {b.status}
                    </span>
                    {(() => {
                      const t = timingOf(b, today);
                      return t && timingStyles[t] ? (
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${timingStyles[t]}`}>
                          {timingLabel(t, b, today)}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <p className="text-sm text-dark/55 mt-1">
                    {b.bikeTitle}
                    {b.plate && (
                      <>
                        {' · Plate '}
                        <b className="text-dark/75">{b.plate}</b>
                      </>
                    )}
                    {' · '}
                    <span className="font-display font-bold tracking-wide text-dark/70">{b.reference}</span>
                  </p>
                </div>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-dark/35 uppercase tracking-wide">
                    Booked {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand whitespace-nowrap">
                    {openIds.has(b.id) ? 'Less' : 'More'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${openIds.has(b.id) ? 'rotate-180' : ''}`} />
                  </span>
                </span>
              </button>

              {openIds.has(b.id) && (
              <div id={`booking-${b.id}`} className="px-5 md:px-6 pb-5 md:pb-6">

              {/* When it goes out and when it is due back is what this page is
                  asked most, so it is one readable line rather than two
                  timestamps and a "(7d)". */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-dark/10 text-sm">
                <span className="inline-flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4 text-brand shrink-0" />
                  {dayLabel(b.pickupDate)} → {dayLabel(b.dropoffDate)}
                  <span className="text-dark/45 font-normal">
                    · {b.days} day{b.days === 1 ? '' : 's'}
                  </span>
                </span>
                <Detail icon={MapPin} text={b.pickupLocation} />
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-dark/60">
                <Detail icon={Mail} text={b.renter.email} />
                <Detail icon={Phone} text={b.renter.phone} />
              </div>

              {b.extras.length > 0 && (
                <p className="text-xs text-dark/40 mt-2">Extras: {b.extras.map(e => e.label).join(', ')}</p>
              )}

              {/* The money and what to do about it on one line: the figures read
                  left to right, the actions sit at the end of them. */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-dark/10">
                <Money label="Total" value={money(b.total)} tone="total" />
                <Money label="Paid" value={money(paidOf(b))} tone={paidOf(b) > 0 ? 'good' : 'muted'} />
                <Money
                  label={dueOf(b) > 0 ? 'Due' : 'Settled'}
                  value={money(dueOf(b))}
                  tone={dueOf(b) > 0 ? 'owed' : 'muted'}
                />
                {b.deposit > 0 && (
                  <Money
                    label={b.depositReturned ? 'Deposit returned' : 'Deposit held'}
                    value={money(b.deposit)}
                    tone={b.depositReturned ? 'muted' : 'held'}
                  />
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {b.status !== 'confirmed' && <ConfirmControl onConfirm={() => changeStatus(b.id, 'confirmed')} />}
                  <button
                    onClick={() => setPayId(b.id)}
                    className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition"
                  >
                    <Wallet className="w-4 h-4" /> Payments
                  </button>
                  {/* Cancelling and deleting are rarer, and one of them cannot
                      be undone, so neither sits under a thumb by default. */}
                  <RowMenu>
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => changeStatus(b.id, 'cancelled')}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-dark/5 flex items-center gap-2"
                      >
                        <X className="w-4 h-4 text-dark/50" /> Cancel booking
                      </button>
                    )}
                    <button
                      onClick={() => remove(b.id)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete permanently
                    </button>
                  </RowMenu>
                </div>
              </div>
              </div>
              )}
            </div>
          ))}

          {/* A shop with a season behind it should not have to scroll through
              all of it to reach the bottom of a filter. */}
          {visible.length > shown && (
            <button
              onClick={() => setShown(n => n + PAGE)}
              className="w-full bg-white rounded-2xl py-4 text-sm font-bold text-brand hover:bg-brand/5 transition"
            >
              Show {Math.min(PAGE, visible.length - shown)} more
              <span className="text-dark/40 font-medium"> · {visible.length - shown} left</span>
            </button>
          )}
        </div>
      )}

      <Drawer
        open={!!payBooking}
        onClose={() => setPayId(null)}
        title="Payments & deposit"
        subtitle={payBooking ? `${payBooking.bikeTitle} · ${payBooking.renter.firstName} ${payBooking.renter.lastName}`.trim() : ''}
        widthClass="max-w-md"
      >
        {payBooking && (
          <PaymentsForm
            booking={payBooking}
            plates={units.filter(
              u => u.bikeId === payBooking.bikeId && (u.status === 'available' || u.id === payBooking.unitId),
            )}
            onAssign={unitId => changeStatus(payBooking.id, 'confirmed', unitId)}
            onApply={ops => applyBilling(payBooking.id, ops)}
          />
        )}
      </Drawer>
    </div>
  );
}

/**
 * Confirms a booking, and nothing else.
 *
 * It used to insist on a plate first. But confirming is the shop agreeing to
 * the rental — a model and some dates — and which machine goes out is not
 * known until the customer is at the counter. Tying the two together meant a
 * booking could not be accepted until a plate was set aside for it, days early.
 * The plate is asked for where it is actually decided: at payment.
 */
function ConfirmControl({ onConfirm }: { onConfirm: () => Promise<void> | void }) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={confirm}
      disabled={busy}
      className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white hover:brightness-110 transition disabled:opacity-40 disabled:pointer-events-none"
    >
      <Check className="w-4 h-4" /> {busy ? 'Confirming…' : 'Confirm'}
    </button>
  );
}

/** Payments & deposit manager (drawer body). Operates on the live booking and
 *  applies each change immediately via onApply. */
function PaymentsForm({
  booking,
  plates,
  onAssign,
  onApply,
}: {
  booking: Booking;
  plates: Unit[];
  onAssign: (unitId: string) => Promise<void> | void;
  onApply: (ops: Parameters<typeof updateBilling>[1]) => Promise<void>;
}) {
  const paid = paidOf(booking);
  const due = dueOf(booking);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [deposit, setDeposit] = useState(String(booking.deposit || ''));
  const [busy, setBusy] = useState(false);
  const [unitId, setUnitId] = useState(booking.unitId || '');
  const [assigning, setAssigning] = useState(false);

  // Money cannot be taken against a booking with no machine behind it: the
  // backend refuses it, and the counter needs to know which bike went out.
  const assigned = !!booking.plate;

  async function assign() {
    if (!unitId) return;
    setAssigning(true);
    try {
      await onAssign(unitId);
    } finally {
      setAssigning(false);
    }
  }

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

      {/* Which machine is going out. Asked here because this is where it is
          settled — the customer is at the counter and a bike is being handed
          over. Payment is held back until it is answered. */}
      <div className={`rounded-2xl p-4 border ${assigned ? 'border-dark/10 bg-beige' : 'border-amber-200 bg-amber-50'}`}>
        <p className="label">Plate</p>
        {assigned ? (
          <div className="flex items-center gap-2 mt-2">
            <span className="font-display font-bold tracking-wide">{booking.plate}</span>
            <span className="text-xs text-dark/45">assigned to this booking</span>
          </div>
        ) : plates.length === 0 ? (
          <p className="text-sm text-amber-800 mt-2">
            No available plates for this model — add one in Fleet before taking payment.
          </p>
        ) : (
          <div className="flex gap-2 mt-2">
            <select
              value={unitId}
              onChange={e => setUnitId(e.target.value)}
              aria-label="Plate to assign"
              className="input flex-1"
            >
              <option value="">Select plate…</option>
              {plates.map(u => (
                <option key={u.id} value={u.id}>
                  {u.plate}
                </option>
              ))}
            </select>
            <button onClick={assign} disabled={!unitId || assigning} className="btn-primary shrink-0 disabled:opacity-40 disabled:pointer-events-none">
              <Check className="w-4 h-4" /> {assigning ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        )}
      </div>

      {/* Add payment */}
      <form onSubmit={addPayment} className="space-y-3">
        <p className="label">Record a payment</p>
        <div className="flex gap-2">
          <input type="number" min={0} step="0.5" className="input max-w-[130px]" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <input className="input flex-1" placeholder="Note (cash, card…)" value={note} onChange={e => setNote(e.target.value)} />
          <button
            type="submit"
            className="btn-primary shrink-0 disabled:opacity-40 disabled:pointer-events-none"
            disabled={busy || !assigned || !(Number(amount) > 0)}
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {!assigned && (
          <p className="text-xs text-amber-800">Assign a plate above before recording payment.</p>
        )}
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

/**
 * One figure from a booking's billing, coloured by what it means rather than
 * printed in the same grey as everything else.
 *
 * The three of these are what the counter actually acts on — whether money is
 * owed, and whether a deposit is still the shop's to give back — and they were
 * the smallest, faintest text on the row. Colour does the reading here: green
 * is settled, red is owed, amber is money being held that is not ours.
 */
function Money({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'good' | 'owed' | 'held' | 'muted' | 'total';
}) {
  const tones = {
    total: 'bg-brand/10 text-brand border-brand/20',
    good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    owed: 'bg-red-50 text-red-700 border-red-200',
    held: 'bg-amber-50 text-amber-800 border-amber-200',
    muted: 'bg-dark/[0.04] text-dark/55 border-dark/10',
  };
  return (
    <span className={`inline-flex items-baseline gap-2 rounded-full border px-3 py-1 ${tones[tone]}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</span>
      <b className="font-display text-sm tabular-nums">{value}</b>
    </span>
  );
}

/**
 * One active filter, and the way to switch just that one off.
 *
 * The list used to say only how many rows survived, which told you that
 * something was hiding them but never what.
 */
function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-dark/5 text-dark/70 rounded-full pl-3 pr-1.5 py-1 capitalize">
      {label}
      <button
        onClick={onClear}
        aria-label={`Remove filter ${label}`}
        className="rounded-full p-0.5 hover:bg-dark/10 text-dark/50 hover:text-dark"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

/**
 * The actions that are not the everyday ones.
 *
 * Deleting a booking cannot be undone, and it used to sit in the open next to
 * the button people press all day. The backdrop closes the menu on any click
 * elsewhere, which is cheaper than listening on the document and unmounts with
 * the row.
 */
function RowMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="More actions"
        aria-expanded={open}
        className="text-dark/50 hover:text-dark hover:bg-dark/5 rounded-full p-2 transition"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 w-52 bg-white rounded-xl shadow-lg border border-dark/10 overflow-hidden py-1"
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </>
      )}
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
