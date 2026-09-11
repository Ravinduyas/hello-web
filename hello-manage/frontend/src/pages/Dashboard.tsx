import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw, AlertTriangle, ArrowRight, Bike as BikeIcon, CalendarCheck,
  Clock, LogIn, LogOut as LogOutIcon, Phone, Plus, TrendingUp, Wallet, Wrench,
} from 'lucide-react';
import {
  fetchBookings, fetchUnits, dueOf,
  UnauthorizedError, type Booking, type Unit,
} from '../lib/api';
import { money } from '../lib/money';

/**
 * What the shop needs to know before it does anything else.
 *
 * Every figure here is a link into the list that produced it — a dashboard
 * that can only be read is a poster. The numbers are worked out from the same
 * bookings the rest of the admin shows, on the same rules, so nothing here can
 * quietly disagree with the page it sends you to.
 */

const pad = (n: number) => String(n).padStart(2, '0');
const isoLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fullDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

const shortDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

const nameOf = (b: Booking) => `${b.renter.firstName} ${b.renter.lastName}`.trim() || 'Someone';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [b, u] = await Promise.all([fetchBookings(), fetchUnits()]);
      setBookings(b);
      setUnits(u);
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Could not load the dashboard');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const today = isoLocal(new Date());
  const live = bookings.filter(b => b.status !== 'cancelled');

  /* ---- the day ---- */
  const pickupsToday = live.filter(b => b.pickupDate === today);
  const returnsToday = live.filter(b => b.dropoffDate === today && b.status === 'confirmed');
  const outNow = live.filter(b => b.status === 'confirmed' && b.pickupDate <= today && b.dropoffDate >= today);
  const overdue = live.filter(b => b.status === 'confirmed' && b.dropoffDate < today);
  const pending = bookings.filter(b => b.status === 'pending');

  /* ---- the money ---- */
  const month = today.slice(0, 7);
  const collectedThisMonth = live
    .flatMap(b => b.payments)
    .filter(p => p.at.slice(0, 7) === month)
    .reduce((s, p) => s + p.amount, 0);
  const outstanding = live.filter(b => b.status === 'confirmed').reduce((s, b) => s + dueOf(b), 0);
  const depositsHeld = live
    .filter(b => b.status === 'confirmed' && !b.depositReturned)
    .reduce((s, b) => s + b.deposit, 0);

  /* ---- what is stuck ---- */
  // A confirmed booking with no plate cannot be paid for — the server refuses
  // the payment — so it sits there looking finished and is not.
  const needsPlate = live.filter(b => b.status === 'confirmed' && !b.unitId);

  /* ---- the week ahead ---- */
  // Seven days from today, so the morning question "what does the week look
  // like" has an answer that is not the calendar page.
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = isoLocal(d);
    return {
      iso,
      out: live.filter(b => b.pickupDate === iso).length,
      back: live.filter(b => b.status === 'confirmed' && b.dropoffDate === iso).length,
    };
  });
  const weekPeak = Math.max(1, ...week.map(d => Math.max(d.out, d.back)));

  /* ---- takings, month by month ---- */
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    return {
      key,
      label: d.toLocaleDateString(undefined, { month: 'short' }),
      total: live
        .flatMap(b => b.payments)
        .filter(p => p.at.slice(0, 7) === key)
        .reduce((sum, p) => sum + p.amount, 0),
    };
  });
  const monthPeak = Math.max(1, ...months.map(m => m.total));

  /* ---- which machines earn ---- */
  const earners = Object.values(
    live
      .filter(b => b.status === 'confirmed' && b.plate)
      .reduce<Record<string, { plate: string; model: string; rentals: number; revenue: number; days: number }>>(
        (acc, b) => {
          const row = acc[b.plate] ?? { plate: b.plate, model: b.bikeTitle, rentals: 0, revenue: 0, days: 0 };
          row.rentals += 1;
          row.revenue += b.total;
          row.days += b.days;
          acc[b.plate] = row;
          return acc;
        },
        {},
      ),
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const earnerPeak = Math.max(1, ...earners.map(e => e.revenue));

  /* ---- the fleet ---- */
  const fleet = {
    available: units.filter(u => u.status === 'available').length,
    rented: units.filter(u => u.status === 'rented').length,
    maintenance: units.filter(u => u.status === 'maintenance').length,
  };
  const outOfService = fleet.maintenance;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="eyebrow">[ Dashboard ]</span>
          <h1 className="font-display text-2xl font-black mt-1">{fullDate(today)}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* The commonest thing anyone does after reading this page. */}
          <Link to="/walk-in" className="btn-primary">
            <Plus className="w-4 h-4" /> Walk-in rental
          </Link>
          <button onClick={() => load()} className="btn-outline" disabled={loading} aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {/* A bike that has not come back outranks everything else on this page. */}
      {overdue.length > 0 && (
        <Link
          to="/bookings?timing=lateReturn"
          className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-4 font-bold hover:bg-red-100 transition"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            {overdue.length} bike{overdue.length === 1 ? '' : 's'} still out past the return date
          </span>
          <ArrowRight className="w-4 h-4 ml-auto shrink-0" />
        </Link>
      )}

      {/* Quieter than an overdue bike, but it stops money being taken. */}
      {needsPlate.length > 0 && (
        <Link
          to="/bookings?status=confirmed&plate=none"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-4 mb-4 font-bold hover:bg-amber-100 transition"
        >
          <Wrench className="w-5 h-5 shrink-0" />
          <span>
            {needsPlate.length} confirmed booking{needsPlate.length === 1 ? '' : 's'} without a plate — payment cannot
            be taken until one is assigned
          </span>
          <ArrowRight className="w-4 h-4 ml-auto shrink-0" />
        </Link>
      )}

      {/* The four questions asked before the shutter is even up. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Tile
          to="/bookings?timing=out"
          icon={BikeIcon}
          label="Out on the road"
          value={outNow.length}
          /* The fleet panel counts 7 rented while this counts 1, and both are
             right: the other six are the overdue ones. Saying so here stops
             the two numbers reading as a contradiction. */
          hint={overdue.length ? `plus ${overdue.length} overdue below` : `of ${units.length} machines`}
        />
        <Tile
          to="/bookings?timing=due"
          icon={LogIn}
          label="Due back today"
          value={returnsToday.length}
          hint={returnsToday.length ? 'coming in' : 'nothing to chase'}
          tone={returnsToday.length ? 'brand' : undefined}
        />
        <Tile
          to="/bookings?status=pending"
          icon={Clock}
          label="Waiting to confirm"
          value={pending.length}
          hint={pending.length ? 'needs an answer' : 'all answered'}
          tone={pending.length ? 'amber' : undefined}
        />
        <Tile
          to="/bookings?pay=unpaid"
          icon={Wallet}
          label="Money owed"
          value={money(outstanding)}
          hint="on confirmed rentals"
          tone={outstanding > 0 ? 'red' : undefined}
        />
      </div>

      {/* The week, so the morning question is answered without opening the
          calendar: the bars are collections against returns, day by day. */}
      <section className="bg-white rounded-2xl p-5 md:p-6 mb-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg font-bold">The week ahead</h2>
          <Link to="/calendar" className="text-xs font-bold text-brand hover:underline">
            Open the calendar
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {week.map((d, i) => (
            <div key={d.iso} className={`rounded-xl p-2 text-center ${i === 0 ? 'bg-brand/5' : ''}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-dark/40">
                {i === 0 ? 'Today' : new Date(d.iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })}
              </p>
              <p className="text-xs text-dark/35 mb-2">{new Date(d.iso + 'T00:00:00').getDate()}</p>
              <div className="flex items-end justify-center gap-1 h-14">
                <span
                  title={`${d.out} going out`}
                  className="w-3 rounded-t bg-brand/70 min-h-[3px]"
                  style={{ height: `${(d.out / weekPeak) * 100}%` }}
                />
                <span
                  title={`${d.back} coming back`}
                  className="w-3 rounded-t bg-emerald-500/70 min-h-[3px]"
                  style={{ height: `${(d.back / weekPeak) * 100}%` }}
                />
              </div>
              <p className="text-xs font-bold tabular-nums mt-1">
                <span className="text-brand">{d.out}</span>
                <span className="text-dark/25"> / </span>
                <span className="text-emerald-600">{d.back}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-dark/40 mt-3 flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand/70" /> going out
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70" /> coming back
          </span>
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ---- the day's movements ---- */}
        <section className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6">
          <h2 className="font-display text-lg font-bold mb-4">Today's movements</h2>

          <Movements
            title="Going out"
            icon={LogOutIcon}
            empty="No collections booked for today."
            rows={pickupsToday}
            today={today}
            kind="out"
          />
          <div className="h-5" />
          <Movements
            title="Coming back"
            icon={LogIn}
            empty="Nothing due back today."
            rows={returnsToday}
            today={today}
            kind="in"
          />

          {overdue.length > 0 && (
            <>
              <div className="h-5" />
              <Movements
                title="Should already be back"
                icon={AlertTriangle}
                empty=""
                rows={overdue}
                today={today}
                kind="late"
              />
            </>
          )}
        </section>

        <div className="space-y-4">
          {/* ---- the fleet at a glance ---- */}
          <section className="bg-white rounded-2xl p-5 md:p-6">
            <h2 className="font-display text-lg font-bold mb-4">The fleet</h2>
            {units.length === 0 ? (
              <p className="text-sm text-dark/45">No machines on the books yet.</p>
            ) : (
              <>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-dark/5 mb-4">
                  <span className="bg-emerald-500" style={{ width: `${(fleet.available / units.length) * 100}%` }} />
                  <span className="bg-brand" style={{ width: `${(fleet.rented / units.length) * 100}%` }} />
                  <span className="bg-amber-400" style={{ width: `${(fleet.maintenance / units.length) * 100}%` }} />
                </div>
                <ul className="space-y-2 text-sm">
                  <FleetRow colour="bg-emerald-500" label="Ready to go" value={fleet.available} />
                  <FleetRow colour="bg-brand" label="Out with customers" value={fleet.rented} />
                  <FleetRow colour="bg-amber-400" label="In the workshop" value={fleet.maintenance} />
                </ul>
                {outOfService > 0 && (
                  <Link to="/fleet" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline mt-4">
                    <Wrench className="w-3.5 h-3.5" /> See what is off the road
                  </Link>
                )}
              </>
            )}
          </section>

          {/* ---- the money ---- */}
          <section className="bg-white rounded-2xl p-5 md:p-6">
            <h2 className="font-display text-lg font-bold mb-4">Money</h2>
            <dl className="space-y-3 text-sm">
              <Figure label="Taken this month" value={money(collectedThisMonth)} tone="good" />
              <Figure label="Still owed" value={money(outstanding)} tone={outstanding > 0 ? 'owed' : undefined} />
              <Figure label="Deposits being held" value={money(depositsHeld)} tone={depositsHeld > 0 ? 'held' : undefined} />
            </dl>
            <Link to="/finance" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline mt-4">
              <CalendarCheck className="w-3.5 h-3.5" /> Payouts and the monthly statement
            </Link>
          </section>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        {/* ---- what came in, month by month ---- */}
        <section className="bg-white rounded-2xl p-5 md:p-6 flex flex-col">
          <h2 className="font-display text-lg font-bold mb-1">Taken, last six months</h2>
          <p className="text-xs text-dark/40 mb-5">Payments on the day they were recorded.</p>
          {/* Grows into whatever height the panel beside it sets, rather
             than leaving a pool of white under a short chart. */}
          <div className="flex items-end gap-3 flex-1 min-h-[9rem]">
            {months.map(m => (
              <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs font-bold tabular-nums mb-1 text-dark/60">
                  {m.total > 0 ? money(m.total) : ''}
                </span>
                <span
                  className={`w-full rounded-t ${m.total > 0 ? 'bg-brand' : 'bg-dark/5'}`}
                  style={{ height: `${Math.max((m.total / monthPeak) * 100, m.total > 0 ? 6 : 2)}%` }}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-dark/40 mt-2">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- which machines pay for themselves ---- */}
        <section className="bg-white rounded-2xl p-5 md:p-6">
          <h2 className="font-display text-lg font-bold mb-1">Hardest working machines</h2>
          <p className="text-xs text-dark/40 mb-5">By what they have earned on confirmed rentals.</p>
          {earners.length === 0 ? (
            <p className="text-sm text-dark/45">No rentals against a plate yet.</p>
          ) : (
            <ul className="space-y-3">
              {earners.map(e => (
                <li key={e.plate}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-bold truncate">
                      {e.plate} <span className="font-normal text-dark/45">· {e.model}</span>
                    </span>
                    <span className="font-display font-black tabular-nums shrink-0">{money(e.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-dark/5 rounded-full mt-1.5 overflow-hidden">
                    <span
                      className="block h-full bg-brand rounded-full"
                      style={{ width: `${(e.revenue / earnerPeak) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-dark/40 mt-1">
                    {e.rentals} rental{e.rentals === 1 ? '' : 's'} · {e.days} day{e.days === 1 ? '' : 's'} out
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link to="/finance" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline mt-4">
            <TrendingUp className="w-3.5 h-3.5" /> Earnings by owner and plate
          </Link>
        </section>
      </div>

      {loading && bookings.length === 0 && <p className="text-dark/50 mt-6">Loading…</p>}
    </div>
  );
}

/** One headline number, and the list it came from. */
function Tile({
  to, icon: Icon, label, value, hint, tone,
}: {
  to: string;
  icon: typeof BikeIcon;
  label: string;
  value: number | string;
  hint: string;
  tone?: 'brand' | 'amber' | 'red';
}) {
  const colour =
    tone === 'red' ? 'text-red-700' : tone === 'amber' ? 'text-amber-700' : tone === 'brand' ? 'text-brand' : 'text-dark';
  return (
    <Link to={to} className="bg-white rounded-2xl p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-2 text-dark/40">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={`font-display text-3xl font-black tabular-nums mt-2 ${colour}`}>{value}</p>
      <p className="text-xs text-dark/40 mt-1 flex items-center gap-1">
        {hint}
        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </p>
    </Link>
  );
}

/**
 * The people and machines involved in one part of the day.
 *
 * Laid out as columns rather than a wrapping line: who, how it stands, what is
 * owed and the number to ring, each always in the same place down the list.
 * Wrapped, the money and the phone number ended up adrift on a second line,
 * right-aligned under whichever row happened to be long.
 */
function Movements({
  title, icon: Icon, rows, empty, today, kind,
}: {
  title: string;
  icon: typeof BikeIcon;
  rows: Booking[];
  empty: string;
  today: string;
  kind: 'out' | 'in' | 'late';
}) {
  const late = kind === 'late';
  return (
    <div>
      <h3 className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest mb-1 ${late ? 'text-red-700' : 'text-dark/40'}`}>
        <Icon className="w-3.5 h-3.5" /> {title}
        {rows.length > 0 && <span className="tabular-nums">· {rows.length}</span>}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-dark/35 py-1">{empty}</p>
      ) : (
        <ul className="divide-y divide-dark/5">
          {rows.map(b => {
            const owed = dueOf(b);
            const daysLate = Math.round(
              (new Date(today).getTime() - new Date(b.dropoffDate).getTime()) / 86400000,
            );
            return (
              <li
                key={b.id}
                /* Fixed widths, not auto: each row is its own grid, so auto
                   columns size to that row's own content and the list ends up
                   a few pixels ragged down the page. */
                className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_140px_150px] items-center gap-x-5 gap-y-1 py-3"
              >
                {/* who, and what they took */}
                <div className="min-w-0">
                  <Link
                    to={`/bookings?q=${encodeURIComponent(b.reference)}`}
                    className="font-bold hover:text-brand transition-colors"
                  >
                    {nameOf(b)}
                  </Link>
                  <p className="text-xs text-dark/45 truncate">
                    {b.bikeTitle}
                    {b.plate && ` · ${b.plate}`}
                  </p>
                </div>

                {/* where it stands */}
                <div className="text-xs sm:text-right">
                  {late ? (
                    <>
                      <span className="inline-block font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        {daysLate} day{daysLate === 1 ? '' : 's'} late
                      </span>
                      <p className="text-dark/40 mt-0.5">was due {shortDate(b.dropoffDate)}</p>
                    </>
                  ) : (
                    <>
                      {b.status === 'pending' && (
                        <span className="inline-block font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          not confirmed
                        </span>
                      )}
                      <p className="text-dark/40 mt-0.5">
                        {kind === 'out' ? `back ${shortDate(b.dropoffDate)}` : `out since ${shortDate(b.pickupDate)}`}
                      </p>
                    </>
                  )}
                </div>

                {/* what is owed, and the way to ask for it */}
                <div className="sm:text-right whitespace-nowrap">
                  {owed > 0 ? (
                    <p className="font-bold text-red-700 tabular-nums">{money(owed)} due</p>
                  ) : (
                    <p className="text-dark/35 text-sm">settled</p>
                  )}
                  <a
                    href={`tel:${b.renter.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline mt-0.5"
                  >
                    <Phone className="w-3 h-3" /> {b.renter.phone}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FleetRow({ colour, label, value }: { colour: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${colour}`} />
      <span className="text-dark/60">{label}</span>
      <span className="ml-auto font-bold tabular-nums">{value}</span>
    </li>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'owed' | 'held' }) {
  const colour =
    tone === 'good' ? 'text-emerald-700' : tone === 'owed' ? 'text-red-700' : tone === 'held' ? 'text-amber-700' : 'text-dark';
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-dark/55">{label}</dt>
      <dd className={`font-display text-lg font-black tabular-nums ${colour}`}>{value}</dd>
    </div>
  );
}
